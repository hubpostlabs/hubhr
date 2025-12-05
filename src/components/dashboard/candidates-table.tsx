'use client'

import { Submission } from '@/types/submission'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CandidatesTableProps {
    submissions: Submission[]
    orgId: string // Might be needed for bucket access if not generic
    showJob?: boolean
}

export function CandidatesTable({ submissions, orgId, showJob = false }: CandidatesTableProps) {

    const handleDownload = async (path: string) => {
        const supabase = createClient()
        // Assuming path is relative to the bucket (which is orgId)
        const { data } = await supabase.storage
            .from(orgId)
            .createSignedUrl(path, 60) // 1 minute link

        if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank')
        }
    }

    if (submissions.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-zinc-50 border-dashed text-zinc-500">
                No candidates yet.
            </div>
        )
    }

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Candidate</TableHead>
                        {showJob && <TableHead>Applied For</TableHead>}
                        <TableHead>Contact</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        <TableHead className="text-right">Resume</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {submissions.map((sub) => (
                        <TableRow key={sub.id}>
                            <TableCell className="font-medium">
                                <div>{sub.name}</div>
                            </TableCell>
                            {showJob && (
                                <TableCell className="text-muted-foreground font-medium">
                                    {sub.jobs?.title || <span className="text-zinc-300">-</span>}
                                </TableCell>
                            )}
                            <TableCell>
                                <div className="text-sm text-zinc-500">{sub.email}</div>
                                <div className="text-xs text-zinc-400">{sub.phone}</div>
                            </TableCell>
                            <TableCell className="text-zinc-500">
                                {new Date(sub.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-center">
                                {sub.score !== null && sub.score !== undefined ? (
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                                        {sub.score}
                                    </span>
                                ) : (
                                    <span className="text-zinc-300">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownload(sub.resume_path)}
                                    title="Download Resume"
                                >
                                    <Download className="h-4 w-4 text-zinc-500 hover:text-indigo-600" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
