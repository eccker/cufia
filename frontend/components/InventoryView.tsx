import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Package, BookOpen } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { inventory, recipes } = useAppContext();

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Package className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Inventario Actual</h2>
        </div>
        
        {inventory.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-gray-500">El inventario está vacío. Sube un ticket de compra en el chat para empezar.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artículo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Unitario Promedio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity.toFixed(2)} {item.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.unitCost.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(item.quantity * item.unitCost).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center mb-4">
          <BookOpen className="w-6 h-6 text-purple-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Recetario</h2>
        </div>

        {recipes.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-gray-500">No hay recetas registradas. Pídele al agente que agregue una receta.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((recipe) => {
              // Calculate dynamic cost
              let currentCost = 0;
              recipe.ingredients.forEach(ing => {
                const invItem = inventory.find(i => i.name.toLowerCase() === ing.name.toLowerCase());
                if (invItem) {
                  currentCost += ing.quantity * invItem.unitCost;
                }
              });
              const costWithWaste = currentCost * (1 + (recipe.estimatedWastePercent / 100));

              return (
                <div key={recipe.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{recipe.name}</h3>
                  <div className="mb-3">
                    <span className="text-sm text-gray-500">Costo de Producción Estimado: </span>
                    <span className="text-lg font-semibold text-green-600">${costWithWaste.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 ml-1">(inc. {recipe.estimatedWastePercent}% merma)</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Ingredientes:</h4>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing.quantity} {ing.unit} de {ing.name}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
