'use server'

import { createClient } from '@/lib/supabase/server'
import { CreateJobInput, CreateJobSchema, JobWithStats } from '@/types/jobs'
import { revalidatePath } from 'next/cache'
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'


export async function getOrgJobs(orgId: string): Promise<{ data: JobWithStats[] | null, error: any }> {
    const supabase = await createClient()

    // use server supabase client
    const { data, error } = await supabase
        .from('jobs_with_stats')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching jobs:', error)
        return { data: null, error }
    }

    return { data, error: null }
}

export async function createJob(orgId: string, input: CreateJobInput) {
    const supabase = await createClient()

    // Validate input
    const parseResult = CreateJobSchema.safeParse(input)
    if (!parseResult.success) {
        return { error: parseResult.error.flatten(), data: null }
    }

    const { data, error } = await supabase.rpc('create_job', {
        p_org_id: orgId,
        p_title: input.title,
        p_team: input.team,
        p_role: input.role,
        p_status: input.status,
        p_short_summary: input.short_summary,
        p_content_md: input.content_md,
        p_required_skills: input.required_skills,
        p_location: input.location,
        p_employment_type: input.employment_type,
        p_apply_fields: input.apply_fields
    })

    if (error) {
        console.error('Error creating job:', error)
        return { error: error.message, data: null }
    }

    revalidatePath(`/${orgId}/jobs`)
    return { data, error: null }
}


export async function generateJobDescription(prompt: any) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        throw new Error("Missing Gemini API Key");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    //list all the models

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const promptText = `
    You are an expert HR copywriter. Create a professional job description based on the following details.
    
    Company Summary: ${prompt.orgName || 'A dynamic forward-thinking company'}
    
    Job Title: ${prompt.title}
    Team/Department: ${prompt.team || 'Engineering'}
    Role Level: ${prompt.role}
    Location: ${prompt.orgLocation || 'Remote'}
    Employment Type: Full-time
    
    Responsibilities / Requirements Notes:
    ${prompt.requirements}
    
    Tone: friendly-professional
    
    Output must be valid JSON with the following structure:
    {
      "short_summary": "A 2-3 sentence engaging summary of the role",
      "content_md": "The full job description in Markdown format. Use H2 (##) for sections like About, Responsibilities, Requirements, Benefits. Do not include the title in the markdown.",
      "required_skills": ["Array", "of", "5-7", "key", "skills", "extracted"]
    }
    
    Do not wrap the JSON in markdown code blocks. Just return the raw JSON string.
    `;

    try {
        const result = await model.generateContent(promptText);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI Generation Error:", error);
        // Fallback or re-throw
        throw new Error("Failed to generate job description");
    }
}

export async function getJob(jobId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()
    return { data, error }
}

export async function updateJob(jobId: string, orgId: string, input: Partial<CreateJobInput>) {
    const supabase = await createClient()

    // We can define a schema for update if needed, but for now reuse partial
    const { data, error } = await supabase
        .from('jobs')
        .update({
            title: input.title,
            team: input.team,
            role: input.role,
            status: input.status,
            short_summary: input.short_summary,
            content_md: input.content_md,
            required_skills: input.required_skills,
            location: input.location,
            employment_type: input.employment_type,
            updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .eq('org_id', orgId)
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/${orgId}/jobs`)
    return { data }
}
