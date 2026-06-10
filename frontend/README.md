# RestoPilot AI - Sistema Unificado (SaaS Multi-inquilino)

RestoPilot es un Co-Piloto Operativo y CFO para restaurantes. Esta versión implementa una arquitectura completa de producción: un servidor Node.js que sirve la aplicación web (React), maneja la autenticación segura de múltiples usuarios (multi-tenant) y utiliza el **Servidor MCP oficial de MongoDB** para que la Inteligencia Artificial interactúe con la base de datos de forma segura.

## Arquitectura del Sistema

1. **Frontend (React + Tailwind):** Interfaz de usuario servida estáticamente por Node.js. Utiliza JWT para mantener la sesión del usuario.
2. **Backend (Node.js + Express):** 
   - **Autenticación (`server/auth.js`):** Maneja el registro y login de usuarios usando `bcrypt` y `jsonwebtoken`.
   - **Agente IA & MCP (`server/agent.js`):** Inicializa el cliente MCP (`@modelcontextprotocol/sdk`) que levanta el servidor oficial de MongoDB MCP. Traduce las intenciones de Gemini en llamadas a herramientas MCP, inyectando siempre el `userId` para garantizar que un restaurante no pueda ver los datos de otro.
   - **Loyverse (`server/loyverse.js`):** Actúa como proxy para evitar problemas de CORS al sincronizar ventas.
3. **Base de Datos (MongoDB Atlas):** Almacena usuarios, inventario, recetas y transacciones.

## Requisitos Previos

- [Node.js](https://nodejs.org/) (v18 o superior)
- Una cuenta en [MongoDB Atlas](https://cloud.mongodb.com/)
- Una API Key de [Google Gemini](https://aistudio.google.com/)
- (Opcional) Un Token de acceso de [Loyverse](https://r.loyverse.com/dashboard/#/settings/tokens)

## Configuración Paso a Paso

### 1. Configurar MongoDB Atlas
1. Crea un clúster gratuito en MongoDB Atlas.
2. Ve a **Database Access** y crea un usuario (ej. `restopilot_user`) con una contraseña segura.
3. Ve a **Network Access** y permite el acceso desde cualquier lugar (`0.0.0.0/0`) o tu IP específica.
4. Ve a **Clusters**, haz clic en **Connect** -> **Drivers** y copia tu *Connection String*.
   - Debería verse así: `mongodb+srv://restopilot_user:<password>@cluster0.xyz.mongodb.net/?retryWrites=true&w=majority`

### 2. Configurar Variables de Entorno
Crea un archivo llamado `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Puerto del servidor
PORT=3000

# Conexión a MongoDB (Reemplaza con tu Connection String real)
MONGO_URI=mongodb+srv://usuario:password@tu-cluster.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=restopilot

# Clave secreta para firmar los tokens JWT (Inventa una cadena larga y segura)
JWT_SECRET=mi_clave_secreta_super_segura_12345

# API Key de Google Gemini
API_KEY=tu_api_key_de_gemini
```

### 3. Instalación y Ejecución

1. Instala todas las dependencias del servidor:
   ```bash
   npm install
   ```

2. Inicia el servidor:
   ```bash
   npm start
   ```

3. Abre tu navegador y visita:
   ```
   http://localhost:3000
   ```

### 4. Uso del Sistema
1. Al entrar, verás la pantalla de **Login/Registro**.
2. Crea una cuenta nueva para tu restaurante.
3. Una vez dentro, ve a **Configuración** si deseas agregar tu token de Loyverse.
4. Ve a la pestaña **Co-Piloto** y comienza a chatear. Ejemplo: *"Compré 10 kg de tomate por $200"*. El agente usará el servidor MCP para guardar esto en tu base de datos de forma segura.
