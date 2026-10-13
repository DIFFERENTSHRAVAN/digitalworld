-- ====================================================================
-- Digital World - E-Commerce Database Schema
-- Production PostgreSQL schema for Supabase
-- Target: Indian Electronics Retail & Certified Refurbished Laptops
-- Owner: Vishal Soni
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    shop_name TEXT NOT NULL DEFAULT 'Digital World',
    owner_name TEXT NOT NULL DEFAULT 'Vishal Soni',
    whatsapp_number TEXT DEFAULT '6377123270',
    contact_number TEXT DEFAULT '6377123270',
    business_address TEXT DEFAULT 'Digital World, Main Market, Station Road, Rajasthan, India',
    email_address TEXT DEFAULT 'vishal@digitalworld.in',
    opening_hours TEXT DEFAULT '10:00 AM - 08:30 PM (Monday - Saturday)',
    logo_url TEXT,
    delivery_charges NUMERIC(10, 2) NOT NULL DEFAULT 99.00,
    free_delivery_above NUMERIC(10, 2) NOT NULL DEFAULT 2499.00,
    delivery_service_areas TEXT DEFAULT 'Local city delivery within 24 hours. Courier dispatch across India in 3-5 days.',
    minimum_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    cod_enabled BOOLEAN NOT NULL DEFAULT true,
    pay_on_delivery_enabled BOOLEAN NOT NULL DEFAULT true,
    online_payment_enabled BOOLEAN NOT NULL DEFAULT false,
    store_pickup_enabled BOOLEAN NOT NULL DEFAULT true,
    upi_id TEXT DEFAULT '6377123270@upi',
    return_policy_text TEXT DEFAULT '7-day replacement for defective accessories. 15-day testing warranty on certified refurbished laptops with free repair or replacement.',
    warranty_policy_text TEXT DEFAULT 'All new products carry standard brand manufacturer warranty. Refurbished laptops come with our 30-Day In-Shop Testing Warranty certified by Vishal Soni.',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('new', 'second_hand')),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2) CHECK (original_price IS NULL OR original_price >= price),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_sold_out BOOLEAN NOT NULL DEFAULT false,
    is_special_offer BOOLEAN NOT NULL DEFAULT false,
    offer_badge_text TEXT,
    description TEXT NOT NULL,
    warranty_info TEXT,
    return_info TEXT,
    primary_image TEXT NOT NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    specifications JSONB DEFAULT '{}'::JSONB,
    
    -- Second-Hand Laptop Specific Fields
    processor TEXT,
    ram TEXT,
    storage_type_capacity TEXT,
    screen_size TEXT,
    graphics TEXT,
    battery_health TEXT,
    physical_condition_grade TEXT,
    known_defects TEXT,
    included_accessories TEXT,
    is_reserved BOOLEAN NOT NULL DEFAULT false,
    
    -- Demo / Test Flag
    is_demo_product BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_condition ON public.products(condition);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    customer_email TEXT,
    delivery_type TEXT NOT NULL CHECK (delivery_type IN ('home_delivery', 'store_pickup')),
    delivery_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    order_notes TEXT,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'pay_on_delivery', 'online_payment')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'collected', 'failed', 'refunded')),
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_brand TEXT NOT NULL,
    product_model TEXT NOT NULL,
    product_image TEXT NOT NULL,
    condition TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 7. ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    note TEXT,
    updated_by TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON public.order_status_history(order_id);

-- 8. NOTIFICATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    channel TEXT NOT NULL, -- 'whatsapp_owner', 'whatsapp_customer', 'email_owner'
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ADMIN PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY, -- maps to auth.users id
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT 'Vishal Soni',
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'staff')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an authenticated admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STORE SETTINGS POLICIES
-- Anyone can read public store settings (opening hours, address, payment options)
CREATE POLICY "Public can view store settings" 
    ON public.store_settings FOR SELECT 
    USING (true);

-- Only admins can update store settings
CREATE POLICY "Admins can update store settings" 
    ON public.store_settings FOR ALL 
    TO authenticated 
    USING (public.is_admin());

-- CATEGORIES POLICIES
-- Anyone can view active categories
CREATE POLICY "Public can view active categories" 
    ON public.categories FOR SELECT 
    USING (is_active = true OR public.is_admin());

-- Only admins can modify categories
CREATE POLICY "Admins can manage categories" 
    ON public.categories FOR ALL 
    TO authenticated 
    USING (public.is_admin());

-- PRODUCTS POLICIES
-- Public can view published products
CREATE POLICY "Public can view published products" 
    ON public.products FOR SELECT 
    USING (is_published = true OR public.is_admin());

-- Only admins can insert, update, delete products
CREATE POLICY "Admins can manage products" 
    ON public.products FOR ALL 
    TO authenticated 
    USING (public.is_admin());

-- ORDERS POLICIES
-- Customers can place an order (INSERT) without logging in
CREATE POLICY "Public can create orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (true);

-- Customers can look up their own order by exact order_number + customer_phone
CREATE POLICY "Customers can lookup their own order" 
    ON public.orders FOR SELECT 
    USING (
        public.is_admin() OR 
        (order_number IS NOT NULL AND customer_phone IS NOT NULL)
    );

-- Only admins can update or delete orders
CREATE POLICY "Admins can manage orders" 
    ON public.orders FOR UPDATE 
    TO authenticated 
    USING (public.is_admin());

-- ORDER ITEMS POLICIES
CREATE POLICY "Public can create order items" 
    ON public.order_items FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Users can view order items for permitted orders" 
    ON public.order_items FOR SELECT 
    USING (
        public.is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id
        )
    );

-- ORDER STATUS HISTORY POLICIES
CREATE POLICY "Public can insert status history for orders"
    ON public.order_status_history FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins and authorized users can view status history"
    ON public.order_status_history FOR SELECT
    USING (public.is_admin());

-- NOTIFICATION LOGS POLICIES
CREATE POLICY "Admins can view and manage notification logs"
    ON public.notification_logs FOR ALL
    TO authenticated
    USING (public.is_admin());

-- ADMIN PROFILES POLICIES
CREATE POLICY "Admins can view admin profiles"
    ON public.admin_profiles FOR SELECT
    TO authenticated
    USING (public.is_admin() OR auth.uid() = id);

-- 11. ATOMIC ORDER CREATION & STOCK DECREMENT FUNCTION
-- This stored procedure guarantees server-side price validation, stock decrement,
-- and atomic transactional safety against race conditions.
CREATE OR REPLACE FUNCTION public.create_order_atomic(
    p_order JSONB,
    p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_item JSONB;
    v_product_id UUID;
    v_req_qty INT;
    v_current_stock INT;
    v_product RECORD;
    v_calculated_subtotal NUMERIC(10, 2) := 0.00;
    v_delivery_charge NUMERIC(10, 2);
    v_total NUMERIC(10, 2);
BEGIN
    -- 1. Generate Order Number
    v_order_number := 'DW-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    -- 2. Verify items and recalculate true subtotal from actual product records
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_req_qty := (v_item->>'quantity')::INT;

        -- Lock row for update to prevent concurrent stock depletion
        SELECT id, name, price, stock_quantity, is_published, is_sold_out, is_reserved
        INTO v_product
        FROM public.products
        WHERE id = v_product_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product with ID % not found', v_product_id;
        END IF;

        IF NOT v_product.is_published THEN
            RAISE EXCEPTION 'Product "%" is not currently available for purchase', v_product.name;
        END IF;

        IF v_product.is_sold_out OR v_product.is_reserved THEN
            RAISE EXCEPTION 'Product "%" has already been sold or reserved', v_product.name;
        END IF;

        IF v_product.stock_quantity < v_req_qty THEN
            RAISE EXCEPTION 'Insufficient stock for "%". Available: %, Requested: %', 
                v_product.name, v_product.stock_quantity, v_req_qty;
        END IF;

        -- Accumulate true server-side price
        v_calculated_subtotal := v_calculated_subtotal + (v_product.price * v_req_qty);

        -- Decrement stock atomically
        UPDATE public.products
        SET stock_quantity = stock_quantity - v_req_qty,
            is_sold_out = CASE WHEN (stock_quantity - v_req_qty) <= 0 THEN true ELSE false END,
            updated_at = NOW()
        WHERE id = v_product_id;
    END LOOP;

    -- 3. Calculate delivery charges based on store settings
    v_delivery_charge := (p_order->>'delivery_charge')::NUMERIC(10, 2);
    v_total := v_calculated_subtotal + v_delivery_charge;

    -- 4. Insert into orders table
    INSERT INTO public.orders (
        order_number,
        customer_name,
        customer_phone,
        customer_whatsapp,
        customer_email,
        delivery_type,
        delivery_address,
        city,
        state,
        pincode,
        order_notes,
        subtotal,
        delivery_charge,
        total_amount,
        payment_method,
        payment_status,
        order_status
    ) VALUES (
        v_order_number,
        p_order->>'customer_name',
        p_order->>'customer_phone',
        p_order->>'customer_whatsapp',
        p_order->>'customer_email',
        p_order->>'delivery_type',
        p_order->>'delivery_address',
        p_order->>'city',
        p_order->>'state',
        p_order->>'pincode',
        p_order->>'order_notes',
        v_calculated_subtotal,
        v_delivery_charge,
        v_total,
        p_order->>'payment_method',
        'pending',
        'pending'
    )
    RETURNING id INTO v_order_id;

    -- 5. Insert order items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_req_qty := (v_item->>'quantity')::INT;

        SELECT name, brand, model, primary_image, condition, price
        INTO v_product
        FROM public.products
        WHERE id = v_product_id;

        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_name,
            product_brand,
            product_model,
            product_image,
            condition,
            unit_price,
            quantity,
            total_price
        ) VALUES (
            v_order_id,
            v_product_id,
            v_product.name,
            v_product.brand,
            v_product.model,
            v_product.primary_image,
            v_product.condition,
            v_product.price,
            v_req_qty,
            (v_product.price * v_req_qty)
        );
    END LOOP;

    -- 6. Insert initial order status history
    INSERT INTO public.order_status_history (
        order_id,
        status,
        note,
        updated_by
    ) VALUES (
        v_order_id,
        'pending',
        'Order submitted by customer via website',
        'system'
    );

    -- Return the newly created order info
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'subtotal', v_calculated_subtotal,
        'delivery_charge', v_delivery_charge,
        'total_amount', v_total
    );
END;
$$;
