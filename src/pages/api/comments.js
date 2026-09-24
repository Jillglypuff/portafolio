import { supabase } from '../../lib/supabase';

export const prerender = false;

// GET /api/comments?slug=blog-hermes
export async function GET({ request }) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Falta el parámetro slug' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!supabase) {
    return new Response(JSON.stringify({ comments: [], warning: 'Supabase no está configurado aún en .env' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .select('id, author_name, content, created_at')
      .eq('post_slug', slug)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Supabase GET Error]', error);
      return new Response(JSON.stringify({ comments: [], error: error.message }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ comments: data || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[GET Comments Exception]', err);
    return new Response(JSON.stringify({ comments: [], error: err.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/comments
export async function POST({ request }) {
  try {
    const body = await request.json();
    const { slug, author_name, content } = body;

    if (!slug || !author_name || !content) {
      return new Response(JSON.stringify({ error: 'Todos los campos son obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanName = String(author_name).trim().slice(0, 100);
    const cleanContent = String(content).trim().slice(0, 2000);

    if (!cleanName || !cleanContent) {
      return new Response(JSON.stringify({ error: 'El nombre y el comentario no pueden estar vacíos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!supabase) {
      return new Response(JSON.stringify({ 
        error: 'Supabase no está configurado aún. Por favor coloca tu URL y Key de Supabase en el archivo .env' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert without .select() so RLS SELECT policy does not block pending rows
    const { error } = await supabase
      .from('comments')
      .insert([
        {
          post_slug: slug,
          author_name: cleanName,
          content: cleanContent,
          status: 'pending',
        },
      ]);

    if (error) {
      console.error('[Supabase POST Error]', error);
      let errorMsg = error.message;
      if (error.code === '42P01') {
        errorMsg = 'La tabla "comments" no existe en Supabase aún. Ejecuta el script supabase/schema.sql en el SQL Editor de Supabase.';
      }
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Tu comentario ha sido enviado exitosamente. Aparecerá tan pronto como sea revisado.',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('[POST Comments Exception]', err);
    return new Response(JSON.stringify({ error: `Error conectando con la base de datos: ${err.message}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
