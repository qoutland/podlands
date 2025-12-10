"use client";

import { useEffect, useState, useRef } from "react";
import "./Snake.css";
import { initGame, eatPod, createWebSocket, generateLoad, type WebSocketMessage } from "../api/snake";

// Preload sounds
const eatSound = new Audio("/sounds/eat.mp3"); // put in public/sounds
const gameOverSound = new Audio("/sounds/gameover.mp3");

export default function Snake() {
  const boardSize = 20;
  const [game_id, setGameId] = useState<string | null>(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [foodWillDeletePod, setFoodWillDeletePod] = useState(false);
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(200);
  const [livePods, setLivePods] = useState<{ name: string, status: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<{ cpu_percent: number; memory_percent: number; requests_per_sec: number; running_pods: number } | null>(null);

  const [cellSize, setCellSize] = useState(20); // 🔥 dynamic size
  const intervalRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const eatenFoodRef = useRef<{ x: number; y: number } | null>(null);
  const foodCountRef = useRef<number>(0);

  // 🔥 Resize handler
  const updateSize = () => {
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    // On mobile, use more screen space
    const widthMultiplier = isMobile ? 0.95 : 0.9;
    const heightMultiplier = isSmallMobile ? 0.5 : isMobile ? 0.55 : 0.6;
    
    const maxWidth = window.innerWidth * widthMultiplier;
    const maxHeight = window.innerHeight * heightMultiplier;

    const cell = Math.floor(
      Math.min(maxWidth, maxHeight) / boardSize
    );

    setCellSize(cell);
  };

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);
    
    // Prevent body scrolling
    document.body.classList.add("no-scroll");
    document.documentElement.classList.add("no-scroll");
    
    return () => {
      window.removeEventListener("resize", updateSize);
      document.body.classList.remove("no-scroll");
      document.documentElement.classList.remove("no-scroll");
      // Close WebSocket on component unmount
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const placeFood = () => {
    // Check if the NEXT food (after current one is eaten) will delete a pod
    // Assuming PODS_DELETE_INTERVAL is 3 (should match backend config)
    const PODS_DELETE_INTERVAL = 3;
    // foodCountRef.current is the count BEFORE eating the current food
    // So (foodCountRef.current + 1) % PODS_DELETE_INTERVAL === 0 means the NEXT food will delete
    const willDeletePod = ((foodCountRef.current + 1) % PODS_DELETE_INTERVAL) === 0;
    setFoodWillDeletePod(willDeletePod);
    
    setFood({
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    });
  };

  const handleWebSocketMessage = () => {
    return (data: WebSocketMessage) => {
      const { type, pod, status } = data;
      if (type === "ADDED") { 
        setLivePods((prev) => [...prev, { name: pod!, status: status! }]);
      } else if (type === "MODIFIED") {
        setLivePods((prev) => prev.map((p) => p.name === pod ? { name: pod!, status: status! } : p));
      } else if (type === "DELETED") {
        setLivePods((prev) => prev.filter((p) => p.name !== pod));
      } else if (type === "METRICS") {
        setMetrics({
          cpu_percent: data.cpu_percent || 0,
          memory_percent: data.memory_percent || 0,
          requests_per_sec: data.requests_per_sec || 0,
          running_pods: data.running_pods || 0
        });
      }
    };
  };


  const startGame = () => {
    // Reset game state first
    setSnake([{ x: 10, y: 10 }]);
    setDir({ x: 1, y: 0 });
    setSpeed(200);
    setScore(0);
    setLivePods([]);
    setGameOver(false);
    setRunning(false);
    setMetrics(null);
    setFoodWillDeletePod(false);
    eatenFoodRef.current = null;
    foodCountRef.current = 0;
    
    // Close existing WebSocket if any (this will trigger cleanup on backend)
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Clear any existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setLoading(true);
    initGame()
      .then(({ game_id }) => {
        setGameId(game_id);
        placeFood();
        const ws = createWebSocket(game_id, handleWebSocketMessage());
        wsRef.current = ws;
      })
      .catch((error) => {
        console.error("Error starting game:", error);
        setLoading(false);
      });
  };

  // Check if all pods are Running and start the game
  useEffect(() => {
    if (loading && livePods.length > 0) {
      const allRunning = livePods.every((p) => p.status === "Running");
      if (allRunning) {
        setLoading(false);
        setRunning(true);
      }
    }
  }, [livePods, loading]);


  const handleKey = (e: KeyboardEvent) => {
    if (!running) return;

    if (e.key === "ArrowUp" && dir.y !== 1) setDir({ x: 0, y: -1 });
    if (e.key === "ArrowDown" && dir.y !== -1) setDir({ x: 0, y: 1 });
    if (e.key === "ArrowLeft" && dir.x !== 1) setDir({ x: -1, y: 0 });
    if (e.key === "ArrowRight" && dir.x !== -1) setDir({ x: 1, y: 0 });
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const tick = () => {
    setSnake((prev) => {
      const head = prev[0];
      const newHead = { x: head.x + dir.x, y: head.y + dir.y };

      newHead.x = (newHead.x + boardSize) % boardSize;
      newHead.y = (newHead.y + boardSize) % boardSize;

      const newSnake = [newHead, ...prev];

      // collision with self
      if (prev.some((s) => s.x === newHead.x && s.y === newHead.y)) {
        setRunning(false);
        setGameOver(true);
        gameOverSound.play();
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
        return prev;
      }

      // Check if snake head is at food position
      const isAtFood = newHead.x === food.x && newHead.y === food.y;
      
      if (isAtFood) {
        // Check if we haven't already processed eating this food position (to prevent duplicate API calls)
        const foodPosition = { x: food.x, y: food.y };
        const alreadyAteThisFood = eatenFoodRef.current && 
          eatenFoodRef.current.x === foodPosition.x && 
          eatenFoodRef.current.y === foodPosition.y;
        
        // Only call API if we haven't already processed this food
        if (!alreadyAteThisFood) {
          // Mark this food position as eaten immediately to prevent duplicate calls
          eatenFoodRef.current = foodPosition;
          
          setScore((s) => s + 1);
          eatSound.currentTime = 0;
          eatSound.play();
          setSpeed((s) => Math.max(50, s - 5));
          
          // Increment food count after eating
          foodCountRef.current += 1;
          
          // Call API to delete pod and get pod name
          eatPod(game_id!)
            .then(() => {
              // Clear the eaten food ref after a short delay to allow for state updates
              setTimeout(() => {
                eatenFoodRef.current = null;
              }, 100);
            })
            .catch((error) => {
              console.error("Error eating pod:", error);
              // Clear on error too
              eatenFoodRef.current = null;
            });
          
          // Increase load (requests/sec) by 5 to trigger autoscaling (backend handles the actual load generation)
          if (game_id) {
            generateLoad(game_id).catch((error) => {
              console.error("Error generating load:", error);
            });
          }
          
          // Place new food after eating (this will check if NEXT food will delete pod)
          placeFood();
        }
        // Don't pop the tail - snake grows when eating food
      } else {
        // Pop the tail when not eating food
        newSnake.pop();
      }

      return newSnake;
    });
  };

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(tick, speed);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, speed, dir]);

  return (
    <div className="snake-container">
      <div className="snake-main-content">
        <div className="flex flex-col items-center p-4 gap-4 w-full">
          <h1 className="text-3xl font-bold">KubeSnake</h1>
          <p>Score: {score}</p>

          <div className="board-wrapper">
            <div
              className="snake-board"
              style={{
                gridTemplateColumns: `repeat(${boardSize}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${boardSize}, ${cellSize}px)`,
                opacity: running ? 1 : 0.4
              }}
            >
              {Array.from({ length: boardSize * boardSize }).map((_, i) => {
                const x = i % boardSize;
                const y = Math.floor(i / boardSize);
                const isSnake = snake.some((s) => s.x === x && s.y === y);
                const isFood = food.x === x && food.y === y;

                return (
                  <div
                    key={i}
                    className={`snake-cell ${
                      isSnake ? "snake-body" : isFood ? (foodWillDeletePod ? "snake-food-pod" : "snake-food") : ""
                    }`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                    }}
                  />
                );
              })}
            </div>

            {/* Loading overlay */}
            {loading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <p className="loading-text">Waiting for pods to be ready...</p>
                <p className="loading-subtext">
                  {livePods.length > 0 
                    ? `${livePods.filter(p => p.status === "Running").length}/${livePods.length} pods running`
                    : "Initializing pods..."}
                </p>
              </div>
            )}

            {/* Overlay button */}
            {!running && !loading && (
              <button className="overlay-button" onClick={startGame}>
                {gameOver ? "Restart" : "Start"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="snake-sidebar">
        <h2 className="sidebar-title">Pod Information</h2>
        
        <div className="sidebar-section">
          <div className="sidebar-item">
            <span className="sidebar-label">Game ID:</span>
            <span className="sidebar-value">{game_id ?? "Not started"}</span>
          </div>
          {game_id && (
            <div className="sidebar-item">
              <span className="sidebar-label">Game URL:</span>
              <span className="sidebar-value">
                <a target="_blank" href={`${window.location.origin}/snake/${game_id}`} style={{ color: '#ffd442', textDecoration: 'underline' }}>Link</a>
              </span>
            </div>
          )}
          <h3 className="sidebar-section-title">Food Legend</h3>
          <div className="food-legend">
            <div className="legend-item">
              <div className="legend-color snake-food"></div>
              <span className="legend-text">Increases load only</span>
            </div>
            <div className="legend-item">
              <div className="legend-color snake-food-pod"></div>
              <span className="legend-text">Deletes pod + increases load</span>
            </div>
          </div>
          <h3 className="sidebar-section-title">Live Pods</h3>
          <div className="pods-list">
            {livePods.length === 0 ? (
              <div className="no-pods">Game not started yet</div>
            ) : (
              livePods.map(({ name, status }, index) => (
                <div key={index} className={`pod-item ${status === "Pending" ? "pending-pod-item" : status === "Terminating" ? "deleting-pod-item" : "live-pod-item"}`}>
                  {name}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Performance Metrics</h3>
          <div className="sidebar-item">
            <span className="sidebar-label">Requests/sec:</span>
            <span className="sidebar-value">
              {metrics ? `${metrics.requests_per_sec.toFixed(1)}` : "-"}
            </span>
          </div>
          <div className="sidebar-item">
            <span className="sidebar-label">CPU Usage:</span>
            <span className="sidebar-value">
              {metrics ? `${metrics.cpu_percent.toFixed(1)}%` : "-"}
            </span>
          </div>
          <div className="sidebar-item">
            <span className="sidebar-label">Memory Usage:</span>
            <span className="sidebar-value">
              {metrics ? `${metrics.memory_percent.toFixed(1)}%` : "-"}
            </span>
          </div>
          <div className="sidebar-item">
            <span className="sidebar-label">Running Pods:</span>
            <span className="sidebar-value">
              {metrics ? metrics.running_pods : "-"}
            </span>
          </div>
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Game Stats</h3>
          <div className="sidebar-item">
            <span className="sidebar-label">Current Score:</span>
            <span className="sidebar-value">{score}</span>
          </div>
          <div className="sidebar-item">
            <span className="sidebar-label">Game Speed:</span>
            <span className="sidebar-value">{speed}ms</span>
          </div>
          <div className="sidebar-item">
            <span className="sidebar-label">Status:</span>
            <span className="sidebar-value">{running ? "Running" : gameOver ? "Game Over" : "Stopped"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
