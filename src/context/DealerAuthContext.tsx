import React, { createContext, useContext, useState, useEffect } from 'react';
import { DealerUser, DealerStatus } from '../types';
import {
  getCurrentDealer,
  dealerLogin as apiDealerLogin,
  dealerRegister as apiDealerRegister,
  dealerLogout as apiDealerLogout
} from '../services/api';

interface DealerAuthContextType {
  dealer: DealerUser | null;
  isDealerLoggedIn: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; status?: DealerStatus }>;
  register: (params: {
    business_name: string;
    contact_person: string;
    phone: string;
    email: string;
    password: string;
    gst_number?: string;
    business_type?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  }) => Promise<{ success: boolean; dealer?: DealerUser; message?: string; error?: string }>;
  logout: () => void;
  refreshDealer: () => void;
}

const DealerAuthContext = createContext<DealerAuthContextType | undefined>(undefined);

export const DealerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dealer, setDealer] = useState<DealerUser | null>(() => getCurrentDealer());

  const refreshDealer = () => {
    setDealer(getCurrentDealer());
  };

  useEffect(() => {
    refreshDealer();
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await apiDealerLogin(identifier, password);
    if (res.success && res.dealer) {
      setDealer(res.dealer);
      return { success: true };
    }
    return { success: false, error: res.error, status: res.status };
  };

  const register = async (params: {
    business_name: string;
    contact_person: string;
    phone: string;
    email: string;
    password: string;
    gst_number?: string;
    business_type?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  }) => {
    return await apiDealerRegister(params);
  };

  const logout = () => {
    apiDealerLogout();
    setDealer(null);
  };

  return (
    <DealerAuthContext.Provider
      value={{
        dealer,
        isDealerLoggedIn: !!dealer && dealer.status === 'approved',
        login,
        register,
        logout,
        refreshDealer
      }}
    >
      {children}
    </DealerAuthContext.Provider>
  );
};

export const useDealerAuth = (): DealerAuthContextType => {
  const context = useContext(DealerAuthContext);
  if (!context) {
    throw new Error('useDealerAuth must be used within a DealerAuthProvider');
  }
  return context;
};
