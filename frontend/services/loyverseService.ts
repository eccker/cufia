import { AppSettings } from '../types';

export const fetchLoyverseReceipts = async (settings: AppSettings, limit: number = 50) => {
  if (!settings.backendUrl) {
    throw new Error("URL del Backend no configurada.");
  }
  if (!settings.loyverseToken) {
    throw new Error("Loyverse Token no configurado.");
  }

  try {
    const response = await fetch(`${settings.backendUrl}/api/loyverse/receipts?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${settings.loyverseToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Error de Loyverse: ${errorData.error || response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      throw new Error("No se pudo conectar al servidor Backend. Asegúrate de que Node.js esté corriendo en el puerto 3001.");
    }
    throw error;
  }
};
