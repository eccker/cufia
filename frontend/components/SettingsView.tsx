import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Database, Store, Save, AlertCircle, HelpCircle, ChevronDown, ChevronUp, Server } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, isConfigured } = useSettings();
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [showMongoHelp, setShowMongoHelp] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración del Sistema</h2>
        
        {!isConfigured && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="text-yellow-500 mr-2" />
              <p className="text-yellow-700 font-medium">Configuración Requerida</p>
            </div>
            <p className="text-yellow-600 text-sm mt-1">
              Para que RestoPilot funcione, debes iniciar el servidor Node.js y configurar tus credenciales.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Backend Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Server className="w-6 h-6 text-indigo-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">Servidor Backend (Node.js)</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              La aplicación web se comunica con este servidor local para conectarse de forma segura a MongoDB y Loyverse.
              Asegúrate de haber ejecutado <code>npm start</code> en la carpeta <code>server/</code>.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL del Backend</label>
              <input
                type="url"
                name="backendUrl"
                value={formData.backendUrl}
                onChange={handleChange}
                placeholder="http://localhost:3001"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* MongoDB Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Database className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-800">Conexión MongoDB Atlas</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowMongoHelp(!showMongoHelp)}
                className="text-sm text-green-600 hover:text-green-800 flex items-center"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                ¿Dónde encuentro esto?
                {showMongoHelp ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </button>
            </div>

            {showMongoHelp && (
              <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-100 text-sm text-green-800">
                <h4 className="font-bold mb-2">Pasos según tu panel de MongoDB Atlas:</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>En el menú izquierdo, bajo la sección <strong>DATABASE</strong>, haz clic en <strong>Clusters</strong>.</li>
                  <li>Haz clic en el botón <strong>Connect</strong> junto a tu clúster.</li>
                  <li>Selecciona <strong>Drivers</strong> (o "Connect your application").</li>
                  <li>Copia la <strong>Connection String</strong> (se ve como <code>mongodb+srv://usuario:password@cluster0...</code>).</li>
                  <li>Pégala abajo y asegúrate de reemplazar <code>&lt;password&gt;</code> con tu contraseña real.</li>
                </ol>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Connection String (URI)</label>
                <input
                  type="text"
                  name="mongoUri"
                  value={formData.mongoUri}
                  onChange={handleChange}
                  placeholder="mongodb+srv://usuario:password@cluster0.xyz.mongodb.net/"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Base de Datos</label>
                <input
                  type="text"
                  name="mongoDatabase"
                  value={formData.mongoDatabase}
                  onChange={handleChange}
                  placeholder="restopilot"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Loyverse Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Store className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">Integración Loyverse POS</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Conecta tu cuenta de Loyverse para sincronizar las ventas automáticamente y descontar el inventario.
              Puedes obtener tu token en el <a href="https://r.loyverse.com/dashboard/#/settings/tokens" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">Backoffice de Loyverse (Tokens de Acceso)</a>.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Token (Bearer)</label>
              <input
                type="password"
                name="loyverseToken"
                value={formData.loyverseToken}
                onChange={handleChange}
                placeholder="Ingresa tu token de acceso de Loyverse"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center bg-[#075e54] text-white px-6 py-2 rounded-lg hover:bg-[#128c7e] transition-colors"
            >
              <Save className="w-5 h-5 mr-2" />
              Guardar Configuración
            </button>
          </div>
          
          {saved && (
            <p className="text-green-600 text-right text-sm mt-2">¡Configuración guardada exitosamente!</p>
          )}
        </form>
      </div>
    </div>
  );
};
