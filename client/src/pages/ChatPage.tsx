import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as chatService from '../services/chat.service';
import { ChatMessage } from '../types';
import { toast } from 'react-hot-toast';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const fetchHistory = async () => {
    try {
      const res = await chatService.getChatHistory();
      if (res.success && res.data) {
        const historyMessages = (res.data as any).messages || [];
        if (historyMessages.length === 0) {
          // Add initial welcome message locally if history is empty
          setMessages([{
            _id: 'welcome',
            user: user?._id || '',
            message: `Hi ${user?.name?.split(' ')[0] || 'User'}! I'm your HostelHub AI Assistant. I can help you register complaints, request room changes, or ask about hostel facilities. How can I help you today?`,
            sender: 'ai',
            createdAt: new Date().toISOString()
          }]);
        } else {
          setMessages(historyMessages);
        }
      }
    } catch (error) {
      toast.error('Failed to load chat history');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessageStr = inputValue.trim();
    setInputValue('');
    
    // Optimistically add user message
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
        // Replace temp with actual, and add AI response
        setMessages(prev => {
          const filtered = prev.filter(m => m._id !== tempUserMsg._id);
          return [...filtered, res.data!.userMessage, res.data!.aiMessage];
        });
      }
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m._id !== tempUserMsg._id)); // Revert
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto glass-card overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700/50 bg-white/50 dark:bg-surface-900/50 flex items-center gap-4 shrink-0">
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-md">
            <Bot className="h-6 w-6" />
          </div>
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-surface-900"></span>
        </div>
        <div>
          <h2 className="font-bold text-surface-900 dark:text-white">HostelHub Agent</h2>
          <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">Powered by Grok</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-surface-50/50 dark:bg-surface-950/30">
        <div className="space-y-6">
          {messages.map((msg, idx) => {
            const isAi = msg.sender === 'ai';
            return (
              <div key={msg._id || idx} className={`flex gap-3 sm:gap-4 chat-bubble ${isAi ? '' : 'flex-row-reverse'}`}>
                <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex flex-shrink-0 items-center justify-center shadow-sm ${isAi ? 'bg-primary-500 text-white' : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300'}`}>
                  {isAi ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                
                <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isAi ? 'items-start' : 'items-end'}`}>
                  <div className={`px-4 sm:px-5 py-3 rounded-2xl ${
                    isAi 
                      ? 'bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200 border border-surface-200 dark:border-surface-700 rounded-tl-sm shadow-sm' 
                      : 'bg-primary-600 text-white rounded-tr-sm shadow-md'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  </div>
                  
                  {/* Actionable Request Link */}
                  {isAi && msg.requestCreated && (
                    <div 
                      onClick={() => navigate(`/requests/${(msg.requestCreated as any)?._id || msg.requestCreated}`)}
                      className="mt-2 bg-surface-100 dark:bg-surface-800/80 border border-surface-200 dark:border-surface-700 rounded-xl p-3 flex items-start gap-3 cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors group max-w-sm w-full shadow-sm"
                    >
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Request Created</p>
                        <p className="text-xs text-surface-500 line-clamp-1 mt-0.5">Click to track status</p>
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-surface-400 font-medium mt-1.5 px-1">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 chat-bubble">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-500 text-white flex flex-shrink-0 items-center justify-center shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 px-5 py-4 rounded-2xl rounded-tl-sm flex gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full typing-dot"></div>
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full typing-dot"></div>
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700/50 shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your request here (e.g., 'My tap is leaking' or 'I need a room change')..."
            className="input-field min-h-[52px] max-h-32 py-3.5 pr-12 resize-none custom-scrollbar"
            rows={1}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 bottom-2 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-primary-600 active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <div className="flex items-center gap-1.5 mt-3 justify-center text-[10px] sm:text-xs text-surface-400 font-medium">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>AI can automatically create actionable requests from your messages.</span>
        </div>
      </div>
    </div>
  );
};
