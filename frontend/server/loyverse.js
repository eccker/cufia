import { authenticateToken } from './auth.js';

export const loyverseSyncRoute = [authenticateToken, async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token de Loyverse requerido.' });
  }

  try {
    const response = await fetch(`https://api.loyverse.com/v1.0/receipts?limit=50`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Loyverse API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    // Aquí iría la lógica para procesar los recibos y descontar inventario en MongoDB
    // Para el MVP, devolvemos los datos crudos al frontend o un mensaje de éxito.
    
    res.json({ success: true, message: `Sincronizados ${data.receipts?.length || 0} recibos.` });
  } catch (error) {
    console.error('[Loyverse Error]', error);
    res.status(500).json({ error: error.message });
  }
}];
