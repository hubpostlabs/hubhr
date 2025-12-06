import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SubmissionStatus } from '@/types/submission'

export function StatusBadge({ status }: { status: SubmissionStatus }) {
    const config = {
        new: { label: 'New', className: 'bg-zinc-50 text-zinc-600 border-zinc-200' },
        reviewed: { label: 'Reviewed', className: 'bg-gray-50 text-gray-600 border-gray-200' },
        shortlisted: { label: 'Shortlisted', className: 'bg-blue-50 text-blue-700 border-blue-200' },
        interview_scheduled: { label: 'Interview Scheduled', className: 'bg-purple-50 text-purple-700 border-purple-200' },
        interviewing: { label: 'Interviewing', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        interviewed: { label: 'Interviewed', className: 'bg-amber-50 text-amber-700 border-amber-200' },
        offer: { label: 'Offer', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        hired: { label: 'Hired', className: 'bg-green-50 text-green-700 border-green-200' },
        rejected: { label: 'Rejected', className: 'bg-red-50 text-red-600 border-red-200' },
    }

    const { label, className } = config[status] || config.new

    return (
        <Badge variant="outline" className={cn('text-xs capitalize', className)}>
            {label}
        </Badge>
    )
}
