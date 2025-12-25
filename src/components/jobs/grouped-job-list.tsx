'use client'

import Link from 'next/link'
import { JobWithStats } from '@/types/jobs'
import { MoreHorizontal, Users, Star, Calendar, ExternalLink, ArrowRight, Trash2, Archive } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
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
import { archiveJob, deleteJob } from '@/actions/jobs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface GroupedJobListProps {
    jobs: JobWithStats[]
}

export function GroupedJobList({ jobs }: GroupedJobListProps) {
    const router = useRouter()
    const [jobToDelete, setJobToDelete] = useState<{ id: string, orgId: string } | null>(null)

    const handleArchive = async (jobId: string, orgId: string) => {
        // ... (existing code)
        const res = await archiveJob(jobId, orgId)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Job archived")
            router.refresh()
        }
    }

    const confirmDelete = async () => {
        if (!jobToDelete) return

        const res = await deleteJob(jobToDelete.id, jobToDelete.orgId)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Job deleted")
            router.refresh()
        }
        setJobToDelete(null)
    }

    if (jobs.length === 0) {
        // ... (existing code)
        return (
            <div className="text-center py-12 text-muted-foreground bg-white rounded-lg border border-dashed">
                No jobs found.
            </div>
        )
    }

    return (
        <>
            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    {/* ... (TableHeader remains same) ... */}
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
                                {/* ... (Cells remain same) ... */}
                                <TableCell className="font-medium">
                                    <Link
                                        href={`/${job.org_id}/jobs/${job.id}/manage`}
                                        prefetch
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
                                                    <Link prefetch href={`/${job.org_id}/jobs/${job.id}/manage`}>
                                                        Manage Job
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link prefetch href={`/${job.org_id}/jobs/${job.id}/edit`}>
                                                        Edit Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                {job.status === 'published' && (
                                                    <DropdownMenuItem asChild>
                                                        <Link prefetch href={`/${job.org_id}/jobs/${job.id}`} target="_blank">
                                                            <ExternalLink className="h-4 w-4 mr-2" /> View Public Page
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                {job.status !== 'archived' && (
                                                    <DropdownMenuItem onClick={() => handleArchive(job.id, job.org_id)}>
                                                        <Archive className="h-4 w-4 mr-2" /> Archive
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => setJobToDelete({ id: job.id, orgId: job.org_id })}
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the job post and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete Job
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
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
