import { useEffect, useState, useRef, useCallback } from "react";
import { listPods, killRandomPod, createWebSocket, type WebSocketMessage } from "../api/chaos";

export default function Arena() {
  const [pods, setPods] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  async function refresh() {
    setPods(await listPods());
  }

  const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    const { type, pod } = data;
    
    // Handle connection confirmation
    if (type === "CONNECTED") {
      console.log("WebSocket connected:", data);
      return;
    }
    
    // Handle errors
    if (type === "ERROR") {
      console.error("WebSocket error:", data);
      return;
    }
    
    // Handle pod events
    if (pod) {
      setPods((currentPods) => {
        const podSet = new Set(currentPods);
        
        if (type === "DELETED") {
          podSet.delete(pod);
        } else if (type === "ADDED" || type === "MODIFIED") {
          podSet.add(pod);
        }
        
        return Array.from(podSet).sort();
      });
    }
  }, []);

  useEffect(() => {
    // Initial load
    refresh();

    // Set up WebSocket connection
    const ws = createWebSocket(
      handleWebSocketMessage,
      (error: unknown) => {
        console.error("WebSocket error:", error);
        setConnected(false);
      }
    );

    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onclose = () => {
      setConnected(false);
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          const newWs = createWebSocket(
            handleWebSocketMessage,
            (error: unknown) => {
              console.error("WebSocket error:", error);
              setConnected(false);
            }
          );
          newWs.onopen = () => setConnected(true);
          wsRef.current = newWs;
        }
      }, 3000);
    };

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [handleWebSocketMessage]);

  async function handleKill() {
    setLoading(true);
    try {
      await killRandomPod();
      // Don't need to refresh - WebSocket will update automatically
    } catch (error) {
      console.error("Error killing pod:", error);
      // Refresh on error as fallback
      await refresh();
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: "2rem", width: "100%", boxSizing: "border-box" }}>
      <h1 className="podlands-title">PodLands Arena</h1>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
        <button className="podlands-button" onClick={handleKill} disabled={loading}>
          {loading ? "Firing..." : "Kill Random Pod"}
        </button>
        
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem",
          fontSize: "0.9rem",
          color: connected ? "#4ade80" : "#ef4444"
        }}>
          <span style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: connected ? "#4ade80" : "#ef4444",
            boxShadow: connected ? "0 0 10px #4ade80" : "none",
            animation: connected ? "pulse 2s infinite" : "none"
          }}></span>
          <span style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}>
            {connected ? "LIVE" : "DISCONNECTED"}
          </span>
        </div>
      </div>

      <div style={{ marginTop: "2rem", display: "grid", gap: "1rem" }}>
        {pods.length === 0 ? (
          <div className="podlands-card" style={{ textAlign: "center", padding: "2rem" }}>
            <strong>No pods in arena</strong>
          </div>
        ) : (
          pods.map((p) => (
            <div key={p} className="podlands-card">
              <strong>Pod:</strong> {p}
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
