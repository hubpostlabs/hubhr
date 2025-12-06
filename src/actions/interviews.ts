'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function startInterview(submissionId: string) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('job_submissions')
        .update({
            status: 'interviewing',
            updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single()

    if (error) {
        console.error('Error starting interview:', error)
        return { error: error.message }
    }

    revalidatePath('/[orgId]/interviews')

    return { data }
}

export async function markInterviewComplete(submissionId: string) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('job_submissions')
        .update({
            status: 'interviewed',
            updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single()

    if (error) {
        console.error('Error marking interview complete:', error)
        return { error: error.message }
    }

    revalidatePath('/[orgId]/interviews')

    return { data }
}

export async function getInterviewedCandidates(orgId: string) {
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
        .in('status', ['interviewed', 'offer', 'hired']) // Include all completed interviews
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching interviewed candidates:', error)
        return { error: error.message }
    }

    return { data }
}

export async function selectCandidate(submissionId: string, notes?: string) {
    const supabase = createAdminClient()

    const { data: submission } = await supabase
        .from('job_submissions')
        .select('reviewer_notes')
        .eq('id', submissionId)
        .single()

    const currentNotes = submission?.reviewer_notes || {}

    const updatedNotes = {
        ...currentNotes,
        selection: {
            selected_at: new Date().toISOString(),
            notes: notes || 'Candidate selected for offer'
        }
    }

    const { data, error } = await supabase
        .from('job_submissions')
        .update({
            status: 'offer',
            reviewer_notes: updatedNotes,
            updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single()

    if (error) {
        console.error('Error selecting candidate:', error)
        return { error: error.message }
    }

    revalidatePath('/[orgId]/interviews')

    return { data }
}

export async function rejectCandidate(
    submissionId: string,
    feedback: {
        reason?: string
        notes?: string
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
        rejection: {
            rejected_at: new Date().toISOString(),
            reason: feedback.reason,
            notes: feedback.notes
        }
    }

    const { data, error } = await supabase
        .from('job_submissions')
        .update({
            status: 'rejected',
            reviewer_notes: updatedNotes,
            updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single()

    if (error) {
        console.error('Error rejecting candidate:', error)
        return { error: error.message }
    }

    revalidatePath('/[orgId]/interviews')

    return { data }
}

export async function getUpcomingInterviews(orgId: string) {
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
        .eq('status', 'interview_scheduled')
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching upcoming interviews:', error)
        return { error: error.message }
    }

    return { data }
}

export async function scheduleInterviewRound(
    submissionId: string,
    roundData: {
        round_number: number
        round_type: string
        scheduled_date: string
        scheduled_time: string
        interviewer?: string
        interviewer_email?: string
        notes?: string
    }
) {
    const supabase = createAdminClient()

    const { data: submission } = await supabase
        .from('job_submissions')
        .select('reviewer_notes, status')
        .eq('id', submissionId)
        .single()

    const currentNotes = submission?.reviewer_notes || {}
    const rounds = currentNotes?.interview_rounds || []

    const newRound = {
        ...roundData,
        status: 'scheduled',
        outcome: 'pending',
        created_at: new Date().toISOString()
    }

    const updatedRounds = [...rounds, newRound]

    const { data, error } = await supabase
        .from('job_submissions')
        .update({
            status: 'interviewing',
            reviewer_notes: {
                ...currentNotes,
                interview_rounds: updatedRounds
            },
            updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single()

    if (error) {
        console.error('Error scheduling interview round:', error)
        return { error: error.message }
    }

    revalidatePath('/[orgId]/interviews')

    return { data }
}

export async function completeInterviewRound(
    submissionId: string,
    roundNumber: number,
    feedback: {
        outcome: 'pass' | 'fail'
        feedback?: string
        notes?: string
    }
) {
    const supabase = createAdminClient()

    const { data: submission } = await supabase
        .from('job_submissions')
        .select('reviewer_notes')
        .eq('id', submissionId)
        .single()

    const currentNotes = submission?.reviewer_notes || {}
    const rounds = currentNotes?.interview_rounds || []

    const updatedRounds = rounds.map((round: any) => {
        if (round.round_number === roundNumber) {
            return {
                ...round,
                status: 'completed',
                outcome: feedback.outcome,
                feedback: feedback.feedback,
                notes: feedback.notes,
                completed_at: new Date().toISOString()
            }
        }
        return round
    })

    // Determine overall status
    // IMPORTANT: Stay in 'interviewing' to allow scheduling more rounds
    // Only move to 'interviewed' if user explicitly marks as done

    let newStatus = 'interviewing' // Default: stay in interviewing

    if (feedback.outcome === 'fail') {
        // Failed a round → reject immediately
        newStatus = 'rejected'
    }
    // Note: We intentionally DON'T check if all rounds are complete
    // User should explicitly decide when to move to 'interviewed'
    // This allows scheduling more rounds after completing earlier ones

    const { data, error } = await supabase
        .from('job_submissions')
        .update({
            status: newStatus,
            reviewer_notes: {
                ...currentNotes,
                interview_rounds: updatedRounds
            },
            updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single()

    if (error) {
        console.error('Error completing interview round:', error)
        return { error: error.message }
    }

    revalidatePath('/[orgId]/interviews')

    return { data }
}

export async function getInterviewingCandidates(orgId: string) {
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
        .eq('status', 'interviewing')
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching interviewing candidates:', error)
        return { error: error.message }
    }

    return { data }
}
