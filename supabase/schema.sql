-- ==========================================
-- SUPABASE SCHEMA FOR PORTFOLIO BLOG & COMMENTS
-- ==========================================

-- 1. Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for fast lookup by post_slug and status
CREATE INDEX IF NOT EXISTS idx_comments_slug_status ON public.comments(post_slug, status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public read approved comments" ON public.comments;
DROP POLICY IF EXISTS "Public insert pending comments" ON public.comments;

-- RLS Policy: Anyone can read approved comments
CREATE POLICY "Public read approved comments"
  ON public.comments
  FOR SELECT
  USING (status = 'approved');

-- RLS Policy: Anyone can submit a comment
CREATE POLICY "Public insert pending comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (true);


-- 2. Create Posts Table (Optional - for publishing articles via MCP)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'es',
  status TEXT NOT NULL DEFAULT 'published', -- 'draft', 'published'
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published posts" ON public.posts;

-- RLS Policy: Public read published posts
CREATE POLICY "Public read published posts"
  ON public.posts
  FOR SELECT
  USING (status = 'published');
