'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle2, FileText, Globe } from 'lucide-react'

interface StepConfirmationProps {
    data: any
    onPublish: () => void
    isPublishing: boolean
}

export function StepConfirmation({ data, onPublish, isPublishing }: StepConfirmationProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-10">
            <div className="flex justify-center mb-6">
                <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
                <h2 className="text-3xl font-bold tracking-tight">Ready to Publish?</h2>
                <p className="text-muted-foreground text-lg">
                    You've completed all the steps. Review your job post one last time before making it live.
                </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-6">
                <div className="p-4 border rounded-xl bg-zinc-50 w-64 text-left space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {data.title || 'Untitled Job'}
                    </div>
                    <div className="text-xs text-muted-foreground ml-6">
                        {data.location || 'Remote'} • {data.employment_type || 'Full-time'}
                    </div>
                </div>
            </div>

            <div className="pt-8 flex justify-center gap-4">
                <Button
                    size="lg"
                    className="h-12 px-8 text-base gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                    onClick={onPublish}
                    disabled={isPublishing}
                >
                    {isPublishing ? 'Publishing...' : (
                        <>
                            <Globe className="h-4 w-4" /> Publish Job Now
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
