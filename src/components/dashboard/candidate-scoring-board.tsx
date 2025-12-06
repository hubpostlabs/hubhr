'use client'

import { useState } from 'react'
import { Submission } from '@/types/submission'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from '@/components/ui/separator'
import {
    Clock,
    Mail,
    Phone,
    FileText,
    Download,
    LayoutGrid,
    List as ListIcon,
    MoreHorizontal,
    ExternalLink,
    Briefcase,
    X,
    Star,
    Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { updateCandidateStatus } from '@/actions/shortlist'
import { ScheduleInterviewDialog } from '@/components/shortlist/schedule-interview-dialog'
import { toast } from 'sonner'

interface ScoringBoardProps {
    submissions: Submission[]
    orgId: string
}

export function CandidateScoringBoard({ submissions, orgId }: ScoringBoardProps) {
    const [view, setView] = useState<'board' | 'list'>('board')
    const [selectedCandidate, setSelectedCandidate] = useState<Submission | null>(null)
    const [sheetOpen, setSheetOpen] = useState(false)

    const highFit = submissions.filter(s => (s.score || 0) >= 80)
    const mediumFit = submissions.filter(s => (s.score || 0) >= 50 && (s.score || 0) < 80)
    const lowFit = submissions.filter(s => (s.score || 0) < 50)

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }

    const handleCardClick = (submission: Submission) => {
        setSelectedCandidate(submission)
        setSheetOpen(true)
    }

    if (view === 'list') {
        return (
            <>
                <div className="space-y-2">
                    <div className="flex justify-end mb-2">
                        <ViewToggle view={view} setView={setView} />
                    </div>
                    <div className="rounded-md border bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Candidate</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Applied</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((submission) => (
                                    <TableRow
                                        key={submission.id}
                                        className="cursor-pointer hover:bg-zinc-50"
                                        onClick={() => handleCardClick(submission)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold ring-2 ring-white">
                                                    {getInitials(submission.name)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>{submission.name}</span>
                                                    <span className="text-xs text-muted-foreground">{submission.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    (submission.score || 0) >= 80 ? "bg-green-100 text-green-700 hover:bg-green-100" :
                                                        (submission.score || 0) >= 50 ? "bg-amber-100 text-amber-700 hover:bg-amber-100" :
                                                            "bg-red-100 text-red-700 hover:bg-red-100"
                                                )}
                                            >
                                                {submission.score || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="capitalize">{submission.status}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                {submission.resume_url && (
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                                                        <a href={submission.resume_url} target="_blank" rel="noopener noreferrer" title="Download Resume">
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                                                    <a href={`mailto:${submission.email}`} title="Email Candidate">
                                                        <Mail className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                <CandidateDetailSheet
                    candidate={selectedCandidate}
                    open={sheetOpen}
                    onOpenChange={setSheetOpen}
                    orgId={orgId}
                />
            </>
        )
    }

    return (
        <>
            <div className="space-y-2">
                <div className="flex justify-end">
                    <ViewToggle view={view} setView={setView} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[calc(100vh-240px)] min-h-[600px]">
                    <BoardColumn
                        title="Top Match"
                        count={highFit.length}
                        submissions={highFit}
                        variant="high"
                        getInitials={getInitials}
                        onCardClick={handleCardClick}
                    />
                    <BoardColumn
                        title="Potential Fit"
                        count={mediumFit.length}
                        submissions={mediumFit}
                        variant="medium"
                        getInitials={getInitials}
                        onCardClick={handleCardClick}
                    />
                    <BoardColumn
                        title="Low Fit"
                        count={lowFit.length}
                        submissions={lowFit}
                        variant="low"
                        getInitials={getInitials}
                        onCardClick={handleCardClick}
                    />
                </div>
            </div>
            <CandidateDetailSheet
                candidate={selectedCandidate}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                orgId={orgId}
            />
        </>
    )
}

function ViewToggle({ view, setView }: { view: 'board' | 'list', setView: (v: 'board' | 'list') => void }) {
    return (
        <div className="bg-zinc-100 p-1 rounded-lg inline-flex h-8 items-center">
            <button
                onClick={() => setView('board')}
                className={cn(
                    "px-3 h-6 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                    view === 'board'
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900"
                )}
            >
                <LayoutGrid className="w-3.5 h-3.5" />
                Board
            </button>
            <button
                onClick={() => setView('list')}
                className={cn(
                    "px-3 h-6 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                    view === 'list'
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900"
                )}
            >
                <ListIcon className="w-3.5 h-3.5" />
                List
            </button>
        </div>
    )
}

function BoardColumn({ title, count, submissions, variant, getInitials, onCardClick }: any) {
    return (
        <div className="flex flex-col h-full">
            {/* Clean header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    {title}
                </h3>
                <span className="text-xs font-medium text-zinc-500 tabular-nums">
                    {count}
                </span>
            </div>

            {/* Card list */}
            <ScrollArea className="flex-1 -mx-1 px-1">
                <div className="space-y-2">
                    {submissions.map((sub: Submission) => (
                        <CandidateCard
                            key={sub.id}
                            submission={sub}
                            variant={variant}
                            getInitials={getInitials}
                            onClick={() => onCardClick(sub)}
                        />
                    ))}
                    {submissions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-3">
                                <ListIcon className="w-5 h-5 text-zinc-300" />
                            </div>
                            <p className="text-xs text-zinc-400 font-medium">No candidates yet</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

function CandidateCard({ submission, variant, getInitials, onClick }: any) {
    const details = submission.scoring_details
    const score = submission.score || 0

    return (
        <div
            className="group relative bg-white border border-zinc-200/60 rounded-lg hover:border-zinc-300 hover:shadow-sm transition-all duration-150 cursor-pointer"
            onClick={onClick}
        >
            {/* Score indicator */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-0.5 rounded-l-lg",
                score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-zinc-300"
            )} />

            <div className="p-3">
                {/* Header */}
                <div className="flex items-start gap-2.5 mb-2.5">
                    {/* Avatar */}
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-600 group-hover:border-zinc-200 group-hover:bg-white transition-colors">
                        {getInitials(submission.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-zinc-900 truncate mb-0.5">
                            {submission.name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <Clock className="w-3 h-3" />
                            <span className="truncate">
                                {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                            </span>
                        </div>
                    </div>

                    {/* Score */}
                    <div className={cn(
                        "shrink-0 px-2 h-6 rounded-md flex items-center justify-center text-xs font-semibold tabular-nums",
                        score >= 80 ? "bg-emerald-50 text-emerald-700" :
                            score >= 50 ? "bg-amber-50 text-amber-700" :
                                "bg-zinc-50 text-zinc-600"
                    )}>
                        {score}
                    </div>
                </div>

                {/* Skills */}
                {details?.strengths && details.strengths.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {details.strengths.slice(0, 3).map((skill: string, i: number) => (
                            <span
                                key={i}
                                className="inline-flex items-center px-2 h-5 rounded text-xs font-medium bg-zinc-50 text-zinc-600 border border-zinc-100 truncate max-w-[100px]"
                                title={skill}
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 pt-2 border-t border-zinc-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = `mailto:${submission.email}`
                        }}
                        className="flex items-center gap-1.5 px-2 h-7 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-md transition-colors"
                    >
                        <Mail className="w-3.5 h-3.5" />
                        Email
                    </button>

                    {submission.resume_url && (
                        <a
                            href={submission.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-2 h-7 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-md transition-colors ml-auto"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Resume
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

function CandidateDetailSheet({ candidate, open, onOpenChange, orgId }: {
    candidate: Submission | null,
    open: boolean,
    onOpenChange: (open: boolean) => void,
    orgId: string
}) {
    const [interviewDialogOpen, setInterviewDialogOpen] = useState(false)
    const [isShortlisting, setIsShortlisting] = useState(false)

    if (!candidate) return null

    const handleShortlist = async () => {
        setIsShortlisting(true)
        const result = await updateCandidateStatus(candidate.id, 'shortlisted')

        if (result.error) {
            toast.error('Failed to shortlist candidate')
        } else {
            toast.success(`${candidate.name} added to shortlist!`)
        }
        setIsShortlisting(false)
    }

    const isShortlisted = candidate.status === 'shortlisted' ||
        candidate.status === 'interview_scheduled' ||
        candidate.status === 'interviewed'

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4">
                    <SheetHeader className="border-b pb-4">
                        <SheetTitle className="flex items-start gap-3">
                            <div className="h-12 w-12 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-700">
                                {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{candidate.name}</h3>
                                <p className="text-sm text-zinc-500 font-normal">{candidate.email}</p>
                            </div>
                        </SheetTitle>
                    </SheetHeader>

                    <div className="mt-6 space-y-6 pb-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-lg border border-zinc-200 bg-zinc-50/50">
                                <p className="text-xs text-zinc-500 mb-1 font-medium">AI Score</p>
                                <p className="text-3xl font-bold tabular-nums">{candidate.score || 'N/A'}</p>
                            </div>
                            <div className="p-4 rounded-lg border border-zinc-200 bg-zinc-50/50">
                                <p className="text-xs text-zinc-500 mb-1 font-medium">Status</p>
                                <Badge className="mt-2" variant="secondary">{candidate.status}</Badge>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-zinc-900">Contact Information</h4>
                            <div className="space-y-2.5 bg-zinc-50 rounded-lg p-3 border border-zinc-200">
                                <div className="flex items-center gap-2.5 text-sm">
                                    <Mail className="h-4 w-4 text-zinc-400" />
                                    <a href={`mailto:${candidate.email}`} className="text-zinc-700 hover:text-zinc-900 hover:underline">{candidate.email}</a>
                                </div>
                                {candidate.phone && (
                                    <div className="flex items-center gap-2.5 text-sm">
                                        <Phone className="h-4 w-4 text-zinc-400" />
                                        <span className="text-zinc-700">{candidate.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2.5 text-sm">
                                    <Clock className="h-4 w-4 text-zinc-400" />
                                    <span className="text-zinc-600">Applied {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        {candidate.scoring_details?.strengths && candidate.scoring_details.strengths.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-zinc-900">Top Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.scoring_details.strengths.map((skill: string, i: number) => (
                                        <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* AI Analysis */}
                        {candidate.scoring_details?.reasoning && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-zinc-900">AI Analysis</h4>
                                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                                    <p className="text-sm text-zinc-700 leading-relaxed">{candidate.scoring_details.reasoning}</p>
                                </div>
                            </div>
                        )}

                        {/* Gaps */}
                        {candidate.scoring_details?.gaps && candidate.scoring_details.gaps.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-zinc-900">Areas for Development</h4>
                                <ul className="space-y-2">
                                    {candidate.scoring_details.gaps.map((gap: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                                            <span className="text-zinc-400 mt-0.5">•</span>
                                            <span>{gap}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-4 border-t space-y-2">
                            <Button
                                onClick={handleShortlist}
                                disabled={isShortlisting || isShortlisted}
                                className="w-full"
                                size="lg"
                                variant={isShortlisted ? "outline" : "default"}
                            >
                                <Star className={cn("h-4 w-4 mr-2", isShortlisted && "fill-current")} />
                                {isShortlisting ? 'Adding...' : isShortlisted ? 'Already Shortlisted' : 'Add to Shortlist'}
                            </Button>

                            {isShortlisted && candidate.status !== 'interview_scheduled' && (
                                <Button
                                    onClick={() => setInterviewDialogOpen(true)}
                                    className="w-full"
                                    size="lg"
                                    variant="default"
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule Interview
                                </Button>
                            )}

                            {candidate.resume_url && (
                                <Button asChild variant="outline" className="w-full" size="lg">
                                    <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Resume
                                    </a>
                                </Button>
                            )}

                            <Button asChild variant="outline" className="w-full" size="lg">
                                <a href={`mailto:${candidate.email}`}>
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
                submissionId={candidate.id}
                candidateName={candidate.name}
                candidateEmail={candidate.email}
                jobTitle={candidate.jobs?.title}
            />
        </>
    )
}
