import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
  imageUrl?: string;
}

interface AppContextType {
  inventory: any[];
  recipes: any[];
  transactions: any[];
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (text: string, base64Image?: string, mimeType?: string) => Promise<void>;
  syncLoyverse: (token: string) => Promise<string>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '¡Hola! Soy RestoPilot, tu CFO y Co-Piloto. Estoy conectado a tu base de datos segura. ¿En qué te ayudo hoy?',
      timestamp: new Date().toISOString()
    }
  ]);

  const refreshData = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    try {
      const res = await fetch('/api/data', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory || []);
        setRecipes(data.recipes || []);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const sendMessage = useCallback(async (text: string, base64Image?: string, mimeType?: string) => {
    if (!token) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      text,
      imageUrl: base64Image ? `data:${mimeType};base64,${base64Image}` : undefined,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text, imageBase64: base64Image, mimeType })
      });

      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'model',
        text: data.text || 'Error procesando respuesta.',
        timestamp: new Date().toISOString()
      }]);

      // Refrescar datos por si el agente modificó la BD
      await refreshData();

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'system',
        text: 'Error de conexión con el servidor.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [token, refreshData]);

  const syncLoyverse = useCallback(async (loyverseToken: string) => {
    if (!token) throw new Error("No autenticado");
    const res = await fetch('/api/loyverse/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token: loyverseToken })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await refreshData();
    return data.message;
  }, [token, refreshData]);

  return (
    <AppContext.Provider value={{
      inventory, recipes, transactions, messages, isLoading,
      sendMessage, syncLoyverse, refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
