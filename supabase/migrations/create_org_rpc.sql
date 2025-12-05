-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.job_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  name text,
  email text,
  phone text,
  resume_path text,
  resume_mime text,
  parsed_json jsonb DEFAULT '{}'::jsonb,
  score numeric,
  scoring_details jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new'::text,
  assigned_to uuid,
  reviewer_notes jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT job_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT job_submissions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id)
);
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  team text,
  role text,
  title text NOT NULL,
  slug text UNIQUE,
  short_summary text,
  content_md text,
  required_skills ARRAY DEFAULT '{}'::text[],
  location text,
  employment_type text,
  apply_fields jsonb DEFAULT '["name", "email", "phone", "resume"]'::jsonb,
  status text NOT NULL DEFAULT 'draft'::text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  published_at timestamp with time zone,
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.organization_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member'::text,
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organization_members_pkey PRIMARY KEY (id),
  CONSTRAINT organization_members_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  industry text,
  image_path text,
  owner_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);