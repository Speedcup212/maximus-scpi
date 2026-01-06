/*
  # Fix Search Path Security Vulnerabilities
  
  1. Security Fix
    - Drop orphaned trigger functions with mutable search_path
    - Recreate active trigger functions with immutable search_path (SET search_path = '')
    - This prevents SQL injection attacks via search_path manipulation
  
  2. Functions Fixed
    - update_articles_generated_updated_at (orphaned - will be dropped)
    - update_articles_optimized_updated_at (orphaned - will be dropped)
    - update_google_ads_comete_leads_updated_at (recreated with security)
    - update_leads_updated_at (recreated with security)
    - update_scores_scpi_updated_at (recreated with security)
  
  3. Security Impact
    - Eliminates "Function Search Path Mutable" warnings
    - Prevents privilege escalation attacks
    - Maintains trigger functionality
*/

-- Drop orphaned functions (tables no longer exist)
DROP FUNCTION IF EXISTS public.update_articles_generated_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_articles_optimized_updated_at() CASCADE;

-- Recreate active trigger functions with secure search_path

-- 1. update_google_ads_comete_leads_updated_at
DROP FUNCTION IF EXISTS public.update_google_ads_comete_leads_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_google_ads_comete_leads_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. update_leads_updated_at
DROP FUNCTION IF EXISTS public.update_leads_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_leads_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 3. update_scores_scpi_updated_at
DROP FUNCTION IF EXISTS public.update_scores_scpi_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_scores_scpi_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate triggers for active tables

-- Check if tables exist and recreate triggers
DO $$
BEGIN
  -- Trigger for google_ads_comete_leads (if table exists)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'google_ads_comete_leads') THEN
    DROP TRIGGER IF EXISTS update_google_ads_comete_leads_updated_at ON public.google_ads_comete_leads;
    CREATE TRIGGER update_google_ads_comete_leads_updated_at
      BEFORE UPDATE ON public.google_ads_comete_leads
      FOR EACH ROW
      EXECUTE FUNCTION public.update_google_ads_comete_leads_updated_at();
  END IF;

  -- Trigger for leads (if table exists)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads') THEN
    DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
    CREATE TRIGGER update_leads_updated_at
      BEFORE UPDATE ON public.leads
      FOR EACH ROW
      EXECUTE FUNCTION public.update_leads_updated_at();
  END IF;

  -- Trigger for scores_scpi (if table exists)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scores_scpi') THEN
    DROP TRIGGER IF EXISTS update_scores_scpi_updated_at ON public.scores_scpi;
    CREATE TRIGGER update_scores_scpi_updated_at
      BEFORE UPDATE ON public.scores_scpi
      FOR EACH ROW
      EXECUTE FUNCTION public.update_scores_scpi_updated_at();
  END IF;
END $$;
