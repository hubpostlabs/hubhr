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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Mail, Clock, Briefcase, Calendar, Search, Star } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { ScheduleInterviewDialog } from './schedule-interview-dialog'
import { updateCandidateStatus } from '@/actions/shortlist'
import { toast } from 'sonner'

interface ShortlistViewProps {
    candidates: Submission[]
    orgId: string
}

function getStatusColor(status: string) {
    switch (status) {
        case 'shortlisted':
            return 'bg-blue-50 text-blue-700 border-blue-200'
        case 'interview_scheduled':
            return 'bg-purple-50 text-purple-700 border-purple-200'
        case 'interviewed':
            return 'bg-amber-50 text-amber-700 border-amber-200'
        default:
            return 'bg-zinc-50 text-zinc-600 border-zinc-200'
    }
}

export function ShortlistView({ candidates, orgId }: ShortlistViewProps) {
    const [selectedCandidate, setSelectedCandidate] = useState<Submission | null>(null)
    const [sheetOpen, setSheetOpen] = useState(false)
    const [interviewDialogOpen, setInterviewDialogOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // Filter candidates
    const filteredCandidates = candidates.filter(candidate => {
        const matchesSearch =
            candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.jobs?.title?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const handleCandidateClick = (candidate: Submission) => {
        setSelectedCandidate(candidate)
        setSheetOpen(true)
    }

    const handleScheduleInterview = (candidate: Submission) => {
        setSelectedCandidate(candidate)
        setInterviewDialogOpen(true)
    }

    const getInterviewDetails = (candidate: Submission) => {
        const notes = candidate.reviewer_notes as any
        return notes?.interview
    }

    if (candidates.length === 0) {
        return (
            <div className="text-center py-16 border rounded-lg bg-zinc-50 border-dashed">
                <Star className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500 font-medium">No shortlisted candidates yet</p>
                <p className="text-xs text-zinc-400 mt-1">Candidates you shortlist will appear here</p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4">
                {/* Filters */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            type="text"
                            placeholder="Search candidates or jobs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>

                    <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
                        <TabsList className="bg-zinc-100 h-9">
                            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                            <TabsTrigger value="shortlisted" className="text-xs">Shortlisted</TabsTrigger>
                            <TabsTrigger value="interview_scheduled" className="text-xs">Scheduled</TabsTrigger>
                            <TabsTrigger value="interviewed" className="text-xs">Interviewed</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {filteredCandidates.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-zinc-50 border-dashed text-zinc-500">
                        No candidates found matching your filters
                    </div>
                ) : (
                    <div className="rounded-md border bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Interview</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCandidates.map((candidate) => {
                                    const interview = getInterviewDetails(candidate)
                                    return (
                                        <TableRow
                                            key={candidate.id}
                                            className="cursor-pointer hover:bg-zinc-50"
                                            onClick={() => handleCandidateClick(candidate)}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600">
                                                        {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div>{candidate.name}</div>
                                                        <div className="text-xs text-zinc-500">{candidate.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                                                    <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
                                                    {candidate.jobs?.title || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn("text-xs capitalize", getStatusColor(candidate.status))}>
                                                    {candidate.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-zinc-600">
                                                {interview ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                                        {format(new Date(interview.date + 'T' + interview.time), 'MMM d, HH:mm')}
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {candidate.score ? (
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                                                        {candidate.score}
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-300">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                {candidate.status === 'shortlisted' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleScheduleInterview(candidate)}
                                                        className="h-7 text-xs"
                                                    >
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        Schedule
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Candidate Detail Sheet */}
            {selectedCandidate && (
                <>
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4">
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
                            </SheetHeader>

                            <div className="mt-6 space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-zinc-900 mb-2">Position</h4>
                                    <p className="text-sm text-zinc-600">{selectedCandidate.jobs?.title}</p>
                                </div>

                                {getInterviewDetails(selectedCandidate) && (
                                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                                        <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Interview Details
                                        </h4>
                                        <div className="space-y-1 text-sm text-purple-700">
                                            <p><strong>Date:</strong> {format(new Date(getInterviewDetails(selectedCandidate).date), 'MMM d, yyyy')}</p>
                                            <p><strong>Time:</strong> {getInterviewDetails(selectedCandidate).time}</p>
                                            {getInterviewDetails(selectedCandidate).interviewer && (
                                                <p><strong>Interviewer:</strong> {getInterviewDetails(selectedCandidate).interviewer}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t space-y-2">
                                    {selectedCandidate.resume_url && (
                                        <Button asChild variant="outline" className="w-full">
                                            <a href={selectedCandidate.resume_url} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download Resume
                                            </a>
                                        </Button>
                                    )}
                                    <Button asChild variant="outline" className="w-full">
                                        <a href={`mailto:${selectedCandidate.email}`}>
                                            <Mail className="h-4 w-4 mr-2" />
                                            Send Email
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <ScheduleInterviewDialog
                        open={interviewDialogOpen}
                        onOpenChange={setInterviewDialogOpen}
                        submissionId={selectedCandidate.id}
                        candidateName={selectedCandidate.name}
                        candidateEmail={selectedCandidate.email}
                        jobTitle={selectedCandidate.jobs?.title}
                    />
                </>
            )}
        </>
    )
}
