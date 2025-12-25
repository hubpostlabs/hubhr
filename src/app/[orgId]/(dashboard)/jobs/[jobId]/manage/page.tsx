import { getJob } from '@/actions/jobs'
import { getJobSubmissions } from '@/actions/submissions'
import { CandidateScoringBoard } from '@/components/dashboard/candidate-scoring-board'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function JobDashboardPage({
    params,
}: {
    params: Promise<{ orgId: string; jobId: string }>
}) {
    const { orgId, jobId } = await params
    const [jobRes, subRes] = await Promise.all([
        getJob(jobId),
        getJobSubmissions(jobId)
    ])

    if (!jobRes.data) {
        return notFound()
    }

    const job = jobRes.data
    const submissions = subRes.data || []

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <Link
                    prefetch
                    href={`/${orgId}/jobs`}
                    className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-3 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Jobs
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
                            <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                                {job.status}
                            </Badge>
                        </div>
                        <p className="text-zinc-500">
                            {job.team} • {job.role} • {job.location}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/${orgId}/jobs/${jobId}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Job
                            </Link>
                        </Button>
                        {job.status === 'published' && (
                            <Button variant="secondary" asChild>
                                <Link href={`/${orgId}/jobs/${jobId}`} target="_blank">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Public
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <Separator />

            {/* Candidates Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Candidates ({submissions.length}) - AI Analysis</h2>
                </div>

                <CandidateScoringBoard submissions={submissions} orgId={orgId} />
            </div>
        </div>
    )
}
