import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, SettingsContextType } from '../types';

const defaultSettings: AppSettings = {
  backendUrl: 'http://localhost:3001',
  mongoUri: '',
  mongoDatabase: 'restopilot',
  loyverseToken: ''
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('restopilot_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('restopilot_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const isConfigured = Boolean(
    settings.backendUrl &&
    settings.mongoUri && 
    settings.mongoDatabase
  );

  if (!isLoaded) return null;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isConfigured }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
