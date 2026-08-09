import React, { useState, useEffect } from 'react';
import { BookingTicket, AlUlaItem } from '../types';
import { Ticket, Calendar, Clock, Users, QrCode, Trash2, CheckCircle2 } from 'lucide-react';

interface Props {
  onOpenBookingForNew?: () => void;
}

export const TicketsView: React.FC<Props> = () => {
  const [tickets, setTickets] = useState<BookingTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<BookingTicket | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      setTickets(data);
      if (data.length > 0) setSelectedTicket(data[0]);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    }
  };

  return (
    <div className="flex flex-col h-full frosted-glass-dark rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">حجوزاتي وتذاكري الرقمية</h2>
            <p className="text-xs text-zinc-300">استعرض التذاكر المؤكدة ورموز الدخول السريعة</p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md">
          {tickets.length} تذكرة مؤكدة
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
        {tickets.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Ticket className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="font-bold text-sm text-zinc-300">لا توجد حجوزات سابقة بعد</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              يمكنك حجز أي مطعم أو معلم أثري أو رحلة مغامرة مباشرة من المحادثة الذكية أو قسم الاستكشاف.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map(t => (
              <div
                key={t.ticketId}
                onClick={() => setSelectedTicket(t)}
                className={`frosted-glass-card rounded-2xl p-4 shadow-md transition duration-300 cursor-pointer border ${
                  selectedTicket?.ticketId === t.ticketId
                    ? 'border-amber-500/60 ring-2 ring-amber-500/25 bg-white/10'
                    : 'border-white/10 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <img src={t.img} alt={t.itemTitle} className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{t.itemTitle}</h4>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                          {t.status === 'confirmed' ? 'مؤكد' : t.status}
                        </span>
                      </div>

                      <p className="text-xs text-amber-300 font-medium mt-0.5">{t.category}</p>

                      <div className="flex items-center gap-3 text-[11px] text-zinc-300 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          {t.bookingDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          {t.bookingTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-zinc-400" />
                          {t.guestsCount} زوار
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-[10px] text-zinc-400 block">رقم التذكرة:</span>
                    <span className="font-mono font-bold text-xs text-amber-300">
                      {t.ticketId}
                    </span>
                  </div>
                </div>

                {/* Expanded QR Ticket View if Selected */}
                {selectedTicket?.ticketId === t.ticketId && (
                  <div className="mt-4 pt-4 border-t border-white/10 bg-amber-500/10 p-4 rounded-xl space-y-3 animate-fade-in text-center backdrop-blur-md border border-amber-500/20">
                    <div className="inline-block p-2 bg-white rounded-xl shadow-md">
                      <img src={t.qrCodeUrl} alt="Ticket QR" className="w-32 h-32" />
                    </div>
                    <p className="text-[11px] text-amber-200">
                      اسم الضيف: <span className="font-bold text-white">{t.guestName}</span> • الرجاء إبراز الباركود للمرشِد أو موظف الاستقبال
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
