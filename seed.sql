-- ====================================================================
-- Digital World - Seed Data Script
-- Includes default categories, store settings, and genuine products.
-- ====================================================================

-- 1. Insert Default Store Settings
INSERT INTO public.store_settings (
    id,
    shop_name,
    owner_name,
    whatsapp_number,
    contact_number,
    business_address,
    email_address,
    opening_hours,
    logo_url,
    delivery_charges,
    free_delivery_above,
    delivery_service_areas,
    minimum_order_amount,
    cod_enabled,
    pay_on_delivery_enabled,
    online_payment_enabled,
    store_pickup_enabled,
    return_policy_text,
    warranty_policy_text
) VALUES (
    'default',
    'Digital World',
    'Vishal Soni',
    '8384957548',
    '8384957548',
    'Near SBI Bank, Sabji Mandi Road, Purani Abadi, Sri Ganganagar, Rajasthan - 335001, India',
    'digitalworld0813@gmail.com',
    '10:00 AM - 08:30 PM (Monday to Saturday)',
    '/logo.png',
    99.00,
    1999.00,
    'Immediate in-store pickup available. Local doorstep delivery within 24 hours. Reliable courier shipping across India in 3-5 business days.',
    100.00,
    true,
    true,
    false,
    true,
    '7 Days testing and replacement window for computer accessories. 15 Days hardware replacement policy on certified refurbished laptops if technical issues arise.',
    'All certified refurbished laptops undergo a 28-point hardware & thermal stress test by Vishal Soni and include a 30-Day In-Shop Testing Warranty with receipt.'
)
ON CONFLICT (id) DO UPDATE SET
    shop_name = EXCLUDED.shop_name,
    owner_name = EXCLUDED.owner_name,
    whatsapp_number = EXCLUDED.whatsapp_number,
    contact_number = EXCLUDED.contact_number,
    business_address = EXCLUDED.business_address,
    email_address = EXCLUDED.email_address;

-- 2. Insert Core Electronics Categories
INSERT INTO public.categories (id, name, slug, description, icon, display_order, is_active) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Refurbished Laptops', 'refurbished-laptops', 'Tested and verified certified refurbished laptops with testing warranty', 'Laptop', 1, true),
    ('c3333333-3333-3333-3333-333333333333', 'Computer Accessories', 'computer-accessories', 'Cables, adapters, laptop chargers, stands and docks', 'Cpu', 2, true),
    ('c4444444-4444-4444-4444-444444444444', 'Keyboards and Mice', 'keyboards-and-mice', 'Ergonomic wireless and gaming input peripherals', 'Keyboard', 3, true),
    ('c5555555-5555-5555-5555-555555555555', 'Monitors and Displays', 'monitors-and-displays', 'IPS, LED and gaming computer monitors', 'Monitor', 4, true),
    ('c6666666-6666-6666-6666-666666666666', 'Storage Devices', 'storage-devices', 'High-speed NVMe SSDs, SATA drives and flash storage', 'HardDrive', 5, true),
    ('c7777777-7777-7777-7777-777777777777', 'Networking Devices', 'networking-devices', 'Wi-Fi routers, extenders, ethernet cables and switches', 'Wifi', 6, true),
    ('c8888888-8888-8888-8888-888888888888', 'Mobile Accessories', 'mobile-accessories', 'Fast chargers, OTG adapters, earphones and power banks', 'Smartphone', 7, true),
    ('c9999999-9999-9999-9999-999999999999', 'Other Electronics', 'other-electronics', 'Speakers, power strips, electronic repair components', 'Sliders', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Genuine Electronics Products
INSERT INTO public.products (
    id, category_id, name, slug, brand, model, condition, price, original_price,
    stock_quantity, is_featured, is_published, is_sold_out, is_special_offer, offer_badge_text,
    description, warranty_info, return_info, primary_image, images, specifications,
    processor, ram, storage_type_capacity, screen_size, graphics, battery_health,
    physical_condition_grade, known_defects, included_accessories, is_reserved, is_demo_product
) VALUES
-- Product 1: ThinkPad T480
(
    'd1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Lenovo ThinkPad T480 (Core i5 8th Gen / 16GB / 512GB SSD)',
    'lenovo-thinkpad-t480-i5-8th-gen',
    'Lenovo',
    'ThinkPad T480',
    'second_hand',
    21999.00,
    24999.00,
    3,
    true,
    true,
    false,
    true,
    'Deal of the Week',
    'Certified business-grade Lenovo ThinkPad T480 laptop. Built like a tank with dual battery bridge support, spill-resistant backlit keyboard, and ultra-durable magnesium roll cage. Thoroughly tested by Vishal Soni with fresh thermal paste applied and clean Windows 11 Pro installed.',
    '30 Days In-Shop Testing Warranty with Digital World Tax Bill',
    '7 Days Replacement if any hardware defect detected',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80'
    ]::TEXT[],
    '{"Ports": "2x USB 3.1, 1x USB-C / Thunderbolt 3, HDMI 1.4b, RJ45 Gigabit Ethernet, SD Card Reader", "Weight": "1.58 kg", "OS": "Windows 11 Pro 64-bit Activated", "Webcam": "720p HD with ThinkShutter Privacy Slider"}'::JSONB,
    'Intel Core i5-8350U (4 Cores, 8 Threads, up to 3.60 GHz)',
    '16 GB DDR4 (Dual Channel Upgraded)',
    '512 GB M.2 NVMe High Speed SSD',
    '14.0-inch FHD (1920x1080) Anti-glare IPS Display',
    'Intel UHD Graphics 620',
    'Verified 84% Health (Dual Battery Setup gives approx 4 to 5 hours backup)',
    'Grade A (Excellent - Minimal sign of usage on top cover, zero screen scratches)',
    'None. Motherboard, keyboard, ports, trackpad, and thermals rigorously benchmarked.',
    'Original Lenovo 65W Type-C Fast Charger, Brand New Power Cord, Padded Laptop Sleeve',
    false,
    false
),
-- Product 2: Dell Latitude 5400
(
    'd2222222-2222-2222-2222-222222222222',
    'c1111111-1111-1111-1111-111111111111',
    'Dell Latitude 5400 (Core i7 8th Gen / 16GB / 256GB SSD)',
    'dell-latitude-5400-i7-8th-gen',
    'Dell',
    'Latitude 5400',
    'second_hand',
    23500.00,
    26000.00,
    2,
    true,
    true,
    false,
    false,
    NULL,
    'High performance business laptop with powerful Core i7 8th Gen processor. Sleek carbon fiber reinforced body, crisp IPS display, and smooth trackpad. Ideal for coding, accounting, office management, and study.',
    '30 Days In-Shop Hardware Testing Warranty',
    '7 Days Technical Replacement Window',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&auto=format&fit=crop&q=80'
    ]::TEXT[],
    '{"Security": "Fingerprint Reader, TPM 2.0", "Weight": "1.52 kg", "Battery Type": "4-cell 68Wh ExpressCharge"}'::JSONB,
    'Intel Core i7-8665U (Quad Core, 8 Threads, up to 4.80 GHz Turbo)',
    '16 GB DDR4 RAM',
    '256 GB High-Speed NVMe PCIe SSD',
    '14.0-inch Full HD (1920 x 1080) WVA Anti-Glare',
    'Intel UHD Graphics 620',
    'Verified 88% Battery Health (Estimated 4 hours backup under standard office load)',
    'Grade A (Clean condition, no cracks, keyboard letters 100% visible)',
    'Minor hairline scratch on outer edge corner, cosmetic only.',
    'Original Dell 65W AC Adapter and Laptop Bag',
    false,
    false
),
-- Product 3: HP EliteBook 840 G6
(
    'd3333333-3333-3333-3333-333333333333',
    'c1111111-1111-1111-1111-111111111111',
    'HP EliteBook 840 G6 Ultrabook (Aluminum Silver / i5 8th / 8GB / 256GB SSD)',
    'hp-elitebook-840-g6',
    'HP',
    'EliteBook 840 G6',
    'second_hand',
    19999.00,
    22500.00,
    1,
    true,
    true,
    false,
    true,
    'Budget Value Pick',
    'Premium all-aluminum unibody executive laptop with Bang & Olufsen high-clarity sound system. Ultra lightweight and sleek design with pristine silver finish.',
    '30 Days In-Shop Hardware Testing Warranty',
    '7 Days Testing Replacement',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
    ]::TEXT[],
    '{"Body": "Full Aluminum CNC Chasis", "Audio": "Bang & Olufsen Dual Stereo Speakers", "Weight": "1.48 kg"}'::JSONB,
    'Intel Core i5-8265U (1.6 GHz base, up to 3.9 GHz)',
    '8 GB DDR4 (Expandable up to 32 GB)',
    '256 GB NVMe M.2 SSD',
    '14.0-inch diagonal FHD IPS eDP anti-glare WLED-backlit',
    'Intel UHD Graphics 620',
    'Verified 81% Health (~3.5 Hours Real World Battery)',
    'Grade A- (Slight wear on bottom rubber feet, pristine screen)',
    'None. Fully inspected by Digital World.',
    'Original HP Smart Blue-pin 45W Charger & Power Cord',
    false,
    false
),
-- Product 4: Kingston NV2 500GB NVMe SSD
(
    'd4444444-4444-4444-4444-444444444444',
    'c6666666-6666-6666-6666-666666666666',
    'Kingston NV2 500GB PCIe 4.0 NVMe M.2 Internal SSD',
    'kingston-nv2-500gb-nvme-ssd',
    'Kingston',
    'NV2 SNV2S/500G',
    'new',
    2899.00,
    3499.00,
    15,
    true,
    true,
    false,
    false,
    NULL,
    'Boost your laptop or desktop speed up to 4x faster than standard SATA SSDs. High-speed Gen 4x4 NVMe read speeds up to 3,500 MB/s. Genuine sealed retail box.',
    '3 Years Manufacturer Warranty by Kingston India',
    '7 Days Dead-on-Arrival In-Shop Replacement',
    'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80'
    ]::TEXT[],
    '{"Interface": "PCIe 4.0 x4 NVMe", "Read Speed": "Up to 3,500 MB/s", "Write Speed": "Up to 2,100 MB/s", "Form Factor": "M.2 2280"}'::JSONB,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, false
),
-- Product 5: Logitech MK270 Combo
(
    'd5555555-5555-5555-5555-555555555555',
    'c4444444-4444-4444-4444-444444444444',
    'Logitech MK270 Wireless Keyboard and Mouse Combo',
    'logitech-mk270-wireless-combo',
    'Logitech',
    'MK270',
    'new',
    1599.00,
    1995.00,
    10,
    true,
    true,
    false,
    false,
    NULL,
    'India''s most reliable wireless keyboard and mouse combo with 2.4GHz plug-and-play USB receiver. Spill resistant design and ultra-long battery life.',
    '3 Years Limited Hardware Warranty by Logitech India',
    '7 Days In-Shop Defect Replacement',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
    ]::TEXT[],
    '{"Wireless Range": "10 meters", "Connectivity": "2.4 GHz USB Nano Receiver", "Keyboard Battery": "Up to 36 months", "Mouse Battery": "Up to 12 months"}'::JSONB,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, false
),
-- Product 6: TP-Link Archer C6 Gigabit Router
(
    'd6666666-6666-6666-6666-666666666666',
    'c7777777-7777-7777-7777-777777777777',
    'TP-Link Archer C6 AC1200 Gigabit Dual-Band Wi-Fi Router',
    'tp-link-archer-c6-ac1200-router',
    'TP-Link',
    'Archer C6 (V3/V4)',
    'new',
    2399.00,
    2999.00,
    6,
    false,
    true,
    false,
    false,
    NULL,
    'High-speed dual-band Wi-Fi router with 4 high-gain external antennas and MU-MIMO technology. Features full Gigabit WAN and LAN ports for seamless 100Mbps+ fiber connections.',
    '3 Years National Warranty by TP-Link India',
    '7 Days Return if defective',
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80'
    ]::TEXT[],
    '{"Wi-Fi Speeds": "867 Mbps on 5 GHz + 300 Mbps on 2.4 GHz", "Ethernet Ports": "1x Gigabit WAN, 4x Gigabit LAN", "Antennas": "4 Fixed High-Gain Omnidirectional"}'::JSONB,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, false
),
-- Product 7: Universal 65W Type-C Laptop Charger
(
    'd7777777-7777-7777-7777-777777777777',
    'c3333333-3333-3333-3333-333333333333',
    '65W GaN Fast Type-C Laptop Power Adapter with Detachable Cable',
    'universal-65w-type-c-laptop-charger',
    'Digital World Pro',
    'DW-65W-GAN',
    'new',
    1199.00,
    1499.00,
    12,
    true,
    true,
    false,
    true,
    'Shop Best-Seller',
    'Compact Gallium Nitride (GaN) fast charger compatible with all Type-C laptops (Dell, Lenovo, HP, MacBook Air, Asus, Acer) and smartphones with Power Delivery 3.0.',
    '6 Months Replacement Warranty by Digital World',
    '7 Days Replacement Policy',
    'https://images.unsplash.com/photo-1618755788416-0ef24483750d?w=800&auto=format&fit=crop&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1618755788416-0ef24483750d?w=800&auto=format&fit=crop&q=80'
    ]::TEXT[],
    '{"Power Output": "65W Max (20V/3.25A, 15V/3A, 9V/3A, 5V/3A)", "Protection": "Over-voltage, short-circuit, and overheating protection", "Cable": "Includes 1.8M Braided Type-C to Type-C Cable"}'::JSONB,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, false
),
-- Product 8: Dell 24-inch FHD IPS Monitor
(
    'd8888888-8888-8888-8888-888888888888',
    'c5555555-5555-5555-5555-555555555555',
    'Dell 24-Inch Full HD IPS Monitor (75Hz / AMD FreeSync / HDMI & VGA)',
    'dell-24-inch-fhd-ips-monitor',
    'Dell',
    'SE2422HX / S2421HN',
    'new',
    8499.00,
    10999.00,
    4,
    true,
    true,
    false,
    false,
    NULL,
    'Sleek 24-inch Full HD monitor with ultra-thin three-sided bezels and IPS wide viewing angles. Ideal companion for laptop dual-screen setups and home workstations.',
    '3 Years Advanced Exchange Service Warranty by Dell India',
    '7 Days Dead Pixel / Transit Damage Replacement',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'
    ]::TEXT[],
    '{"Display Size": "23.8 Inches", "Panel": "IPS (In-Plane Switching)", "Refresh Rate": "75 Hz", "Resolution": "1920 x 1080 FHD", "Connectivity": "2x HDMI 1.4, 1x Audio-out"}'::JSONB,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, false
)
ON CONFLICT (slug) DO NOTHING;
