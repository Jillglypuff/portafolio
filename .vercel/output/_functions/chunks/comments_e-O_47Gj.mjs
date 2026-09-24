import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { createClient } from "@supabase/supabase-js";
//#region src/lib/supabase.js
var getEnv = (key) => {
	let val;
	try {
		if (import.meta && Object.assign({
			"ASSETS_PREFIX": void 0,
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SITE": "https://www.jillglypuff.com",
			"SSR": true
		}, {
			NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZ3ZzdWhia2prbmhleWlxeHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNjk2MDIsImV4cCI6MjEwNTg0NTYwMn0.vdMapfnvScqetUsGwKU3dTfA0BallXDKN41z4r9D4tE",
			NEXT_PUBLIC_SUPABASE_URL: "https://jhgvsuhbkjknheyiqxvp.supabase.co",
			SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZ3ZzdWhia2prbmhleWlxeHZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2OTYwMiwiZXhwIjoyMTA1ODQ1NjAyfQ.kUzzlMqmi57jJcE5uHOGa4D-dyj9dFIf9hJSjl3HRPo",
			PUBLIC: "C:\\Users\\Public"
		}) && Object.assign({
			"ASSETS_PREFIX": void 0,
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SITE": "https://www.jillglypuff.com",
			"SSR": true
		}, {
			NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZ3ZzdWhia2prbmhleWlxeHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNjk2MDIsImV4cCI6MjEwNTg0NTYwMn0.vdMapfnvScqetUsGwKU3dTfA0BallXDKN41z4r9D4tE",
			NEXT_PUBLIC_SUPABASE_URL: "https://jhgvsuhbkjknheyiqxvp.supabase.co",
			SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZ3ZzdWhia2prbmhleWlxeHZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2OTYwMiwiZXhwIjoyMTA1ODQ1NjAyfQ.kUzzlMqmi57jJcE5uHOGa4D-dyj9dFIf9hJSjl3HRPo",
			PUBLIC: "C:\\Users\\Public"
		})[key]) val = Object.assign({
			"ASSETS_PREFIX": void 0,
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SITE": "https://www.jillglypuff.com",
			"SSR": true
		}, {
			NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZ3ZzdWhia2prbmhleWlxeHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNjk2MDIsImV4cCI6MjEwNTg0NTYwMn0.vdMapfnvScqetUsGwKU3dTfA0BallXDKN41z4r9D4tE",
			NEXT_PUBLIC_SUPABASE_URL: "https://jhgvsuhbkjknheyiqxvp.supabase.co",
			SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZ3ZzdWhia2prbmhleWlxeHZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2OTYwMiwiZXhwIjoyMTA1ODQ1NjAyfQ.kUzzlMqmi57jJcE5uHOGa4D-dyj9dFIf9hJSjl3HRPo",
			PUBLIC: "C:\\Users\\Public"
		})[key];
	} catch {}
	if (!val) try {
		if (process && process.env && process.env[key]) val = process.env[key];
	} catch {}
	if (typeof val === "string") return val.trim().replace(/^["']|["']$/g, "");
};
var rawUrl = getEnv("PUBLIC_SUPABASE_URL") || getEnv("SUPABASE_URL") || getEnv("NEXT_PUBLIC_SUPABASE_URL");
var rawAnonKey = getEnv("PUBLIC_SUPABASE_ANON_KEY") || getEnv("SUPABASE_ANON_KEY") || getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") || getEnv("SUPABASE_KEY");
var isValidUrl = (url) => typeof url === "string" && url.startsWith("http") && !url.includes("tu-proyecto");
var isValidKey = (key) => typeof key === "string" && key.length > 10 && !key.includes("tu-anon-key");
var supabaseUrl = isValidUrl(rawUrl) ? rawUrl : null;
var supabaseAnonKey = isValidKey(rawAnonKey) ? rawAnonKey : null;
var supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
//#endregion
//#region src/pages/api/comments.js
var comments_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
async function GET({ request }) {
	const slug = new URL(request.url).searchParams.get("slug");
	if (!slug) return new Response(JSON.stringify({ error: "Falta el parámetro slug" }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	if (!supabase) return new Response(JSON.stringify({
		comments: [],
		warning: "Supabase no está configurado aún en .env"
	}), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
	try {
		const { data, error } = await supabase.from("comments").select("id, author_name, content, created_at").eq("post_slug", slug).eq("status", "approved").order("created_at", { ascending: true });
		if (error) {
			console.error("[Supabase GET Error]", error);
			return new Response(JSON.stringify({
				comments: [],
				error: error.message
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		}
		return new Response(JSON.stringify({ comments: data || [] }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("[GET Comments Exception]", err);
		return new Response(JSON.stringify({
			comments: [],
			error: err.message
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	}
}
async function POST({ request }) {
	try {
		const { slug, author_name, content } = await request.json();
		if (!slug || !author_name || !content) return new Response(JSON.stringify({ error: "Todos los campos son obligatorios" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const cleanName = String(author_name).trim().slice(0, 100);
		const cleanContent = String(content).trim().slice(0, 2e3);
		if (!cleanName || !cleanContent) return new Response(JSON.stringify({ error: "El nombre y el comentario no pueden estar vacíos" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		if (!supabase) return new Response(JSON.stringify({ error: "Supabase no está configurado aún. Por favor coloca tu URL y Key de Supabase en el archivo .env" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const { error } = await supabase.from("comments").insert([{
			post_slug: slug,
			author_name: cleanName,
			content: cleanContent,
			status: "pending"
		}]);
		if (error) {
			console.error("[Supabase POST Error]", error);
			let errorMsg = error.message;
			if (error.code === "42P01") errorMsg = "La tabla \"comments\" no existe en Supabase aún. Ejecuta el script supabase/schema.sql en el SQL Editor de Supabase.";
			return new Response(JSON.stringify({ error: errorMsg }), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}
		return new Response(JSON.stringify({
			success: true,
			message: "Tu comentario ha sido enviado exitosamente. Aparecerá tan pronto como sea revisado."
		}), {
			status: 201,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("[POST Comments Exception]", err);
		return new Response(JSON.stringify({ error: `Error conectando con la base de datos: ${err.message}` }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
}
//#endregion
//#region \0virtual:astro:page:src/pages/api/comments@_@js
var page = () => comments_exports;
//#endregion
export { page };
