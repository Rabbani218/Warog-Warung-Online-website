"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, AlertCircle } from "lucide-react";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const scrollRef = useRef(null);
  const REQUEST_TIMEOUT_MS = 12000;
  const MAX_RETRY = 1;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  async function handleSubmit(event) {
    event.preventDefault();

    const message = input.trim();
    if (!message || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setErrorMessage("");
    setIsLoading(true);

    try {
      let reply = "";

      for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const data = await response.json().catch(() => ({}));
          const parsedReply = String(data?.reply || "").trim();

          if (!response.ok) {
            throw new Error(parsedReply || "Server mengembalikan error.");
          }

          if (!parsedReply) {
            throw new Error("Balasan AI kosong.");
          }

          reply = parsedReply;
          break;
        } catch (requestError) {
          clearTimeout(timeoutId);

          if (attempt === MAX_RETRY) {
            throw requestError;
          }
        }
      }

      if (!reply) {
        throw new Error("Balasan AI kosong.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      setErrorMessage("Terjadi gangguan koneksi...");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          role: "assistant",
          content:
            "Maaf, sistem AI kami sedang istirahat sebentar. Silakan hubungi kasir secara langsung.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

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
              {messages.length === 0 && !errorMessage && (
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

              {errorMessage && (
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
              {errorMessage && (
                <div className="mb-3 flex items-center justify-between bg-rose-50 p-2 rounded-xl border border-rose-100">
                  <span className="text-[10px] text-rose-600 font-bold italic">{errorMessage}</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setMessages([]);
                      setInput("");
                    }}
                    className="text-[10px] bg-rose-500 text-white px-2 py-1 rounded-lg font-bold"
                  >
                    Reset Bot
                  </button>
                </div>
              )}
              <div className="relative flex items-center">
                <input
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-5 pr-14 text-[13px] focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all outline-none"
                  value={input}
                  placeholder={isLoading ? "Bot sedang mengetik..." : "Ketik pesan Anda..."}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input?.trim()}
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
