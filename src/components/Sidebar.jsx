import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, MessagesSquare, Hash, Users, LogOut } from 'lucide-react';

export default function Sidebar({ roomId, userName, activeTab, setActiveTab, activeUsers = [], onLeaveRoom }) {
  const [copied, setCopied] = useState(false);

  const handleCopyRoomId = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="hidden lg:flex flex-col h-full w-[280px] bg-slate-50 border-r border-slate-200 shrink-0 select-none">
      <div className="p-6 flex flex-col gap-2 border-b border-slate-200">
        <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider font-bold">
          <span>ROOM IDENTITY</span>
          <button 
            onClick={handleCopyRoomId}
            className="p-1 hover:text-indigo-600 text-slate-400 transition-colors cursor-pointer"
            title="Copy Room ID"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2]" />
            ) : (
              <Copy className="w-3.5 h-3.5 stroke-[1.5]" />
            )}
          </button>
        </div>
        <div className="text-xl font-bold text-slate-900 tracking-widest font-mono">
          #{roomId}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
        <div className="space-y-1">
          <span className="px-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Navigation
          </span>
          
          <div className="space-y-1.5 pt-2">
            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-sm rounded-lg cursor-pointer ${
                activeTab === 'messages' 
                  ? 'bg-indigo-50/70 text-indigo-700 font-bold' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-950 font-medium'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessagesSquare className="w-4 h-4 stroke-[2]" />
                <span>Direct Messages</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                activeTab === 'messages' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
              }`}>1</span>
            </button>

            <button
              onClick={() => setActiveTab('channels')}
              className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-sm rounded-lg cursor-pointer ${
                activeTab === 'channels' 
                  ? 'bg-indigo-100/70 text-indigo-700 font-bold' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-950 font-medium'
              }`}
            >
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 stroke-[2]" />
                <span>Channels</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                activeTab === 'channels' ? 'bg-indigo-100/80 text-indigo-800' : 'bg-slate-200 text-slate-650'
              }`}>ACTIVE</span>
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 transition-all text-sm rounded-lg cursor-pointer ${
                activeTab === 'contacts' 
                  ? 'bg-indigo-100/70 text-indigo-700 font-bold' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-950 font-medium'
              }`}
            >
              <Users className="w-4 h-4 stroke-[2]" />
              <span>Nav Contacts</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="px-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex justify-between items-center">
            <span>ACTIVE USERS</span>
            <span className="text-[9px] font-mono font-normal opacity-55">
              ({activeUsers?.length || 0})
            </span>
          </span>

          <div className="space-y-1.5 pt-2">
            {activeUsers?.map((user) => {
              if (!user) return null;
              const isMe = user.name === userName;
              const isWriting = user.status === 'Writing...';
              const isAway = user.status === 'Away';
              const isOnline = user.status === 'Active Now' || isWriting || !user.status;

              return (
                <div 
                  key={user.id || user.name}
                  className={`flex items-center gap-3 px-2 py-1.5 rounded-lg transition-all ${
                    isMe ? 'bg-indigo-50/50' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className={`w-8 h-8 rounded-full border border-slate-200 object-cover ${
                          isAway ? 'grayscale opacity-50' : ''
                        }`}
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase border border-slate-200 ${
                        isAway ? 'grayscale opacity-50' : ''
                      }`}>
                        {user.name?.charAt(0) || '?'}
                      </div>
                    )}
                    
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-slate-50" />
                    )}
                    {isAway && (
                      <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-slate-400 ring-2 ring-slate-50" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-900 truncate max-w-[150px]">
                      {user.name} {isMe && <span className="text-slate-400 font-normal font-mono text-[9px]">(You)</span>}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium tracking-tight truncate">
                      {user.status || 'Active Now'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 bg-slate-100/50">
        <button
          onClick={onLeaveRoom}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 hover:border-slate-300 transition-all font-sans text-xs uppercase font-bold tracking-wider rounded-lg cursor-pointer"
        >
          <LogOut className="w-4 h-4 stroke-[1.5]" />
          <span>Leave Room</span>
        </button>
      </div>
    </aside>
  );
}