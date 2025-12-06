'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats(orgId: string) {
    const supabase = await createClient()

    // 1. Active Jobs
    const { count: activeJobsCount, error: jobsError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'published')

    // 2. Total Candidates (Submissions)
    // We need to join with jobs to filter by orgId
    const { count: candidatesCount, error: candidatesError } = await supabase
        .from('job_submissions')
        .select('*, jobs!inner(org_id)', { count: 'exact', head: true })
        .eq('jobs.org_id', orgId)

    // 3. Interviews (Scheduled or Interviewing)
    const { count: interviewsCount, error: interviewsError } = await supabase
        .from('job_submissions')
        .select('*, jobs!inner(org_id)', { count: 'exact', head: true })
        .eq('jobs.org_id', orgId)
        .in('status', ['interview_scheduled', 'interviewing'])

    if (jobsError || candidatesError || interviewsError) {
        console.error('Error fetching dashboard stats:', jobsError, candidatesError, interviewsError)
    }

    return {
        activeJobs: activeJobsCount || 0,
        totalCandidates: candidatesCount || 0,
        activeInterviews: interviewsCount || 0
    }
}

export async function getApplicationStats(orgId: string) {
    const supabase = await createClient()

    // Fetch submissions created in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
        .from('job_submissions')
        .select('created_at, jobs!inner(org_id)')
        .eq('jobs.org_id', orgId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching application stats:', error)
        return []
    }

    // Aggregate by date
    const statsMap = new Map<string, number>()

    // Initialize last 30 days with 0
    for (let i = 0; i < 30; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        // Format: "MMM dd" e.g., "Oct 24"
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        statsMap.set(key, 0)
    }

    data.forEach(submission => {
        const date = new Date(submission.created_at)
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        // If the date is within our map (it should be), increment
        if (statsMap.has(key)) {
            statsMap.set(key, (statsMap.get(key) || 0) + 1)
        }
    })

    // Convert map to array and reverse to chronological order (since we initialized backwards)
    // Actually, let's just sort by date. 
    // Easier: Create array for last 30 days chronologically
    const result = []
    for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        result.push({
            name: key,
            total: statsMap.get(key) || 0
        })
    }

    return result
}

export async function getRecentActivity(orgId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('job_submissions')
        .select(`
            *,
            jobs!inner (
                title,
                org_id
            )
        `)
        .eq('jobs.org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(5)

    if (error) {
        console.error('Error fetching recent activity:', error)
        return []
    }

    return data.map(submission => ({
        id: submission.id,
        candidateName: submission.name,
        jobTitle: submission.jobs.title,
        appliedAt: submission.created_at,
        status: submission.status
    }))
}
