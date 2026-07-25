import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AuthScreen from './components/AuthScreen.jsx';
import ChatScreen from './components/ChatScreen.jsx';
import { io } from 'socket.io-client';

// Strictly Environment Variable Driven URL Parser
const getBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (!envUrl) {
    console.warn("VITE_BACKEND_URL environment variable missing!");
    return "";
  }
  return envUrl.replace(/\/+$/, "");
};

const BACKEND_URL = getBackendUrl();

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = sessionStorage.getItem("chat_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const userRef = useRef(currentUser);
  useEffect(() => {
    userRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    if (!BACKEND_URL) return;

    const newSocket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      if (userRef.current) {
        newSocket.emit('join', {
          roomId: String(userRef.current.roomId).trim(),
          userName: String(userRef.current.name).trim()
        });
      }
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.disconnect();
    };
  }, []);

  const handleEnterChat = (userInfo) => {
    const formattedUser = {
      name: String(userInfo.name).trim(),
      roomId: String(userInfo.roomId).trim()
    };

    setCurrentUser(formattedUser);
    sessionStorage.setItem("chat_user", JSON.stringify(formattedUser));

    if (socket && socket.connected) {
      socket.emit('join', formattedUser);
    }
  };

  const handleLeaveRoom = () => {
    if (currentUser && socket && socket.connected) {
      socket.emit('leave', currentUser.roomId);
    }
    sessionStorage.removeItem("chat_user");
    setCurrentUser(null);
  };

  if (!socket || !isConnected) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-xs text-slate-500 uppercase tracking-widest">
        Connecting to real-time server...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AuthScreen onEnterChat={handleEnterChat} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChatScreen
              userName={currentUser.name}
              roomId={currentUser.roomId}
              onLeaveRoom={handleLeaveRoom}
              socket={socket}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}