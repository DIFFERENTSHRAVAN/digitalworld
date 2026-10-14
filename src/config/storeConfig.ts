/**
 * ==============================================================================
 * 🏪 DIGITAL WORLD - CENTRAL STORE CONFIGURATION
 * ==============================================================================
 * 
 * 📌 HINDI / ENGLISH GUIDE:
 * Agar aapko website par koi bhi detail badalni hai (jaise Shop Name, WhatsApp Number,
 * Calling Number, Address, Email, Timings, Delivery Charges, ya Policies), toh aapko 
 * alag-alag files dhundhne ki zaroorat nahi hai.
 * 
 * BAS IS EK FILE (src/config/storeConfig.ts) MEIN CHANGE KIJIYE!
 * 
 * Website ke sabhi components, pages, header, footer, WhatsApp ordering links,
 * aur Admin settings isi central configuration se connect hain.
 * 
 * TIP: Agar aap is file mein koi change karein aur chahein ki browser mein turant 
 * reflect ho jaye, toh niche diye gaye `version` ko badha dein (jaise '1.1.0' -> '1.1.1').
 * ==============================================================================
 */

export interface StoreConfigType {
  // 1. Basic Store & Owner Details
  shopName: string;
  shopNameHindi: string;
  ownerName: string;
  tagline: string;

  // 2. Contact Information
  whatsappNumber: string; // 10-digit number without + or country code (e.g. '6377123270')
  contactNumber: string;  // Normal calling phone number
  emailAddress: string;

  // 3. Physical Address & Timings
  businessAddress: string;
  city: string;
  state: string;
  pincode: string;
  openingHours: string;
  closedOn: string;

  // 4. Delivery & Pricing Settings (₹ INR)
  currency: string;
  currencyCode: string;
  deliveryCharges: number;
  freeDeliveryAbove: number;
  minimumOrderAmount: number;
  deliveryServiceAreas: string;

  // 5. Payment Methods
  codEnabled: boolean;            // Cash on Delivery
  payOnDeliveryEnabled: boolean;  // Pay upon receiving (UPI/Cash)
  onlinePaymentEnabled: boolean;  // Payment Gateway
  storePickupEnabled: boolean;    // In-store pickup
  upiId?: string;                 // Shop UPI ID for payments (e.g. 6377123270@upi)

  // 6. Warranty & Return Policies
  warrantyPolicyText: string;
  returnPolicyText: string;

  // 7. Official Bank Details (Requirement 5)
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankBranch: string;
  bankPaymentInstructions: string;
  googleMapsUrl: string;

  // 8. Branding & Assets
  logoUrl?: string;

  // 9. Demo Admin Credentials (For local offline testing)
  adminEmail: string;

  // 10. Config Cache Version
  version: string;
}

export const STORE_CONFIG: StoreConfigType = {
  // ---------------------------------------------------------------------------
  // 1. DUKAAN KA NAAM AUR OWNER (Shop & Owner Identity)
  // ---------------------------------------------------------------------------
  shopName: 'Digital World',
  shopNameHindi: 'डिजिटल वर्ल्ड',
  ownerName: 'Vishal Soni',
  tagline: 'Certified Electronics & Used Laptop Specialist',

  // ---------------------------------------------------------------------------
  // 2. CONTACT DETAILS (WhatsApp & Calling Numbers)
  // ---------------------------------------------------------------------------
  whatsappNumber: '+918384957548', // Primary WhatsApp for Customer Chats & Orders
  contactNumber: '+918384957548',  // Shop Calling Number
  emailAddress: 'digitalworld0813@gmail.com',

  // ---------------------------------------------------------------------------
  // 3. SHOP ADDRESS & OPENING HOURS (Requirement 4)
  // ---------------------------------------------------------------------------
  businessAddress: 'Near SBI Bank, Sabji Mandi Road, Purani Abadi, Sri Ganganagar, Rajasthan - 335001, India',
  city: 'Sri Ganganagar',
  state: 'Rajasthan',
  pincode: '335001',
  openingHours: '10:00 AM - 08:30 PM (Monday to Saturday)',
  closedOn: 'Sunday',

  // ---------------------------------------------------------------------------
  // 4. DELIVERY CHARGES & MINIMUM ORDER (in ₹ INR)
  // ---------------------------------------------------------------------------
  currency: '₹',
  currencyCode: 'INR',
  deliveryCharges: 99,           // Delivery charge for orders below free delivery limit
  freeDeliveryAbove: 1999,       // Orders above ₹1999 get FREE delivery
  minimumOrderAmount: 100,       // Minimum order value
  deliveryServiceAreas: 'Store pickup available immediately. Local city doorstep delivery within 24 hours. Courier dispatch across India in 3-5 business days.',

  // ---------------------------------------------------------------------------
  // 5. PAYMENT OPTIONS
  // ---------------------------------------------------------------------------
  codEnabled: true,              // Cash on Delivery enabled
  payOnDeliveryEnabled: true,    // Pay on Delivery (UPI QR / Cash at door)
  onlinePaymentEnabled: false,   // Set to true after connecting Razorpay/Cashfree
  storePickupEnabled: true,      // Allow customer to collect order in-shop
  upiId: 'vishalsoni.0813@axl',        // Shop UPI ID for receiving customer payments

  // ---------------------------------------------------------------------------
  // 6. RETURN & WARRANTY POLICIES
  // ---------------------------------------------------------------------------
  warrantyPolicyText: 'All certified refurbished laptops undergo a 28-point hardware & thermal stress test by Vishal Soni and include a 30-Day In-Shop Testing Warranty with receipt.',
  returnPolicyText: '7 Days replacement for defective accessories. 15 Days hardware replacement policy on certified refurbished laptops if technical issues arise.',

  // ---------------------------------------------------------------------------
  // 7. EXACT OFFICIAL BANK DETAILS (Requirement 5)
  // ---------------------------------------------------------------------------
  bankName: 'INDIAN BANK',
  bankAccountName: 'Digital World',
  bankAccountNumber: '8062314869',
  bankIfsc: 'IDIB000S761',
  bankBranch: 'Sri Ganganagar',
  bankPaymentInstructions: 'Transfer order amount via NEFT / IMPS / RTGS to our Indian Bank account. After transferring, please share the UTR reference number or payment receipt to our WhatsApp (+91 8384957548) for instant order verification & dispatch.',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Digital+World+Near+SBI+Bank+Sabji+Mandi+Road+Purani+Abadi+Sri+Ganganagar+Rajasthan+335001',

  // ---------------------------------------------------------------------------
  // 8. BRANDING LOGO (Optional image URL, leave blank to use typography logo)
  // ---------------------------------------------------------------------------
  logoUrl: '',

  // ---------------------------------------------------------------------------
  // 9. ADMIN LOGIN EMAIL (For Vishal Soni)
  // ---------------------------------------------------------------------------
  adminEmail: 'digitalworld0813@gmail.com',

  // ---------------------------------------------------------------------------
  // 10. CONFIG VERSION (Change this number whenever you update this file!)
  // ---------------------------------------------------------------------------
  version: '2.0.0'
};

/**
 * Helper to clean phone numbers and ensure valid India country code (91)
 */
export const getCleanPhoneNumber = (rawNumber?: string): string => {
  const num = rawNumber || STORE_CONFIG.whatsappNumber;
  return num.replace(/\D/g, '');
};

/**
 * Helper to generate a direct WhatsApp click-to-chat URL
 */
export const getStoreWhatsAppUrl = (customMessage?: string, rawNumber?: string): string => {
  const clean = getCleanPhoneNumber(rawNumber);
  const formatted = clean.startsWith('91') ? clean : `91${clean}`;
  const message = customMessage || `Hello Vishal Soni (${STORE_CONFIG.shopName}), I would like to inquire about your products.`;
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
};

/**
 * Helper to generate a direct phone call URL (tel:)
 */
export const getStoreCallUrl = (rawNumber?: string): string => {
  const clean = getCleanPhoneNumber(rawNumber || STORE_CONFIG.contactNumber);
  return `tel:${clean}`;
};
