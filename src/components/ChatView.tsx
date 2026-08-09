import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AlUlaItem } from '../types';
import { Sparkles, User, Send, Volume2, VolumeX, Calendar, MapPin, Star, Ticket, ArrowLeft, RefreshCw } from 'lucide-react';

interface Props {
  onOpenBooking: (item: AlUlaItem) => void;
}

export const ChatView: React.FC<Props> = ({ onOpenBooking }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: 'يا هلا بك! 🐪 أنا **رفيق العلا الشامل**. \n\nيمكنني مساعدتك في اكتشاف أفضل **المطاعم**، **الأماكن السياحية والأثرية**، **الفعاليات الحماسية**، ودرجات **الطقس المباشرة**. جرب تسألني اللي بخاطرك!',
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'يا هلا بك! أنا هنا لخدمتك دائماً.',
        cards: data.cards,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat send error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `ast-err-${Date.now()}`,
          sender: 'assistant',
          text: 'عذراً، حدث خطأ مؤقت في الاتصال. يمكنك إعادة المحاولة وسأكون معك فوراً! 🐪',
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-Speech support
  const speakText = (msgId: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking === msgId) {
        window.speechSynthesis.cancel();
        setIsSpeaking(null);
        return;
      }

      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;

      utterance.onend = () => setIsSpeaking(null);
      utterance.onerror = () => setIsSpeaking(null);

      setIsSpeaking(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-full frosted-glass-dark relative shadow-2xl overflow-hidden rounded-2xl border border-white/10">
      {/* Sub-Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-xl z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg shadow-sm border border-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              مساعد العلا الشامل
            </h2>
            <p className="text-[10px] text-emerald-400 font-medium flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full ml-1 animate-pulse"></span>
              الذكاء الاصطناعي نشط • رفيقك السياحي
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'msg-init-reset',
                sender: 'assistant',
                text: 'تم بدء محادثة جديدة! يا هلا بك، ما الذي ترغب باستكشافه في العلا اليوم؟ 🐪',
                timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          }}
          className="text-xs text-zinc-300 hover:text-amber-400 p-1.5 rounded-xl border border-white/10 hover:border-amber-500/30 bg-white/5 hover:bg-white/10 backdrop-blur-md transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">محادثة جديدة</span>
        </button>
      </div>

      {/* Chat Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs mt-1 shadow-sm ${
                  isUser
                    ? 'bg-amber-600 text-white border border-amber-400/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div className="max-w-[85%] sm:max-w-[80%] space-y-2">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed relative group backdrop-blur-xl border ${
                    isUser
                      ? 'bg-amber-600/80 text-white border-amber-500/40 rounded-tl-none shadow-lg shadow-amber-900/20'
                      : 'bg-white/10 text-zinc-100 border-white/10 rounded-tr-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {!isUser && (
                    <button
                      onClick={() => speakText(msg.id, msg.text)}
                      title="قراءة النص بصوت المرشد"
                      className="absolute left-2 bottom-2 opacity-70 hover:opacity-100 p-1 rounded-md text-amber-400 hover:bg-white/10 transition"
                    >
                      {isSpeaking === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                  <span className="text-[10px] opacity-60 block text-left mt-1">{msg.timestamp}</span>
                </div>

                {/* Optional Cards Row */}
                {msg.cards && msg.cards.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 pt-1 chat-scroll snap-x">
                    {msg.cards.map(card => (
                      <div
                        key={card.id}
                        className="min-w-[220px] max-w-[240px] frosted-glass-card rounded-2xl overflow-hidden shrink-0 snap-start flex flex-col justify-between group transition duration-300"
                      >
                        <div className="relative h-28 overflow-hidden">
                          <img
                            src={card.img}
                            alt={card.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                          />
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/30">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{card.rating}</span>
                          </div>
                        </div>

                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-white text-xs mb-1 line-clamp-1">
                              {card.title}
                            </h4>
                            <p className="text-[11px] text-zinc-300 mb-2 line-clamp-2">
                              {card.desc}
                            </p>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-white/10">
                            <div className="flex items-center justify-between text-[10px] text-zinc-300">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-amber-400" />
                                {card.location}
                              </span>
                              <span className="font-bold text-amber-300">{card.price}</span>
                            </div>

                            <button
                              onClick={() => onOpenBooking(card)}
                              className="w-full bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-bold py-2 rounded-xl active:scale-95 transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/20 border border-amber-500/30"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              <span>{card.btnText}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs shadow-sm border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl rounded-tr-none px-4 py-3 flex items-center gap-2 text-zinc-300 text-xs">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
              <span>جاري صياغة التوصية والرد المعرفي...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-3 py-2 bg-black/30 backdrop-blur-xl border-t border-white/10 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
        {[
          { label: 'أفضل المطاعم 🍽️', query: 'أريد ترشيح أفضل مطاعم العلا للحجز' },
          { label: 'جولة الحجر 🏛️', query: 'كيف أحجز جولة في الحجر مدائن صالح؟' },
          { label: 'تأمل النجوم 🌌', query: 'تفاصيل رحلة تأمل النجوم في الغراميل' },
          { label: 'طقس العلا 🌤️', query: 'ما هي حالة الطقس والتوصيات للزيارة؟' },
          { label: 'تخطيط 3 أيام 📅', query: 'اقترح لي جدول سياحي شامل لمدة 3 أيام' }
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip.query)}
            className="text-[11px] font-medium bg-white/5 hover:bg-white/15 hover:border-amber-500/40 text-zinc-200 hover:text-amber-300 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md whitespace-nowrap transition shrink-0"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-black/40 backdrop-blur-2xl border-t border-white/10 shrink-0">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-white/5 p-1.5 rounded-full border border-white/10 focus-within:border-amber-500/50 backdrop-blur-md transition"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="اسأل عن مطاعم، معالم، فعاليات، طقس، حجز..."
            className="flex-1 bg-transparent border-none outline-none text-white text-xs px-3 placeholder-zinc-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-full bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 transition flex items-center justify-center shrink-0 shadow-lg shadow-amber-900/30 border border-amber-500/30"
          >
            <Send className="w-4 h-4 pl-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
