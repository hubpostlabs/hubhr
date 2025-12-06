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
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { completeInterviewRound } from '@/actions/interviews'
import { toast } from 'sonner'

interface CompleteRoundDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    submissionId: string
    candidateName: string
    roundNumber: number
}

export function CompleteRoundDialog({
    open,
    onOpenChange,
    submissionId,
    candidateName,
    roundNumber
}: CompleteRoundDialogProps) {
    const [loading, setLoading] = useState(false)
    const [outcome, setOutcome] = useState<'pass' | 'fail'>('pass')
    const [feedback, setFeedback] = useState('')
    const [notes, setNotes] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setLoading(true)

        const result = await completeInterviewRound(submissionId, roundNumber, {
            outcome,
            feedback,
            notes
        })

        if (result.error) {
            toast.error('Failed to complete round')
        } else {
            toast.success(`Round ${roundNumber} marked as ${outcome === 'pass' ? 'passed' : 'failed'}`)
            handleClose()
        }

        setLoading(false)
    }

    const handleClose = () => {
        onOpenChange(false)
        setTimeout(() => {
            setOutcome('pass')
            setFeedback('')
            setNotes('')
        }, 200)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Round {roundNumber}</DialogTitle>
                    <DialogDescription>
                        Record outcome and feedback for {candidateName}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        <Label>Outcome</Label>
                        <RadioGroup value={outcome} onValueChange={(value) => setOutcome(value as 'pass' | 'fail')}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pass" id="pass" />
                                <Label htmlFor="pass" className="font-normal cursor-pointer">
                                    Pass - Candidate performed well
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fail" id="fail" />
                                <Label htmlFor="fail" className="font-normal cursor-pointer">
                                    Fail - Candidate did not meet requirements
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="feedback">Feedback</Label>
                        <Textarea
                            id="feedback"
                            placeholder="Provide detailed feedback about the interview..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any additional notes or observations..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="resize-none"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            variant={outcome === 'fail' ? 'destructive' : 'default'}
                        >
                            {loading ? 'Saving...' : `Mark as ${outcome === 'pass' ? 'Passed' : 'Failed'}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
