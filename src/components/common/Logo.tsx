import React from 'react';
import { Cpu } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

interface LogoProps {
  className?: string;
  isLight?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', isLight = false }) => {
  const { settings } = useStoreSettings();

  if (settings.logo_url && settings.logo_url.trim() !== '') {
    return (
      <img
        src={settings.logo_url}
        alt={settings.shop_name}
        className={`h-10 object-contain ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      <div className={`p-2 rounded-xl flex items-center justify-center transition-transform hover:scale-105 shadow-sm ${
        isLight ? 'bg-white text-primary' : 'bg-primary text-white'
      }`}>
        <Cpu className="w-5 h-5 text-secondary-light" />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
          isLight ? 'text-white' : 'text-primary'
        }`}>
          DIGITAL<span className="text-secondary ml-1.5">WORLD</span>
        </span>
        <span className={`text-[10px] tracking-wider uppercase font-semibold mt-0.5 ${
          isLight ? 'text-slate-300' : 'text-charcoal-muted'
        }`}>
          Certified Laptops & Electronics
        </span>
      </div>
    </div>
  );
};
