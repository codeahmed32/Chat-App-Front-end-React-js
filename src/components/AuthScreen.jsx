import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Cpu, Lock } from 'lucide-react';

export default function AuthScreen({ onEnterChat, loading = false, statusText = '' }) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');

  const isAuthenticating = loading;
  const authStatus = statusText || 'CONNECTING TO NODE...';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !roomId.trim()) return;

    onEnterChat({ 
      name: name.trim(), 
      roomId: roomId.trim().toUpperCase() 
    });
  };

  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen p-6 bg-slate-50 font-sans selection:bg-indigo-600 selection:text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-px bg-slate-200"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-slate-200"></div>
        <div className="absolute top-0 left-0 w-px h-full bg-slate-200"></div>
        <div className="absolute top-0 right-0 w-px h-full bg-slate-200"></div>
      </div>

      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <motion.div 
            initial={{ scale: 0.9, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <MessageSquare className="text-white w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
              ConnectFlow
            </span>
          </motion.div>
          <p className="text-xs text-slate-500 tracking-wide font-medium">
            Architecture for focused team communication.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="user_name" 
                className="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
              >
                Your Name
              </label>
              <input
                id="user_name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isAuthenticating}
                placeholder="Enter your name"
                className="w-full bg-slate-50/50 text-slate-900 border border-slate-200 px-4 py-3 rounded-lg text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 font-sans disabled:opacity-50"
                required
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="room_id" 
                className="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
              >
                Room ID
              </label>
              <input
                id="room_id"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                disabled={isAuthenticating}
                placeholder="Enter room code"
                className="w-full bg-slate-50/50 text-slate-900 border border-slate-200 px-4 py-3 rounded-lg text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 font-sans disabled:opacity-50 uppercase tracking-wider"
                required
                autoComplete="off"
              />
            </div>

            <button
              id="enter_chat"
              type="submit"
              disabled={isAuthenticating}
              className={`w-full py-4 transition-all rounded-lg font-sans font-bold tracking-[0.12em] text-xs uppercase cursor-pointer flex items-center justify-center gap-2 ${
                isAuthenticating 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-md shadow-indigo-100'
              }`}
            >
              {isAuthenticating ? (
                <>
                  <Cpu className="w-4.5 h-4.5 animate-spin stroke-[2]" />
                  <span>{authStatus}</span>
                </>
              ) : (
                'Enter Chatroom'
              )}
            </button>
          </form>

          <div className="pt-4 flex justify-between items-center border-t border-slate-100 mt-1">
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest">
              SYSTEM v1.04
            </span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 font-mono tracking-widest">
                NODE_ACTIVE
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-slate-400 stroke-[1.5]" />
          <span className="text-[10px] font-bold text-slate-400 tracking-[0.25em] uppercase font-sans">
            Secure End-to-End Encryption Protocol
          </span>
        </div>
      </motion.main>
    </div>
  );
}