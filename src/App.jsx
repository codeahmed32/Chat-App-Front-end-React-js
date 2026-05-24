import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import AuthScreen from './components/AuthScreen.jsx';
import ChatScreen from './components/ChatScreen.jsx';
import { io } from 'socket.io-client';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);

  // 1. Socket Initialize sirf aik baar hoga jab App mount hogi
  useEffect(() => {
    const newSocket = io("https://chatapp-backend-production-5dd7.up.railway.app", {
      transports: ["websocket", "polling"], // Websocket ko priority do
      withCredentials: true,
      autoConnect: true // Explicitly true rakhein
    });

    setSocket(newSocket);

    // Cleanup function: Jab user browser tab band kare to connection clean ho
    return () => {
      newSocket.close();
    };
  }, []);

  const handleEnterChat = (userInfo) => {
    setCurrentUser(userInfo);
    
    // Safety check ke socket active hai ya nahi
    if (socket) {
      socket.emit('join', {
        roomId: String(userInfo.roomId).trim(), // Trim lagao takay room match ho
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

  // Jab tak socket ready na ho, loading state handle karo ya empty div do
  if (!socket) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Connecting to server...</div>;
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
              socket={socket} // Sahi tracked socket pass ho raha hai
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}