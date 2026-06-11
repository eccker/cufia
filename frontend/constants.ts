import { Type, FunctionDeclaration } from '@google/genai';

export const SYSTEM_INSTRUCTION = `
Eres RestoPilot, el Co-Piloto Operativo y CFO de un pequeño restaurante.
Tu objetivo es ayudar al dueño a gestionar su negocio de forma automatizada e intuitiva, como si estuvieran chateando por WhatsApp.

Tus responsabilidades principales:
1. **Ingesta de Compras (Inventario):** Si el usuario sube una foto de un ticket o te dice qué compró, extrae los artículos, cantidades, unidades y costos totales. Usa la herramienta 'update_inventory'. Si falta el costo, pregúntale amablemente.
2. **Gestión de Recetas:** Si el usuario te da una receta, extrae los ingredientes y proporciones. Infiere mermas lógicas (ej. limpiar vegetales pierde peso). Usa la herramienta 'add_recipe'.
3. **Registro de Mermas:** Si el usuario reporta que algo se echó a perder, se quemó o se tiró, usa la herramienta 'log_waste'.
4. **Ventas (Simulación Loyverse):** Si el usuario reporta ventas, usa 'record_sale'.
5. **Asesoría Financiera:** Responde preguntas sobre márgenes, costos de recetas (calculados en base al inventario actual) y punto de equilibrio. Sé claro y evita tecnicismos complejos.

Reglas de interacción:
- Sé conciso, amigable y profesional.
- Habla siempre en español.
- Cuando uses una herramienta, confirma al usuario lo que hiciste de forma natural (ej. "¡Listo! He agregado 10kg de tomate al inventario.").
- Si hay ambigüedad, haz una pregunta corta para aclarar antes de usar una herramienta.
- Asume que las fotos subidas son tickets de compra o facturas a menos que el usuario indique lo contrario.
`;

export const TOOLS: FunctionDeclaration[] = [
  {
    name: 'update_inventory',
    description: 'Actualiza el inventario con nuevas compras. Úsalo cuando el usuario suba un ticket o dicte una compra.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          description: 'Lista de artículos comprados',
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Nombre del ingrediente o producto' },
              quantity: { type: Type.NUMBER, description: 'Cantidad comprada' },
              unit: { type: Type.STRING, description: 'Unidad de medida (kg, litros, piezas, gramos, etc.)' },
              totalCost: { type: Type.NUMBER, description: 'Costo total pagado por esta cantidad del artículo' }
            },
            required: ['name', 'quantity', 'unit', 'totalCost']
          }
        }
      },
      required: ['items']
    }
  },
  {
    name: 'add_recipe',
    description: 'Agrega una nueva receta al sistema.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Nombre del platillo o receta' },
        ingredients: {
          type: Type.ARRAY,
          description: 'Ingredientes necesarios para una porción',
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Nombre del ingrediente' },
              quantity: { type: Type.NUMBER, description: 'Cantidad necesaria' },
              unit: { type: Type.STRING, description: 'Unidad de medida' }
            },
            required: ['name', 'quantity', 'unit']
          }
        },
        estimatedWastePercent: { type: Type.NUMBER, description: 'Porcentaje estimado de merma durante la preparación (0-100)' }
      },
      required: ['name', 'ingredients', 'estimatedWastePercent']
    }
  },
  {
    name: 'log_waste',
    description: 'Registra una merma o pérdida de inventario (comida echada a perder, accidentes, etc.).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        itemName: { type: Type.STRING, description: 'Nombre del artículo mermado' },
        quantity: { type: Type.NUMBER, description: 'Cantidad perdida' },
        unit: { type: Type.STRING, description: 'Unidad de medida' },
        reason: { type: Type.STRING, description: 'Razón de la merma' }
      },
      required: ['itemName', 'quantity', 'unit', 'reason']
    }
  },
  {
    name: 'record_sale',
    description: 'Registra la venta de un platillo (simulando la integración con el punto de venta).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        recipeName: { type: Type.STRING, description: 'Nombre del platillo vendido' },
        quantity: { type: Type.NUMBER, description: 'Cantidad de platillos vendidos' },
        totalRevenue: { type: Type.NUMBER, description: 'Ingreso total por esta venta' }
      },
      required: ['recipeName', 'quantity', 'totalRevenue']
    }
  }
];
