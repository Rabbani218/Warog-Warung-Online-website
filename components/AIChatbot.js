"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, AlertCircle } from "lucide-react";

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
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
            style={{ 
              border: '1px solid rgba(255, 107, 107, 0.2)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.1)' 
            }}
          >
            {/* Header */}
            <div className="bg-[#FF6B6B] p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Bot size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold tracking-tight leading-none text-sm">Wareb AI Assistant</span>
                  <span className="text-[10px] opacity-80 font-medium">Bantuan Cepat 24/7</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30 scroll-smooth"
            >
              {messages.length === 0 && !error && (
                <div className="text-center mt-12 space-y-4">
                  <div className="w-16 h-16 bg-rose-50 text-[#FF6B6B] rounded-2xl flex items-center justify-center mx-auto">
                    <Bot size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Halo! 👋</h4>
                    <p className="text-slate-500 text-xs px-8">Ada yang bisa saya bantu hari ini? Tanyakan apa saja tentang menu atau promo kami.</p>
                  </div>
                </div>
              )}
              
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.role === 'user' ? 'bg-slate-100 text-slate-500' : 'bg-[#FF6B6B] text-white'}`}>
                      {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-[#FF6B6B] text-white rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none text-slate-700'}`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FF6B6B] text-white flex items-center justify-center shadow-sm">
                      <Loader2 size={14} className="animate-spin" />
                    </div>
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-[#FF6B6B]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#FF6B6B]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#FF6B6B]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-[1.5rem] text-center space-y-3">
                  <AlertCircle size={32} className="mx-auto text-rose-400" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-rose-900">Layanan Bermasalah</p>
                    <p className="text-[11px] text-rose-600 leading-relaxed px-2">
                      Maaf, Layanan Customer Service internal sedang dalam perbaikan. Silakan tinggalkan pesan pada menu ulasan.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-5 bg-white border-t border-slate-100">
              <div className="relative flex items-center">
                <input
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-5 pr-14 text-[13px] focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all outline-none"
                  value={input}
                  placeholder="Ketik pesan Anda..."
                  onChange={handleInputChange}
                  disabled={isLoading || !!error}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input?.trim() || !!error}
                  className="absolute right-2 p-2 bg-[#FF6B6B] text-white rounded-xl disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#FF6B6B]/20"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified FAB */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Layanan Customer Service"
        className="w-14 h-14 bg-[#FF6B6B] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#ff5252] transition-all duration-300 group"
        style={{ 
          boxShadow: "0 10px 30px rgba(255, 107, 107, 0.4)",
          border: "4px solid rgba(255,255,255,0.2)"
        }}
      >
        {isOpen ? (
          <X size={24} className="transition-transform group-hover:rotate-90 duration-300" />
        ) : (
          <MessageCircle size={28} className="transition-transform group-hover:-rotate-12 duration-300" />
        )}
      </motion.button>
    </div>
  );
}
