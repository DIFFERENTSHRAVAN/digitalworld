import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerUser, CustomerAddress } from '../types';
import {
  getCurrentCustomer,
  customerLogin as apiCustomerLogin,
  customerRegister as apiCustomerRegister,
  customerSendOtp as apiCustomerSendOtp,
  customerVerifyOtpLogin as apiCustomerVerifyOtpLogin,
  customerLogout as apiCustomerLogout,
  updateCustomerAddress as apiUpdateCustomerAddress
} from '../services/api';

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  isLoggedIn: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (params: { name: string; phone: string; email?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (phoneOrEmail: string) => Promise<{ success: boolean; message: string; previewOtp?: string }>;
  verifyOtpLogin: (identifier: string, otp: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  saveAddress: (address: CustomerAddress) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerUser | null>(() => getCurrentCustomer());

  useEffect(() => {
    setCustomer(getCurrentCustomer());
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await apiCustomerLogin({ identifier, password });
    if (res.success && res.user) {
      setCustomer(res.user);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const register = async (params: { name: string; phone: string; email?: string; password: string }) => {
    const res = await apiCustomerRegister(params);
    if (res.success && res.user) {
      setCustomer(res.user);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const sendOtp = async (phoneOrEmail: string) => {
    return await apiCustomerSendOtp(phoneOrEmail);
  };

  const verifyOtpLogin = async (identifier: string, otp: string, name?: string) => {
    const res = await apiCustomerVerifyOtpLogin(identifier, otp, name);
    if (res.success && res.user) {
      setCustomer(res.user);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const logout = () => {
    apiCustomerLogout();
    setCustomer(null);
  };

  const saveAddress = (address: CustomerAddress) => {
    const updated = apiUpdateCustomerAddress(address);
    setCustomer(updated);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoggedIn: !!customer,
        login,
        register,
        sendOtp,
        verifyOtpLogin,
        logout,
        saveAddress
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
