import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- MONGODB PROXY ENDPOINT ---
app.post('/api/mongo', async (req, res) => {
  const { action, collection, uri, database, payload } = req.body;

  if (!uri || !database || !collection || !action) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos (uri, database, collection, action)' });
  }

  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(database);
    const coll = db.collection(collection);

    let result;
    switch (action) {
      case 'find':
        let cursor = coll.find(payload.filter || {});
        if (payload.sort) cursor = cursor.sort(payload.sort);
        if (payload.limit) cursor = cursor.limit(payload.limit);
        result = { documents: await cursor.toArray() };
        break;
      case 'insertOne':
        result = await coll.insertOne(payload.document);
        break;
      case 'insertMany':
        result = await coll.insertMany(payload.documents);
        break;
      case 'updateOne':
        result = await coll.updateOne(payload.filter, payload.update);
        break;
      case 'deleteOne':
        result = await coll.deleteOne(payload.filter);
        break;
      default:
        return res.status(400).json({ error: `Acción '${action}' no soportada` });
    }
    
    res.json(result);
  } catch (error) {
    console.error('[MongoDB Error]', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

// --- LOYVERSE PROXY ENDPOINT ---
// Resuelve el problema de CORS del navegador al hacer la petición desde el servidor
app.get('/api/loyverse/receipts', async (req, res) => {
  const token = req.headers.authorization;
  const limit = req.query.limit || 50;

  if (!token) {
    return res.status(401).json({ error: 'Token de Loyverse no proporcionado' });
  }

  try {
    const response = await fetch(`https://api.loyverse.com/v1.0/receipts?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Loyverse API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('[Loyverse Error]', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor RestoPilot Backend corriendo en http://localhost:${PORT}`);
  console.log(`➡️  Endpoint MongoDB: http://localhost:${PORT}/api/mongo`);
  console.log(`➡️  Endpoint Loyverse: http://localhost:${PORT}/api/loyverse/receipts`);
});
