
import { getOrgSubmissions } from '@/actions/submissions'
import { CandidatesTable } from '@/components/dashboard/candidates-table'
import { Separator } from '@/components/ui/separator'

export default async function CandidatesPage({
    params,
}: {
    params: Promise<{ orgId: string }>
}) {
    const { orgId } = await params
    const { data: submissions, error } = await getOrgSubmissions(orgId)

    if (error) {
        return (
            <div className="p-6 text-center text-red-500">
                Failed to load candidates.
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
                <p className="text-zinc-500">
                    View all candidates applied to your organization's jobs.
                </p>
            </div>

            <Separator />

            <CandidatesTable
                submissions={submissions || []}
                orgId={orgId}
                showJob={true}
            />
        </div>
    )
}
