import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import AuthScreen from './components/AuthScreen.jsx';
import ChatScreen from './components/ChatScreen.jsx';
import { io } from 'socket.io-client';


const socket = io("https://chatapp-backend-production-5dd7.up.railway.app/", {
  transports: ["polling", "websocket"], 
  withCredentials: true
});
// https://chatapp-backend-production-503e.up.railway.app


export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleEnterChat = (userInfo) => {
    setCurrentUser(userInfo);
    socket.emit('join', {
      roomId: userInfo.roomId,
      userName: userInfo.name
    });
  };

  const handleLeaveRoom = () => {
    if (currentUser) {
      socket.emit('leave', currentUser.roomId);
    }
    setCurrentUser(null);
  };

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