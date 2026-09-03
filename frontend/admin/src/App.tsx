import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "./components/ui/sonner";
import { socket, connectSocket, disconnectSocket } from "@/services/socket";

function App() {
useEffect(() => {
  console.log("🔵 Admin Socket test started");
  console.log("Socket URL:", import.meta.env.VITE_SOCKET_URL);

  const handleConnect = () => {
    console.log("🟢 Admin Socket connected:", socket.id);
  };

  const handleDisconnect = (reason: string) => {
    console.log("🔴 Admin Socket disconnected:", reason);
  };

  const handleError = (error: Error) => {
    console.error(
      "❌ Admin Socket connection error:",
      error.message,
    );
  };

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);
  socket.on("connect_error", handleError);

  connectSocket();

  return () => {
    socket.off("connect", handleConnect);
    socket.off("disconnect", handleDisconnect);
    socket.off("connect_error", handleError);

    disconnectSocket();
  };
}, []);

  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
}

export default App;