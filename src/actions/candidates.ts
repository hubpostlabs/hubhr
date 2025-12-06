'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function getCandidateSubmissions(email: string, orgId: string) {
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
                status,
                org_id
            )
        `)
        .eq('email', email)
        .eq('jobs.org_id', orgId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching candidate submissions:', error)
        return { error: error.message }
    }

    return { data }
}
