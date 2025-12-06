'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon, Clock, Download, ExternalLink, Mail, Send } from 'lucide-react'
import { scheduleInterview } from '@/actions/shortlist'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { generateGoogleCalendarLink, generateOutlookCalendarLink, generateICSFile } from '@/lib/calendar-utils'
import { generateCandidateEmailTemplate, generateInterviewerEmailTemplate } from '@/lib/email-templates'

interface ScheduleInterviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    submissionId: string
    candidateName: string
    candidateEmail: string
    jobTitle?: string
}

export function ScheduleInterviewDialog({
    open,
    onOpenChange,
    submissionId,
    candidateName,
    candidateEmail,
    jobTitle = 'the position'
}: ScheduleInterviewDialogProps) {
    const [loading, setLoading] = useState(false)
    const [scheduled, setScheduled] = useState(false)
    const [date, setDate] = useState<Date>()
    const [time, setTime] = useState('')
    const [interviewer, setInterviewer] = useState('')
    const [interviewerEmail, setInterviewerEmail] = useState('')
    const [notes, setNotes] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!date) return

        setLoading(true)

        const formData = {
            date: format(date, 'yyyy-MM-dd'),
            time,
            interviewer,
            notes
        }

        const result = await scheduleInterview(submissionId, formData)

        if (result.error) {
            toast.error('Failed to schedule interview')
        } else {
            toast.success('Interview scheduled successfully!')
            setScheduled(true)
        }

        setLoading(false)
    }

    const handleClose = () => {
        onOpenChange(false)
        setTimeout(() => {
            setScheduled(false)
            setDate(undefined)
            setTime('')
            setInterviewer('')
            setInterviewerEmail('')
            setNotes('')
        }, 200)
    }

    const getCalendarLinkData = () => {
        if (!date || !time) return null

        const [hours, minutes] = time.split(':')
        const startDate = new Date(date)
        startDate.setHours(parseInt(hours), parseInt(minutes), 0)

        const endDate = new Date(startDate)
        endDate.setHours(startDate.getHours() + 1) // Default 1 hour duration

        return {
            title: `Interview with ${candidateName}`,
            description: notes || `Interview scheduled for ${candidateName}`,
            location: 'Video Call',
            startDate,
            endDate
        }
    }

    const handleAddToGoogleCalendar = () => {
        const data = getCalendarLinkData()
        if (data) {
            window.open(generateGoogleCalendarLink(data), '_blank')
        }
    }

    const handleAddToOutlook = () => {
        const data = getCalendarLinkData()
        if (data) {
            window.open(generateOutlookCalendarLink(data), '_blank')
        }
    }

    const handleDownloadICS = () => {
        const data = getCalendarLinkData()
        if (data) {
            const url = generateICSFile(data)
            const a = document.createElement('a')
            a.href = url
            a.download = `interview-${candidateName.replace(/\s+/g, '-')}.ics`
            a.click()
            URL.revokeObjectURL(url)
        }
    }

    const handleEmailCandidate = () => {
        if (!date || !time) return

        const emailData = generateCandidateEmailTemplate({
            candidateName,
            interviewDate: date,
            interviewTime: time,
            interviewer,
            jobTitle,
            companyName: 'HubHR'
        })

        window.location.href = emailData.mailto.replace('mailto:?', `mailto:${candidateEmail}?`)
    }

    const handleEmailInterviewer = () => {
        if (!date || !time || !interviewerEmail) return

        const emailData = generateInterviewerEmailTemplate({
            candidateName,
            interviewDate: date,
            interviewTime: time,
            notes,
            jobTitle,
        })

        window.location.href = emailData.mailto.replace('mailto:?', `mailto:${interviewerEmail}?`)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                    <DialogDescription>
                        Schedule an interview with {candidateName}
                    </DialogDescription>
                </DialogHeader>

                {!scheduled ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm font-medium">
                                <CalendarIcon className="h-4 w-4 text-zinc-500" />
                                Interview Date
                            </Label>
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
                            <Label htmlFor="time" className="flex items-center gap-2 text-sm font-medium">
                                <Clock className="h-4 w-4 text-zinc-500" />
                                Interview Time
                            </Label>
                            <Input
                                id="time"
                                type="time"
                                required
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="interviewer" className="text-sm font-medium">
                                Interviewer Name (Optional)
                            </Label>
                            <Input
                                id="interviewer"
                                type="text"
                                placeholder="e.g., John Doe"
                                value={interviewer}
                                onChange={(e) => setInterviewer(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="interviewerEmail" className="text-sm font-medium">
                                Interviewer Email (Optional)
                            </Label>
                            <Input
                                id="interviewerEmail"
                                type="email"
                                placeholder="e.g., john@company.com"
                                value={interviewerEmail}
                                onChange={(e) => setInterviewerEmail(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-sm font-medium">
                                Notes (Optional)
                            </Label>
                            <Textarea
                                id="notes"
                                placeholder="Add any additional notes or instructions..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full resize-none"
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading || !date || !time}>
                                {loading ? 'Scheduling...' : 'Schedule Interview'}
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="text-center space-y-2">
                            <div className="h-12 w-12 rounded-full bg-green-100 mx-auto flex items-center justify-center">
                                <CalendarIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-lg">Interview Scheduled!</h3>
                            <p className="text-sm text-zinc-600">
                                {date && format(date, "EEEE, MMMM d, yyyy")} at {time}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-zinc-700">Send invitations:</p>

                            <Button
                                variant="default"
                                className="w-full justify-start"
                                onClick={handleEmailCandidate}
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Email Candidate ({candidateEmail})
                            </Button>

                            {interviewerEmail && (
                                <Button
                                    variant="default"
                                    className="w-full justify-start"
                                    onClick={handleEmailInterviewer}
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Email Interviewer ({interviewerEmail})
                                </Button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-zinc-700">Add to your calendar:</p>

                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleAddToGoogleCalendar}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Add to Google Calendar
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleAddToOutlook}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Add to Outlook Calendar
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleDownloadICS}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download .ics file
                            </Button>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleClose} className="w-full">
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
