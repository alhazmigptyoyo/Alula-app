import React, { useState } from 'react';
import { AlUlaItem } from '../types';
import { ALULA_ITEMS } from '../data/alulaData';
import { Search, MapPin, Star, Ticket, Filter, Utensils, Landmark, Compass, Clock } from 'lucide-react';

interface Props {
  onOpenBooking: (item: AlUlaItem) => void;
}

export const ExploreView: React.FC<Props> = ({ onOpenBooking }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'restaurant' | 'place' | 'event'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemDetail, setSelectedItemDetail] = useState<AlUlaItem | null>(null);

  const filteredItems = ALULA_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full frosted-glass-dark rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Header Controls */}
      <div className="p-4 bg-white/5 backdrop-blur-xl border-b border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">دليل العُلا الشامل</h2>
            <p className="text-xs text-zinc-300">استكشف المطاعم والآثار والتجارب الصحراوية الفريدة</p>
          </div>
          <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
            {filteredItems.length} موقع
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث عن مطعم، الحجر، مرايا، الغراميل..."
            className="w-full pr-9 pl-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500/50 backdrop-blur-md"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'all', label: 'الكل', icon: Filter },
            { id: 'restaurant', label: 'المطاعم والقهوة', icon: Utensils },
            { id: 'place', label: 'المعالم والآثار', icon: Landmark },
            { id: 'event', label: 'الفعاليات والمغامرات', icon: Compass }
          ].map(cat => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition backdrop-blur-md ${
                  isActive
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/20">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="frosted-glass-card border border-white/10 rounded-2xl overflow-hidden shadow-md hover:border-amber-500/40 transition duration-300 flex flex-col justify-between group"
          >
            <div
              className="relative h-40 overflow-hidden cursor-pointer"
              onClick={() => setSelectedItemDetail(item)}
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
              />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{item.rating}</span>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-zinc-200 text-[10px] px-2.5 py-0.5 rounded-md border border-white/10">
                {item.category === 'restaurant' ? 'مطعم' : item.category === 'place' ? 'معلم سياحي' : 'فعالية'}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3
                  onClick={() => setSelectedItemDetail(item)}
                  className="font-bold text-sm text-white group-hover:text-amber-300 cursor-pointer transition"
                >
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-white/5 text-amber-200/90 px-2 py-0.5 rounded-md border border-white/5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 block">التكلفة والأسعار</span>
                  <span className="font-bold text-xs text-amber-300">{item.price}</span>
                </div>

                <button
                  onClick={() => onOpenBooking(item)}
                  className="bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-900/20 border border-amber-500/30 active:scale-95"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{item.btnText}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Item Detail Modal */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="frosted-glass-dark rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-amber-500/30">
            <div className="relative h-56">
              <img
                src={selectedItemDetail.img}
                alt={selectedItemDetail.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="absolute top-3 left-3 bg-black/60 text-white p-2 rounded-full hover:bg-black transition border border-white/20"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-right">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedItemDetail.title}</h3>
                <p className="text-xs text-amber-300 font-medium">{selectedItemDetail.location}</p>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {selectedItemDetail.longDesc || selectedItemDetail.desc}
              </p>

              {selectedItemDetail.recommendedTime && (
                <div className="flex items-center gap-2 text-xs bg-amber-500/15 p-3 rounded-2xl border border-amber-500/30 text-amber-200 backdrop-blur-md">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>أفضل الأوقات: {selectedItemDetail.recommendedTime}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => {
                    const itemToBook = selectedItemDetail;
                    setSelectedItemDetail(null);
                    onOpenBooking(itemToBook);
                  }}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-2xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 border border-amber-500/30"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{selectedItemDetail.btnText}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
