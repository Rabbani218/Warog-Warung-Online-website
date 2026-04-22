"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ border: '1px solid rgba(255, 107, 107, 0.2)' }}
          >
            {/* Header */}
            <div className="bg-[#FF6B6B] p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-bold tracking-tight">Wareb AI Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30"
            >
              {messages.length === 0 && (
                <div className="text-center mt-10">
                  <Bot size={40} className="mx-auto text-[#FF6B6B] opacity-50 mb-2" />
                  <p className="text-slate-500 text-sm">Halo! Ada yang bisa saya bantu hari ini?</p>
                </div>
              )}
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-200' : 'bg-[#FF6B6B] text-white'}`}>
                      {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-[#FF6B6B] text-white rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none shadow-sm text-slate-700'}`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center">
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl text-center">
                  Terjadi kesalahan. Pastikan API Key sudah dikonfigurasi.
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100">
              <div className="relative flex items-center">
                <input
                  className="w-full bg-slate-100 border-none rounded-full py-2.5 pl-4 pr-12 text-sm focus:ring-2 focus:ring-[#FF6B6B] transition-all outline-none"
                  value={input}
                  placeholder="Tanya sesuatu..."
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 p-1.5 bg-[#FF6B6B] text-white rounded-full disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Buka Chatbot"
        className="w-14 h-14 bg-[#FF6B6B] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#ff5252] transition-colors relative"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
        )}
      </motion.button>
    </div>
  );
}
