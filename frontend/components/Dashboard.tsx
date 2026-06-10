import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { transactions, inventory, recipes, syncLoyverse } = useAppContext();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    try {
      const result = await syncLoyverse();
      setSyncMessage(result);
    } catch (error: any) {
      setSyncMessage(error.message || 'Error al sincronizar');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  const metrics = useMemo(() => {
    let totalSales = 0;
    let totalPurchases = 0;
    let totalWaste = 0;

    transactions.forEach(t => {
      if (t.type === 'sale') totalSales += t.amount;
      if (t.type === 'purchase') totalPurchases += t.amount;
      if (t.type === 'waste') totalWaste += t.amount;
    });

    let estimatedCOGS = 0;
    transactions.filter(t => t.type === 'sale').forEach(sale => {
      const recipeName = sale.items?.[0]?.name;
      const qty = sale.items?.[0]?.quantity || 0;
      const recipe = recipes.find(r => r.name === recipeName);
      
      if (recipe) {
        let recipeCost = 0;
        recipe.ingredients.forEach(ing => {
          const invItem = inventory.find(i => i.name === ing.name);
          if (invItem) {
            recipeCost += ing.quantity * invItem.unitCost * (1 + (recipe.estimatedWastePercent / 100));
          }
        });
        estimatedCOGS += recipeCost * qty;
      }
    });

    const grossProfit = totalSales - estimatedCOGS;
    const netProfit = grossProfit - totalWaste;
    const margin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    return { totalSales, totalPurchases, totalWaste, estimatedCOGS, grossProfit, netProfit, margin };
  }, [transactions, inventory, recipes]);

  const chartData = useMemo(() => {
    const dailyData: Record<string, { date: string, ventas: number, compras: number, mermas: number }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = { date, ventas: 0, compras: 0, mermas: 0 };
      }
      if (t.type === 'sale') dailyData[date].ventas += t.amount;
      if (t.type === 'purchase') dailyData[date].compras += t.amount;
      if (t.type === 'waste') dailyData[date].mermas += t.amount;
    });

    return Object.values(dailyData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Financiero</h2>
        
        <div className="flex items-center space-x-3">
          {syncMessage && <span className="text-sm text-green-600 font-medium">{syncMessage}</span>}
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar Loyverse
          </button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Ventas Brutas</h3>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">${metrics.totalSales.toFixed(2)}</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Costo Insumos (COGS)</h3>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">${metrics.estimatedCOGS.toFixed(2)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Mermas Registradas</h3>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">${metrics.totalWaste.toFixed(2)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Margen Neto</h3>
            <TrendingUp className={`w-5 h-5 ${metrics.margin >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-2xl font-bold ${metrics.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.margin.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Flujo Diario</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="ventas" fill="#10b981" name="Ventas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="compras" fill="#3b82f6" name="Compras" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Tendencia de Mermas</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mermas" stroke="#f97316" strokeWidth={2} name="Mermas ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Alerts Section */}
      {metrics.margin < 15 && metrics.totalSales > 0 && (
        <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2" />
            <p className="text-red-700 font-medium">Alerta de Rentabilidad</p>
          </div>
          <p className="text-red-600 text-sm mt-1">Tu margen neto está por debajo del 15%. Revisa tus costos de insumos o ajusta los precios de venta.</p>
        </div>
      )}
    </div>
  );
};
