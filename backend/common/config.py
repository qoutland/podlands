import os
import sys
from dotenv import load_dotenv

load_dotenv()

DOMAIN = os.getenv("DOMAIN", "localhost")
SNAKE_NAMESPACE = os.getenv("SNAKE_NAMESPACE", "snake")
LOAD_INCREMENT = os.getenv("LOAD_INCREMENT", 100.0)
PODS_DELETE_INTERVAL = os.getenv("PODS_DELETE_INTERVAL", 3)