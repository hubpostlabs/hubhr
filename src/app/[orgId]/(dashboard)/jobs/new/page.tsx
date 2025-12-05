import { getOrganization } from '@/actions/organizations'
import { CreateJobForm } from '@/components/jobs/create-job-form'
import { Separator } from '@/components/ui/separator'
import { redirect } from 'next/navigation'

export default async function NewJobPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = await params
    const { data: org, error } = await getOrganization(orgId)

    if (error || !org) {
        redirect('/auth/login')
    }

    return (
        <div className="flex flex-col gap-6 py-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Create a new job</h1>
                <p className="text-muted-foreground">
                    Posting for <span className="font-medium text-foreground">{org.name}</span> in <span className="font-medium text-foreground">{org.location || 'Remote'}</span>.
                </p>
            </div>
            <Separator />

            <CreateJobForm org={org} />
        </div>
    )
}
