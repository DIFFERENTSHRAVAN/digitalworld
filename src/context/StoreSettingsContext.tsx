import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings } from '../types';
import { getStoreSettings, updateStoreSettings as updateApiSettings, initialStoreSettings } from '../services/api';

interface StoreSettingsContextType {
  settings: StoreSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<StoreSettings>;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(initialStoreSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const data = await getStoreSettings();
      setSettings(data);
    } catch {
      // keep default on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<StoreSettings>): Promise<StoreSettings> => {
    const updated = await updateApiSettings(newSettings);
    setSettings(updated);
    return updated;
  };

  return (
    <StoreSettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings }}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = (): StoreSettingsContextType => {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
  }
  return context;
};
