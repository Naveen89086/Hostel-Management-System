import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, User, Minimize2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as chatService from '../services/chat.service';
import { ChatMessage } from '../types';

export const FloatingChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([{
          _id: 'welcome',
          user: user?._id || '',
          message: `Hi ${user?.name?.split(' ')[0] || 'User'}! I'm your HostelHub AI Assistant. I'm here to help you with ${user?.role === 'admin' ? 'administrative tasks' : user?.role === 'warden' ? 'warden duties' : 'student services'}. How can I help you today?`,
          sender: 'ai',
          createdAt: new Date().toISOString()
        }]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleClearChat = () => {
    setMessages([{
      _id: 'welcome',
      user: user?._id || '',
      message: `Hi ${user?.name?.split(' ')[0] || 'User'}! I'm your HostelHub AI Assistant. I'm here to help you with ${user?.role === 'admin' ? 'administrative tasks' : user?.role === 'warden' ? 'warden duties' : 'student services'}. How can I help you today?`,
      sender: 'ai',
      createdAt: new Date().toISOString()
    }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessageStr = inputValue.trim();
    setInputValue('');
    
    const tempUserMsg: ChatMessage = {
      _id: Date.now().toString(),
      user: user?._id || '',
      message: userMessageStr,
      sender: 'user',
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const res = await chatService.sendMessage(userMessageStr);
      if (res.success && res.data) {
        setMessages(prev => {
          const filtered = prev.filter(m => m._id !== tempUserMsg._id);
          return [...filtered, res.data!.userMessage, res.data!.aiMessage];
        });
      }
    } catch (error) {
      console.error('Failed to send message', error);
      setMessages(prev => prev.filter(m => m._id !== tempUserMsg._id));
    } finally {
      setIsTyping(false);
    }
  };

  if (!user) return null;

  const renderMessageBubble = (msg: ChatMessage, idx: number) => {
    const isAi = msg.sender === 'ai';
    return (
      <div key={msg._id || idx} className={`flex gap-2 ${isAi ? '' : 'flex-row-reverse'}`}>
        <div className={`h-7 w-7 rounded-full flex flex-shrink-0 items-center justify-center shadow-sm overflow-hidden ${isAi ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
          {isAi ? <img src="/ai-agent-profile.png" alt="AI" className="h-full w-full object-cover" /> : <User className="h-4 w-4" />}
        </div>
        
        <div className={`flex flex-col max-w-[75%] ${isAi ? 'items-start' : 'items-end'}`}>
          <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
            isAi 
              ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm shadow-sm' 
              : 'bg-blue-600 text-white rounded-tr-sm shadow-md'
          }`}>
            <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-fade-in">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[340px] sm:w-[380px] h-[550px] max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-scale-in origin-bottom-right">
          
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden">
                <img src="/ai-agent-profile.png" alt="AI" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML = '<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>'; }} />
              </div>
              <div>
                <h3 className="font-bold text-sm">HostelHub Agent</h3>
                <p className="text-[10px] text-blue-100 font-medium">Always Ready</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearChat}
                title="Clear Chat"
                className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                title="Minimize"
                className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-white"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 flex flex-col gap-4">
            
            {messages.map(renderMessageBubble)}
            
            {isTyping && (
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-600 flex flex-shrink-0 items-center justify-center shadow-sm overflow-hidden">
                  <img src="/ai-agent-profile.png" alt="AI" className="h-full w-full object-cover" />
                </div>
                <div className="bg-white border border-slate-100 px-4 py-3.5 rounded-2xl rounded-tl-sm flex gap-1.5 shadow-sm items-center h-10">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-slate-800"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-1.5 bottom-1.5 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-50 ${
          isOpen ? 'bg-slate-800' : 'bg-gradient-to-br from-blue-600 to-indigo-600'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="h-full w-full rounded-full overflow-hidden p-[2px]">
            <div className="h-full w-full bg-white rounded-full flex items-center justify-center overflow-hidden">
               <img src="/ai-agent-profile.png" alt="Chat" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML = '<svg class="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>'; }} />
            </div>
          </div>
        )}
      </button>
      
    </div>
  );
};
