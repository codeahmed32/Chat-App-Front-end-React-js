import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Smile, Send, Search, Video, Phone, Info, Hash, MessagesSquare, Users,
  ChevronRight, ArrowDown, HelpCircle, HardDrive, BellRing, Settings
} from 'lucide-react';

export default function ChatScreen({ userName, roomId, onLeaveRoom, socket }) {
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('channels');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [showInfoSidebar, setShowInfoSidebar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle incoming messages from socket backend
  useEffect(() => {
    if (!socket) return;

    // Direct registration for message handling
    socket.on('message', (incomingMessage) => {
      if (!incomingMessage) return;
      
      const isMe = incomingMessage.senderName === userName;

      // Filter state updates properly to avoid duplicate object injections
      setMessages((prev) => {
        // Stop accumulation if duplicate id or exact payload match exists
        const exists = prev.some(msg => msg.timeRaw === incomingMessage.timeStamp && msg.text === incomingMessage.message);
        if (exists) return prev;

        return [...prev, {
          id: incomingMessage.id || Date.now() + Math.random(),
          sender: incomingMessage.senderName, 
          text: incomingMessage.message,       
          time: incomingMessage.timeStamp ? new Date(incomingMessage.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          timeRaw: incomingMessage.timeStamp,
          isMe: isMe
        }];
      });
    });

    // Handle historic chat load from MongoDB/Redis pipeline
    socket.on('chat_history', (history) => {
      if (Array.isArray(history)) {
        const mappedHistory = history.map((msg) => ({
          id: msg._id || Math.random(),
          sender: msg.senderName,
          text: msg.message,
          time: msg.timeStamp ? new Date(msg.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          timeRaw: msg.timeStamp,
          isMe: msg.senderName === userName
        }));
        setMessages(mappedHistory);
      }
    });

    return () => {
      socket.off('message');
      socket.off('chat_history');
    };
  }, [socket, userName]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !socket) return;

    const messagePayload = {
      room: String(roomId).trim(),
      senderName: userName, 
      message: inputText.trim() 
    };

    // Emit statement targeting backend socket endpoints
    socket.emit('send', messagePayload);

    setInputText('');
    setShowEmojiPicker(false);
  };

  const addEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const safeMessages = Array.isArray(messages) ? messages : [];

  const filteredMessages = safeMessages.filter(msg =>
    msg && msg.text && msg.text.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const emojiList = ['👍', '👀', '🔥', '🚀', '💻', '🔒', '💯', '✨', '⚡', '☕', '⚙️', '🐛'];

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative selection:bg-indigo-600 selection:text-white">

      {/* Sidebar shell embedded inside main workspace */}
      <aside className="hidden lg:flex flex-col h-full w-[280px] bg-slate-50 border-r border-slate-200 shrink-0 select-none">
        <div className="p-6 flex flex-col gap-2 border-b border-slate-200">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider font-bold">
            <span>ROOM IDENTITY</span>
            <div className="flex items-center gap-1.5 font-mono text-indigo-600 font-bold">
              SECURE
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-widest font-mono">
            #{roomId}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
          <div className="space-y-1">
            <span className="px-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Navigation
            </span>

            <div className="space-y-1.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-sm rounded-lg cursor-pointer ${activeTab === 'messages'
                    ? 'bg-indigo-50/70 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-950 font-medium'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <MessagesSquare className="w-4 h-4 stroke-[2]" />
                  <span>Direct Messages</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${activeTab === 'messages' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                  }`}>1</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('channels')}
                className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-sm rounded-lg cursor-pointer ${activeTab === 'channels'
                    ? 'bg-indigo-100/70 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-950 font-medium'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 stroke-[2]" />
                  <span>Channels</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${activeTab === 'channels' ? 'bg-indigo-100/80 text-indigo-800' : 'bg-slate-200 text-slate-650'
                  }`}>ACTIVE</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('contacts')}
                className={`w-full flex items-center gap-2 px-3 py-2.5 transition-all text-sm rounded-lg cursor-pointer ${activeTab === 'contacts'
                    ? 'bg-indigo-100/70 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-950 font-medium'
                  }`}
              >
                <Users className="w-4 h-4 stroke-[2]" />
                <span>Contacts</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="px-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex justify-between items-center">
              <span>ACTIVE USERS</span>
              <span className="text-[9px] font-mono font-normal opacity-55">
                (LIVE)
              </span>
            </span>

            <div className="space-y-1.5 pt-2">
              <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-indigo-50/50">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {(userName || 'U').charAt(0)}
                  </div>
                  <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-slate-50" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-900 truncate max-w-[150px]">
                    {userName} <span className="text-slate-400 font-normal font-mono text-[9px]">(You)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Active Now</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200 bg-slate-100/50">
          <button
            type="button"
            onClick={onLeaveRoom}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 hover:border-slate-300 transition-all font-sans text-xs uppercase font-bold tracking-wider rounded-lg cursor-pointer"
          >
            <span>Leave Room</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <section className="flex-1 flex flex-col h-full bg-white relative">
        <header className="flex justify-between items-center h-[64px] px-6 w-full border-b border-slate-200 bg-white sticky top-0 z-40 select-none">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 text-indigo-600 rounded-lg">
              <Hash className="w-4 h-4 text-indigo-600 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-tight text-slate-800 leading-tight">
                General Channel
              </h1>
              <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">
                ROOM #{roomId} • LIVE STREAM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200/80 rounded-lg">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs w-44 placeholder:text-slate-400 text-slate-700"
              />
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <button
                type="button"
                className={`p-1 transition-colors cursor-pointer ${showInfoSidebar ? 'text-indigo-600' : 'hover:text-slate-600'}`}
                title="Toggle System Info panel"
                onClick={() => setShowInfoSidebar(!showInfoSidebar)}
              >
                <Info className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
          {searchQuery === '' && (
            <div className="border border-slate-200 border-dashed p-6 bg-indigo-50/20 mb-2 select-none rounded-xl">
              <div className="text-indigo-600 text-xs font-mono font-bold uppercase tracking-widest mb-1">
                SYSTEM COMM INITIATED
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                You have joined room <span className="text-slate-800 font-mono font-bold">#{roomId}</span>. All communications inside this room identity are routed through secure protocol hashes.
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 w-full py-2 select-none">
            <div className="h-[1px] flex-1 bg-slate-200"></div>
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-bold text-slate-400">
              TODAY
            </span>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
          </div>

          <div className="flex-col flex gap-5">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1.5 max-w-[75%] ${msg.isMe ? 'ml-auto items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 select-none">
                    {!msg.isMe && (
                      <span className="text-xs text-slate-800 font-bold">{msg.sender}</span>
                    )}
                    <span className="text-[10px] text-slate-400 font-medium font-mono">{msg.time}</span>
                    {msg.isMe && (
                      <span className="text-xs text-slate-800 font-bold">{msg.sender}</span>
                    )}
                  </div>

                  <div
                    className={`p-4 text-sm leading-relaxed font-sans shadow-sm ${msg.isMe
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 rounded-2xl rounded-tl-none'
                      }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 select-none font-mono text-xs">
                {searchQuery !== '' ? `No matching results found for "${searchQuery}"` : "Workspace empty. Send a message to begin stream."}
              </div>
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>

        <footer className="p-6 bg-white border-t border-slate-100 relative">
          <form onSubmit={handleSendMessage} className="relative">
            <div className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-xl p-3.5 shadow-sm focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all group">

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message to General Channel..."
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-slate-800 placeholder:text-slate-400"
                autoComplete="off"
              />

              <div className="flex items-center gap-3 relative text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-1 hover:text-slate-600 transition-colors cursor-pointer ${showEmojiPicker ? 'text-indigo-600' : 'text-slate-400'}`}
                  title="Insert emoji icon"
                >
                  <Smile className="w-4.5 h-4.5 stroke-[2]" />
                </button>

                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-12 right-0 z-50 bg-white border border-slate-200/80 rounded-xl p-3 flex flex-wrap gap-2 w-48 shadow-lg shrink-0"
                    >
                      {emojiList.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                          className="hover:scale-125 focus:scale-125 transition-transform text-sm cursor-pointer p-0.5"
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="h-5 w-[1px] bg-slate-200"></div>

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-2 transition-all flex items-center justify-center rounded-lg ${inputText.trim()
                      ? 'bg-indigo-600 text-white shadow shadow-indigo-150 scale-100 hover:bg-indigo-700 active:scale-95 cursor-pointer'
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                  title="Deliver message transmission"
                >
                  <Send className="w-3.5 h-3.5 fill-current stroke-none" />
                </button>
              </div>
            </div>
          </form>
        </footer>
      </section>

      {/* Right Drawer Info Panel Sidebar */}
      <AnimatePresence>
        {showInfoSidebar && (
          <motion.aside
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 300 }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
            className="h-full bg-slate-50 border-l border-slate-200 shrink-0 overflow-hidden flex flex-col uppercase font-sans select-none"
          >
            <div className="p-6 flex flex-col gap-6 h-full justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider">SYSTEM INFO PANEL</span>
                  <button
                    type="button"
                    onClick={() => setShowInfoSidebar(false)}
                    className="text-xs font-bold font-mono hover:text-slate-800 text-slate-400 transition-colors cursor-pointer"
                  >
                    CLOSE
                  </button>
                </div>

                <div className="space-y-4 text-slate-700">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider block">PROCESSOR STATUS</span>
                    <span className="text-xs font-bold text-green-600 font-mono">ONLINE • READY</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider block">CURRENT USERNAME</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">{userName}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider block">CONNECTION STATUS</span>
                    <span className="text-xs font-bold text-indigo-600 font-mono leading-relaxed lowercase">
                      connected to railway live stream
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-slate-400 text-[10px] font-mono">
                <span>SECURED PROTOCOL</span>
                <span>v1.00</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}