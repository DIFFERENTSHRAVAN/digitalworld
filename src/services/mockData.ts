import { Category, Product, StoreSettings, Order } from '../types';
import { STORE_CONFIG } from '../config/storeConfig';

export const initialCategories: Category[] = [
  {
    id: 'c1',
    name: 'Refurbished Laptops',
    slug: 'refurbished-laptops',
    description: 'Certified 28-point tested refurbished laptops with 30-Day Testing Warranty',
    icon: 'Laptop',
    display_order: 1,
    is_active: true
  },
  {
    id: 'c2',
    name: 'New Laptops',
    slug: 'new-laptops',
    description: 'Factory sealed brand-new laptops with 1-Year Brand Warranty',
    icon: 'Sparkles',
    display_order: 2,
    is_active: true
  },
  {
    id: 'c3',
    name: 'Computer Accessories',
    slug: 'computer-accessories',
    description: 'Chargers, docks, adapters, laptop bags, and thermal pastes',
    icon: 'Cpu',
    display_order: 3,
    is_active: true
  },
  {
    id: 'c4',
    name: 'Keyboards and Mice',
    slug: 'keyboards-and-mice',
    description: 'Mechanical, wireless, and ergonomic gaming peripherals',
    icon: 'Keyboard',
    display_order: 4,
    is_active: true
  },
  {
    id: 'c5',
    name: 'Monitors and Displays',
    slug: 'monitors-and-displays',
    description: 'IPS, LED, Full HD and 2K monitors for office & editing',
    icon: 'Monitor',
    display_order: 5,
    is_active: true
  },
  {
    id: 'c6',
    name: 'Storage Devices',
    slug: 'storage-devices',
    description: 'High-speed NVMe M.2 SSDs, 2.5-inch SATA SSDs and hard drives',
    icon: 'HardDrive',
    display_order: 6,
    is_active: true
  },
  {
    id: 'c7',
    name: 'Networking Devices',
    slug: 'networking-devices',
    description: 'Gigabit dual-band Wi-Fi routers, network switches & cables',
    icon: 'Wifi',
    display_order: 7,
    is_active: true
  },
  {
    id: 'c8',
    name: 'Mobile Accessories',
    slug: 'mobile-accessories',
    description: 'Fast chargers, USB-C cables, OTG drives, and power banks',
    icon: 'Smartphone',
    display_order: 8,
    is_active: true
  },
  {
    id: 'c9',
    name: 'Other Electronics',
    slug: 'other-electronics',
    description: 'Audio speakers, power strips, electronic testing tools',
    icon: 'Sliders',
    display_order: 9,
    is_active: true
  }
];

export const initialStoreSettings: StoreSettings = {
  id: 'default',
  shop_name: STORE_CONFIG.shopName,
  owner_name: STORE_CONFIG.ownerName,
  whatsapp_number: STORE_CONFIG.whatsappNumber,
  contact_number: STORE_CONFIG.contactNumber,
  business_address: STORE_CONFIG.businessAddress,
  email_address: STORE_CONFIG.emailAddress,
  opening_hours: STORE_CONFIG.openingHours,
  logo_url: STORE_CONFIG.logoUrl || '',
  delivery_charges: STORE_CONFIG.deliveryCharges,
  free_delivery_above: STORE_CONFIG.freeDeliveryAbove,
  delivery_service_areas: STORE_CONFIG.deliveryServiceAreas,
  minimum_order_amount: STORE_CONFIG.minimumOrderAmount,
  cod_enabled: STORE_CONFIG.codEnabled,
  pay_on_delivery_enabled: STORE_CONFIG.payOnDeliveryEnabled,
  online_payment_enabled: STORE_CONFIG.onlinePaymentEnabled,
  store_pickup_enabled: STORE_CONFIG.storePickupEnabled,
  upi_id: STORE_CONFIG.upiId,
  return_policy_text: STORE_CONFIG.returnPolicyText,
  warranty_policy_text: STORE_CONFIG.warrantyPolicyText
};

export const initialProducts: Product[] = [
  {
    id: 'p1',
    category_id: 'c1',
    category_name: 'Refurbished Laptops',
    name: 'Lenovo ThinkPad T480 (Core i5 8th Gen / 16GB / 512GB NVMe SSD)',
    slug: 'lenovo-thinkpad-t480-i5-8th-gen-demo',
    brand: 'Lenovo',
    model: 'ThinkPad T480',
    condition: 'second_hand',
    price: 21999,
    original_price: 24999,
    stock_quantity: 3,
    is_featured: true,
    is_published: true,
    is_sold_out: false,
    is_special_offer: true,
    offer_badge_text: 'Deal of the Week',
    description: 'Certified business-grade Lenovo ThinkPad T480. Built like a tank with dual battery bridge support, spill-resistant backlit keyboard, and ultra-durable magnesium roll cage. Thoroughly tested by Vishal Soni with fresh thermal paste applied and clean Windows 11 Pro installed.',
    warranty_info: '30 Days In-Shop Testing Warranty with Digital World GST/Bill',
    return_info: '7 Days Replacement if any internal hardware defect detected',
    primary_image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: {
      'Ports': '2x USB 3.1, 1x USB-C / Thunderbolt 3, HDMI 1.4b, RJ45 Ethernet, SD Card',
      'Weight': '1.58 kg',
      'Operating System': 'Windows 11 Pro 64-bit Genuine Activated',
      'Webcam': '720p HD with ThinkShutter Privacy Slider'
    },
    processor: 'Intel Core i5-8350U (4 Cores, 8 Threads, up to 3.60 GHz)',
    ram: '16 GB DDR4 (Dual Channel Upgraded)',
    storage_type_capacity: '512 GB M.2 NVMe High Speed SSD',
    screen_size: '14.0-inch FHD (1920x1080) Anti-glare IPS Display',
    graphics: 'Intel UHD Graphics 620',
    battery_health: 'Verified 84% Health (Dual Battery Setup gives approx 4 to 5 hours backup)',
    physical_condition_grade: 'Grade A (Excellent - Minimal sign of usage on top cover, zero screen scratches)',
    known_defects: 'None. Motherboard, keyboard, ports, trackpad, and thermals rigorously benchmarked.',
    included_accessories: 'Original Lenovo 65W Type-C Fast Charger, Brand New Power Cord, Padded Laptop Sleeve',
    is_reserved: false,
    min_dealer_qty: 1,
    dealer_price: 18500,
    is_demo_product: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'p2',
    category_id: 'c1',
    category_name: 'Refurbished Laptops',
    name: 'Dell Latitude 5400 (Core i7 8th Gen / 16GB / 256GB SSD)',
    slug: 'dell-latitude-5400-i7-8th-gen-demo',
    brand: 'Dell',
    model: 'Latitude 5400',
    condition: 'second_hand',
    price: 23500,
    dealer_price: 19800,
    min_dealer_qty: 1,
    original_price: 26000,
    stock_quantity: 2,
    is_featured: true,
    is_published: true,
    is_sold_out: false,
    is_special_offer: false,
    description: 'High performance business laptop with powerful Core i7 8th Gen processor. Sleek carbon fiber reinforced body, crisp IPS display, and smooth trackpad. Ideal for coding, accounting, office management, and study.',
    warranty_info: '30 Days In-Shop Hardware Testing Warranty',
    return_info: '7 Days Technical Replacement Window',
    primary_image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: {
      'Security': 'Fingerprint Reader, TPM 2.0 Security Chip',
      'Weight': '1.52 kg',
      'Audio': 'Waves MaxxAudio Pro Dual Speakers'
    },
    processor: 'Intel Core i7-8665U (Quad Core, 8 Threads, up to 4.80 GHz Turbo)',
    ram: '16 GB DDR4 RAM',
    storage_type_capacity: '256 GB High-Speed NVMe PCIe SSD',
    screen_size: '14.0-inch Full HD (1920 x 1080) WVA Anti-Glare',
    graphics: 'Intel UHD Graphics 620',
    battery_health: 'Verified 88% Battery Health (Estimated 4 hours backup under standard office load)',
    physical_condition_grade: 'Grade A (Clean condition, no cracks, keyboard letters 100% visible)',
    known_defects: 'Minor hairline scratch on outer edge corner, cosmetic only.',
    included_accessories: 'Original Dell 65W AC Adapter and Laptop Bag',
    is_reserved: false,
    is_demo_product: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'p3',
    category_id: 'c1',
    category_name: 'Refurbished Laptops',
    name: 'HP EliteBook 840 G6 Ultrabook (Aluminum Silver / i5 8th / 8GB / 256GB SSD)',
    slug: 'hp-elitebook-840-g6-demo',
    brand: 'HP',
    model: 'EliteBook 840 G6',
    condition: 'second_hand',
    price: 19999,
    dealer_price: 16900,
    min_dealer_qty: 1,
    original_price: 22500,
    stock_quantity: 1,
    is_featured: true,
    is_published: true,
    is_sold_out: false,
    is_special_offer: true,
    offer_badge_text: 'Budget Value Pick',
    description: 'Premium all-aluminum unibody executive laptop with Bang & Olufsen high-clarity sound system. Ultra lightweight and sleek design with pristine silver finish.',
    warranty_info: '30 Days In-Shop Hardware Testing Warranty',
    return_info: '7 Days Testing Replacement',
    primary_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: {
      'Body': 'Full Aluminum CNC Chassis',
      'Audio': 'Bang & Olufsen Dual Stereo Speakers',
      'Weight': '1.48 kg'
    },
    processor: 'Intel Core i5-8265U (1.6 GHz base, up to 3.9 GHz)',
    ram: '8 GB DDR4 (Expandable up to 32 GB)',
    storage_type_capacity: '256 GB NVMe M.2 SSD',
    screen_size: '14.0-inch diagonal FHD IPS eDP anti-glare WLED-backlit',
    graphics: 'Intel UHD Graphics 620',
    battery_health: 'Verified 81% Health (~3.5 Hours Real World Battery)',
    physical_condition_grade: 'Grade A- (Slight wear on bottom rubber feet, pristine screen)',
    known_defects: 'None. Fully inspected by Digital World.',
    included_accessories: 'Original HP Smart Blue-pin 45W Charger & Power Cord',
    is_reserved: false,
    is_demo_product: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'p4',
    category_id: 'c6',
    category_name: 'Storage Devices',
    name: 'Kingston NV2 500GB PCIe 4.0 NVMe M.2 Internal SSD',
    slug: 'kingston-nv2-500gb-nvme-ssd-demo',
    brand: 'Kingston',
    model: 'NV2 SNV2S/500G',
    condition: 'new',
    price: 2899,
    dealer_price: 2350,
    min_dealer_qty: 3,
    original_price: 3499,
    stock_quantity: 15,
    is_featured: true,
    is_published: true,
    is_sold_out: false,
    is_special_offer: false,
    description: 'Boost your laptop or desktop speed up to 4x faster than standard SATA SSDs. High-speed Gen 4x4 NVMe read speeds up to 3,500 MB/s. Genuine sealed retail box with invoice.',
    warranty_info: '3 Years Manufacturer Warranty by Kingston India',
    return_info: '7 Days Dead-on-Arrival In-Shop Replacement',
    primary_image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: {
      'Interface': 'PCIe 4.0 x4 NVMe',
      'Read Speed': 'Up to 3,500 MB/s',
      'Write Speed': 'Up to 2,100 MB/s',
      'Form Factor': 'M.2 2280'
    },
    is_demo_product: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'p5',
    category_id: 'c4',
    category_name: 'Keyboards and Mice',
    name: 'Logitech MK270 Wireless Keyboard and Mouse Combo',
    slug: 'logitech-mk270-wireless-combo-demo',
    brand: 'Logitech',
    model: 'MK270',
    condition: 'new',
    price: 1599,
    dealer_price: 1290,
    min_dealer_qty: 5,
    original_price: 1995,
    stock_quantity: 10,
    is_featured: true,
    is_published: true,
    is_sold_out: false,
    is_special_offer: false,
    description: 'India\'s most reliable wireless keyboard and mouse combo with 2.4GHz plug-and-play USB receiver. Spill resistant design and ultra-long battery life.',
    warranty_info: '3 Years Limited Hardware Warranty by Logitech India',
    return_info: '7 Days In-Shop Defect Replacement',
    primary_image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: {
      'Wireless Range': '10 meters',
      'Connectivity': '2.4 GHz USB Nano Receiver',
      'Keyboard Battery': 'Up to 36 months',
      'Mouse Battery': 'Up to 12 months'
    },
    is_demo_product: true,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    id: 'p6',
    category_id: 'c7',
    category_name: 'Networking Devices',
    name: 'TP-Link Archer C6 AC1200 Gigabit Dual-Band Wi-Fi Router',
    slug: 'tp-link-archer-c6-ac1200-router-demo',
    brand: 'TP-Link',
    model: 'Archer C6',
    condition: 'new',
    price: 2399,
    dealer_price: 1950,
    min_dealer_qty: 2,
    original_price: 2999,
    stock_quantity: 6,
    is_featured: false,
    is_published: true,
    is_sold_out: false,
    is_special_offer: false,
    description: 'High-speed dual-band Wi-Fi router with 4 high-gain external antennas and MU-MIMO technology. Features full Gigabit WAN and LAN ports for seamless 100Mbps+ fiber connections.',
    warranty_info: '3 Years National Warranty by TP-Link India',
    return_info: '7 Days Return if defective',
    primary_image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: {
      'Wi-Fi Speeds': '867 Mbps on 5 GHz + 300 Mbps on 2.4 GHz',
      'Ethernet Ports': '1x Gigabit WAN, 4x Gigabit LAN',
      'Antennas': '4 Fixed High-Gain Omnidirectional'
    },
    is_demo_product: true,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: 'p7',
    category_id: 'c3',
    category_name: 'Computer Accessories',
    name: '65W GaN Fast Type-C Laptop Power Adapter with Detachable Cable',
    slug: 'universal-65w-type-c-laptop-charger-demo',
    brand: 'Digital World Pro',
    model: 'DW-65W-GAN',
    condition: 'new',
    price: 1199,
    dealer_price: 890,
    min_dealer_qty: 5,
    original_price: 1499,
    stock_quantity: 12,
    is_featured: true,
    is_published: true,
    is_sold_out: false,
    is_special_offer: true,
    offer_badge_text: 'Shop Best-Seller',
    description: 'Compact Gallium Nitride (GaN) fast charger compatible with all Type-C laptops (Dell, Lenovo, HP, MacBook Air, Asus, Acer) and smartphones with Power Delivery 3.0.',
    warranty_info: '6 Months Replacement Warranty by Digital World',
    return_info: '7 Days Replacement Policy',
    primary_image: 'https://images.unsplash.com/photo-1618755788416-0ef24483750d?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1618755788416-0ef24483750d?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: {
      'Power Output': '65W Max (20V/3.25A, 15V/3A, 9V/3A, 5V/3A)',
      'Protection': 'Over-voltage, short-circuit, and overheating protection',
      'Cable': 'Includes 1.8M Braided Type-C to Type-C Cable'
    },
    is_demo_product: true,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    id: 'p8',
    category_id: 'c5',
    category_name: 'Monitors and Displays',
    name: 'Dell 24-Inch Full HD IPS Monitor (75Hz / AMD FreeSync / HDMI & VGA)',
    slug: 'dell-24-inch-fhd-ips-monitor-demo',
    brand: 'Dell',
    model: 'SE2422HX',
    condition: 'new',
    price: 8499,
    dealer_price: 7200,
    min_dealer_qty: 1,
    original_price: 10999,
    stock_quantity: 4,
    is_featured: true,
    is_published: true,
    is_sold_out: false,
    is_special_offer: false,
    description: 'Sleek 24-inch Full HD monitor with ultra-thin three-sided bezels and IPS wide viewing angles. Ideal companion for laptop dual-screen setups and home workstations.',
    warranty_info: '3 Years Advanced Exchange Service Warranty by Dell India',
    return_info: '7 Days Dead Pixel / Transit Damage Replacement',
    primary_image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: {
      'Display Size': '23.8 Inches',
      'Panel': 'IPS (In-Plane Switching)',
      'Refresh Rate': '75 Hz',
      'Resolution': '1920 x 1080 FHD',
      'Connectivity': '1x HDMI 1.4, 1x VGA'
    },
    is_demo_product: true,
    created_at: new Date(Date.now() - 86400000 * 9).toISOString()
  },
  {
    id: 'p_dlr_lot1',
    category_id: 'c1',
    category_name: 'Refurbished Laptops',
    name: 'Wholesale B2B Lot: 5x Business Refurbished Laptops (ThinkPad & Latitude Grade A)',
    slug: 'wholesale-b2b-lot-5x-business-refurbished-laptops',
    brand: 'Commercial Assorted',
    model: 'T480 & Latitude 5400 Combo (5 Units)',
    condition: 'second_hand',
    price: 115000,
    dealer_price: 89999,
    min_dealer_qty: 1,
    is_dealer_only: true,
    stock_quantity: 3,
    is_featured: true,
    is_published: true,
    is_sold_out: false,
    is_special_offer: true,
    offer_badge_text: 'B2B Wholesale Lot',
    description: 'Exclusive Wholesale Dealer Package: Includes 3x Lenovo ThinkPad T480 (Core i5 8th / 16GB / 512GB SSD) and 2x Dell Latitude 5400 (Core i7 8th / 16GB / 256GB SSD). 100% Grade A certified with OEM fast chargers, 30-Day testing warranty, and GST invoice.',
    warranty_info: '30 Days In-Shop B2B Testing & Replacement Warranty',
    return_info: '7 Days Dealer Testing Window',
    primary_image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: {
      'Units Included': '5 Tested Laptops with Original Chargers',
      'Condition Grade': 'Grade A Tested & Benchmarked',
      'Target Profit Margin': '₹20,000 - ₹25,000 Retail Resale Profit'
    },
    is_demo_product: true,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'p_dlr_lot2',
    category_id: 'c6',
    category_name: 'Storage Devices',
    name: 'Wholesale B2B Master Pack: 10x Kingston NV2 500GB NVMe SSDs',
    slug: 'wholesale-b2b-master-pack-10x-kingston-nv2-ssds',
    brand: 'Kingston',
    model: 'NV2 SNV2S/500G (10 Pack)',
    condition: 'new',
    price: 28990,
    dealer_price: 22500,
    min_dealer_qty: 1,
    is_dealer_only: true,
    stock_quantity: 6,
    is_featured: false,
    is_published: true,
    is_sold_out: false,
    is_special_offer: true,
    offer_badge_text: 'Dealer Master Pack',
    description: 'Factory sealed master carton of 10x Kingston NV2 500GB PCIe 4.0 NVMe SSDs. High-margin inventory for local electronics shops, technicians, and repair centers. 3 Years National Brand Warranty.',
    warranty_info: '3 Years Kingston Official Warranty',
    return_info: '7 Days DOA In-Shop Replacement',
    primary_image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: {
      'Pack Quantity': '10 Units Sealed in Master Box',
      'Warranty': '3 Years National Kingston Support'
    },
    is_demo_product: true,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const initialOrders: Order[] = [
  {
    id: 'o_dlr_1',
    order_number: 'B2B-1001',
    order_type: 'dealer',
    dealer_id: 'dlr_1001',
    dealer_code: 'DLR-1001',
    dealer_business_name: 'Jaipur IT Solutions',
    gst_number: '08AAAAA0000A1Z5',
    customer_name: 'Sunil Sharma (Jaipur IT)',
    customer_phone: '9829012345',
    customer_whatsapp: '9829012345',
    customer_email: 'sunil@jaipurit.com',
    delivery_type: 'store_pickup',
    delivery_address: 'Plot 42, MI Road',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    order_notes: 'Urgent dealer lot pickup. Prepared for in-store handover.',
    subtotal: 37000,
    delivery_charge: 0,
    total_amount: 37000,
    payment_method: 'pay_on_delivery',
    payment_status: 'collected',
    order_status: 'delivered',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    items: [
      {
        product_id: 'p1',
        product_name: 'Lenovo ThinkPad T480 (Core i5 8th Gen / 16GB / 512GB NVMe SSD)',
        product_brand: 'Lenovo',
        product_model: 'ThinkPad T480',
        product_image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
        condition: 'second_hand',
        unit_price: 18500,
        quantity: 2,
        total_price: 37000
      }
    ],
    status_history: [
      {
        order_id: 'o_dlr_1',
        status: 'pending',
        note: 'Dealer wholesale order placed',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_by: 'dealer_portal'
      },
      {
        order_id: 'o_dlr_1',
        status: 'delivered',
        note: 'Picked up from shop & payment collected in cash/UPI',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        updated_by: 'Vishal Soni'
      }
    ]
  },
  {
    id: 'o1',
    order_number: 'DW-DEMO-1001',
    order_type: 'retail',
    customer_name: 'Rahul Sharma',
    customer_phone: '9876543210',
    customer_whatsapp: '9876543210',
    customer_email: 'rahul.demo@example.com',
    delivery_type: 'home_delivery',
    delivery_address: 'Flat 402, Sai Residency, Near Civil Hospital',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    order_notes: 'Please call before delivery. Testing purpose sample order.',
    subtotal: 21999,
    delivery_charge: 0,
    total_amount: 21999,
    payment_method: 'cod',
    payment_status: 'pending',
    order_status: 'confirmed',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    items: [
      {
        product_id: 'p1',
        product_name: 'Lenovo ThinkPad T480 (Core i5 8th Gen / 16GB / 512GB NVMe SSD)',
        product_brand: 'Lenovo',
        product_model: 'ThinkPad T480',
        product_image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
        condition: 'second_hand',
        unit_price: 21999,
        quantity: 1,
        total_price: 21999
      }
    ],
    status_history: [
      {
        order_id: 'o1',
        status: 'pending',
        note: 'Order submitted by customer',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        updated_by: 'system'
      },
      {
        order_id: 'o1',
        status: 'confirmed',
        note: 'Confirmed with customer by Vishal Soni',
        created_at: new Date(Date.now() - 43200000).toISOString(),
        updated_by: 'Vishal Soni'
      }
    ]
  }
];
