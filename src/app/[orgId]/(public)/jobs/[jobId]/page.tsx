import { getJob } from '@/actions/jobs'
import { getOrganization } from '@/actions/organizations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import { Badge } from '@/components/ui/badge'
import { MapPin, Briefcase, Clock, Building2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { JobApplicationForm } from '@/components/public/job-application-form'

export default async function JobPublicPage({ params }: { params: Promise<{ orgId: string, jobId: string }> }) {
    const { orgId, jobId } = await params
    const [orgRes, jobRes] = await Promise.all([
        getOrganization(orgId),
        getJob(jobId)
    ])

    if (!orgRes.data || !jobRes.data) {
        return notFound()
    }

    const job = jobRes.data
    const org = orgRes.data

    if (job.status === 'draft') {
        return notFound()
    }

    return (
        <div className="min-h-screen bg-zinc-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-lg text-indigo-600">
                        <Building2 className="h-5 w-5" />
                        {org.name} <span className="text-zinc-400 font-normal">Careers</span>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-[1fr_360px] gap-12">
                {/* Left: JD */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">{job.title}</h1>
                        <div className="flex flex-wrap gap-4 text-zinc-500">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="h-4 w-4" />
                                {job.team}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {job.employment_type || 'Full-time'}
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-zinc max-w-none prose-lg">
                        <ReactMarkdown>{job.content_md}</ReactMarkdown>
                    </div>
                </div>

                {/* Right: Application Form */}
                <div className="relative">
                    <div className="sticky top-24">
                        <JobApplicationForm orgName={org.name} jobId={job.id} />
                    </div>
                </div>
            </main>
        </div>
    )
}
