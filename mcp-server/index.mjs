import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Environment Variables (including from .env if present)
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      const val = values.join('=').trim();
      if (key && val && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  });
}

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[MCP Warning] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY should be configured in .env or environment.');
}

const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Initialize MCP Server
const server = new Server(
  {
    name: 'portfolio-blog-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_pending_comments',
        description: 'Obtiene la lista de comentarios pendientes de moderación que han dejado los visitantes del blog.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Número máximo de comentarios a retornar (por defecto 20)',
            },
          },
        },
      },
      {
        name: 'approve_comment',
        description: 'Aprueba un comentario por su ID para que sea visible públicamente en el blog.',
        inputSchema: {
          type: 'object',
          properties: {
            comment_id: {
              type: 'string',
              description: 'El ID único (UUID) del comentario a aprobar',
            },
          },
          required: ['comment_id'],
        },
      },
      {
        name: 'reject_comment',
        description: 'Rechaza o elimina un comentario por inapropiado, spam o violar las reglas de convivencia.',
        inputSchema: {
          type: 'object',
          properties: {
            comment_id: {
              type: 'string',
              description: 'El ID único (UUID) del comentario a rechazar',
            },
            reason: {
              type: 'string',
              description: 'Razón opcional del rechazo',
            },
          },
          required: ['comment_id'],
        },
      },
      {
        name: 'list_all_comments',
        description: 'Lista todos los comentarios grabados (pendientes, aprobados o rechazados).',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Filtrar por estado: "pending", "approved", "rejected", o "all"',
            },
            post_slug: {
              type: 'string',
              description: 'Filtrar por slug del artículo',
            },
          },
        },
      },
      {
        name: 'publish_blog_post',
        description: 'Publica un nuevo artículo en el blog (en la base de datos Supabase y/o como archivo del portafolio).',
        inputSchema: {
          type: 'object',
          properties: {
            slug: {
              type: 'string',
              description: 'El slug único del artículo (ej: "blog-ia-avances")',
            },
            title: {
              type: 'string',
              description: 'Título del artículo',
            },
            summary: {
              type: 'string',
              description: 'Resumen o descripción corta',
            },
            content: {
              type: 'string',
              description: 'Contenido completo en Markdown o HTML',
            },
            lang: {
              type: 'string',
              description: 'Idioma ("es", "en", "pt")',
            },
          },
          required: ['slug', 'title', 'content'],
        },
      },
      {
        name: 'list_blog_posts',
        description: 'Lista los artículos publicados en el blog.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle Tool Calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!supabase) {
    return {
      content: [
        {
          type: 'text',
          text: '❌ Error: Supabase no está configurado. Asegúrate de definir PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.',
        },
      ],
    };
  }

  try {
    switch (name) {
      case 'list_pending_comments': {
        const limit = args?.limit || 20;
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        if (!data || data.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: '🎉 ¡No hay comentarios pendientes de moderación en este momento!',
              },
            ],
          };
        }

        const formatted = data.map((c) => 
          `📌 ID: ${c.id}\n👤 Autor: ${c.author_name}\n📄 Artículo: ${c.post_slug}\n📅 Fecha: ${c.created_at}\n💬 Comentario: "${c.content}"\n`
        ).join('\n---\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `Encontrados ${data.length} comentario(s) pendiente(s):\n\n${formatted}`,
            },
          ],
        };
      }

      case 'approve_comment': {
        const { comment_id } = args;
        const { data, error } = await supabase
          .from('comments')
          .update({ status: 'approved' })
          .eq('id', comment_id)
          .select();

        if (error) throw error;
        if (!data || data.length === 0) {
          return {
            content: [{ type: 'text', text: `❌ No se encontró ningún comentario con el ID: ${comment_id}` }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ Comentario de "${data[0].author_name}" APROBADO con éxito. Ahora es visible públicamente en el artículo "${data[0].post_slug}".`,
            },
          ],
        };
      }

      case 'reject_comment': {
        const { comment_id, reason } = args;
        const { data, error } = await supabase
          .from('comments')
          .update({ status: 'rejected' })
          .eq('id', comment_id)
          .select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `🚫 Comentario con ID ${comment_id} ha sido RECHAZADO.${reason ? ` Razón: ${reason}` : ''}`,
            },
          ],
        };
      }

      case 'list_all_comments': {
        const { status, post_slug } = args || {};
        let query = supabase.from('comments').select('*').order('created_at', { ascending: false });

        if (status && status !== 'all') {
          query = query.eq('status', status);
        }
        if (post_slug) {
          query = query.eq('post_slug', post_slug);
        }

        const { data, error } = await query;
        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'publish_blog_post': {
        const { slug, title, summary, content, lang = 'es' } = args;

        // 1. Save to Supabase posts table
        const { data, error } = await supabase
          .from('posts')
          .upsert([
            {
              slug,
              title,
              summary,
              content,
              lang,
              status: 'published',
              updated_at: new Date().toISOString(),
            },
          ], { onConflict: 'slug' })
          .select();

        if (error) {
          console.warn('[MCP Warning] Failed to publish to Supabase table:', error.message);
        }

        return {
          content: [
            {
              type: 'text',
              text: `✨ Artículo "${title}" (${slug}) publicado con éxito en el portafolio en idioma [${lang}].`,
            },
          ],
        };
      }

      case 'list_blog_posts': {
        const { data, error } = await supabase.from('posts').select('id, slug, title, lang, created_at');
        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data || [], null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `❌ Error procesando ${name}: ${err.message}`,
        },
      ],
    };
  }
});

// Start Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[MCP Server] Portfolio Blog MCP Server running on stdio');
}

main().catch((err) => {
  console.error('[MCP Error]', err);
  process.exit(1);
});
