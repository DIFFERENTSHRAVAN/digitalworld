import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Monitor,
  Laptop,
  HardDrive,
  Tv,
  Keyboard,
  Shapes,
  Video,
  Router,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageCircle,
  Shield,
  Smartphone,
  Cable,
  Wrench,
  Layers,
  PhoneCall
} from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { STORE_CONFIG } from '../../config/storeConfig';
import { getCategories } from '../../services/api';

export interface CategoryItemData {
  id: string;
  name: string;
  slug: string;
  icon: string;
  subcategories: string[];
}

export const CATEGORIES_WITH_SUBCATEGORIES: CategoryItemData[] = [
  {
    id: 'desktop',
    name: 'Desktop',
    slug: 'desktop-computers',
    icon: 'Monitor',
    subcategories: [
      'Barebone Desktop',
      'Branded Desktop',
      'CPU (Processor)',
      'New Products',
      'Open Box',
      'CPU (Processor) Fan',
      'Motherboard',
      'Desktop RAM (Memory)',
      'Graphics Card (GPU)',
      'Cabinet | Cabinet Fan'
    ]
  },
  {
    id: 'laptop',
    name: 'Laptop',
    slug: 'second-hand-laptops',
    icon: 'Laptop',
    subcategories: [
      'Refurbished Laptops (Tested)',
      'Commercial / Business Laptops',
      'Gaming Laptops',
      'Laptop RAM (DDR4 / DDR5)',
      'Laptop NVMe SSD Storage',
      'Laptop Adapters & Chargers',
      'Laptop Keyboards & Batteries',
      'Laptop Screen & Body Parts'
    ]
  },
  {
    id: 'storage',
    name: 'Storage',
    slug: 'storage-devices',
    icon: 'HardDrive',
    subcategories: [
      'Internal SSD (SATA)',
      'NVMe M.2 High-Speed SSD',
      'External Portable SSD',
      'Desktop 3.5" Hard Drive',
      'Surveillance Hard Drive (CCTV)',
      'Pen Drives & Flash Drives',
      'MicroSD & Memory Cards'
    ]
  },
  {
    id: 'display',
    name: 'Display',
    slug: 'monitors-and-displays',
    icon: 'Tv',
    subcategories: [
      'Desktop Monitors (19" - 24")',
      'Full HD / IPS Monitors (27")',
      'High Refresh Gaming Monitors',
      'CCTV Surveillance Screens',
      'HDMI / VGA / DisplayPort Cables',
      'Monitor Wall Mounts & Stands'
    ]
  },
  {
    id: 'peripherals',
    name: 'Peripherals',
    slug: 'keyboards-and-mice',
    icon: 'Keyboard',
    subcategories: [
      'Wired Keyboards & Mice',
      'Wireless Keyboard Combos',
      'RGB Mechanical Gaming Keyboards',
      'Gaming Optical Mice',
      'Large Mouse Pads & Desk Mats',
      'USB 3.0 Hubs & Converters'
    ]
  },
  {
    id: 'printers',
    name: 'Printers & Scanners',
    slug: 'printers-and-scanners',
    icon: 'Shapes',
    subcategories: [
      'Laser Single-Function Printers',
      'All-In-One Tank Printers',
      'Thermal Receipt / POS Printers',
      '1D & 2D Barcode Scanners',
      'Laser Toner Cartridges & Inks',
      'Printer Power & USB Cables'
    ]
  },
  {
    id: 'security',
    name: 'Security',
    slug: 'cctv-and-security',
    icon: 'Video',
    subcategories: [
      '2MP & 5MP HD CCTV Cameras',
      'IP Network Bullet & Dome Cameras',
      '4-Channel & 8-Channel DVRs',
      '16CH & 32CH NVR Systems',
      'CCTV SMPS & Power Supplies',
      'BNC & DC Connectors, 3+1 Wire',
      'Wi-Fi 360° Smart Home Cameras'
    ]
  },
  {
    id: 'networking',
    name: 'Networking',
    slug: 'networking-devices',
    icon: 'Router',
    subcategories: [
      'High-Speed Wi-Fi Routers',
      'Wi-Fi Range Extenders & Repeaters',
      'Fast Ethernet & Gigabit PoE Switches',
      'Cat6 LAN Patch Cords & Cable Rolls',
      'USB Wi-Fi Adapters & Dongles',
      'RJ45 Connectors & Crimpers'
    ]
  },
  {
    id: 'software',
    name: 'Software',
    slug: 'other-electronics',
    icon: 'Layers',
    subcategories: [
      'Windows 11 Pro Genuine License',
      'Quick Heal Total Security Antivirus',
      'K7 Ultimate Security',
      'Microsoft Office Home & Business'
    ]
  },
  {
    id: 'mobility',
    name: 'Mobility',
    slug: 'mobile-accessories',
    icon: 'Smartphone',
    subcategories: [
      'Fast Charging Adapters & PD',
      'Type-C Braided Cables',
      'Heavy Duty Power Banks',
      'Wireless Collar Mics for Phones'
    ]
  },
  {
    id: 'cables',
    name: 'Cables',
    slug: 'computer-accessories',
    icon: 'Cable',
    subcategories: [
      'High Speed 4K HDMI Cables',
      'Gold-Plated VGA Cables',
      'Heavy Duty 3-Pin Power Cords',
      'Cat6 High Speed Patch Cables'
    ]
  },
  {
    id: 'connector-converter',
    name: 'Connector & Converter',
    slug: 'computer-accessories',
    icon: 'Layers',
    subcategories: [
      'HDMI to VGA with Audio Converter',
      'SATA to USB 3.0 Adapter',
      'DisplayPort to VGA Converter',
      'OTG Type-C & Micro USB'
    ]
  },
  {
    id: 'accessories',
    name: 'Accessories',
    slug: 'computer-accessories',
    icon: 'Wrench',
    subcategories: [
      'Thermal Paste (Cooler Master, Arctic)',
      'PC Cleaning Kits & Blower',
      'Spike Guards & Surge Protectors',
      'Cable Management Ties',
      'Anti-Static Screen Cleaners'
    ]
  },
  {
    id: 'cctv-networking',
    name: 'CCTV & Networking',
    slug: 'cctv-and-security',
    icon: 'Shield',
    subcategories: [
      'CP PLUS 4-Camera Complete Sets',
      'HIKVISION HD Camera Combos',
      'Waterproof Camera Junction Boxes',
      'PoE Switches for IP Cameras',
      'Video Baluns & Power Splitters'
    ]
  },
  {
    id: 'telecom',
    name: 'Telecom',
    slug: 'other-electronics',
    icon: 'PhoneCall',
    subcategories: [
      'EPABX Intercom Systems',
      'Landline Caller ID Phones',
      'Telephone Line Cables & RJ11 Plugs',
      'Wireless Walkie Talkies'
    ]
  }
];

interface ShopByCategoryAccordionProps {
  onSelectCategory?: () => void;
  className?: string;
  defaultExpandedId?: string;
  showHeader?: boolean;
}

export const ShopByCategoryAccordion: React.FC<ShopByCategoryAccordionProps> = ({
  onSelectCategory,
  className = '',
  defaultExpandedId,
  showHeader = true
}) => {
  const { settings } = useStoreSettings();
  const [expandedId, setExpandedId] = useState<string | null>(defaultExpandedId || null);
  const [categoriesList, setCategoriesList] = useState<CategoryItemData[]>(CATEGORIES_WITH_SUBCATEGORIES);

  useEffect(() => {
    getCategories().then(cats => {
      if (cats && cats.length > 0) {
        setCategoriesList(cats.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon || 'Monitor',
          subcategories: c.subcategories || []
        })));
      }
    });
  }, []);

  const toggleCategory = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const effectivePhone = settings.contact_number || STORE_CONFIG.contactNumber;
  const effectiveWhatsapp = settings.whatsapp_number || STORE_CONFIG.whatsappNumber;
  const cleanPhone = effectivePhone ? effectivePhone.replace(/\D/g, '') : '';
  const cleanWhatsapp = effectiveWhatsapp ? effectiveWhatsapp.replace(/\D/g, '') : '';

  const renderIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5 text-[#4a1525]' };
    switch (iconName) {
      case 'Monitor':
        return <Monitor {...props} />;
      case 'Laptop':
        return <Laptop {...props} />;
      case 'HardDrive':
        return <HardDrive {...props} />;
      case 'Tv':
        return <Tv {...props} />;
      case 'Keyboard':
        return <Keyboard {...props} />;
      case 'Shapes':
        return <Shapes {...props} />;
      case 'Video':
        return <Video {...props} />;
      case 'Router':
        return <Router {...props} />;
      case 'Shield':
        return <Shield {...props} />;
      case 'Smartphone':
        return <Smartphone {...props} />;
      case 'Cable':
        return <Cable {...props} />;
      case 'Wrench':
        return <Wrench {...props} />;
      case 'Layers':
        return <Layers {...props} />;
      case 'PhoneCall':
        return <PhoneCall {...props} />;
      default:
        return <Monitor {...props} />;
    }
  };

  return (
    <div className={`bg-[#fcf9f2] rounded-2xl border border-[#ebdcc6] p-3.5 sm:p-5 shadow-xs ${className}`}>
      {/* 1. Header: SHOP BY CATEGORY (Reference Image 2) */}
      {showHeader && (
        <div className="pb-3 mb-2 border-b border-[#ebdcc6]/80 flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-black tracking-widest text-[#7c3f00] uppercase">
            SHOP BY CATEGORY
          </h3>
          <span className="text-[10px] font-bold text-amber-800 bg-[#faecd8] px-2 py-0.5 rounded-full">
            {categoriesList.length} Categories
          </span>
        </div>
      )}

      {/* 2. Categories Accordion List (Reference Image 1 & 2) */}
      <div className="space-y-1">
        {categoriesList.map((category) => {
          const isOpen = expandedId === category.id;

          return (
            <div key={category.id} className="transition-all">
              {/* Category Header Row */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={`w-full flex items-center justify-between py-2.5 px-2 rounded-xl transition-all cursor-pointer text-left select-none ${
                  isOpen ? 'bg-[#faecd8]/60 shadow-2xs' : 'hover:bg-[#faecd8]/30'
                }`}
                aria-expanded={isOpen}
              >
                {/* Left: Cream Rounded Box Icon + Category Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#faecd8] border border-[#ebd6be] flex items-center justify-center shrink-0 shadow-2xs">
                    {renderIcon(category.icon)}
                  </div>
                  <span className="font-bold text-sm sm:text-base text-[#4a1525] truncate">
                    {category.name}
                  </span>
                </div>

                {/* Right: Chevron Down / Up */}
                <div className="text-[#4a1525] p-1 shrink-0">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 transition-transform duration-200" />
                  ) : (
                    <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                  )}
                </div>
              </button>

              {/* Subcategories Expanded List (Reference Image 1) */}
              {isOpen && (
                <div className="bg-[#fcf8ef] border-l-2 border-amber-400 rounded-xl p-2 sm:p-2.5 my-1.5 space-y-1 animate-fade-in shadow-inner">
                  {category.subcategories.map((subcat, idx) => (
                    <Link
                      key={idx}
                      to={`/products?category=${category.slug}&subcategory=${encodeURIComponent(subcat)}`}
                      onClick={onSelectCategory}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-[#4a1525] hover:bg-[#faecd8] hover:text-[#7b0c1e] transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-xs" />
                      <span className="truncate">{subcat}</span>
                    </Link>
                  ))}

                  {/* All products link for this category */}
                  <div className="pt-1.5 px-3 border-t border-[#ebdcc6]/50">
                    <Link
                      to={`/category/${category.slug}`}
                      onClick={onSelectCategory}
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline flex items-center gap-1"
                    >
                      <span>Explore all {category.name} products →</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Separator line between categories (Reference Image 2) */}
              <div className="h-px bg-[#ebdcc6]/60 my-0.5" />
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Action Buttons: Call Us & WhatsApp (Reference Image 2) */}
      <div className="pt-4 mt-3 border-t border-[#ebdcc6]/80 flex items-center gap-2.5 sm:gap-3">
        {cleanPhone && (
          <a
            href={`tel:${cleanPhone}`}
            className="flex-1 py-2.5 px-3 sm:px-4 rounded-full bg-[#fcf4e8] border border-[#ebd7be] text-[#4a1525] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#faeedd] active:scale-98 transition-all shadow-xs"
          >
            <Phone className="w-4 h-4 text-[#4a1525] shrink-0" />
            <span>Call Us</span>
          </a>
        )}

        {cleanWhatsapp && (
          <a
            href={`https://wa.me/${cleanWhatsapp.startsWith('91') ? cleanWhatsapp : `91${cleanWhatsapp}`}?text=${encodeURIComponent('Hello Vishal Soni, I would like to inquire about electronics and computer products at Digital World.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-3 sm:px-4 rounded-full bg-[#dcfce7] border border-[#86efac] text-[#15803d] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#bbf7d0] active:scale-98 transition-all shadow-xs"
          >
            <MessageCircle className="w-4 h-4 text-[#15803d] fill-current shrink-0" />
            <span>WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );
};
