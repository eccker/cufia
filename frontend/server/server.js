import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

import authRoutes from './auth.js';
import { initMCP, chatRoute, getDataRoute } from './agent.js';
import { loyverseSyncRoute } from './loyverse.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Conexión a MongoDB (Para Auth y consultas directas rápidas)
// Nota: El agente IA usará el servidor MCP, pero el backend necesita conexión directa para el Login/Registro.
export const mongoClient = new MongoClient(process.env.MONGO_URI);
export const dbName = process.env.MONGO_DB_NAME || 'restopilot';

async function startServer() {
  try {
    await mongoClient.connect();
    console.log('✅ Conectado a MongoDB Atlas (Driver Directo)');

    // Inicializar el servidor MCP de MongoDB para el Agente IA
    await initMCP();

    // Rutas de API
    app.use('/api/auth', authRoutes);
    app.post('/api/chat', chatRoute);
    app.get('/api/data', getDataRoute);
    app.post('/api/loyverse/sync', loyverseSyncRoute);

    // Servir archivos estáticos del frontend (React)
    // En este MVP, servimos la raíz del proyecto donde están index.html y los .tsx
    const rootDir = path.join(__dirname, '..');
    app.use(express.static(rootDir));

    // Fallback para SPA routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(rootDir, 'index.html'));
    });

    app.listen(PORT, () => {
      console.log(`🚀 Servidor RestoPilot corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
}

startServer();
