# 🚀 Portfolio Blog & Comments MCP Server

Este servidor MCP (Model Context Protocol) permite moderar los comentarios del blog y publicar nuevos artículos de manera automática desde tu asistente de IA (Claude Desktop, Cursor, Antigravity, etc.).

---

## 📋 Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. En el Editor SQL de Supabase, ejecuta el script ubicado en:
   [`supabase/schema.sql`](../supabase/schema.sql)
3. Obtén las llaves de tu proyecto en **Project Settings -> API**:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Llave secreta para el MCP)

4. Copia el archivo `.env.example` a `.env` y completa tus credenciales:
   ```bash
   cp .env.example .env
   ```

---

## 🛠️ Herramientas disponibles en el MCP

| Herramienta | Descripción |
| :--- | :--- |
| `list_pending_comments` | Obtiene los comentarios enviados por visitantes en espera de aprobación. |
| `approve_comment` | Aprueba un comentario por ID para publicarlo en el blog. |
| `reject_comment` | Rechaza/elimina un comentario spam o inapropiado. |
| `list_all_comments` | Lista todos los comentarios con opción de filtrado. |
| `publish_blog_post` | Publica o actualiza un artículo en la base de datos Supabase. |
| `list_blog_posts` | Muestra la lista de artículos del blog. |

---

## ⚙️ Cómo conectar este MCP a Claude Desktop / Cursor / Antigravity

Añade lo siguiente a tu archivo de configuración de cliente MCP (`claude_desktop_config.json` o similar):

```json
{
  "mcpServers": {
    "portfolio-blog": {
      "command": "node",
      "args": [
        "e:/Teji/Portafolio_jill/portafolio/mcp-server/index.mjs"
      ],
      "env": {
        "PUBLIC_SUPABASE_URL": "https://tu-proyecto.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "tu-service-role-key-aqui"
      }
    }
  }
}
```

---

## 💻 Probar el servidor en terminal

Para verificar que el MCP arranca correctamente:
```bash
npm run mcp
```
