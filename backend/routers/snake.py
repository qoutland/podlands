from fastapi import APIRouter, HTTPException
from kubernetes import client, watch
import random
import asyncio
from concurrent.futures import ThreadPoolExecutor
from queue import Queue
import threading
import logging
from logging.handlers import RotatingFileHandler
import sys
import yaml
from jinja2 import Environment, FileSystemLoader
import uuid
from fastapi.websockets import WebSocket
from fastapi.websockets import WebSocketDisconnect
from fastapi.websockets import WebSocketState
from common.config import SNAKE_NAMESPACE, DOMAIN, LOAD_INCREMENT, PODS_DELETE_INTERVAL
from common.logger import logger
from typing import Dict, Optional
from datetime import datetime, timedelta
import requests
import time

router = APIRouter()
env = Environment(loader=FileSystemLoader('./kubernetes'), trim_blocks=True, lstrip_blocks=True)

api = client.AppsV1Api()
autoscaling = client.AutoscalingV2Api()
core = client.CoreV1Api()
net = client.NetworkingV1Api()

# Try to initialize metrics API (may not be available in all clusters)
try:
    metrics_api = client.CustomObjectsApi()
    METRICS_AVAILABLE = True
except Exception as e:
    logger.warning(f"Metrics API not available: {e}")
    METRICS_AVAILABLE = False

# Store request rate per game and load generators
request_rates: Dict[str, Dict[str, any]] = {}
load_generators: Dict[str, threading.Event] = {}
load_threads: Dict[str, threading.Thread] = {}


# Background function to generate load (sends requests to ingress URL)
def _generate_load_thread(game_id: str, stop_event: threading.Event):
    # Use the ingress URL (public domain) to trigger autoscaling
    ingress_url = f"http://{DOMAIN}/snake/{game_id}"
    
    while not stop_event.is_set():
        if game_id in request_rates:
            target_rate = request_rates[game_id]["rate"]
            if target_rate > 0:
                interval = 1.0 / target_rate
                try:
                    response = requests.get(ingress_url, timeout=2.0)
                    request_rates[game_id]["last_request"] = datetime.now()
                except Exception as e:
                    logger.debug(f"Error sending request to {ingress_url}: {e}")
                time.sleep(interval)
            else:
                time.sleep(0.1)
        else:
            time.sleep(0.1)


# Helper function to get metrics for a game
def _get_metrics(game_id: str) -> Dict:
    try:
        pods = core.list_namespaced_pod(SNAKE_NAMESPACE, label_selector=f"game_id={game_id}")
        
        total_cpu_usage = 0.0
        total_memory_usage = 0.0
        total_cpu_limit = 0.0
        total_memory_limit = 0.0
        running_pods = 0
        
        for pod in pods.items:
            if pod.status.phase == "Running":
                running_pods += 1
                # Get resource limits from pod spec
                if pod.spec.containers:
                    container = pod.spec.containers[0]
                    if container.resources and container.resources.limits:
                        limits = container.resources.limits
                        if limits.get("cpu"):
                            cpu_limit_str = str(limits["cpu"])
                            # Convert to millicores (e.g., "100m" -> 0.1, "1" -> 1.0)
                            if cpu_limit_str.endswith("m"):
                                total_cpu_limit += float(cpu_limit_str[:-1]) / 1000.0
                            else:
                                total_cpu_limit += float(cpu_limit_str)
                        
                        if limits.get("memory"):
                            memory_limit_str = str(limits["memory"])
                            # Convert to bytes (e.g., "24Mi" -> 24 * 1024 * 1024)
                            if memory_limit_str.endswith("Mi"):
                                total_memory_limit += float(memory_limit_str[:-2]) * 1024 * 1024
                            elif memory_limit_str.endswith("Ki"):
                                total_memory_limit += float(memory_limit_str[:-2]) * 1024
                            elif memory_limit_str.endswith("Gi"):
                                total_memory_limit += float(memory_limit_str[:-2]) * 1024 * 1024 * 1024
                            else:
                                total_memory_limit += float(memory_limit_str)
                
                # Try to get actual usage from metrics API
                if METRICS_AVAILABLE:
                    try:
                        pod_metrics = metrics_api.get_namespaced_custom_object(
                            group="metrics.k8s.io",
                            version="v1beta1",
                            namespace=SNAKE_NAMESPACE,
                            plural="pods",
                            name=pod.metadata.name
                        )
                        if "containers" in pod_metrics:
                            for container in pod_metrics["containers"]:
                                if "usage" in container:
                                    usage = container["usage"]
                                    if "cpu" in usage:
                                        cpu_str = usage["cpu"]
                                        # Parse CPU (e.g., "100m" or "1n")
                                        if cpu_str.endswith("n"):
                                            total_cpu_usage += float(cpu_str[:-1]) / 1000000000.0
                                        elif cpu_str.endswith("u"):
                                            total_cpu_usage += float(cpu_str[:-1]) / 1000000.0
                                        elif cpu_str.endswith("m"):
                                            total_cpu_usage += float(cpu_str[:-1]) / 1000.0
                                        else:
                                            total_cpu_usage += float(cpu_str)
                                    
                                    if "memory" in usage:
                                        memory_str = usage["memory"]
                                        # Parse memory (e.g., "24Mi")
                                        if memory_str.endswith("Mi"):
                                            total_memory_usage += float(memory_str[:-2]) * 1024 * 1024
                                        elif memory_str.endswith("Ki"):
                                            total_memory_usage += float(memory_str[:-2]) * 1024
                                        elif memory_str.endswith("Gi"):
                                            total_memory_usage += float(memory_str[:-2]) * 1024 * 1024 * 1024
                                        else:
                                            total_memory_usage += float(memory_str)
                    except Exception as e:
                        logger.debug(f"Could not get metrics for pod {pod.metadata.name}: {e}")
                        # Fall back to estimating usage (assume 50% of limit if no metrics)
                        if total_cpu_limit > 0:
                            total_cpu_usage = total_cpu_limit * 0.5
                        if total_memory_limit > 0:
                            total_memory_usage = total_memory_limit * 0.5
        
        # Calculate percentages
        cpu_percent = (total_cpu_usage / total_cpu_limit * 100) if total_cpu_limit > 0 else 0.0
        memory_percent = (total_memory_usage / total_memory_limit * 100) if total_memory_limit > 0 else 0.0
        
        # Get requests/sec from tracking
        requests_per_sec = 0.0
        if game_id in request_rates:
            requests_per_sec = request_rates[game_id].get("rate", 0.0)
        
        # Network I/O is harder to get without metrics server, return placeholder
        network_io = "N/A"
        
        return {
            "cpu_percent": round(cpu_percent, 2),
            "memory_percent": round(memory_percent, 2),
            "network_io": network_io,
            "requests_per_sec": round(requests_per_sec, 2),
            "running_pods": running_pods
        }
    except Exception as e:
        logger.error(f"Error getting metrics for game {game_id}: {e}")
        return {
            "cpu_percent": 0.0,
            "memory_percent": 0.0,
            "network_io": "N/A",
            "running_pods": 0
        }


# Function to get pods for game id, also add watcher for pods
def get_pods(game_id: str):
    try:
        pods = core.list_namespaced_pod(SNAKE_NAMESPACE, label_selector=f"game_id={game_id}")
        with open("pods.yaml", "w") as f:
            yaml.dump(pods.to_dict()["items"], f, indent=4)
        pods_list = []
        for pod in pods.to_dict()["items"]:
            pods_list.append({
                "name": pod["metadata"]["name"],
                "status": pod["status"]["phase"]
            })
        return pods_list
    except Exception as e:
        logger.error(f"Error getting pods for game {game_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create new instance of game:
@router.post("/init")
def snake_init():
    logger.info(f"Initializing game")

    # Generate a unique game id for the deployment
    game_id = str(uuid.uuid4())[:8]

    # Render the deployment, service, and ingress templates
    deployment = yaml.safe_load(env.get_template("snake/deployment.yaml").render(game_id=game_id, namespace=SNAKE_NAMESPACE))
    service = yaml.safe_load(env.get_template("snake/service.yaml").render(game_id=game_id, namespace=SNAKE_NAMESPACE))
    scaling = yaml.safe_load(env.get_template("snake/autoscaling.yaml").render(game_id=game_id, namespace=SNAKE_NAMESPACE))
    ingress = yaml.safe_load(env.get_template("snake/ingress.yaml").render(game_id=game_id, namespace=SNAKE_NAMESPACE, domain=DOMAIN))

    api.create_namespaced_deployment(SNAKE_NAMESPACE, deployment)
    core.create_namespaced_service(SNAKE_NAMESPACE, service)
    autoscaling.create_namespaced_horizontal_pod_autoscaler(SNAKE_NAMESPACE, scaling)
    net.create_namespaced_ingress(SNAKE_NAMESPACE, ingress)
    return {"status": "initialized", "game_id": game_id}


# Track how many times food has been eaten per game (to delete pods less frequently)
eat_counters: Dict[str, int] = {}

# Pod has been consumed
@router.post("/eat/{game_id}")
def snake_eat(game_id: str):
    logger.info(f"Pod {game_id} has been eaten")
    
    # Increment counter for this game
    if game_id not in eat_counters:
        eat_counters[game_id] = 0
    eat_counters[game_id] += 1
    
    # Only delete pod every N food items to allow metrics to accumulate
    should_delete_pod = eat_counters[game_id] % PODS_DELETE_INTERVAL == 0
    
    if should_delete_pod:
        pods = get_pods(game_id)
        if len(pods) == 0:
            logger.warning(f"No pod found for game {game_id}")
            raise HTTPException(status_code=404, detail="No pod found for game.")
        # Kill first Running pod in list
        for pod in pods:
            if pod["status"] == "Running":
                core.delete_namespaced_pod(pod["name"], SNAKE_NAMESPACE)
                logger.info(f"Successfully deleted pod {pod['name']} (food count: {eat_counters[game_id]})")
                break
    
    return {"status": "eaten", "game_id": game_id, "pod_deleted": should_delete_pod}


# Generate load (increase requests/sec) - sends requests to ingress URL
@router.post("/load/{game_id}")
def generate_load(game_id: str, requests_per_sec: Optional[float] = None):
    try:
        # If requests_per_sec not provided, increment from current rate
        if game_id not in request_rates:
            request_rates[game_id] = {"rate": 0.0, "last_update": datetime.now()}
        
        if requests_per_sec is None:
            # Increment by 5 requests/sec each time food is eaten
            current_rate = request_rates[game_id]["rate"]
            requests_per_sec = current_rate + LOAD_INCREMENT
        else:
            requests_per_sec = float(requests_per_sec)
        
        # Update tracking
        request_rates[game_id]["rate"] = requests_per_sec
        request_rates[game_id]["last_update"] = datetime.now()
        
        # Start or restart load generator thread if not already running
        if game_id not in load_generators or not load_threads.get(game_id) or not load_threads[game_id].is_alive():
            # Stop existing if any
            if game_id in load_generators:
                load_generators[game_id].set()
            
            # Create new stop event and thread
            stop_event = threading.Event()
            load_generators[game_id] = stop_event
            thread = threading.Thread(target=_generate_load_thread, args=(game_id, stop_event), daemon=True)
            load_threads[game_id] = thread
            thread.start()
        
        logger.info(f"Updated load generation to {requests_per_sec} req/s for game {game_id}")
        return {
            "status": "load_generated",
            "game_id": game_id,
            "requests_per_sec": requests_per_sec
        }
    except Exception as e:
        logger.error(f"Error generating load for game {game_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Game over
@router.post("/kill/{game_id}")
def snake_kill(game_id: str):
    logger.info(f"Killing game {game_id}")
    api.delete_namespaced_deployment(f"snake-{game_id}", SNAKE_NAMESPACE)
    core.delete_namespaced_service(f"snake-{game_id}", SNAKE_NAMESPACE)
    autoscaling.delete_namespaced_horizontal_pod_autoscaler(f"snake-{game_id}", SNAKE_NAMESPACE)
    net.delete_namespaced_ingress(f"snake-{game_id}", SNAKE_NAMESPACE)
    # Clean up request rate tracking and load generators
    if game_id in request_rates:
        del request_rates[game_id]
    if game_id in load_generators:
        load_generators[game_id].set()
        del load_generators[game_id]
    if game_id in load_threads:
        del load_threads[game_id]
    if game_id in eat_counters:
        del eat_counters[game_id]
    logger.info(f"Successfully killed game {game_id}")
    return {"status": "killed", "game_id": game_id}




# Stream live updates of snake game for specific namespace
@router.websocket("/stream/{game_id}")
async def snake_stream(websocket: WebSocket, game_id: str):
    logger.info("New WebSocket connection accepted")
    await websocket.accept()
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "CONNECTED",
            "message": "WebSocket connected successfully"
        })

        w = watch.Watch()
        executor = ThreadPoolExecutor(max_workers=1)
        event_queue = Queue()
        watch_stopped = threading.Event()
        
        def blocking_watch():
            try:
                for event in w.stream(core.list_namespaced_pod, SNAKE_NAMESPACE, label_selector=f"game_id={game_id}"):
                    if watch_stopped.is_set():
                        break
                    event_queue.put({
                        "type": event["type"],  # ADDED, MODIFIED, DELETED
                        "pod": event['object'].metadata.name,
                        "status": event['object'].status.phase
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
        
        # Track last metrics send time
        last_metrics_send = datetime.now()
        metrics_interval = timedelta(seconds=1)  # Send metrics every 1 second
        
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
                
                # Send metrics periodically
                now = datetime.now()
                if now - last_metrics_send >= metrics_interval:
                    try:
                        metrics = _get_metrics(game_id)
                        await websocket.send_json({
                            "type": "METRICS",
                            **metrics
                        })
                        last_metrics_send = now
                    except WebSocketDisconnect:
                        logger.info("Client disconnected while sending metrics")
                        raise
                    except Exception as e:
                        logger.error(f"Error sending metrics: {e}")
                
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
    finally:
        try:
            if websocket.client_state != WebSocketState.DISCONNECTED:
                await websocket.close()
            logger.info("WebSocket connection closed")
        except Exception as e:
            logger.error(f"Error closing WebSocket: {e}")
        
        # Always call snake_kill when WebSocket closes
        try:
            snake_kill(game_id)
            logger.info(f"Successfully called snake_kill for game {game_id}")
        except Exception as e:
            logger.error(f"Error calling snake_kill for game {game_id}: {e}")

