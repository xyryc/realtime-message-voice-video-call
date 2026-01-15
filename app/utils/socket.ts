import { store } from "@/store/store";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["polling"],
  auth: (cb) => {
    const token = store.getState().auth.token;
    // console.log("🔑 Using token:", token ? "exists" : "missing");
    cb({ token });
  },
  extraHeaders: {
    "ngrok-skip-browser-warning": "true",
  },
});

socket.on("connect", () => {
  console.log("✅ Socket connected", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.log("Socket connection error", error);
});
