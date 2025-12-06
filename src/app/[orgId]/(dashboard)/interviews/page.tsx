import { getInterviewedCandidates, getUpcomingInterviews, getInterviewingCandidates } from '@/actions/interviews'
import { Separator } from '@/components/ui/separator'
import { InterviewsView } from '@/components/interviews/interviews-view'

export default async function InterviewsPage({
    params,
}: {
    params: Promise<{ orgId: string }>
}) {
    const { orgId } = await params

    const [interviewedResult, upcomingResult, interviewingResult] = await Promise.all([
        getInterviewedCandidates(orgId),
        getUpcomingInterviews(orgId),
        getInterviewingCandidates(orgId)
    ])

    if (interviewedResult.error || upcomingResult.error || interviewingResult.error) {
        return (
            <div className="p-6 text-center text-red-500">
                Failed to load interviews.
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Interviews</h1>
                <p className="text-zinc-500">
                    Manage scheduled interviews and review completed interviews.
                </p>
            </div>

            <Separator />

            <InterviewsView
                interviewedCandidates={interviewedResult.data || []}
                upcomingInterviews={upcomingResult.data || []}
                interviewingCandidates={interviewingResult.data || []}
                orgId={orgId}
            />
        </div>
    )
}
