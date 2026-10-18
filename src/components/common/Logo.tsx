import React from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

interface LogoProps {
  className?: string;
  isLight?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', isLight = false }) => {
  const { settings } = useStoreSettings();
  const logoSrc = settings.logo_url && settings.logo_url.trim() !== '' 
    ? settings.logo_url 
    : '/logo.png';

  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      <img
        src={logoSrc}
        alt={settings.shop_name || 'Digital World'}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shrink-0 shadow-sm border border-amber-400/50 hover:scale-105 transition-transform"
      />
      <div className="flex flex-col leading-none">
        <span className={`text-xl sm:text-2xl font-black tracking-tight ${
          isLight ? 'text-white' : 'text-[#7b0c1e]'
        }`}>
          DIGITAL<span className={isLight ? 'text-amber-400 ml-1.5' : 'text-amber-600 ml-1.5'}>WORLD</span>
        </span>
        <span className={`text-[10px] tracking-wider uppercase font-semibold mt-0.5 ${
          isLight ? 'text-amber-200/90' : 'text-slate-500'
        }`}>
          Certified Laptops & Electronics
        </span>
      </div>
    </div>
  );
};
