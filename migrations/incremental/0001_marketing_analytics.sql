-- Migration: Add analytics tracking to email_campaigns and create campaign_open_events
-- Run this on existing databases when upgrading to include email analytics features.
-- This migration is idempotent (safe to re-run).

-- Add error_count column to email_campaigns (default 0)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_campaigns' AND column_name = 'error_count'
  ) THEN
    ALTER TABLE "email_campaigns" ADD COLUMN "error_count" integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add open_count column to email_campaigns (default 0)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_campaigns' AND column_name = 'open_count'
  ) THEN
    ALTER TABLE "email_campaigns" ADD COLUMN "open_count" integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add subject column to email_campaigns (nullable text)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_campaigns' AND column_name = 'subject'
  ) THEN
    ALTER TABLE "email_campaigns" ADD COLUMN "subject" text;
  END IF;
END $$;

-- Make template_id nullable (Markdown template is now optional when HTML template is present)
DO $$ BEGIN
  ALTER TABLE "email_campaigns" ALTER COLUMN "template_id" DROP NOT NULL;
EXCEPTION WHEN others THEN
  NULL; -- column already nullable
END $$;

-- Create campaign_open_events table for unique per-lead open tracking
-- FK uses ON DELETE CASCADE so deleting a campaign also removes its open events
CREATE TABLE IF NOT EXISTS "campaign_open_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "campaign_id" uuid NOT NULL,
  "lead_id" uuid NOT NULL,
  "opened_at" timestamp with time zone DEFAULT NOW(),
  CONSTRAINT "unique_open_per_lead" UNIQUE("campaign_id", "lead_id"),
  CONSTRAINT "campaign_open_events_campaign_id_email_campaigns_id_fk"
    FOREIGN KEY ("campaign_id") REFERENCES "email_campaigns"("id") ON DELETE CASCADE
);
