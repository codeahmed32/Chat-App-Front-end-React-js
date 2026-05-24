import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Smile, Send, Search, Info, Hash, Edit2, Trash2
} from 'lucide-react';
import Sidebar from './Sidebar.jsx'; 

export default function ChatScreen({ userName, roomId, onLeaveRoom, socket }) {
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('channels');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [showInfoSidebar, setShowInfoSidebar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]); 
  const [contextMenu, setContextMenu] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editInputText, setEditInputText] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on('message', (incomingMessage) => {
      if (!incomingMessage) return;

      const isMe = incomingMessage.senderName === userName;

      setMessages((prev) => {
        const exists = prev.some(msg => msg.id === incomingMessage._id || (msg.timeRaw === incomingMessage.timeStamp && msg.text === incomingMessage.message));
        if (exists) return prev;

        return [...prev, {
          id: incomingMessage._id || Date.now() + Math.random(),
          sender: incomingMessage.senderName,
          text: incomingMessage.message,
          time: incomingMessage.timeStamp ? new Date(incomingMessage.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timeRaw: incomingMessage.timeStamp,
          isMe: isMe,
          isEdited: incomingMessage.isEdited || false
        }];
      });
    });

    socket.on('chat_history', (history) => {
      if (Array.isArray(history)) {
        const mappedHistory = history.map((msg) => ({
          id: msg._id || Math.random(),
          sender: msg.senderName,
          text: msg.message,
          time: msg.timeStamp ? new Date(msg.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          timeRaw: msg.timeStamp,
          isMe: msg.senderName === userName,
          isEdited: msg.isEdited || false
        }));
        setMessages(mappedHistory);
      }
    });

    socket.on('message_edited', ({ messageId, message }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, text: message, isEdited: true } : msg
        )
      );
    });

    socket.on('message_deleted', ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    });

    socket.on('room_users', (users) => {
      if (Array.isArray(users)) {
        setActiveUsers(users);
      }
    });

    return () => {
      socket.off('message');
      socket.off('chat_history');
      socket.off('message_edited');
      socket.off('message_deleted');
      socket.off('room_users'); 
    };
  }, [socket, userName]);

  useEffect(() => {
    const handleCloseContextMenu = () => setContextMenu(null);
    window.addEventListener('click', handleCloseContextMenu);
    return () => window.removeEventListener('click', handleCloseContextMenu);
  }, []);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !socket) return;

    const messagePayload = {
      room: String(roomId).trim(),
      senderName: userName,
      message: inputText.trim()
    };

    socket.emit('send', messagePayload);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    e.stopPropagation(); 

    if (!msg.isMe) return;

    const menuWidth = 145;
    const menuHeight = 90;
    let x = e.clientX;
    let y = e.clientY;

    if (e.changedTouches && e.changedTouches.length > 0) {
      x = e.changedTouches[0].clientX;
      y = e.changedTouches[0].clientY;
    }

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }

    setContextMenu({
      mouseX: x,
      mouseY: y,
      messageId: msg.id,
      currentText: msg.text
    });
  };

  const triggerEditMode = () => {
    if (!contextMenu) return;
    setEditingMessageId(contextMenu.messageId);
    setEditInputText(contextMenu.currentText);
    setContextMenu(null);
  };

  const handleSaveEdit = (e) => {
    if (e) e.preventDefault();
    if (!editInputText.trim() || !socket || !editingMessageId) return;

    socket.emit('edit_message', {
      room: String(roomId).trim(),
      messageId: editingMessageId,
      newMessage: editInputText.trim()
    });

    setEditingMessageId(null);
    setEditInputText('');
  };

  const handleDeleteMessage = () => {
    if (!contextMenu || !socket) return;

    socket.emit('delete_message', {
      room: String(roomId).trim(),
      messageId: contextMenu.messageId
    });
    setContextMenu(null);
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

      <Sidebar 
        roomId={roomId} 
        userName={userName} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeUsers={activeUsers} 
        onLeaveRoom={onLeaveRoom} 
      />

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
                    <span className="text-[10px] text-slate-400 font-medium font-mono">
                      {msg.time} {msg.isEdited && <span className="text-slate-400/80 italic font-sans font-normal ml-1">(edited)</span>}
                    </span>
                    {msg.isMe && (
                      <span className="text-xs text-slate-800 font-bold">{msg.sender}</span>
                    )}
                  </div>

                  {editingMessageId === msg.id ? (
                    <form onSubmit={handleSaveEdit} className="flex items-center gap-2 w-full max-w-md bg-slate-100 p-1.5 rounded-xl border border-slate-300">
                      <input
                        type="text"
                        value={editInputText}
                        onChange={(e) => setEditInputText(e.target.value)}
                        className="flex-1 bg-transparent px-3 py-1 text-sm text-slate-800 outline-none border-none focus:ring-0"
                        autoFocus
                      />
                      <button type="submit" className="px-3 py-1 bg-indigo-600 text-white font-medium text-xs rounded-lg hover:bg-indigo-700 transition-colors">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingMessageId(null)} className="px-3 py-1 bg-slate-200 text-slate-600 font-medium text-xs rounded-lg hover:bg-slate-300 transition-colors">
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div
                      onContextMenu={(e) => handleContextMenu(e, msg)}
                      className={`p-4 text-sm leading-relaxed font-sans shadow-sm transition-all duration-150 relative group select-text ${msg.isMe
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none hover:bg-indigo-700 cursor-context-menu'
                        : 'bg-slate-100 text-slate-800 rounded-2xl rounded-tl-none'
                        }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  )}
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

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
            className="fixed z-50 min-w-[140px] bg-white border border-slate-200 shadow-xl rounded-xl p-1.5 flex flex-col select-none"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                triggerEditMode();
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Edit Message</span>
            </button>

            <div className="h-[1px] bg-slate-100 my-1" />

            <button
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleDeleteMessage();
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Delete Message</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}