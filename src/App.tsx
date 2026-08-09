import React, { useState, useEffect } from 'react';
import { WeatherData, AlUlaItem, BookingTicket } from './types';
import { ChatView } from './components/ChatView';
import { ExploreView } from './components/ExploreView';
import { ItineraryView } from './components/ItineraryView';
import { TicketsView } from './components/TicketsView';
import { WeatherWidget } from './components/WeatherWidget';
import { BookingModal } from './components/BookingModal';
import { fetchWeather as getWeather } from './services/api';
import { Sparkles, MessageSquare, Compass, Calendar, Ticket, Sun, Moon, Info, ShieldCheck, MapPin, Sparkle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'explore' | 'itinerary' | 'tickets'>('chat');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [selectedItemForBooking, setSelectedItemForBooking] = useState<AlUlaItem | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);

  useEffect(() => {
    loadWeather();
    const interval = setInterval(loadWeather, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadWeather = async () => {
    try {
      const data = await getWeather();
      setWeather(data);
    } catch (err) {
      console.error('Weather fetch failed:', err);
    }
  };

  const handleOpenBooking = (item: AlUlaItem) => {
    setSelectedItemForBooking(item);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="flex w-full h-screen bg-[#0f0e0d] font-sans text-slate-100 overflow-hidden select-none relative">
      {/* Background Ambient Glass Glows */}
      <div className="fixed -top-20 -left-20 w-96 h-96 bg-[#b45309]/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-20 right-1/4 w-[500px] h-[500px] bg-amber-900/15 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-20 w-80 h-80 bg-orange-950/25 rounded-full blur-[130px] pointer-events-none z-0" />

      <div className="flex w-full h-full relative z-10 p-2 sm:p-4 gap-4">
        {/* Left Panel - Desktop Branding & Scenic Experience (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 frosted-glass-dark rounded-3xl flex-col relative overflow-hidden h-full">
          {/* Background Image of Hegra & Ashar Valley */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 transition-all duration-1000 scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1542314831-c6a4d14b8a4f?q=80&w=2000&auto=format&fit=crop')`
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0d] via-[#0f0e0d]/70 to-transparent" />

          {/* Top Branding Content */}
          <div className="relative z-10 p-10 flex flex-col h-full justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl shadow-lg shadow-amber-900/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>الذكاء الاصطناعي التفاعلي لحجز وتخطيط رحلات العلا</span>
              </div>

              <div>
                <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                  رفيق العلا الشامل
                </h1>
                <p className="text-amber-300/90 text-lg mt-2 font-medium tracking-wide">
                  AlUla Ultimate Companion
                </p>
              </div>

              <p className="text-zinc-300 text-sm max-w-md leading-relaxed">
                استكشف أرقى المطاعم، معالم مدائن صالح، جولات المنطاد، وسحر النجوم في الصحراء مع مرشد ذكي وتأكيد حجز بلمسة واحدة في تجربة أثيرية مميزة.
              </p>

              {/* Live Weather Card */}
              <div className="max-w-md">
                <WeatherWidget weather={weather} onOpenDetails={() => setShowWeatherModal(true)} />
              </div>
            </div>

            {/* Quick Badges Footer */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  '🏛️ الحجر (مدائن صالح)',
                  '🪞 قاعة مرايا',
                  '🐘 جبل الفيل',
                  '🌌 تأمل النجوم بالغراميل',
                  '🎈 جولة المناطيد',
                  '🍽️ مطعم سهيل وهابيتاس'
                ].map((badge, idx) => (
                  <span
                    key={idx}
                    className="bg-white/5 backdrop-blur-md text-amber-200 border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/10 transition"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> موثق ومربوط بأنظمة حجز العلا
                </span>
                <span>2026 © AlUla Guide</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Main App Interface */}
        <div className="w-full lg:w-1/2 flex flex-col h-full frosted-glass-dark rounded-3xl relative shadow-2xl overflow-hidden border border-white/10">
          {/* Top Header */}
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-black/30 backdrop-blur-2xl z-20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">
                  رفيق العلا الشامل
                </h2>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  الذكاء الاصطناعي نشط
                </span>
              </div>
            </div>

            {/* Weather compact badge */}
            <WeatherWidget
              weather={weather}
              compact
              onOpenDetails={() => setShowWeatherModal(true)}
            />
          </div>

          {/* Navigation Tabs Bar */}
          <div className="px-4 py-2.5 bg-black/20 backdrop-blur-xl border-b border-white/10 flex items-center justify-around shrink-0 z-10">
            {[
              { id: 'chat', label: 'المحادثة الذكية', icon: MessageSquare },
              { id: 'explore', label: 'دليل المعالم', icon: Compass },
              { id: 'itinerary', label: 'مخطط الرحلات', icon: Calendar },
              { id: 'tickets', label: 'تذاكري', icon: Ticket }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10 backdrop-blur-md'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main View Area */}
          <div className="flex-1 overflow-hidden p-3 bg-black/10 backdrop-blur-md">
            {activeTab === 'chat' && <ChatView onOpenBooking={handleOpenBooking} />}
            {activeTab === 'explore' && <ExploreView onOpenBooking={handleOpenBooking} />}
            {activeTab === 'itinerary' && <ItineraryView onOpenBooking={handleOpenBooking} />}
            {activeTab === 'tickets' && <TicketsView />}
          </div>
        </div>
      </div>

      {/* Booking Ticket Modal */}
      <BookingModal
        item={selectedItemForBooking}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingComplete={() => {
          setActiveTab('tickets');
        }}
      />

      {/* Weather Detail Modal */}
      {showWeatherModal && weather && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="frosted-glass-dark text-white rounded-3xl max-w-md w-full p-6 border border-amber-500/30 space-y-4 text-right relative shadow-2xl">
            <button
              onClick={() => setShowWeatherModal(false)}
              className="absolute top-4 left-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                {weather.isDay ? <Sun className="w-8 h-8" /> : <Moon className="w-8 h-8 text-indigo-300" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">طقس العلا المباشر</h3>
                <p className="text-xs text-amber-300">درجة الحرارة: {weather.temp}°م • {weather.condition}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/10 text-xs">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                <span className="text-zinc-400 text-[10px] block">مؤشر الأشعة الفوق بنفسجية</span>
                <span className="font-bold text-sm text-amber-400">UV: {weather.uvIndex}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                <span className="text-zinc-400 text-[10px] block">سرعة الرياح</span>
                <span className="font-bold text-sm text-teal-300">{weather.windSpeed} كم/س</span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                <span className="text-zinc-400 text-[10px] block">نسبة الرطوبة</span>
                <span className="font-bold text-sm text-sky-300">{weather.humidity}%</span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                <span className="text-zinc-400 text-[10px] block">حالة اليوم</span>
                <span className="font-bold text-sm text-amber-300">{weather.isDay ? 'نهار صحراوي مشرق' : 'ليل ساحر صافٍ'}</span>
              </div>
            </div>

            <div className="bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/30 text-xs text-amber-200 leading-relaxed backdrop-blur-md">
              💡 <span className="font-bold">التوصية السياحية للأجواء:</span> {weather.advisory}
            </div>

            <button
              onClick={() => setShowWeatherModal(false)}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-2xl transition text-xs shadow-lg shadow-amber-900/30 border border-amber-500/30"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
