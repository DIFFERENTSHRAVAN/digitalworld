import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { StoreSettingsProvider } from './context/StoreSettingsContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { DealerAuthProvider } from './context/DealerAuthContext';
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
import { ContactPage } from './pages/ContactPage';
import { CustomerAuthPage } from './pages/customer/CustomerAuthPage';
import { CustomerAccountPage } from './pages/customer/CustomerAccountPage';
import { DealerLoginPage } from './pages/dealer/DealerLoginPage';
import { DealerRegisterPage } from './pages/dealer/DealerRegisterPage';
import { DealerPortalPage } from './pages/dealer/DealerPortalPage';
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
        <CustomerAuthProvider>
          <DealerAuthProvider>
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
                    <Route path="/contact" element={<ContactPage />} />

                    {/* Customer Account & Authentication */}
                    <Route path="/customer/login" element={<CustomerAuthPage />} />
                    <Route path="/customer/register" element={<CustomerAuthPage />} />
                    <Route path="/account" element={<CustomerAccountPage />} />
                    <Route path="/customer/account" element={<CustomerAccountPage />} />

                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* Authorized Dealer & B2B Wholesale Portal */}
                  <Route path="/dealer/login" element={<DealerLoginPage />} />
                  <Route path="/dealer/register" element={<DealerRegisterPage />} />
                  <Route path="/dealer/dashboard" element={<DealerPortalPage />} />
                  <Route path="/dealer/portal" element={<DealerPortalPage />} />
                  <Route path="/dealer" element={<DealerPortalPage />} />

                  {/* Shop Owner Admin Dashboard & Login */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                </Routes>
              </Router>
            </CartProvider>
          </DealerAuthProvider>
        </CustomerAuthProvider>
      </StoreSettingsProvider>
    </LanguageProvider>
  );
};

export default App;
