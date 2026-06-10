import { AppSettings } from '../types';

export const mongoApi = async (
  action: 'findOne' | 'find' | 'insertOne' | 'insertMany' | 'updateOne' | 'updateMany' | 'deleteOne' | 'deleteMany',
  collection: string,
  settings: AppSettings,
  payload: any = {}
) => {
  if (!settings.backendUrl) {
    throw new Error("URL del Backend no configurada.");
  }
  if (!settings.mongoUri || !settings.mongoDatabase) {
    throw new Error("MongoDB URI no configurada.");
  }

  try {
    const response = await fetch(`${settings.backendUrl}/api/mongo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        collection,
        uri: settings.mongoUri,
        database: settings.mongoDatabase,
        payload
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Error de Base de Datos: ${errorData.error || response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      throw new Error("No se pudo conectar al servidor Backend. Asegúrate de que Node.js esté corriendo en el puerto 3001.");
    }
    throw error;
  }
};
