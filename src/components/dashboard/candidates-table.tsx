'use client'

import { useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Download, FileText, Mail, Clock, Briefcase, ExternalLink, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface CandidatesTableProps {
    submissions: Submission[]
    orgId: string
    showJob?: boolean
}

export function CandidatesTable({ submissions, orgId, showJob = false }: CandidatesTableProps) {
    const [selectedCandidate, setSelectedCandidate] = useState<{ name: string, email: string } | null>(null)
    const [sheetOpen, setSheetOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const handleDownload = async (path: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const supabase = createClient()
        const { data } = await supabase.storage
            .from(orgId)
            .createSignedUrl(path, 60)

        if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank')
        }
    }

    const handleCandidateClick = (candidate: Submission) => {
        setSelectedCandidate({
            name: candidate.name,
            email: candidate.email
        })
        setSheetOpen(true)
    }

    // Group submissions by candidate email
    const getCandidateApplications = (email: string) => {
        return submissions.filter(sub => sub.email === email)
    }

    // Filter submissions based on search query
    const filteredSubmissions = submissions.filter(sub => {
        const query = searchQuery.toLowerCase()
        return sub.name.toLowerCase().includes(query) ||
            sub.email.toLowerCase().includes(query)
    })

    // Get unique candidates from filtered results
    const uniqueCandidates = Array.from(
        new Map(filteredSubmissions.map(sub => [sub.email, sub])).values()
    )

    const displaySubmissions = showJob ? filteredSubmissions : uniqueCandidates

    if (submissions.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-zinc-50 border-dashed text-zinc-500">
                No candidates yet.
            </div>
        )
    }

    return (
        <>
            {/* Search Bar */}
            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        type="text"
                        placeholder="Search candidates by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10"
                    />
                </div>
                {searchQuery && (
                    <p className="text-xs text-zinc-500 mt-2">
                        Found {displaySubmissions.length} {displaySubmissions.length === 1 ? 'candidate' : 'candidates'}
                    </p>
                )}
            </div>

            {displaySubmissions.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-zinc-50 border-dashed text-zinc-500">
                    No candidates found matching "{searchQuery}"
                </div>
            ) : (
                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                {showJob && <TableHead>Applied For</TableHead>}
                                <TableHead>Contact</TableHead>
                                <TableHead>Applied</TableHead>
                                <TableHead className="text-center">Score</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displaySubmissions.map((sub) => (
                                <TableRow
                                    key={sub.id}
                                    className="cursor-pointer hover:bg-zinc-50"
                                    onClick={() => handleCandidateClick(sub)}
                                >
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
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => handleDownload(sub.resume_path, e)}
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
            )}

            {/* Candidate Applications Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4">
                    {selectedCandidate && (
                        <>
                            <SheetHeader className="border-b pb-4">
                                <SheetTitle className="flex items-start gap-3">
                                    <div className="h-12 w-12 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-700">
                                        {selectedCandidate.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{selectedCandidate.name}</h3>
                                        <p className="text-sm text-zinc-500 font-normal">{selectedCandidate.email}</p>
                                    </div>
                                </SheetTitle>
                                <SheetDescription className="sr-only">
                                    View all job applications for {selectedCandidate.name}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-zinc-900">
                                        Job Applications ({getCandidateApplications(selectedCandidate.email).length})
                                    </h4>
                                </div>

                                <div className="space-y-3">
                                    {getCandidateApplications(selectedCandidate.email).map((application) => (
                                        <div
                                            key={application.id}
                                            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all bg-white"
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-semibold text-sm text-zinc-900 mb-1 flex items-center gap-2">
                                                        <Briefcase className="h-4 w-4 text-zinc-400" />
                                                        {application.jobs?.title || 'Unknown Position'}
                                                    </h5>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                                                    </div>
                                                </div>
                                                {application.score !== null && application.score !== undefined && (
                                                    <Badge
                                                        className={cn(
                                                            "text-xs font-semibold tabular-nums",
                                                            application.score >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                                application.score >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                                    "bg-zinc-50 text-zinc-600 border-zinc-200"
                                                        )}
                                                        variant="outline"
                                                    >
                                                        Score: {application.score}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
                                                <Badge variant="secondary" className="text-xs capitalize">
                                                    {application.status}
                                                </Badge>
                                                <div className="ml-auto flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2"
                                                        asChild
                                                    >
                                                        <a
                                                            href={`/${orgId}/jobs/${application.job_id}/manage`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Contact Actions */}
                                <div className="pt-4 border-t space-y-2">
                                    <Button asChild variant="outline" className="w-full" size="lg">
                                        <a href={`mailto:${selectedCandidate.email}`}>
                                            <Mail className="h-4 w-4 mr-2" />
                                            Send Email
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </>
    )
}
