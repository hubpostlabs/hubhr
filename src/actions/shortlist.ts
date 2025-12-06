'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateCandidateStatus(submissionId: string, status: string) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('job_submissions')
        .update({
            status,
            updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single()

    if (error) {
        console.error('Error updating candidate status:', error)
        return { error: error.message }
    }

    revalidatePath('/[orgId]/candidates')
    revalidatePath('/[orgId]/shortlist')
    revalidatePath('/[orgId]/jobs/[jobId]/manage')

    return { data }
}

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
            status: 'interview_scheduled', // Goes to Upcoming tab first
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
    revalidatePath('/[orgId]/jobs/[jobId]/manage')

    return { data }
}

export async function getShortlistedCandidates(orgId: string) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('job_submissions')
        .select(`
            *,
            jobs!inner (
                id,
                title,
                team,
                role,
                org_id
            )
        `)
        .eq('jobs.org_id', orgId)
        .in('status', ['shortlisted', 'interview_scheduled', 'interviewed'])
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching shortlisted candidates:', error)
        return { error: error.message }
    }

    return { data }
}

export async function addInterviewFeedback(
    submissionId: string,
    feedback: {
        rating?: number
        notes: string
        interviewer: string
    }
) {
    const supabase = createAdminClient()

    const { data: submission } = await supabase
        .from('job_submissions')
        .select('reviewer_notes')
        .eq('id', submissionId)
        .single()

    const currentNotes = submission?.reviewer_notes || {}

    const updatedNotes = {
        ...currentNotes,
        feedback: {
            ...feedback,
            submitted_at: new Date().toISOString()
        }
    }

    const { data, error } = await supabase
        .from('job_submissions')
        .update({
            status: 'interviewed',
            reviewer_notes: updatedNotes,
            updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single()

    if (error) {
        console.error('Error adding feedback:', error)
        return { error: error.message }
    }

    revalidatePath('/[orgId]/shortlist')

    return { data }
}
