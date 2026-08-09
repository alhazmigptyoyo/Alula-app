import React, { useState } from 'react';
import { AlUlaItem, BookingTicket } from '../types';
import { X, Calendar, Clock, Users, User, CheckCircle2, QrCode, Download, Share2, Ticket } from 'lucide-react';

interface Props {
  item: AlUlaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: (ticket: BookingTicket) => void;
}

export const BookingModal: React.FC<Props> = ({ item, isOpen, onClose, onBookingComplete }) => {
  if (!isOpen || !item) return null;

  const [guestName, setGuestName] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [bookingTime, setBookingTime] = useState('07:00 مساءً');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState<BookingTicket | null>(null);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          guestName: guestName || 'ضيف العلا الكريم',
          guestsCount,
          bookingDate,
          bookingTime
        })
      });

      const data = await res.json();
      if (data.ticket) {
        setConfirmedTicket(data.ticket);
        onBookingComplete(data.ticket);
      }
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmedTicket(null);
    setGuestName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="frosted-glass-dark border border-amber-500/30 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative text-white">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-2xl p-5 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {confirmedTicket ? 'تأكيد الحجز والتذكرة الرقمية' : `طلب حجز: ${item.title}`}
              </h3>
              <p className="text-xs text-amber-300">{item.location}</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {confirmedTicket ? (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-white">تم تأكيد الحجز بنجاح!</h4>
                <p className="text-xs text-zinc-300 mt-1">
                  رقم الحجز المرجعي: <span className="font-mono font-bold text-amber-300 text-sm">{confirmedTicket.ticketId}</span>
                </p>
              </div>

              {/* Digital Ticket Card */}
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-amber-500/30 text-right space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <img src={item.img} alt={item.title} className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                    <div>
                      <h5 className="font-bold text-sm text-white">{item.title}</h5>
                      <span className="text-[11px] text-amber-300 font-medium">{confirmedTicket.category}</span>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    مؤكد
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
                  <div>
                    <span className="text-zinc-400 text-[10px] block">اسم الضيف:</span>
                    <span className="font-bold text-white">{confirmedTicket.guestName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-[10px] block">عدد الأشخاص:</span>
                    <span className="font-bold text-white">{confirmedTicket.guestsCount} زوار</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-[10px] block">تاريخ الزيارة:</span>
                    <span className="font-bold text-white">{confirmedTicket.bookingDate}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-[10px] block">الوقت الموعد:</span>
                    <span className="font-bold text-white">{confirmedTicket.bookingTime}</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="pt-2 flex flex-col items-center justify-center border-t border-white/10">
                  <img
                    src={confirmedTicket.qrCodeUrl}
                    alt="QR Ticket Code"
                    className="w-32 h-32 bg-white p-2 rounded-xl shadow-md"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">إبرز الرمز عند نقطة الدخول أو الاستقبال</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-2xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 border border-amber-500/30"
                >
                  حفظ وتأكيد
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBook} className="space-y-4 text-right">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <img src={item.img} alt={item.title} className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                <div>
                  <h4 className="font-bold text-sm text-white">{item.title}</h4>
                  <p className="text-xs text-amber-300 font-semibold">{item.price}</p>
                  <p className="text-[11px] text-zinc-300 mt-0.5">{item.recommendedTime}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  اسم الضيف الرئيسي
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="أدخل اسمك الكريم"
                    className="w-full pr-9 pl-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50 backdrop-blur-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    تاريخ الحجز
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)}
                      className="w-full pr-9 pl-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 backdrop-blur-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    الفترة / الوقت
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
                    <select
                      value={bookingTime}
                      onChange={e => setBookingTime(e.target.value)}
                      className="w-full pr-9 pl-3 py-2 bg-[#1a1918] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="08:30 صباحاً">08:30 صباحاً (الشروق والأنشطة)</option>
                      <option value="01:30 ظهراً">01:30 ظهراً (الغداء)</option>
                      <option value="05:30 مساءً">05:30 مساءً (الغروب والجلسات)</option>
                      <option value="08:00 مساءً">08:00 مساءً (العشاء والنوافذ الفلكية)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  عدد الأشخاص / التذاكر
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={guestsCount}
                    onChange={e => setGuestsCount(Number(e.target.value))}
                    className="w-full pr-9 pl-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50 backdrop-blur-md"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-2xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 border border-amber-500/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري إصدار الحجز والتذكرة...' : 'تأكيد الحجز والحصول على التذكرة 🎟️'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
