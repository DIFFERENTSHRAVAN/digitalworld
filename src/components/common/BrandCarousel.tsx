import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Brand {
  name: string;
  badge?: string;
  color?: string;
}

const TOP_BRANDS: Brand[] = [
  { name: 'ZOTAC', color: 'text-amber-600 font-black' },
  { name: 'PRAMA', badge: 'PROJECT SERIES', color: 'text-blue-700 font-extrabold' },
  { name: 'AARVEX', color: 'text-slate-800 font-bold' },
  { name: 'acer', color: 'text-emerald-600 font-bold' },
  { name: 'DELL', color: 'text-blue-600 font-black' },
  { name: 'HP', color: 'text-slate-900 font-black' },
  { name: 'Lenovo', color: 'text-rose-600 font-extrabold' },
  { name: 'EVM', color: 'text-amber-700 font-black' },
  { name: 'Crucial', color: 'text-indigo-600 font-extrabold' },
  { name: 'WD', color: 'text-blue-800 font-black' }
];

export const BrandCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative py-2">
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll('left')}
        type="button"
        aria-label="Scroll left"
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 border border-slate-300 shadow-md flex items-center justify-center text-rose-800 hover:bg-slate-50 transition-all cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Brands Scroll Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none px-9 py-1 scroll-smooth"
      >
        {TOP_BRANDS.map((brand, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 min-w-[95px] sm:min-w-[125px] h-12 sm:h-14 bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs flex flex-col items-center justify-center p-2 text-center transition-all hover:scale-102 cursor-pointer select-none"
          >
            <span className={`text-xs sm:text-sm tracking-wider uppercase ${brand.color || 'text-slate-800'}`}>
              {brand.name}
            </span>
            {brand.badge && (
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                {brand.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll('right')}
        type="button"
        aria-label="Scroll right"
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 border border-slate-300 shadow-md flex items-center justify-center text-rose-800 hover:bg-slate-50 transition-all cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
