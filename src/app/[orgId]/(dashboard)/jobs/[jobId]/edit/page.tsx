import { getOrganization } from '@/actions/organizations'
import { getJob } from '@/actions/jobs'
import { CreateJobForm } from '@/components/jobs/create-job-form'
import { Separator } from '@/components/ui/separator'
import { redirect } from 'next/navigation'

export default async function EditJobPage({ params }: { params: Promise<{ orgId: string, jobId: string }> }) {
    const { orgId, jobId } = await params
    const [orgRes, jobRes] = await Promise.all([
        getOrganization(orgId),
        getJob(jobId)
    ])

    if (orgRes.error || !orgRes.data || !jobRes.data) {
        redirect(`/${orgId}/jobs`)
    }

    return (
        <div className="flex flex-col gap-6 py-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Edit Job</h1>
                <p className="text-muted-foreground">
                    Editing <span className="font-medium text-foreground">{jobRes.data.title}</span>.
                </p>
            </div>
            <Separator />

            <CreateJobForm org={orgRes.data} initialData={jobRes.data} />
        </div>
    )
}
