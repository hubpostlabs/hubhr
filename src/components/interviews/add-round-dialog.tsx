'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { scheduleInterviewRound } from '@/actions/interviews'
import { toast } from 'sonner'
import { ROUND_TYPE_LABELS } from '@/types/interview'

interface AddRoundDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    submissionId: string
    candidateName: string
    nextRoundNumber: number
}

export function AddRoundDialog({
    open,
    onOpenChange,
    submissionId,
    candidateName,
    nextRoundNumber
}: AddRoundDialogProps) {
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState<Date>()
    const [time, setTime] = useState('')
    const [roundType, setRoundType] = useState<string>('technical')
    const [interviewer, setInterviewer] = useState('')
    const [interviewerEmail, setInterviewerEmail] = useState('')
    const [notes, setNotes] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!date || !time) {
            toast.error('Please select date and time')
            return
        }

        setLoading(true)

        const result = await scheduleInterviewRound(submissionId, {
            round_number: nextRoundNumber,
            round_type: roundType,
            scheduled_date: format(date, 'yyyy-MM-dd'),
            scheduled_time: time,
            interviewer,
            interviewer_email: interviewerEmail,
            notes
        })

        if (result.error) {
            toast.error('Failed to schedule round')
        } else {
            toast.success(`Round ${nextRoundNumber} scheduled for ${candidateName}!`)
            handleClose()
        }

        setLoading(false)
    }

    const handleClose = () => {
        onOpenChange(false)
        setTimeout(() => {
            setDate(undefined)
            setTime('')
            setRoundType('technical')
            setInterviewer('')
            setInterviewerEmail('')
            setNotes('')
        }, 200)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Schedule Round {nextRoundNumber}</DialogTitle>
                    <DialogDescription>
                        Schedule interview round for {candidateName}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="roundType">Round Type</Label>
                        <Select value={roundType} onValueChange={setRoundType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(ROUND_TYPE_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Input
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="interviewer">Interviewer Name (Optional)</Label>
                        <Input
                            id="interviewer"
                            type="text"
                            placeholder="e.g., John Doe"
                            value={interviewer}
                            onChange={(e) => setInterviewer(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="interviewerEmail">Interviewer Email (Optional)</Label>
                        <Input
                            id="interviewerEmail"
                            type="email"
                            placeholder="e.g., john@company.com"
                            value={interviewerEmail}
                            onChange={(e) => setInterviewerEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any additional notes or instructions..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Scheduling...' : 'Schedule Round'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
