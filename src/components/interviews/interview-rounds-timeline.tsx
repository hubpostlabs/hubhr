'use client'

import { InterviewRound, ROUND_TYPE_LABELS } from '@/types/interview'
import { CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface InterviewRoundsTimelineProps {
    rounds: InterviewRound[]
}

export function InterviewRoundsTimeline({ rounds }: InterviewRoundsTimelineProps) {
    if (!rounds || rounds.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-500 text-sm">
                No interview rounds scheduled yet
            </div>
        )
    }

    const sortedRounds = [...rounds].sort((a, b) => a.round_number - b.round_number)

    return (
        <div className="space-y-4">
            {sortedRounds.map((round, index) => {
                const isLast = index === sortedRounds.length - 1

                return (
                    <div key={round.round_number} className="relative">
                        {/* Timeline connector */}
                        {!isLast && (
                            <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-zinc-200" />
                        )}

                        {/* Round card */}
                        <div className={cn(
                            "flex gap-4 p-4 rounded-lg border",
                            round.status === 'completed' && round.outcome === 'pass' && "bg-emerald-50 border-emerald-200",
                            round.status === 'completed' && round.outcome === 'fail' && "bg-red-50 border-red-200",
                            round.status === 'scheduled' && "bg-blue-50 border-blue-200",
                            round.status === 'cancelled' && "bg-zinc-50 border-zinc-200"
                        )}>
                            {/* Status icon */}
                            <div className="shrink-0">
                                {round.status === 'completed' && round.outcome === 'pass' && (
                                    <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                {round.status === 'completed' && round.outcome === 'fail' && (
                                    <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
                                        <XCircle className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                {round.status === 'scheduled' && (
                                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                {round.status === 'cancelled' && (
                                    <div className="h-8 w-8 rounded-full bg-zinc-400 flex items-center justify-center">
                                        <XCircle className="h-5 w-5 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-sm">
                                        Round {round.round_number}: {ROUND_TYPE_LABELS[round.round_type]}
                                    </h4>
                                    <Badge variant="outline" className="text-xs">
                                        {round.status}
                                    </Badge>
                                </div>

                                {round.scheduled_date && (
                                    <div className="flex items-center gap-1.5 text-sm text-zinc-600 mb-2">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {format(parseISO(round.scheduled_date), 'MMM d, yyyy')} at {round.scheduled_time}
                                    </div>
                                )}

                                {round.interviewer && (
                                    <p className="text-sm text-zinc-600 mb-1">
                                        <strong>Interviewer:</strong> {round.interviewer}
                                    </p>
                                )}

                                {round.feedback && (
                                    <div className="mt-2 p-2 bg-white/50 rounded text-sm">
                                        <strong>Feedback:</strong>
                                        <p className="mt-1 text-zinc-700">{round.feedback}</p>
                                    </div>
                                )}

                                {round.notes && (
                                    <p className="text-sm text-zinc-500 mt-1">{round.notes}</p>
                                )}

                                {round.completed_at && (
                                    <p className="text-xs text-zinc-400 mt-2">
                                        Completed {format(parseISO(round.completed_at), 'MMM d, yyyy')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
