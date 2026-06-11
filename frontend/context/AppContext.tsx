import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppContextType, Ingredient, Recipe, Transaction, ChatMessage } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '¡Hola! Soy RestoPilot, tu CFO y Co-Piloto. Estoy listo para ayudarte. Puedes empezar subiendo una foto de tu última compra, dictándome una receta, o contándome qué vendiste hoy.',
      timestamp: new Date().toISOString()
    }
  ]);

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString()
    }]);
  }, []);

  const updateInventory = useCallback((items: { name: string; quantity: number; unit: string; totalCost: number }[]) => {
    setInventory(prev => {
      const newInventory = [...prev];
      items.forEach(newItem => {
        const existingIndex = newInventory.findIndex(i => i.name.toLowerCase() === newItem.name.toLowerCase());
        const unitCost = newItem.totalCost / newItem.quantity;
        
        if (existingIndex >= 0) {
          // Weighted average cost
          const existing = newInventory[existingIndex];
          const totalValue = (existing.quantity * existing.unitCost) + newItem.totalCost;
          const newQuantity = existing.quantity + newItem.quantity;
          
          newInventory[existingIndex] = {
            ...existing,
            quantity: newQuantity,
            unitCost: totalValue / newQuantity,
            lastUpdated: new Date().toISOString()
          };
        } else {
          newInventory.push({
            id: Math.random().toString(36).substring(7),
            name: newItem.name,
            quantity: newItem.quantity,
            unit: newItem.unit,
            unitCost: unitCost,
            lastUpdated: new Date().toISOString()
          });
        }
      });
      return newInventory;
    });

    // Record purchase transaction
    const totalPurchaseCost = items.reduce((sum, item) => sum + item.totalCost, 0);
    setTransactions(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
      type: 'purchase',
      amount: totalPurchaseCost,
      description: 'Compra de insumos',
      items: items
    }]);
  }, []);

  const addRecipe = useCallback((recipe: Omit<Recipe, 'id'>) => {
    setRecipes(prev => [...prev, { ...recipe, id: Math.random().toString(36).substring(7) }]);
  }, []);

  const logWaste = useCallback((itemName: string, quantity: number, unit: string, reason: string) => {
    setInventory(prev => {
      const newInventory = [...prev];
      const itemIndex = newInventory.findIndex(i => i.name.toLowerCase() === itemName.toLowerCase());
      
      let costLost = 0;
      if (itemIndex >= 0) {
        const item = newInventory[itemIndex];
        // Simple unit conversion logic could go here, assuming same units for MVP
        const actualQtyToDeduct = quantity; 
        costLost = actualQtyToDeduct * item.unitCost;
        
        newInventory[itemIndex] = {
          ...item,
          quantity: Math.max(0, item.quantity - actualQtyToDeduct),
          lastUpdated: new Date().toISOString()
        };
      }

      // Record waste transaction
      setTransactions(tPrev => [...tPrev, {
        id: Math.random().toString(36).substring(7),
        date: new Date().toISOString(),
        type: 'waste',
        amount: costLost,
        description: `Merma: ${reason}`,
        items: [{ name: itemName, quantity, unit, cost: costLost }]
      }]);

      return newInventory;
    });
  }, []);

  const recordSale = useCallback((recipeName: string, quantity: number, totalRevenue: number) => {
    // 1. Find recipe
    const recipe = recipes.find(r => r.name.toLowerCase() === recipeName.toLowerCase());
    
    if (recipe) {
      // 2. Deduct ingredients from inventory
      setInventory(prev => {
        const newInventory = [...prev];
        recipe.ingredients.forEach(reqIng => {
          const invIndex = newInventory.findIndex(i => i.name.toLowerCase() === reqIng.name.toLowerCase());
          if (invIndex >= 0) {
            const totalNeeded = reqIng.quantity * quantity * (1 + (recipe.estimatedWastePercent / 100));
            newInventory[invIndex].quantity = Math.max(0, newInventory[invIndex].quantity - totalNeeded);
          }
        });
        return newInventory;
      });
    }

    // 3. Record sale transaction
    setTransactions(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
      type: 'sale',
      amount: totalRevenue,
      description: `Venta: ${quantity}x ${recipeName}`,
      items: [{ name: recipeName, quantity, unit: 'porción' }]
    }]);
  }, [recipes]);

  const exportData = useCallback(() => {
    const data = {
      inventory,
      recipes,
      transactions
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restopilot_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [inventory, recipes, transactions]);

  return (
    <AppContext.Provider value={{
      inventory, recipes, transactions, messages,
      addMessage, updateInventory, addRecipe, logWaste, recordSale, exportData
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
