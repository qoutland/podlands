from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from kubernetes import client, config, watch
import random
import asyncio
from concurrent.futures import ThreadPoolExecutor
from queue import Queue
import threading
import sys

from common.logger import logger

app = FastAPI(title="Chaos Arena API")

# Log startup
logger.info("Starting Chaos Arena API")

# Configure CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"{HTTP_SCHEME}://{DOMAIN}"],  # Add other origins as needed
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

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# Include the snake router
from routers.snake import router as snake_router
app.include_router(snake_router, prefix="/api/snake")