export type ProductCondition = 'new' | 'second_hand';

export interface ProductSpecifications {
  [key: string]: string;
}

export interface Product {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  condition: ProductCondition;
  price: number;
  original_price?: number;
  stock_quantity: number;
  is_featured: boolean;
  is_published: boolean;
  is_sold_out: boolean;
  is_special_offer: boolean;
  offer_badge_text?: string;
  description: string;
  warranty_info?: string;
  return_info?: string;
  primary_image: string;
  images: string[];
  specifications: ProductSpecifications;

  // Dedicated Refurbished Laptop Inspection Fields
  processor?: string;
  ram?: string;
  storage_type_capacity?: string;
  screen_size?: string;
  graphics?: string;
  battery_health?: string;
  physical_condition_grade?: string;
  known_defects?: string;
  included_accessories?: string;
  is_reserved?: boolean;

  // Dealer / Wholesale Exclusive Fields
  dealer_price?: number;
  is_dealer_only?: boolean;
  min_dealer_qty?: number;

  // Demo status
  is_demo_product?: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliveryType = 'home_delivery' | 'store_pickup';
export type PaymentMethod = 'cod' | 'pay_on_delivery' | 'online_payment';
export type PaymentStatus = 'pending' | 'collected' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderCustomerInfo {
  customer_name: string;
  customer_phone: string;
  customer_whatsapp: string;
  customer_email?: string;
  delivery_type: DeliveryType;
  delivery_address: string;
  city: string;
  state: string;
  pincode: string;
  order_notes?: string;
  payment_method: PaymentMethod;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_brand: string;
  product_model: string;
  product_image: string;
  condition: ProductCondition;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface OrderStatusHistoryItem {
  id?: string;
  order_id: string;
  status: OrderStatus;
  note?: string;
  created_at: string;
  updated_by?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp: string;
  customer_email?: string;
  delivery_type: DeliveryType;
  delivery_address: string;
  city: string;
  state: string;
  pincode: string;
  order_notes?: string;
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
  status_history?: OrderStatusHistoryItem[];

  // Dealer / Wholesale Order Details
  order_type?: 'retail' | 'dealer';
  dealer_id?: string;
  dealer_code?: string;
  dealer_business_name?: string;
  gst_number?: string;
}

export interface StoreSettings {
  id: string;
  shop_name: string;
  owner_name: string;
  whatsapp_number: string;
  contact_number: string;
  business_address: string;
  email_address: string;
  opening_hours: string;
  logo_url?: string;
  delivery_charges: number;
  free_delivery_above: number;
  delivery_service_areas: string;
  minimum_order_amount: number;
  cod_enabled: boolean;
  pay_on_delivery_enabled: boolean;
  online_payment_enabled: boolean;
  store_pickup_enabled: boolean;
  upi_id?: string;
  return_policy_text: string;
  warranty_policy_text: string;
  updated_at?: string;
}

export interface CustomerAddress {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  created_at: string;
  default_address?: CustomerAddress;
}

export type DealerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface DealerUser {
  id: string;
  dealer_code: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  gst_number?: string;
  business_type?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: DealerStatus;
  created_at: string;
  approved_at?: string;
  admin_notes?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  phone?: string;
  role: 'owner' | 'manager' | 'staff';
}
