// https://chatapp-backend-production-5dd7.up.railway.app

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import AuthScreen from './components/AuthScreen.jsx';
import ChatScreen from './components/ChatScreen.jsx';
import { io } from 'socket.io-client';

const BACKEND_URL = "https://chatapp-backend-production-5dd7.up.railway.app"; // Apni live backend URL yahan dalo

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      transports: ["polling", "websocket"],
      withCredentials: true
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleEnterChat = (userInfo) => {
    setCurrentUser(userInfo);

    if (socket) {
      socket.emit('join', {
        roomId: String(userInfo.roomId).trim(),
        userName: String(userInfo.name).trim()
      });
    }
  };

  const handleLeaveRoom = () => {
    if (currentUser && socket) {
      socket.emit('leave', currentUser.roomId);
    }
    setCurrentUser(null);
  };

  if (!socket) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-xs text-slate-500 uppercase tracking-widest">
        Connecting to server...
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
            transition={{ duration: 0.3 }}
          >
            <AuthScreen onEnterChat={handleEnterChat} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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