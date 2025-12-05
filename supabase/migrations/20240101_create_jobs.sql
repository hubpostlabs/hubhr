-- Create Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL_REFERENCES public.organizations(id) ON DELETE CASCADE,
  team text, -- e.g. "Engineering", "Marketing"
  role text, -- e.g. "Senior Engineer", "Manager"
  title text NOT NULL,
  slug text, -- can be auto-generated or manual
  short_summary text,
  content_md text,
  required_skills text[] DEFAULT '{}'::text[],
  location text,
  employment_type text, -- "Full-time", "Contract", etc.
  apply_fields jsonb DEFAULT '["name", "email", "phone", "resume"]'::jsonb,
  status text NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  published_at timestamp with time zone,
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_slug_key UNIQUE (org_id, slug)
);

-- Create Job Submissions Table
CREATE TABLE IF NOT EXISTS public.job_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  resume_path text,
  resume_mime text,
  parsed_json jsonb DEFAULT '{}'::jsonb,
  score numeric, -- AI score 0-100?
  scoring_details jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new', -- 'new', 'screened', 'interview', 'offer', 'rejected'
  assigned_to uuid REFERENCES auth.users(id),
  reviewer_notes jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT job_submissions_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_submissions ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for demo, assume org members can do everything for now)
CREATE POLICY "Org members can view jobs" ON public.jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.org_id = jobs.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can insert jobs" ON public.jobs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.org_id = jobs.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can update jobs" ON public.jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.org_id = jobs.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RPC: Create Job
CREATE OR REPLACE FUNCTION create_job(
  p_org_id uuid,
  p_title text,
  p_team text,
  p_role text,
  p_status text,
  p_short_summary text DEFAULT NULL,
  p_content_md text DEFAULT NULL,
  p_required_skills text[] DEFAULT '{}'::text[],
  p_location text DEFAULT NULL,
  p_employment_type text DEFAULT NULL,
  p_apply_fields jsonb DEFAULT '["name", "email", "phone", "resume"]'::jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_id uuid;
  v_slug text;
  v_result json;
BEGIN
  -- Simple slug generation (not collision proof in this snippet, but good enough for demo)
  v_slug := lower(regexp_replace(p_title, '[^a-zA-Z0-9]+', '-', 'g'));

  INSERT INTO public.jobs (
    org_id, title, team, role, status, slug, short_summary, content_md, 
    required_skills, location, employment_type, apply_fields, created_by
  )
  VALUES (
    p_org_id, p_title, p_team, p_role, p_status, v_slug, p_short_summary, p_content_md,
    p_required_skills, p_location, p_employment_type, p_apply_fields, auth.uid()
  )
  RETURNING id INTO v_job_id;

  SELECT row_to_json(j) INTO v_result FROM public.jobs j WHERE id = v_job_id;
  RETURN v_result;
END;
$$;

-- RPC: Get Jobs with Stats
CREATE OR REPLACE FUNCTION get_org_jobs_with_stats(p_org_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  team text,
  role text,
  status text,
  updated_at timestamp with time zone,
  applicants_count bigint,
  avg_score numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    j.id,
    j.title,
    j.team,
    j.role,
    j.status,
    j.updated_at,
    COUNT(s.id) as applicants_count,
    ROUND(AVG(s.score), 1) as avg_score
  FROM public.jobs j
  LEFT JOIN public.job_submissions s ON j.id = s.job_id
  WHERE j.org_id = p_org_id
  GROUP BY j.id
  ORDER BY j.updated_at DESC;
$$;
