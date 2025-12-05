'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, UploadCloud, FileText } from 'lucide-react'
import { submitApplication } from '@/actions/submissions'
import { cn } from '@/lib/utils'

export function JobApplicationForm({ orgName, jobId }: { orgName: string, jobId: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        formData.append('job_id', jobId)

        try {
            const result = await submitApplication(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                setIsSuccess(true)
                toast.success('Application submitted successfully!')
            }
        } catch (e) {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name)
        }
    }

    if (isSuccess) {
        return (
            <div className="bg-white rounded-2xl border border-green-100 shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 ring-8 ring-green-50/50">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">Application Received!</h3>
                    <p className="text-gray-500">
                        Thanks for applying to <span className="font-semibold text-gray-900">{orgName}</span>.
                        We have sent a confirmation email to you.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-gray-100/50 overflow-hidden sticky top-24">
            <div className="p-6 sm:p-8 space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Apply for this position</h3>
                    <p className="text-sm text-gray-500 mt-1">Submit your application to {orgName}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div className="grid gap-1.5 group">
                            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-gray-500 group-focus-within:text-indigo-600 transition-colors">
                                Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                placeholder="e.g. Alex Morgan"
                                className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                            />
                        </div>

                        <div className="grid gap-1.5 group">
                            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-500 group-focus-within:text-indigo-600 transition-colors">
                                Email Address <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="name@example.com"
                                className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                            />
                        </div>

                        <div className="grid gap-1.5 group">
                            <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-gray-500 group-focus-within:text-indigo-600 transition-colors">
                                Phone Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                placeholder="+1 (555) 000-0000"
                                className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="resume" className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                                Resume <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative group">
                                <Input
                                    id="resume"
                                    name="resume"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    required
                                    onChange={handleFileChange}
                                    className="hidden" // Hide default input
                                />
                                <Label
                                    htmlFor="resume"
                                    className={cn(
                                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
                                        fileName
                                            ? "border-indigo-200 bg-indigo-50/50"
                                            : "border-gray-200 bg-gray-50 hover:bg-white hover:border-indigo-300"
                                    )}
                                >
                                    {fileName ? (
                                        <div className="flex flex-col items-center text-indigo-600 animate-in fade-in zoom-in">
                                            <FileText className="w-8 h-8 mb-2" />
                                            <span className="text-sm font-medium px-4 text-center break-all">{fileName}</span>
                                            <span className="text-xs text-indigo-400 mt-1">Click to change</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-500">
                                            <UploadCloud className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform duration-200 text-gray-400 group-hover:text-indigo-500" />
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">Click to upload resume</span>
                                            <span className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (Max 5MB)</span>
                                        </div>
                                    )}
                                </Label>
                            </div>
                        </div>

                        <div className="grid gap-1.5 group">
                            <Label htmlFor="cover" className="text-xs font-semibold uppercase tracking-wider text-gray-500 group-focus-within:text-indigo-600 transition-colors">
                                Cover Letter (Optional)
                            </Label>
                            <Textarea
                                id="cover"
                                name="cover"
                                placeholder="Tell us why you're a great fit..."
                                className="min-h-[100px] resize-none bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Application"}
                    </Button>

                    <p className="text-xs text-center text-gray-400">
                        By applying, you agree to our <a href="#" className="underline hover:text-gray-600">Privacy Policy</a> and <a href="#" className="underline hover:text-gray-600">Terms</a>.
                    </p>
                </form>
            </div>
        </div>
    )
}
