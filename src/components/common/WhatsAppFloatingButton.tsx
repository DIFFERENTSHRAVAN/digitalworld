import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { STORE_CONFIG } from '../../config/storeConfig';

export const WhatsAppFloatingButton: React.FC = () => {
  const { settings } = useStoreSettings();
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  const effectiveNumber = settings.whatsapp_number || STORE_CONFIG.whatsappNumber;
  const cleanNumber = effectiveNumber ? effectiveNumber.replace(/\D/g, '') : '';
  const formattedNumber = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;

  const greetingMessage = encodeURIComponent(
    `Hello ${settings.owner_name || STORE_CONFIG.ownerName} (${settings.shop_name || STORE_CONFIG.shopName}), I am visiting your website and would like some assistance regarding products.`
  );

  const whatsappUrl = cleanNumber
    ? `https://wa.me/${formattedNumber}?text=${greetingMessage}`
    : '#';

  const handleClick = (e: React.MouseEvent) => {
    if (!cleanNumber) {
      e.preventDefault();
      alert('The shop owner has not yet configured a WhatsApp number.');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end no-print">
      {/* Tooltip speech bubble - Desktop only to keep mobile clean */}
      {!tooltipDismissed && (
        <div className="hidden sm:flex mb-2 bg-white text-charcoal border border-slate-200 px-3 py-2 rounded-2xl shadow-xl max-w-xs text-xs items-start gap-2 animate-bounce-subtle">
          <div>
            <p className="font-semibold text-primary">Chat with Vishal Soni</p>
            <p className="text-[11px] text-charcoal-muted">Ask questions about laptops, stock or parts!</p>
          </div>
          <button
            onClick={() => setTooltipDismissed(true)}
            className="text-slate-400 hover:text-charcoal p-0.5 cursor-pointer"
            aria-label="Close tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target={cleanNumber ? '_blank' : '_self'}
        rel="noopener noreferrer"
        onClick={handleClick}
        className="w-14 h-14 bg-whatsapp hover:bg-whatsapp-hover text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 group relative"
        aria-label="Contact Digital World on WhatsApp"
        title="Chat on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
        </span>
        <MessageCircle className="w-8 h-8 fill-current" />
      </a>
    </div>
  );
};
