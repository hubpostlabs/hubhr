import { getShortlistedCandidates } from '@/actions/shortlist'
import { Separator } from '@/components/ui/separator'
import { ShortlistView } from '@/components/shortlist/shortlist-view'

export default async function ShortlistPage({
    params,
}: {
    params: Promise<{ orgId: string }>
}) {
    const { orgId } = await params
    const { data: candidates, error } = await getShortlistedCandidates(orgId)

    if (error) {
        return (
            <div className="p-6 text-center text-red-500">
                Failed to load shortlisted candidates.
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Shortlist</h1>
                <p className="text-zinc-500">
                    Manage shortlisted candidates and schedule interviews.
                </p>
            </div>

            <Separator />

            <ShortlistView candidates={candidates || []} orgId={orgId} />
        </div>
    )
}
