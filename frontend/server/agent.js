import { GoogleGenAI, Type } from '@google/genai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { authenticateToken } from './auth.js';
import { mongoClient, dbName } from './server.js';

let mcpClient;

// Inicializa el servidor MCP oficial de MongoDB como un proceso hijo
export async function initMCP() {
  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-mongodb', process.env.MONGO_URI]
    });
    
    mcpClient = new Client({ name: 'restopilot-backend', version: '1.0.0' }, { capabilities: { tools: {} } });
    await mcpClient.connect(transport);
    console.log("✅ Servidor MCP de MongoDB conectado y listo.");
  } catch (error) {
    console.error("❌ Error conectando al servidor MCP:", error);
  }
}

// Herramientas expuestas a Gemini. 
// Nota: No exponemos las herramientas MCP crudas directamente a Gemini para garantizar la seguridad multi-tenant.
// Exponemos herramientas específicas de negocio, y el backend usa MCP para ejecutarlas inyectando el userId.
const agentTools = [{
  functionDeclarations: [
    {
      name: 'add_inventory',
      description: 'Agrega o actualiza artículos en el inventario tras una compra.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                totalCost: { type: Type.NUMBER }
              },
              required: ['name', 'quantity', 'unit', 'totalCost']
            }
          }
        },
        required: ['items']
      }
    },
    {
      name: 'log_waste',
      description: 'Registra una merma o pérdida de inventario.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          itemName: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unit: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ['itemName', 'quantity', 'unit', 'reason']
      }
    }
  ]
}];

const SYSTEM_INSTRUCTION = `
Eres RestoPilot, el Co-Piloto Operativo y CFO de un restaurante.
Ayudas al dueño a gestionar inventario, compras y mermas.
Usa las herramientas proporcionadas para guardar la información en la base de datos.
Sé conciso, amigable y habla en español.
`;

// Ruta para manejar el chat
export const chatRoute = [authenticateToken, async (req, res) => {
  const { message, imageBase64, mimeType } = req.body;
  const userId = req.user.userId;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: agentTools,
        temperature: 0.2,
      }
    });

    // Construir el mensaje
    const contentParts = [{ text: message }];
    if (imageBase64 && mimeType) {
      contentParts.push({ inlineData: { data: imageBase64, mimeType } });
    }

    let response = await chat.sendMessage({ message: contentParts });

    // Manejar llamadas a herramientas
    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const call of response.functionCalls) {
        let result = "Success";
        
        try {
          if (call.name === 'add_inventory') {
            // Usar MCP para insertar en MongoDB, inyectando el userId
            for (const item of call.args.items) {
              const unitCost = item.totalCost / item.quantity;
              
              // Llamada al servidor MCP oficial de MongoDB
              await mcpClient.callTool({
                name: "insert_one",
                arguments: {
                  database: dbName,
                  collection: "inventory",
                  document: {
                    userId: userId, // ¡SEGURIDAD MULTI-TENANT!
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    unitCost: unitCost,
                    lastUpdated: new Date().toISOString()
                  }
                }
              });
            }
            
            // Registrar la transacción de compra vía MCP
            await mcpClient.callTool({
              name: "insert_one",
              arguments: {
                database: dbName,
                collection: "transactions",
                document: {
                  userId: userId,
                  date: new Date().toISOString(),
                  type: 'purchase',
                  amount: call.args.items.reduce((sum, i) => sum + i.totalCost, 0),
                  description: 'Compra de insumos',
                  items: call.args.items
                }
              }
            });

          } else if (call.name === 'log_waste') {
            await mcpClient.callTool({
              name: "insert_one",
              arguments: {
                database: dbName,
                collection: "transactions",
                document: {
                  userId: userId,
                  date: new Date().toISOString(),
                  type: 'waste',
                  amount: 0, // Simplificado para el MVP
                  description: `Merma: ${call.args.reason}`,
                  items: [{ name: call.args.itemName, quantity: call.args.quantity, unit: call.args.unit }]
                }
              }
            });
          }
        } catch (e) {
          console.error("Error ejecutando herramienta MCP:", e);
          result = `Error: ${e.message}`;
        }

        // Devolver resultado a Gemini
        response = await chat.sendMessage({
          message: [{
            functionResponse: { name: call.name, response: { result } }
          }]
        });
      }
    }

    res.json({ text: response.text });

  } catch (error) {
    console.error('Error en chat:', error);
    res.status(500).json({ error: 'Error procesando el mensaje.' });
  }
}];

// Ruta para obtener datos iniciales del Dashboard (Usando driver directo por velocidad)
export const getDataRoute = [authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const db = mongoClient.db(dbName);
    const inventory = await db.collection('inventory').find({ userId }).toArray();
    const recipes = await db.collection('recipes').find({ userId }).toArray();
    const transactions = await db.collection('transactions').find({ userId }).sort({ date: -1 }).limit(100).toArray();
    
    res.json({ inventory, recipes, transactions });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo datos.' });
  }
}];
