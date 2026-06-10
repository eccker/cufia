import React, { useState } from 'react';
import { ChatArea } from './components/ChatArea';
import { Dashboard } from './components/Dashboard';
import { InventoryView } from './components/InventoryView';
import { Login } from './components/Login';
import { MessageSquare, LayoutDashboard, PackageSearch, LogOut, User } from 'lucide-react';
import { useAuth } from './context/AuthContext';

type ViewState = 'chat' | 'dashboard' | 'inventory';

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('chat');

  return (
    <div className="flex h-screen w-full bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-20 md:w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-gray-100">
            <div className="w-8 h-8 bg-[#075e54] rounded-lg flex items-center justify-center text-white font-bold">
              RP
            </div>
            <span className="hidden md:block ml-3 font-bold text-gray-800 text-lg">RestoPilot</span>
          </div>
          
          <nav className="mt-6 flex flex-col gap-2 px-2">
            <button 
              onClick={() => setCurrentView('chat')}
              className={`flex items-center p-3 rounded-lg transition-colors ${currentView === 'chat' ? 'bg-[#e8f5e9] text-[#075e54]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <MessageSquare className="w-6 h-6 md:mr-3" />
              <span className="hidden md:block font-medium">Co-Piloto</span>
            </button>
            
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center p-3 rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-[#e8f5e9] text-[#075e54]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutDashboard className="w-6 h-6 md:mr-3" />
              <span className="hidden md:block font-medium">Finanzas</span>
            </button>

            <button 
              onClick={() => setCurrentView('inventory')}
              className={`flex items-center p-3 rounded-lg transition-colors ${currentView === 'inventory' ? 'bg-[#e8f5e9] text-[#075e54]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <PackageSearch className="w-6 h-6 md:mr-3" />
              <span className="hidden md:block font-medium">Inventario & Recetas</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center mb-4 px-2">
            <User className="w-5 h-5 text-gray-500 mr-2" />
            <div className="hidden md:block overflow-hidden">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.restaurantName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center md:justify-start p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 md:mr-2" />
            <span className="hidden md:block">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {currentView === 'chat' && <ChatArea />}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'inventory' && <InventoryView />}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppContent /> : <Login />;
};

export default App;
