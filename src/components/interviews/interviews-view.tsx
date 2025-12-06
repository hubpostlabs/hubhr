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
import { StatusBadge } from '@/components/ui/status-badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    CheckCircle2,
    XCircle,
    Clock,
    Briefcase,
    Calendar,
    Search,
    UserCheck,
    Download,
    Mail,
    CalendarClock,
    Plus
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { selectCandidate, rejectCandidate, startInterview, markInterviewComplete } from '@/actions/interviews'
import { ScheduleInterviewDialog } from '@/components/shortlist/schedule-interview-dialog'
import { InterviewRound } from '@/types/interview'
import { InterviewRoundsTimeline } from './interview-rounds-timeline'
import { AddRoundDialog } from './add-round-dialog'
import { CompleteRoundDialog } from './complete-round-dialog'
import { toast } from 'sonner'

interface InterviewsViewProps {
    interviewedCandidates: Submission[]
    upcomingInterviews: Submission[]
    interviewingCandidates: Submission[]
    orgId: string
}

export function InterviewsView({ interviewedCandidates, upcomingInterviews, interviewingCandidates, orgId }: InterviewsViewProps) {
    const [selectedCandidate, setSelectedCandidate] = useState<Submission | null>(null)
    const [sheetOpen, setSheetOpen] = useState(false)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
    const [addRoundDialogOpen, setAddRoundDialogOpen] = useState(false)
    const [completeRoundDialogOpen, setCompleteRoundDialogOpen] = useState(false)
    const [selectedRoundNumber, setSelectedRoundNumber] = useState(1)
    const [actionLoading, setActionLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [rejectionReason, setRejectionReason] = useState('')
    const [rejectionNotes, setRejectionNotes] = useState('')

    const filteredInterviewed = interviewedCandidates.filter(candidate => {
        const query = searchQuery.toLowerCase()
        return candidate.name.toLowerCase().includes(query) ||
            candidate.email.toLowerCase().includes(query) ||
            candidate.jobs?.title?.toLowerCase().includes(query)
    })

    const filteredUpcoming = upcomingInterviews.filter(candidate => {
        const query = searchQuery.toLowerCase()
        return candidate.name.toLowerCase().includes(query) ||
            candidate.email.toLowerCase().includes(query) ||
            candidate.jobs?.title?.toLowerCase().includes(query)
    })

    const filteredInterviewing = interviewingCandidates.filter(candidate => {
        const query = searchQuery.toLowerCase()
        return candidate.name.toLowerCase().includes(query) ||
            candidate.email.toLowerCase().includes(query) ||
            candidate.jobs?.title?.toLowerCase().includes(query)
    })

    const handleCandidateClick = (candidate: Submission) => {
        setSelectedCandidate(candidate)
        setSheetOpen(true)
    }

    const handleSelect = async (candidate: Submission) => {
        setActionLoading(true)
        const result = await selectCandidate(candidate.id, 'Candidate selected for offer')

        if (result.error) {
            toast.error('Failed to select candidate')
        } else {
            toast.success(`${candidate.name} moved to offer stage!`)
            setSheetOpen(false)
        }
        setActionLoading(false)
    }

    const handleRejectClick = (candidate: Submission) => {
        setSelectedCandidate(candidate)
        setRejectDialogOpen(true)
    }

    const handleRejectSubmit = async () => {
        if (!selectedCandidate) return

        setActionLoading(true)
        const result = await rejectCandidate(selectedCandidate.id, {
            reason: rejectionReason,
            notes: rejectionNotes
        })

        if (result.error) {
            toast.error('Failed to reject candidate')
        } else {
            toast.success(`${selectedCandidate.name} has been rejected`)
            setRejectDialogOpen(false)
            setSheetOpen(false)
            setRejectionReason('')
            setRejectionNotes('')
        }
        setActionLoading(false)
    }

    const getInterviewDetails = (candidate: Submission) => {
        const notes = candidate.reviewer_notes as any
        return notes?.interview
    }

    const handleReschedule = (candidate: Submission) => {
        setSelectedCandidate(candidate)
        setRescheduleDialogOpen(true)
    }

    const handleStartInterview = async (candidate: Submission) => {
        setActionLoading(true)
        const result = await startInterview(candidate.id)

        if (result.error) {
            toast.error('Failed to start interview')
        } else {
            toast.success(`Interview started for ${candidate.name}`)
        }

        setActionLoading(false)
    }

    const handleMarkComplete = async (candidate: Submission) => {
        setActionLoading(true)
        const result = await markInterviewComplete(candidate.id)

        if (result.error) {
            toast.error('Failed to mark interview complete')
        } else {
            toast.success(`Interview marked as complete for ${candidate.name}`)
        }

        setActionLoading(false)
    }

    const getRounds = (candidate: Submission): InterviewRound[] => {
        const notes = candidate.reviewer_notes as any
        return notes?.interview_rounds || []
    }

    const getNextRoundNumber = (candidate: Submission): number => {
        const rounds = getRounds(candidate)
        return rounds.length > 0 ? Math.max(...rounds.map(r => r.round_number)) + 1 : 1
    }

    const getCurrentRound = (candidate: Submission): InterviewRound | undefined => {
        const rounds = getRounds(candidate)
        return rounds.find(r => r.status === 'scheduled')
    }

    if (interviewedCandidates.length === 0 && upcomingInterviews.length === 0 && interviewingCandidates.length === 0) {
        return (
            <div className="text-center py-16 border rounded-lg bg-zinc-50 border-dashed">
                <UserCheck className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500 font-medium">No interviews yet</p>
                <p className="text-xs text-zinc-400 mt-1">Scheduled and completed interviews will appear here</p>
            </div>
        )
    }

    return (
        <>
            <Tabs defaultValue="upcoming" className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-zinc-100">
                        <TabsTrigger value="upcoming" className="gap-2">
                            <CalendarClock className="h-4 w-4" />
                            Upcoming ({upcomingInterviews.length})
                        </TabsTrigger>
                        <TabsTrigger value="interviewing" className="gap-2">
                            <Clock className="h-4 w-4" />
                            Interviewing ({interviewingCandidates.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="gap-2">
                            <UserCheck className="h-4 w-4" />
                            Completed ({interviewedCandidates.length})
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            type="text"
                            placeholder="Search candidates or jobs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                </div>

                <TabsContent value="upcoming" className="mt-4">
                    {filteredUpcoming.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-zinc-50 border-dashed text-zinc-500">
                            {searchQuery ? 'No upcoming interviews found' : 'No upcoming interviews scheduled'}
                        </div>
                    ) : (
                        <div className="rounded-md border bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Candidate</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Scheduled For</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUpcoming.map((candidate) => {
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
                                                    {interview ? (
                                                        <div>
                                                            <div className="flex items-center gap-1.5 text-sm font-medium">
                                                                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                                                {format(parseISO(interview.date), 'MMM d, yyyy')}
                                                            </div>
                                                            <div className="text-xs text-zinc-500 ml-5">{interview.time}</div>
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
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStartInterview(candidate)}
                                                            disabled={actionLoading}
                                                            className="h-7 text-xs"
                                                        >
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            Start Interview
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleReschedule(candidate)}
                                                            className="h-7 text-xs"
                                                        >
                                                            <CalendarClock className="h-3 w-3 mr-1" />
                                                            Reschedule
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>

                {/* Interviewing Tab - Multi-Round Candidates */}
                <TabsContent value="interviewing" className="mt-4">
                    {filteredInterviewing.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-zinc-50 border-dashed text-zinc-500">
                            {searchQuery ? 'No candidates found in interview process' : 'No candidates in interview rounds'}
                        </div>
                    ) : (
                        <div className="rounded-md border bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Candidate</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Round Progress</TableHead>
                                        <TableHead>Next/Current Round</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInterviewing.map((candidate) => {
                                        const rounds = getRounds(candidate)
                                        const currentRound = getCurrentRound(candidate)
                                        const completedCount = rounds.filter(r => r.status === 'completed').length
                                        const totalCount = rounds.length

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
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 max-w-[100px] h-2 bg-zinc-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-500 transition-all"
                                                                style={{ width: `${(completedCount / totalCount) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-zinc-600">
                                                            {completedCount}/{totalCount}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {currentRound ? (
                                                        <div>
                                                            <div className="text-sm font-medium">Round {currentRound.round_number}</div>
                                                            <div className="text-xs text-zinc-500">
                                                                {currentRound.scheduled_date && format(parseISO(currentRound.scheduled_date), 'MMM d')}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-zinc-400">No upcoming round</span>
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
                                                    <div className="flex items-center justify-end gap-1">
                                                        {currentRound && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedCandidate(candidate)
                                                                    setSelectedRoundNumber(currentRound.round_number)
                                                                    setCompleteRoundDialogOpen(true)
                                                                }}
                                                                className="h-7 text-xs"
                                                            >
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                Complete
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedCandidate(candidate)
                                                                setAddRoundDialogOpen(true)
                                                            }}
                                                            disabled={actionLoading}
                                                            className="h-7 text-xs"
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" />
                                                            + Round
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => handleMarkComplete(candidate)}
                                                            disabled={actionLoading}
                                                            className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                                        >
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Mark Complete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="completed" className="mt-4">
                    {filteredInterviewed.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-zinc-50 border-dashed text-zinc-500">
                            {searchQuery ? 'No completed interviews found' : 'No completed interviews yet'}
                        </div>
                    ) : (
                        <div className="rounded-md border bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Candidate</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Interview Date</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInterviewed.map((candidate) => {
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
                                                <TableCell className="text-sm text-zinc-600">
                                                    {interview ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                                            {format(parseISO(interview.date), 'MMM d, yyyy')}
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
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleSelect(candidate)}
                                                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                                                        >
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Select
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleRejectClick(candidate)}
                                                            className="h-7 text-xs"
                                                        >
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {selectedCandidate && (
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

                            <div>
                                <h4 className="text-sm font-semibold text-zinc-900 mb-2">AI Score</h4>
                                <Badge className="text-lg px-4 py-2">{selectedCandidate.score || 'N/A'}</Badge>
                            </div>

                            {getInterviewDetails(selectedCandidate) && (
                                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                                    <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Interview Details
                                    </h4>
                                    <div className="space-y-1 text-sm text-purple-700">
                                        <p><strong>Date:</strong> {format(parseISO(getInterviewDetails(selectedCandidate).date), 'MMM d, yyyy')}</p>
                                        <p><strong>Time:</strong> {getInterviewDetails(selectedCandidate).time}</p>
                                        {getInterviewDetails(selectedCandidate).interviewer && (
                                            <p><strong>Interviewer:</strong> {getInterviewDetails(selectedCandidate).interviewer}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {getRounds(selectedCandidate).length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-zinc-900 mb-3">Interview Rounds History</h4>
                                    <InterviewRoundsTimeline rounds={getRounds(selectedCandidate)} />
                                </div>
                            )}

                            {selectedCandidate.status === 'interviewed' && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-zinc-600 mb-3">Interview process completed. Make your final decision:</p>
                                    <div className="space-y-2">
                                        <Button
                                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                                            size="lg"
                                            onClick={() => handleSelect(selectedCandidate)}
                                            disabled={actionLoading}
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Select for Offer
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            size="lg"
                                            onClick={() => setRejectDialogOpen(true)}
                                            disabled={actionLoading}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Reject Candidate
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {(selectedCandidate.status === 'offer' || selectedCandidate.status === 'hired' || selectedCandidate.status === 'rejected') && (
                                <div className="pt-4 border-t">
                                    <div className={`border rounded-lg p-3 text-center ${selectedCandidate.status === 'rejected'
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-green-50 border-green-200'
                                        }`}>
                                        <StatusBadge status={selectedCandidate.status} />
                                        <p className={`text-sm mt-2 ${selectedCandidate.status === 'rejected' ? 'text-red-700' : 'text-green-700'
                                            }`}>
                                            This candidate has been {selectedCandidate.status === 'offer' ? 'selected for an offer' : selectedCandidate.status === 'hired' ? 'hired' : 'rejected'}
                                        </p>
                                    </div>
                                </div>
                            )}

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
                    </SheetContent>
                </Sheet>
            )}

            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reject Candidate</DialogTitle>
                        <DialogDescription>
                            Provide feedback for {selectedCandidate?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason (Optional)</Label>
                            <Select value={rejectionReason} onValueChange={setRejectionReason}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="skills">Skills mismatch</SelectItem>
                                    <SelectItem value="experience">Insufficient experience</SelectItem>
                                    <SelectItem value="culture">Culture fit concerns</SelectItem>
                                    <SelectItem value="position_filled">Position filled</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Add any additional feedback..."
                                value={rejectionNotes}
                                onChange={(e) => setRejectionNotes(e.target.value)}
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRejectDialogOpen(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectSubmit}
                            disabled={actionLoading}
                        >
                            {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {
                selectedCandidate && (
                    <ScheduleInterviewDialog
                        open={rescheduleDialogOpen}
                        onOpenChange={setRescheduleDialogOpen}
                        submissionId={selectedCandidate.id}
                        candidateName={selectedCandidate.name}
                        candidateEmail={selectedCandidate.email}
                        jobTitle={selectedCandidate.jobs?.title}
                    />
                )
            }

            {
                selectedCandidate && (
                    <AddRoundDialog
                        open={addRoundDialogOpen}
                        onOpenChange={setAddRoundDialogOpen}
                        submissionId={selectedCandidate.id}
                        candidateName={selectedCandidate.name}
                        nextRoundNumber={getNextRoundNumber(selectedCandidate)}
                    />
                )
            }

            {
                selectedCandidate && (
                    <CompleteRoundDialog
                        open={completeRoundDialogOpen}
                        onOpenChange={setCompleteRoundDialogOpen}
                        submissionId={selectedCandidate.id}
                        candidateName={selectedCandidate.name}
                        roundNumber={selectedRoundNumber}
                    />
                )
            }
        </>
    )
}
