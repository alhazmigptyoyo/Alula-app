import React, { useState, useEffect } from 'react';
import { ItineraryDay, AlUlaItem } from '../types';
import { fetchItineraryData } from '../services/api';
import { Calendar, Clock, MapPin, Sparkles, Ticket, Lightbulb, ChevronLeft } from 'lucide-react';

interface Props {
  onOpenBooking: (item: AlUlaItem) => void;
}

export const ItineraryView: React.FC<Props> = ({ onOpenBooking }) => {
  const [selectedDays, setSelectedDays] = useState<number>(2);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchItinerary = async (days: number) => {
    setIsLoading(true);
    try {
      const data = await fetchItineraryData(days);
      setItinerary(data);
    } catch (err) {
      console.error('Failed to fetch itinerary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItinerary(selectedDays);
  }, [selectedDays]);

  return (
    <div className="flex flex-col h-full frosted-glass-dark rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Header Controls */}
      <div className="p-4 bg-white/5 backdrop-blur-xl border-b border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">مخطط الرحلات الذكي</h2>
              <p className="text-xs text-zinc-300">جداول متكاملة مصممة خصيصاً لمناخ وجغرافية العلا</p>
            </div>
          </div>
        </div>

        {/* Days Selector */}
        <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
          {[1, 2, 3].map(d => (
            <button
              key={d}
              onClick={() => setSelectedDays(d)}
              className={`py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
                selectedDays === d
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10 backdrop-blur-md'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              جدول {d} {d === 1 ? 'يوم' : d === 2 ? 'يومان' : 'أيام'}
            </button>
          ))}
        </div>
      </div>

      {/* Itinerary Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-black/20">
        {isLoading ? (
          <div className="text-center py-12 space-y-3">
            <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-xs text-zinc-300">جاري تنظيم الخطة السياحية المثالية وتوزيع الأوقات...</p>
          </div>
        ) : (
          itinerary.map(day => (
            <div
              key={day.dayNumber}
              className="frosted-glass-card border border-white/10 rounded-2xl p-4 shadow-md space-y-4"
            >
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                <span className="w-7 h-7 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center">
                  {day.dayNumber}
                </span>
                <h3 className="font-bold text-sm text-white">{day.dayTitle}</h3>
              </div>

              <div className="space-y-4 relative pr-4 border-r-2 border-amber-500/40">
                {day.activities.map((act, idx) => (
                  <div key={idx} className="relative space-y-2">
                    <div className="absolute -right-[23px] top-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-black" />

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
                        {act.timeSlot}
                      </span>
                      <span className="text-[10px] text-zinc-300">
                        {act.period === 'morning' ? 'الصباح 🌅' : act.period === 'afternoon' ? 'الظهيرة والعصر ☀️' : 'المساء والليل 🌙'}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-white">{act.title}</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">{act.desc}</p>

                    {act.tip && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-200 bg-white/5 p-2.5 rounded-xl border border-white/10 backdrop-blur-md">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{act.tip}</span>
                      </div>
                    )}

                    {act.itemRef && (
                      <div className="pt-1">
                        <button
                          onClick={() => onOpenBooking(act.itemRef!)}
                          className="text-xs bg-amber-600/90 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border border-amber-500/30 shadow-md shadow-amber-900/20"
                        >
                          <Ticket className="w-3 h-3" />
                          <span>احجز هذا النشاط ({act.itemRef.title})</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
