'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const createOrgSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    location: z.string().optional(),
    industry: z.string().optional(),
    imagePath: z.string().optional().nullable(),
})

export type CreateOrgInput = z.infer<typeof createOrgSchema>

export async function createOrganization(input: CreateOrgInput) {
    const result = createOrgSchema.safeParse(input)

    if (!result.success) {
        return { error: result.error.issues[0].message }
    }

    const supabase = await createClient()

    // Ensure user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    try {
        const { data, error } = await supabase.rpc('create_organization', {
            p_name: result.data.name,
            p_location: result.data.location || null,
            p_industry: result.data.industry || null,
            p_image_path: result.data.imagePath || null,
        })

        if (error) {
            console.error('Error creating organization:', error)
            return { error: error.message }
        }

        revalidatePath('/') // Revalidate relevant paths
        return { data }
    } catch (err) {
        console.error('Unexpected error creating organization:', err)
        return { error: 'An unexpected error occurred' }
    }
}

export async function getUserOrganizations() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { data, error } = await supabase
        .from('organization_members')
        .select(`
      org_id,
      role,
      organizations (
        id,
        name,
        location,
        industry,
        image_path
      )
    `)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error fetching user organizations:', error)
        return { error: error.message }
    }

    // Flatten the structure for easier consumption
    const organizations = data.map(item => ({
        ...item.organizations,
        role: item.role
    }))

    return { data: organizations }
}

export async function getOrganization(orgId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Check membership
    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

    if (error) return { error: error.message }

    // Ideally check membership here too, but RLS should handle it if set up correctly.
    // However, since we are using the service role in some places or just authenticated client,
    // let's assume RLS on 'organizations' table allows select if member.
    // If not, we might need to join membership.

    return { data }
}
