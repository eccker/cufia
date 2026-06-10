export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  lastUpdated: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  estimatedWastePercent: number;
  instructions?: string;
}

export type TransactionType = 'purchase' | 'sale' | 'waste';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number; // Cost for purchase/waste, Revenue for sale
  description: string;
  items?: { name: string; quantity: number; unit: string; cost?: number }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
  imageUrl?: string;
}

export interface AppSettings {
  backendUrl: string;
  mongoUri: string;
  mongoDatabase: string;
  loyverseToken: string;
}

export interface AppState {
  inventory: Ingredient[];
  recipes: Recipe[];
  transactions: Transaction[];
  messages: ChatMessage[];
  isLoading: boolean;
}

export interface AppContextType extends AppState {
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateInventory: (items: { name: string; quantity: number; unit: string; totalCost: number }[]) => Promise<void>;
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Promise<void>;
  logWaste: (itemName: string, quantity: number, unit: string, reason: string) => Promise<void>;
  recordSale: (recipeName: string, quantity: number, totalRevenue: number) => Promise<void>;
  syncLoyverse: () => Promise<string>;
  exportData: () => void;
}

export interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isConfigured: boolean;
}
