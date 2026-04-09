-- Migration: Create article-related tables
-- Idempotent (safe to re-run): uses CREATE TABLE IF NOT EXISTS and DO $$ blocks.

CREATE TABLE IF NOT EXISTS "article_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'article_categories_slug_unique'
      AND table_name = 'article_categories'
  ) THEN
    ALTER TABLE "article_categories" ADD CONSTRAINT "article_categories_slug_unique" UNIQUE ("slug");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "articles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "excerpt" text,
  "image" text,
  "category_id" uuid,
  "author_name" text NOT NULL DEFAULT 'Admin',
  "tags" text[],
  "published" text NOT NULL DEFAULT 'false',
  "featured" text NOT NULL DEFAULT 'false',
  "views" integer NOT NULL DEFAULT 0,
  "reading_time" integer NOT NULL DEFAULT 5,
  "created_at" timestamp with time zone DEFAULT NOW(),
  "updated_at" timestamp with time zone DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'articles_category_id_article_categories_id_fk'
      AND table_name = 'articles'
  ) THEN
    ALTER TABLE "articles"
      ADD CONSTRAINT "articles_category_id_article_categories_id_fk"
      FOREIGN KEY ("category_id") REFERENCES "article_categories"("id");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "articles_category_id_idx" ON "articles" ("category_id");
CREATE INDEX IF NOT EXISTS "articles_published_idx" ON "articles" ("published");

CREATE TABLE IF NOT EXISTS "article_comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "article_id" uuid NOT NULL,
  "parent_comment_id" uuid,
  "author_name" text NOT NULL,
  "author_email" text NOT NULL,
  "content" text NOT NULL,
  "is_approved" text NOT NULL DEFAULT 'false',
  "reaction_counts" text DEFAULT '{}',
  "created_at" timestamp with time zone DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'article_comments_article_id_articles_id_fk'
      AND table_name = 'article_comments'
  ) THEN
    ALTER TABLE "article_comments"
      ADD CONSTRAINT "article_comments_article_id_articles_id_fk"
      FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "article_comments_article_id_idx" ON "article_comments" ("article_id");

CREATE TABLE IF NOT EXISTS "article_reactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "article_id" uuid NOT NULL,
  "anonymous_user_id" text NOT NULL,
  "reaction_type" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'article_reactions_article_id_articles_id_fk'
      AND table_name = 'article_reactions'
  ) THEN
    ALTER TABLE "article_reactions"
      ADD CONSTRAINT "article_reactions_article_id_articles_id_fk"
      FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "article_reactions_article_id_idx" ON "article_reactions" ("article_id");
CREATE INDEX IF NOT EXISTS "article_reactions_user_id_idx" ON "article_reactions" ("anonymous_user_id");
