import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_CHAOS_API || "http://localhost:8000";
const API = axios.create({
  baseURL: API_BASE_URL,
});

export interface WebSocketMessage {
  type: "ADDED" | "MODIFIED" | "DELETED" | "CONNECTED" | "ERROR";
  pod?: string;
  phase?: string;
  message?: string;
}

export const listPods = async (): Promise<string[]> => {
  const res = await API.get<string[]>("/pods");
  return res.data;
};

export const killRandomPod = async (): Promise<{ status: string; pod: string }> => {
  const res = await API.post<{ status: string; pod: string }>("/chaos/random");
  return res.data;
};

export const createWebSocket = (
  onMessage: (data: WebSocketMessage) => void,
  onError?: (error: unknown) => void
): WebSocket => {
  // Convert http:// to ws:// or https:// to wss://
  const wsUrl = API_BASE_URL.replace(/^http/, "ws") + "/stream";
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

