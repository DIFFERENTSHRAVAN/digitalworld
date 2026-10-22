-- ====================================================================
-- FINAL VAPT OPTIMIZATION: ZERO PERMISSIVE POLICY OVERLAP
-- Separates role 'anon' and role 'authenticated' strictly
-- Eliminates all "Multiple Permissive Policies" warnings in Supabase
-- ====================================================================

-- 1. DROP ALL EXISTING POLICIES DYNAMICALLY
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('products', 'categories', 'store_settings', 'orders', 'order_items', 'order_status_history', 'admin_profiles')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 2. PRODUCTS (Strict 1-per-role separation)
CREATE POLICY "products_anon_select"
    ON public.products FOR SELECT
    TO anon
    USING (is_published = true);

CREATE POLICY "products_auth_all"
    ON public.products FOR ALL
    TO authenticated
    USING ((SELECT auth.role()) = 'authenticated')
    WITH CHECK ((SELECT auth.role()) = 'authenticated');

-- 3. CATEGORIES (Strict 1-per-role separation)
CREATE POLICY "categories_anon_select"
    ON public.categories FOR SELECT
    TO anon
    USING (is_active = true);

CREATE POLICY "categories_auth_all"
    ON public.categories FOR ALL
    TO authenticated
    USING ((SELECT auth.role()) = 'authenticated')
    WITH CHECK ((SELECT auth.role()) = 'authenticated');

-- 4. STORE SETTINGS (Strict 1-per-role separation)
CREATE POLICY "store_settings_anon_select"
    ON public.store_settings FOR SELECT
    TO anon
    USING (id IS NOT NULL);

CREATE POLICY "store_settings_auth_all"
    ON public.store_settings FOR ALL
    TO authenticated
    USING ((SELECT auth.role()) = 'authenticated')
    WITH CHECK ((SELECT auth.role()) = 'authenticated');

-- 5. ORDERS (Strict 1-per-role separation)
CREATE POLICY "orders_anon_insert"
    ON public.orders FOR INSERT
    TO anon
    WITH CHECK (total_amount >= 0 AND customer_name IS NOT NULL AND customer_phone IS NOT NULL);

CREATE POLICY "orders_auth_all"
    ON public.orders FOR ALL
    TO authenticated
    USING ((SELECT auth.role()) = 'authenticated')
    WITH CHECK ((SELECT auth.role()) = 'authenticated');

-- 6. ORDER ITEMS (Strict 1-per-role separation)
CREATE POLICY "order_items_anon_insert"
    ON public.order_items FOR INSERT
    TO anon
    WITH CHECK (quantity > 0 AND unit_price >= 0);

CREATE POLICY "order_items_auth_all"
    ON public.order_items FOR ALL
    TO authenticated
    USING ((SELECT auth.role()) = 'authenticated')
    WITH CHECK ((SELECT auth.role()) = 'authenticated');

-- 7. ORDER STATUS HISTORY (Strict 1-per-role separation)
CREATE POLICY "order_status_history_anon_insert"
    ON public.order_status_history FOR INSERT
    TO anon
    WITH CHECK (order_id IS NOT NULL);

CREATE POLICY "order_status_history_auth_all"
    ON public.order_status_history FOR ALL
    TO authenticated
    USING ((SELECT auth.role()) = 'authenticated')
    WITH CHECK ((SELECT auth.role()) = 'authenticated');

-- 8. ADMIN PROFILES
CREATE POLICY "admin_profiles_auth_all"
    ON public.admin_profiles FOR ALL
    TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);
