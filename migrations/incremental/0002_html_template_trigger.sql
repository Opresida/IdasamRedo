-- Migration: Add trigger_type to custom_html_templates
-- This is idempotent (safe to re-run).

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_html_templates' AND column_name = 'trigger_type'
  ) THEN
    ALTER TABLE "custom_html_templates" ADD COLUMN "trigger_type" text DEFAULT 'manual';
  END IF;
END $$;
