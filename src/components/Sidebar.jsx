import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, MessageSquare, Hash, Users, LogOut } from 'lucide-react';

export default function Sidebar({ roomId, userName, activeTab, setActiveTab, activeUsers = [], onLeaveRoom }) {
  const [copied, setCopied] = useState(false);

  const handleCopyRoomId = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="flex flex-col h-full w-[280px] bg-[#141416] border-r border-zinc-800 shrink-0 select-none">
      {/* Sidebar Header: Room Identity and Code */}
      <div className="p-6 flex flex-col gap-2 border-b border-zinc-800/50">
        <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
          <span>ROOM IDENTITY</span>
          <button 
            onClick={handleCopyRoomId}
            className="p-1 hover:text-white text-zinc-500 transition-colors cursor-pointer"
            title="Copy Room ID"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2]" />
            ) : (
              <Copy className="w-3.5 h-3.5 stroke-[1.5]" />
            )}
          </button>
        </div>
        <div className="text-xl font-bold text-white tracking-widest font-mono">
          #{roomId}
        </div>
      </div>

      {/* Navigation channels/messages list */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
        <div className="space-y-1">
          <span className="px-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            Navigation
          </span>
          
          <div className="space-y-0.5 pt-2">
            {/* Messages button */}
            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all text-sm rounded-none border-l-2 cursor-pointer ${
                activeTab === 'messages' 
                  ? 'bg-[#1e1e21] text-white border-white font-medium' 
                  : 'text-zinc-400 border-transparent hover:bg-[#18181b]/50 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 stroke-[1.5]" />
              <span>Messages</span>
            </button>

            {/* Channels button */}
            <button
              onClick={() => setActiveTab('channels')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all text-sm rounded-none border-l-2 cursor-pointer ${
                activeTab === 'channels' 
                  ? 'bg-[#1e1e21] text-white border-white font-medium' 
                  : 'text-zinc-400 border-transparent hover:bg-[#18181b]/50 hover:text-white'
              }`}
            >
              <Hash className="w-4 h-4 stroke-[1.5]" />
              <span>Channels</span>
            </button>

            {/* Contacts button */}
            <button
              onClick={() => setActiveTab('contacts')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all text-sm rounded-none border-l-2 cursor-pointer ${
                activeTab === 'contacts' 
                  ? 'bg-[#1e1e21] text-white border-white font-medium' 
                  : 'text-zinc-400 border-transparent hover:bg-[#18181b]/50 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 stroke-[1.5]" />
              <span>Contacts</span>
            </button>
          </div>
        </div>

        {/* Active users section */}
        <div className="space-y-1.5">
          <span className="px-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex justify-between items-center">
            <span>ACTIVE USERS</span>
            <span className="text-[9px] font-mono font-normal opacity-55">
              ({activeUsers?.length || 0})
            </span>
          </span>

          <div className="space-y-1 pt-2">
            {activeUsers?.map((user) => {
              if (!user) return null;
              const isMe = user.name === userName;
              const isWriting = user.status === 'Writing...';
              const isAway = user.status === 'Away';
              const isOnline = user.status === 'Active Now' || isWriting || !user.status;

              return (
                <div 
                  key={user.id || user.name}
                  className={`flex items-center gap-3 px-2 py-2 transition-all rounded-none ${
                    isMe ? 'bg-[#18181b]/30' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className={`w-8 h-8 rounded-full border border-zinc-800 object-cover ${
                          isAway ? 'grayscale opacity-50' : ''
                        }`}
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase border border-zinc-800 ${
                        isAway ? 'grayscale opacity-50' : ''
                      }`}>
                        {user.name?.charAt(0) || '?'}
                      </div>
                    )}
                    
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-[#141416]" />
                    )}
                    {isAway && (
                      <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-zinc-600 ring-2 ring-[#141416]" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                      {user.name} {isMe && <span className="text-zinc-500 font-normal font-mono text-[10px]">(You)</span>}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium tracking-tight truncate">
                      {user.status || 'Active Now'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer element */}
      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={onLeaveRoom}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/40 hover:border-zinc-700 transition-all font-sans text-xs uppercase font-bold tracking-wider cursor-pointer"
        >
          <LogOut className="w-4 h-4 stroke-[1.5]" />
          <span>Leave Room</span>
        </button>
      </div>
    </aside>
  );
}