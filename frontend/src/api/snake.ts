import axios from "axios";

const API_BASE_URL = import.meta.env.SNAKE_API || "http://localhost:8000/api/snake";
const API = axios.create({
  baseURL: API_BASE_URL,
});

export interface WebSocketMessage {
  type: "ADDED" | "MODIFIED" | "DELETED" | "CONNECTED" | "ERROR" | "METRICS";
  pod?: string;
  status?: string;
  cpu_percent?: number;
  memory_percent?: number;
  network_io?: string;
  requests_per_sec?: number;
  running_pods?: number;
}

export const initGame = async (): Promise<{ status: string; game_id: string }> => {
  const res = await API.post<{ status: string; game_id: string }>("/init");
  return res.data;
};

export const eatPod = async (game_id: string): Promise<{ status: string; game_id: string; pod_deleted: boolean }> => {
  const res = await API.post<{ status: string; game_id: string; pod_deleted: boolean }>(`/eat/${game_id}`);
  return res.data;
};

export const generateLoad = async (game_id: string): Promise<{ status: string; game_id: string; requests_per_sec: number }> => {
  const res = await API.post<{ status: string; game_id: string; requests_per_sec: number }>(`/load/${game_id}`);
  return res.data;
};


export const createWebSocket = (
  game_id: string,
  onMessage: (data: WebSocketMessage) => void,
  onError?: (error: unknown) => void
): WebSocket => {
  // Convert http:// to ws:// or https:// to wss://
  const wsUrl = API_BASE_URL.replace(/^http/, "ws") + `/stream/${game_id}`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("WebSocket connected");
  };

  ws.onmessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as WebSocketMessage;
      onMessage(data);
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
      if (onError) onError(error);
    }
  };

  ws.onerror = (error: Event) => {
    console.error("WebSocket error:", error);
    if (onError) onError(error);
  };

  ws.onclose = () => {
    console.log("WebSocket disconnected");
  };

  return ws;
};

