import React, { useState } from 'react';
import { ChatArea } from './components/ChatArea';
import { Dashboard } from './components/Dashboard';
import { InventoryView } from './components/InventoryView';
import { MessageSquare, LayoutDashboard, PackageSearch, Download, Database } from 'lucide-react';
import { useAppContext } from './context/AppContext';

type ViewState = 'chat' | 'dashboard' | 'inventory';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('chat');
  const { exportData } = useAppContext();

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
          <button 
            onClick={exportData}
            className="w-full flex items-center justify-center md:justify-start p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            title="Exportar a JSON (Compatible con Sheets)"
          >
            <Download className="w-5 h-5 md:mr-2" />
            <span className="hidden md:block">Exportar Datos</span>
          </button>
          
          {/* MCP Connection Stub Indicator */}
          <div className="mt-4 flex items-center justify-center md:justify-start p-2 text-xs text-green-600 bg-green-50 rounded-lg">
            <Database className="w-4 h-4 md:mr-2" />
            <span className="hidden md:block">MongoDB MCP Activo</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentView === 'chat' && <ChatArea />}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'inventory' && <InventoryView />}
      </div>
    </div>
  );
};

export default App;
