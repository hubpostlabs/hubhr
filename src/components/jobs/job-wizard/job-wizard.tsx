'use client'

import { useState } from 'react'
import { StepsSidebar } from './steps-sidebar'
import { StepBasicInfo } from './step-basic-info'
import { StepJobDescription } from './step-job-description'
import { StepConfirmation } from './step-confirmation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, ChevronLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { CreateJobInput } from '@/types/jobs'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const STEPS = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'description', label: 'Job Description' },
    { id: 'confirmation', label: 'Confirmation' },
]

interface JobWizardProps {
    initialData: Partial<CreateJobInput> & {
        responsibilities?: string
        requirements?: string
        status?: 'draft' | 'published' | 'archived'
    }
    onSave: (data: any, status: 'draft' | 'published') => Promise<void>
    onBack?: () => void
    onDelete?: () => Promise<void>
}

export function JobWizard({ initialData, onSave, onBack, onDelete }: JobWizardProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [completedSteps, setCompletedSteps] = useState<number[]>([])
    const [formData, setFormData] = useState(initialData)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const updateData = (updates: any) => {
        setFormData(prev => ({ ...prev, ...updates }))
        // Clear errors for fields being updated
        const newErrors = { ...errors }
        Object.keys(updates).forEach(key => delete newErrors[key])
        setErrors(newErrors)
    }

    const validateStep = (stepIndex: number) => {
        const newErrors: Record<string, string> = {}
        let isValid = true

        if (stepIndex === 0) {
            if (!formData.title) {
                newErrors.title = "Job Title is required"
                isValid = false
            }
        }

        setErrors(newErrors)
        return isValid
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (!completedSteps.includes(currentStep)) {
                setCompletedSteps([...completedSteps, currentStep])
            }
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            toast.error("Please fix the errors before proceeding.")
        }
    }

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0))
    }

    const handlePublish = async () => {
        setIsSaving(true)
        try {
            // Re-merge specific fields if needed
            const finalData = {
                ...formData,
                // Combine responsibilities and requirements into content_md if not already handled
                // But for now we pass the raw pieces and let the parent handle the merge logic or we do it here.
                // WE SHOULD DO IT HERE to keep the parent clean
            }
            await onSave(finalData, 'published')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteClick = () => {
        setShowDeleteDialog(true)
    }

    const handleConfirmDelete = async () => {
        if (!onDelete) return

        setIsDeleting(true)
        setShowDeleteDialog(false)
        try {
            await onDelete()
        } finally {
            setIsDeleting(false)
        }
    }

    const isPublished = initialData.status === 'published'

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1200px] mx-auto pb-20">
            {/* Sidebar */}
            <StepsSidebar
                steps={STEPS}
                currentStepIndex={currentStep}
                onStepClick={(i) => setCurrentStep(i)}
                completedSteps={completedSteps}
            />

            {/* Main Content */}
            <div className="flex-1 bg-white rounded-2xl border shadow-sm min-h-[600px] flex flex-col">
                {/* Header (Mobile Only) */}
                <div className="lg:hidden p-4 border-b flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</span>
                    <span className="text-sm font-medium">{STEPS[currentStep].label}</span>
                </div>

                <div className="flex-1 p-6 lg:p-10">
                    {currentStep === 0 && <StepBasicInfo data={formData} updateData={updateData} errors={errors} />}
                    {currentStep === 1 && <StepJobDescription data={formData} updateData={updateData} />}
                    {currentStep === 2 && <StepConfirmation data={formData} onPublish={handlePublish} isPublishing={isSaving} />}
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t bg-zinc-50/50 flex items-center justify-between rounded-b-2xl">
                    <div className="flex gap-2">
                        {currentStep === 0 ? (
                            onBack && (
                                <Button variant="ghost" onClick={onBack} disabled={isSaving || isDeleting}>
                                    <ChevronLeft className="h-4 w-4 mr-2" /> Back
                                </Button>
                            )
                        ) : (
                            <Button variant="outline" onClick={handleBack} disabled={isSaving || isDeleting}>
                                Back
                            </Button>
                        )}

                        {onDelete && (
                            <Button
                                variant="ghost"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={handleDeleteClick}
                                disabled={isSaving || isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Job'}
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {!isPublished && (
                            <div className="mr-4 flex items-center">
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground"
                                    onClick={() => onSave(formData, 'draft')}
                                    disabled={isSaving || isDeleting || currentStep === 2}
                                >
                                    {isSaving ? 'Saving...' : 'Save Draft'}
                                </Button>
                            </div>
                        )}

                        {currentStep < STEPS.length - 1 ? (
                            <Button onClick={handleNext} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                                Next Step <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the job post and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete Job
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
