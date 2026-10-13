export type Language = 'en' | 'hi';

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const translations: Record<string, { en: string; hi: string }> = {
  // Brand & Header
  brandName: { en: 'Digital World', hi: 'डिजिटल वर्ल्ड' },
  ownerTitle: { en: 'Owner: Vishal Soni', hi: 'दुकान मालिक: विशाल सोनी' },
  searchPlaceholder: { en: 'Search laptops, chargers, accessories, SSDs...', hi: 'लैपटॉप, चार्जर, एसएसडी, सामान खोजें...' },
  navHome: { en: 'Home', hi: 'होम' },
  navAllProducts: { en: 'All Products', hi: 'सभी उत्पाद' },
  navUsedLaptops: { en: 'Refurbished Laptops', hi: 'रिफर्बिश्ड लैपटॉप' },
  navNewLaptops: { en: 'New Laptops', hi: 'नए लैपटॉप' },
  navAccessories: { en: 'Accessories', hi: 'कंप्यूटर एक्सेसरीज' },
  navTrackOrder: { en: 'Track Order', hi: 'ऑर्डर ट्रैक करें' },
  navAdmin: { en: 'Shop Admin', hi: 'दुकान एडमिन' },
  cart: { en: 'Cart', hi: 'कार्ट' },

  // Hero & Highlights
  heroTitle: { en: 'Certified Laptops & Electronics at Honest Local Prices', hi: 'सत्यापित लैपटॉप और इलेक्ट्रॉनिक्स, भरोसेमंद दामों पर' },
  heroSubtitle: { en: 'Direct from Vishal Soni. Physically stress-tested refurbished laptops with shop testing warranty, genuine computer parts, and instant WhatsApp support.', hi: 'विशाल सोनी द्वारा व्यक्तिगत रूप से 28-पॉइंट टेस्टेड रिफर्बिश्ड लैपटॉप, 30 दिन की शॉप वारंटी और सीधे व्हाट्सएप पर ऑर्डर की सुविधा।' },
  shopNow: { en: 'Shop Now', hi: 'अभी खरीदें' },
  exploreUsedLaptops: { en: 'Explore Refurbished Laptops', hi: 'रिफर्बिश्ड लैपटॉप देखें' },
  heroBadge: { en: 'Local Electronics & Refurbished Laptops Specialist', hi: 'विश्वसनीय इलेक्ट्रॉनिक्स और टेस्टेड रिफर्बिश्ड स्टोर' },

  // Value props
  whyShopWithUs: { en: 'Why Shop With Digital World?', hi: 'डिजिटल वर्ल्ड से क्यों खरीदें?' },
  whySubtitle: { en: 'Clear specifications, no fabricated claims, and direct personal accountability by Vishal Soni.', hi: 'स्पष्ट विनिर्देश, कोई झूठे दावे नहीं, और विशाल सोनी द्वारा व्यक्तिगत भरोसा।' },
  featureTestedTitle: { en: '28-Point Physical Inspection', hi: '28-पॉइंट हार्डवेयर टेस्टिंग' },
  featureTestedDesc: { en: 'Every refurbished laptop is physically checked for thermals, battery health, display, keyboard, and motherboard integrity before listing.', hi: 'प्रत्येक रिफर्बिश्ड लैपटॉप की बैटरी, स्क्रीन, कीबोर्ड और मदरबोर्ड की पूरी जांच की जाती है।' },
  featureWarrantyTitle: { en: 'In-Shop Testing Warranty', hi: '30-दिन शॉप टेस्टिंग वारंटी' },
  featureWarrantyDesc: { en: 'Buy with complete peace of mind. We provide testing replacement warranty with physical shop receipt.', hi: 'पक्के बिल और टेस्टिंग वारंटी के साथ खरीदें। किसी भी समस्या पर तुरंत सहायता।' },
  featureTransparentTitle: { en: 'Transparent Pricing & Condition', hi: 'पारदर्शी कीमत और स्पष्ट स्थिति' },
  featureTransparentDesc: { en: 'Exact physical condition, battery percentage, and real photos are shown upfront. No hidden surprises.', hi: 'लैपटॉप की वास्तविक कंडीशन, बैटरी बैकअप और असली फोटो साफ़-साफ़ दिखाई जाती हैं।' },
  featureWhatsAppTitle: { en: 'Direct WhatsApp Support', hi: 'सीधे व्हाट्सएप सहायता' },
  featureWhatsAppDesc: { en: 'Chat directly with Vishal Soni for availability, custom configurations, video calls of laptops, or delivery status.', hi: 'लैपटॉप का लाइव वीडियो देखने या जानकारी के लिए सीधे व्हाट्सएप पर बात करें।' },

  // Catalog & Product Card
  categories: { en: 'Browse Categories', hi: 'श्रेणियाँ' },
  bestSellers: { en: 'Best Selling Products', hi: 'सबसे लोकप्रिय उत्पाद' },
  recentProducts: { en: 'Recently Added Products', hi: 'हाल ही में जोड़े गए उत्पाद' },
  laptopDeals: { en: 'Affordable Refurbished Laptop Deals', hi: 'किफायती रिफर्बिश्ड लैपटॉप डील्स' },
  specialOffers: { en: 'Special Offers', hi: 'विशेष ऑफर्स' },
  viewAll: { en: 'View All', hi: 'सभी देखें' },
  viewDetails: { en: 'View Details', hi: 'विवरण देखें' },
  addToCart: { en: 'Add to Cart', hi: 'कार्ट में जोड़ें' },
  orderOnWhatsApp: { en: 'Order on WhatsApp', hi: 'व्हाट्सएप पर ऑर्डर करें' },
  conditionNew: { en: 'Brand New', hi: 'नया (ब्रांड न्यू)' },
  conditionSecondHand: { en: 'Certified Refurbished', hi: 'सत्यापित रिफर्बिश्ड (Certified Refurbished)' },
  inStock: { en: 'In Stock', hi: 'उपलब्ध है' },
  outOfStock: { en: 'Out of Stock', hi: 'स्टॉक में नहीं है' },
  reserved: { en: 'Reserved', hi: 'आरक्षित' },
  soldOut: { en: 'Sold Out', hi: 'बिक चुका है' },
  demoNotice: { en: 'Demo Product for Testing', hi: 'परीक्षण हेतु डेमो उत्पाद' },

  // Filters & Sorting
  filters: { en: 'Filters', hi: 'फ़िल्टर' },
  allCategories: { en: 'All Categories', hi: 'सभी श्रेणियाँ' },
  allConditions: { en: 'All Conditions', hi: 'सभी स्थितियाँ' },
  priceRange: { en: 'Price Range', hi: 'कीमत का दायरा' },
  brand: { en: 'Brand', hi: 'ब्रांड' },
  sortBy: { en: 'Sort by', hi: 'क्रमबद्ध करें' },
  sortNewest: { en: 'Newest Arrivals', hi: 'नवीनतम' },
  sortPriceAsc: { en: 'Price: Low to High', hi: 'कीमत: कम से ज्यादा' },
  sortPriceDesc: { en: 'Price: High to Low', hi: 'कीमत: ज्यादा से कम' },
  resetFilters: { en: 'Reset Filters', hi: 'फ़िल्टर रीसेट करें' },
  noProductsFound: { en: 'No products found matching your search.', hi: 'आपकी खोज से मिलता कोई उत्पाद नहीं मिला।' },

  // Laptop Details
  specsTitle: { en: 'Technical Specifications', hi: 'तकनीकी विवरण' },
  processor: { en: 'Processor (CPU)', hi: 'प्रोसेसर' },
  ram: { en: 'RAM Memory', hi: 'रैम मेमोरी' },
  storage: { en: 'Storage', hi: 'स्टोरेज (एसएसडी/एचडीडी)' },
  display: { en: 'Display Screen', hi: 'स्क्रीन साइज' },
  graphics: { en: 'Graphics (GPU)', hi: 'ग्राफ़िक्स' },
  batteryHealth: { en: 'Battery Health / Backup', hi: 'बैटरी हेल्थ / बैकअप' },
  physicalCondition: { en: 'Physical Condition Grade', hi: 'फिजिकल कंडीशन' },
  knownDefects: { en: 'Inspected Defects / Notes', hi: 'जांच रिपोर्ट / कमियां' },
  includedAccessories: { en: 'Included Accessories', hi: 'साथ में मिलने वाला सामान' },
  warranty: { en: 'Warranty Coverage', hi: 'वारंटी' },
  notProvided: { en: 'Not provided', hi: 'उपलब्ध नहीं' },

  // Cart & Checkout
  shoppingCart: { en: 'Shopping Cart', hi: 'शॉपिंग कार्ट' },
  emptyCart: { en: 'Your shopping cart is currently empty.', hi: 'आपकी कार्ट अभी खाली है।' },
  subtotal: { en: 'Subtotal', hi: 'उप-योग' },
  deliveryCharges: { en: 'Delivery Charges', hi: 'डिलीवरी शुल्क' },
  freeDelivery: { en: 'FREE Delivery', hi: 'मुफ़्त डिलीवरी' },
  totalAmount: { en: 'Total Payable Amount', hi: 'कुल देय राशि' },
  proceedToCheckout: { en: 'Proceed to Checkout', hi: 'चेकआउट करें' },
  continueShopping: { en: 'Continue Shopping', hi: 'खरीदारी जारी रखें' },
  sendCartToWhatsApp: { en: 'Send Cart Inquiry to WhatsApp', hi: 'पूरी कार्ट व्हाट्सएप पर भेजें' },
  checkoutTitle: { en: 'Complete Your Order', hi: 'अपना ऑर्डर पूरा करें' },
  customerDetails: { en: 'Customer Contact & Delivery Details', hi: 'ग्राहक संपर्क और पता' },
  fullName: { en: 'Full Name', hi: 'पूरा नाम' },
  mobileNumber: { en: '10-Digit Mobile Number', hi: '10-अंकों का मोबाइल नंबर' },
  whatsAppNumber: { en: 'WhatsApp Number', hi: 'व्हाट्सएप नंबर' },
  sameAsMobile: { en: 'Same as mobile number', hi: 'मोबाइल नंबर के समान' },
  deliveryType: { en: 'Delivery Option', hi: 'डिलीवरी का विकल्प' },
  homeDelivery: { en: 'Doorstep Delivery', hi: 'घर पर डिलीवरी' },
  storePickup: { en: 'Store Pickup (Pick up from Digital World shop)', hi: 'दुकान से पिकअप (डिजिटल वर्ल्ड से प्राप्त करें)' },
  deliveryAddress: { en: 'Complete Street Address', hi: 'पूरा पता' },
  city: { en: 'City', hi: 'शहर' },
  state: { en: 'State', hi: 'राज्य' },
  pincode: { en: 'PIN Code (6 digits)', hi: 'पिन कोड (6 अंक)' },
  orderNotes: { en: 'Optional Notes for Shop Owner', hi: 'दुकानदार के लिए विशेष निर्देश (वैकल्पिक)' },
  paymentMethod: { en: 'Payment Method', hi: 'भुगतान का तरीका' },
  codLabel: { en: 'Cash on Delivery (COD)', hi: 'कैश ऑन डिलीवरी (COD)' },
  codDesc: { en: 'Pay pure cash to the delivery courier when your order arrives.', hi: 'ऑर्डर मिलने पर डिलीवरी वाले को नकद भुगतान करें।' },
  payOnDeliveryLabel: { en: 'Pay on Delivery (UPI / Cash at Doorstep)', hi: 'पे ऑन डिलीवरी (UPI क्यूआर कोड या नकद)' },
  payOnDeliveryDesc: { en: 'Pay via any UPI app (Google Pay, PhonePe, Paytm) or Cash when inspecting package.', hi: 'पैकेज प्राप्त करते समय UPI क्यूआर कोड स्कैन करके या नकद भुगतान करें।' },
  onlinePaymentLabel: { en: 'Online Payment Gateway', hi: 'ऑनलाइन भुगतान गेटवे' },
  onlinePaymentDisabled: { en: 'Online card gateway is temporarily disabled. Please select Cash or Pay on Delivery.', hi: 'ऑनलाइन कार्ड गेटवे अभी बंद है। कृपया कैश या पे ऑन डिलीवरी चुनें।' },
  placeOrder: { en: 'Confirm and Place Order', hi: 'ऑर्डर पक्का करें' },

  // Order Confirmation
  orderConfirmed: { en: 'Order Placed Successfully!', hi: 'ऑर्डर सफलतापूर्वक प्राप्त हुआ!' },
  orderNumber: { en: 'Order Number', hi: 'ऑर्डर संख्या' },
  confirmationMsg: { en: 'Thank you! Vishal Soni will review your order and verify inventory before dispatch.', hi: 'धन्यवाद! विशाल सोनी आपके ऑर्डर की पुष्टि करेंगे।' },
  chatWithShopOnWhatsApp: { en: 'Chat with Shop on WhatsApp regarding this Order', hi: 'इस ऑर्डर के बारे में व्हाट्सएप पर बात करें' },
  trackThisOrder: { en: 'Track This Order', hi: 'इस ऑर्डर को ट्रैक करें' },

  // Footer
  footerAbout: { en: 'Digital World is your neighborhood computer and electronics specialist in India. We offer genuine hardware, certified refurbished business laptops, and fast local support.', hi: 'डिजिटल वर्ल्ड भारत में आपकी विश्वसनीय इलेक्ट्रॉनिक्स और रिफर्बिश्ड लैपटॉप की स्थानीय दुकान है।' },
  storeHours: { en: 'Shop Business Hours', hi: 'दुकान का समय' },
  storeAddress: { en: 'Shop Address', hi: 'दुकान का पता' },
  contactUs: { en: 'Contact Us', hi: 'संपर्क करें' },
  rightsReserved: { en: 'All rights reserved.', hi: 'सर्वाधिकार सुरक्षित।' }
};
