from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from kubernetes import client, config, watch
import random
import asyncio
from concurrent.futures import ThreadPoolExecutor
from queue import Queue
import threading
import logging
from logging.handlers import RotatingFileHandler
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.StreamHandler(sys.stdout),
        RotatingFileHandler('app.log', maxBytes=10485760, backupCount=5)  # 10MB per file, 5 backups
    ]
)

logger = logging.getLogger(__name__)

app = FastAPI(title="Chaos Arena API")

# Log startup
logger.info("Starting Chaos Arena API")

# Configure CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add other origins as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load config (works locally with kubeconfig or in-cluster)
try:
    logger.info("Loading in-cluster config")
    config.load_incluster_config()
    logger.info("Successfully loaded in-cluster config")
except Exception as e:
    logger.warning(f"Failed to load in-cluster config: {e}")
    try:
        logger.info("Loading kubeconfig")
        config.load_kube_config()
        logger.info("Successfully loaded kubeconfig")
    except Exception as e:
        logger.error(f"Failed to load kubeconfig: {e}")
        raise HTTPException(status_code=500, detail="Failed to load kubeconfig")

v1 = client.CoreV1Api()
NAMESPACE = "arena"

@app.get("/pods")
def list_pods():
    logger.info(f"Listing pods in namespace {NAMESPACE}")
    pods = v1.list_namespaced_pod(NAMESPACE)
    pod_names = [p.metadata.name for p in pods.items]
    logger.info(f"Found {len(pod_names)} pods: {pod_names}")
    return pod_names

@app.delete("/pod/{name}")
def delete_pod(name: str):
    logger.info(f"Deleting pod {name} from namespace {NAMESPACE}")
    try:
        v1.delete_namespaced_pod(name, NAMESPACE)
        logger.info(f"Successfully deleted pod {name}")
        return {"status": "deleted", "pod": name}
    except client.exceptions.ApiException as e:
        logger.error(f"Error deleting pod {name}: {e.reason}")
        raise HTTPException(status_code=400, detail=e.reason)

@app.post("/chaos/random")
def random_pod_delete():
    logger.info(f"Random pod deletion requested in namespace {NAMESPACE}")
    pods = v1.list_namespaced_pod(NAMESPACE).items
    if not pods:
        logger.warning(f"No pods found in namespace {NAMESPACE}")
        raise HTTPException(status_code=404, detail="No pods to delete.")
    pod = random.choice(pods)
    pod_name = pod.metadata.name
    logger.info(f"Randomly selected pod {pod_name} for deletion")
    v1.delete_namespaced_pod(pod_name, NAMESPACE)
    logger.info(f"Successfully deleted random pod {pod_name}")
    return {"status": "deleted", "pod": pod_name}

# Stream live updates of pods
@app.websocket("/stream")
async def stream_pods(websocket: WebSocket):
    logger.info("New WebSocket connection accepted")
    await websocket.accept()
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "CONNECTED",
            "message": "WebSocket connected successfully"
        })
        
        # Get initial state of pods
        try:
            pods = v1.list_namespaced_pod(NAMESPACE)
            for pod in pods.items:
                await websocket.send_json({
                    "type": "ADDED",
                    "pod": pod.metadata.name,
                    "phase": pod.status.phase
                })
        except Exception as e:
            logger.error(f"Error getting initial pods: {e}")
            await websocket.send_json({
                "type": "ERROR",
                "message": f"Error listing pods: {str(e)}"
            })
        
        # Start watching for changes - run blocking watch in thread pool
        w = watch.Watch()
        executor = ThreadPoolExecutor(max_workers=1)
        event_queue = Queue()
        watch_stopped = threading.Event()
        
        def blocking_watch():
            try:
                for event in w.stream(v1.list_namespaced_pod, NAMESPACE):
                    if watch_stopped.is_set():
                        break
                    event_queue.put({
                        "type": event["type"],  # ADDED, MODIFIED, DELETED
                        "pod": event["object"].metadata.name,
                        "phase": event["object"].status.phase
                    })
            except Exception as e:
                logger.error(f"Error in watch stream: {e}")
                if not watch_stopped.is_set():
                    event_queue.put({
                        "type": "ERROR",
                        "message": f"Watch error: {str(e)}"
                    })
        
        # Run blocking watch in thread pool
        future = executor.submit(blocking_watch)
        
        # Process events from queue and keep connection alive
        try:
            while True:
                # Check for messages from client (with timeout)
                try:
                    await asyncio.wait_for(websocket.receive_text(), timeout=0.5)
                except asyncio.TimeoutError:
                    pass
                except WebSocketDisconnect:
                    logger.info("Client disconnected from WebSocket")
                    break
                
                # Process events from watch queue
                while not event_queue.empty():
                    try:
                        event = event_queue.get_nowait()
                        await websocket.send_json(event)
                    except WebSocketDisconnect:
                        logger.info("Client disconnected while sending WebSocket message")
                        raise
                    except Exception as e:
                        logger.error(f"Error sending WebSocket event: {e}")
                
                # Check if watch thread stopped
                if future.done():
                    break
                    
        except WebSocketDisconnect:
            logger.info("WebSocket disconnected")
        finally:
            watch_stopped.set()
            executor.shutdown(wait=False)
    except Exception as e:
        logger.error(f"Error in stream_pods: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        websocket.close()