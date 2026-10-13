import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { StoreSettingsProvider } from './context/StoreSettingsContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { LocalModeNotice } from './components/common/LocalModeNotice';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderLookupPage } from './pages/OrderLookupPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Customer storefront layout wrapper
const StorefrontLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-charcoal">
      <LocalModeNotice />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloatingButton />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <StoreSettingsProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Customer Facing Storefront */}
              <Route element={<StorefrontLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/category/:categorySlug" element={<ProductsPage />} />
                <Route path="/product/:idOrSlug" element={<ProductDetailPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
                <Route path="/order-lookup" element={<OrderLookupPage />} />
                <Route path="/policies" element={<PoliciesPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Shop Owner Admin Dashboard & Login */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Routes>
          </Router>
        </CartProvider>
      </StoreSettingsProvider>
    </LanguageProvider>
  );
};

export default App;
