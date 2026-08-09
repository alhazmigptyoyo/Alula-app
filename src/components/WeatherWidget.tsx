import React from 'react';
import { WeatherData } from '../types';
import { Sun, Moon, CloudSun, Wind, Droplets, Compass, Info } from 'lucide-react';

interface Props {
  weather: WeatherData | null;
  onOpenDetails?: () => void;
  compact?: boolean;
}

export const WeatherWidget: React.FC<Props> = ({ weather, onOpenDetails, compact = false }) => {
  if (!weather) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-white border border-white/10 animate-pulse flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-full"></div>
        <div className="space-y-1">
          <div className="h-4 w-24 bg-white/10 rounded"></div>
          <div className="h-3 w-16 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={onOpenDetails}
        className="flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition shrink-0 shadow-sm"
      >
        {weather.isDay ? <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" /> : <Moon className="w-4 h-4 text-indigo-300" />}
        <span>العلا: {weather.temp}°م</span>
        <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-bold">مباشر</span>
      </button>
    );
  }

  return (
    <div
      onClick={onOpenDetails}
      className="cursor-pointer group frosted-glass hover:bg-white/10 rounded-2xl p-5 text-white border border-amber-500/30 shadow-xl transition duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition">
            {weather.isDay ? <Sun className="w-7 h-7 text-amber-400" /> : <Moon className="w-7 h-7 text-indigo-300" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-amber-300">{weather.temp}°م</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold">
                {weather.condition}
              </span>
            </div>
            <p className="text-xs text-zinc-300 flex items-center gap-1 mt-0.5">
              <Compass className="w-3 h-3 text-amber-400" /> العلا، المملكة العربية السعودية • تحديث مباشر
            </p>
          </div>
        </div>
        <Info className="w-5 h-5 text-zinc-400 group-hover:text-amber-400 transition" />
      </div>

      <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-white/10 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <Droplets className="w-3.5 h-3.5 text-sky-400" />
          <span>الرطوبة: {weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <Wind className="w-3.5 h-3.5 text-teal-400" />
          <span>الرياح: {weather.windSpeed} كم/س</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <CloudSun className="w-3.5 h-3.5 text-amber-400" />
          <span>UV: {weather.uvIndex}</span>
        </div>
      </div>

      <div className="mt-2 text-[11px] text-amber-200/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 leading-relaxed backdrop-blur-md">
        💡 {weather.advisory}
      </div>
    </div>
  );
};
