'use client'

import Link from 'next/link'
import { JobWithStats } from '@/types/jobs'
import { MoreHorizontal, Users, Star, Calendar, ExternalLink, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

interface GroupedJobListProps {
    jobs: JobWithStats[]
}

export function GroupedJobList({ jobs }: GroupedJobListProps) {

    if (jobs.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-white rounded-lg border border-dashed">
                No jobs found.
            </div>
        )
    }

    return (
        <div className="rounded-md border bg-white shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                        <TableHead className="w-[300px]">Job Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-center">Applicants</TableHead>
                        <TableHead className="text-center">Avg Score</TableHead>
                        <TableHead className="text-right">Updated</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jobs.map((job) => (
                        <TableRow key={job.id} className="group">
                            <TableCell className="font-medium">
                                <Link
                                    href={`/${job.org_id}/jobs/${job.id}/manage`}
                                    className="block font-medium text-foreground hover:text-indigo-600 transition-colors truncate"
                                    title={job.title}
                                >
                                    {job.title}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <JobStatusBadge status={job.status} />
                            </TableCell>
                            <TableCell className="text-muted-foreground">{job.team || '-'}</TableCell>
                            <TableCell className="text-muted-foreground">{job.role || '-'}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>{job.applicants_count || 0}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                {job.avg_score ? (
                                    <div className="flex items-center justify-center gap-1.5 text-amber-600 font-medium">
                                        <Star className="h-3.5 w-3.5 fill-current" />
                                        <span>{job.avg_score}</span>
                                    </div>
                                ) : (
                                    <span className="text-zinc-300">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground text-xs whitespace-nowrap">
                                {formatDistanceToNow(new Date(job.updated_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/${job.org_id}/jobs/${job.id}/manage`}>
                                                    Manage Job
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/${job.org_id}/jobs/${job.id}/edit`}>
                                                    Edit Details
                                                </Link>
                                            </DropdownMenuItem>
                                            {job.status === 'published' && (
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/${job.org_id}/jobs/${job.id}`} target="_blank">
                                                        View Public Page
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function JobStatusBadge({ status }: { status: string }) {
    const variants: Record<string, string> = {
        draft: "bg-zinc-100 text-zinc-600 border-zinc-200",
        published: "bg-green-100 text-green-700 border-green-200",
        archived: "bg-red-50 text-red-600 border-red-100"
    }

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wide", variants[status] || variants.draft)}>
            {status}
        </span>
    )
}
