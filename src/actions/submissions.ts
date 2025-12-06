'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { waitUntil } from '@vercel/functions'

const submissionSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(5, 'Phone is required'),
    cover_letter: z.string().optional(),
    job_id: z.string(),
})



export async function submitApplication(formData: FormData) {
    const supabase = createAdminClient()

    // 1. Initial Parsing
    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        cover_letter: formData.get('cover'),
        job_id: formData.get('job_id'),
    }

    const validation = submissionSchema.safeParse(rawData)

    if (!validation.success) {
        return { error: validation.error.issues[0].message }
    }

    const { name, email, phone, cover_letter, job_id } = validation.data
    const resumeFile = formData.get('resume') as File

    if (!resumeFile || resumeFile.size === 0) {
        return { error: 'Resume is required' }
    }

    // 2. Duplicate Check
    const { data: existing } = await supabase
        .from('job_submissions')
        .select('id')
        .eq('job_id', job_id)
        .eq('email', email)
        .single()

    if (existing) {
        return { error: 'You have already applied for this job.' }
    }

    // Fetch Job to get Org ID
    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('org_id')
        .eq('id', job_id)
        .single()

    if (jobError || !job) {
        return { error: 'Invalid Job ID' }
    }

    const bucketName = job.org_id; // Use Org ID as bucket name

    // Upload
    const fileExt = resumeFile.name.split('.').pop()
    const fileName = `${job_id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, resumeFile, {
            contentType: resumeFile.type,
            upsert: false
        })

    if (uploadError) {
        console.error('Upload Error:', uploadError)
        // Fallback: If bucket doesn't exist, try to create it
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('The resource was not found')) {
            const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
                public: false,
                fileSizeLimit: 5242880 // 5MB limit example
            })
            if (createBucketError) {
                console.error('Create Bucket Error:', createBucketError)
                return { error: 'System configuration error (Storage)' }
            }

            // Retry upload
            const { error: retryError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, resumeFile, { contentType: resumeFile.type })

            if (retryError) return { error: 'Failed to upload resume after retry' }
        } else {
            return { error: 'Failed to upload resume' }
        }
    }

    // 3. Insert Submission Record
    const { data: submissionData, error: insertError } = await supabase
        .from('job_submissions')
        .insert({
            job_id,
            name,
            email,
            phone,
            resume_path: fileName, // Path within the bucket
            resume_mime: resumeFile.type,
            status: 'new',
            reviewer_notes: cover_letter ? { cover_letter } : {},
        })
        .select('id') // Return ID for scoring
        .single()

    if (insertError || !submissionData) {
        console.error('DB Insert Error:', insertError)
        return { error: 'Failed to save application' }
    }

    // 4. Async Scoring
    // 4. Async Scoring
    // Use waitUntil for background processing on Vercel
    waitUntil(scoreResume(submissionData.id))

    return { success: true }
}

import { scoreResume } from '@/lib/scoring'


import { Submission } from '@/types/submission'

export async function scheduleInterview(
    submissionId: string,
    interviewData: {
        date: string
        time: string
        interviewer?: string
        notes?: string
    }
) {
    const supabase = createAdminClient()

    // Get current submission data
    const { data: submission } = await supabase
        .from('job_submissions')
        .select('reviewer_notes')
        .eq('id', submissionId)
        .single()

    const currentNotes = submission?.reviewer_notes || {}

    // Create Round 1 with the interview data
    const round1 = {
        round_number: 1,
        round_type: 'phone_screen', // Default to phone screen for first round
        scheduled_date: interviewData.date,
        scheduled_time: interviewData.time,
        interviewer: interviewData.interviewer,
        interviewer_email: '', // Can be added later
        status: 'scheduled',
        outcome: 'pending',
        notes: interviewData.notes,
        created_at: new Date().toISOString()
    }

    const updatedNotes = {
        ...currentNotes,
        interview_rounds: [round1],
        // Keep legacy interview field for backward compatibility
        interview: {
            date: interviewData.date,
            time: interviewData.time,
            interviewer: interviewData.interviewer,
            notes: interviewData.notes,
            scheduled_at: new Date().toISOString()
        }
    }

    const { data, error } = await supabase
        .from('job_submissions')
        .update({
            status: 'interviewing', // Set to interviewing (not interview_scheduled)
            reviewer_notes: updatedNotes,
            updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single()

    if (error) {
        console.error('Error scheduling interview:', error)
        return { error: error.message }
    }

    revalidatePath('/[orgId]/shortlist')
    revalidatePath('/[orgId]/interviews')

    return { data }
}

export async function getJobSubmissions(jobId: string) {
    const supabase = createAdminClient()

    // 1. Fetch Job to get Org ID (for Bucket Name)
    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('org_id')
        .eq('id', jobId)
        .single()

    if (jobError || !job) {
        console.error('Error fetching job details:', jobError)
        return { error: 'Job not found' }
    }

    const { data, error } = await supabase
        .from('job_submissions')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching submissions:', error)
        return { error: error.message }
    }

    // 2. Generate Signed URLs for Resumes
    const enrichedSubmissions = await Promise.all(data.map(async (sub) => {
        let resumeUrl = null
        if (sub.resume_path) {
            const { data: signedData } = await supabase.storage
                .from(job.org_id)
                .createSignedUrl(sub.resume_path, 3600) // 1 hour validity

            if (signedData) {
                resumeUrl = signedData.signedUrl
            }
        }
        return { ...sub, resume_url: resumeUrl }
    }))

    return { data: enrichedSubmissions as Submission[] }
}

export async function getOrgSubmissions(orgId: string) {
    const supabase = createAdminClient()

    // We need to join with jobs to filter by org_id
    const { data, error } = await supabase
        .from('job_submissions')
        .select(`
            *,
            jobs!inner (
                id,
                title,
                org_id
            )
        `)
        .eq('jobs.org_id', orgId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching org submissions:', error)
        return { error: error.message }
    }

    return { data: data as unknown as Submission[] }
}
