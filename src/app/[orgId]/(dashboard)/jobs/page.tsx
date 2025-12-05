import { Suspense } from 'react'
import { getOrgJobs } from '@/actions/jobs'
import { JobsFilter } from '@/components/jobs/jobs-filter'
import { GroupedJobList } from '@/components/jobs/grouped-job-list'
import { CreateJobButton } from '@/components/jobs/create-job-button'
import { Separator } from '@/components/ui/separator'

export default async function JobsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = await params
    const { data: jobs, error } = await getOrgJobs(orgId)

    if (error) {
        return <div>Error loading jobs</div>
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your open positions and track applicants.
                    </p>
                </div>
                <CreateJobButton orgId={orgId} />
            </div>

            <Separator />

            <div className="flex flex-col gap-6">
                {/* We'll pass the initial jobs to a client component that handles filtering */}
                {/* For now, we render the filters and the list separately, but often they need shared state. */}
                {/* To keep it simple, I'll wrap them in a client container or pass state down? */}
                {/* Better: JobsContainer that has state. */}
                <JobsContainer initialJobs={jobs || []} orgId={orgId} />
            </div>
        </div>
    )
}

// Small client wrapper to hold state
import { JobsContainer } from '@/components/jobs/jobs-container'
