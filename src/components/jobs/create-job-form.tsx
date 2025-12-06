'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createJob, generateJobDescription, updateJob, deleteJob } from '@/actions/jobs'
import { toast } from 'sonner'
import { Loader2, Wand2, FileText, ArrowLeft, Sparkles, LayoutTemplate, CheckCircle2, Bot } from 'lucide-react'
import { CreateJobInput, Job } from '@/types/jobs'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import { JobWizard } from './job-wizard/job-wizard'

export function CreateJobForm({ org, initialData }: { org: any, initialData?: Job }) {
    const router = useRouter()
    const [mode, setMode] = useState<'select' | 'ai' | 'manual'>(initialData ? 'manual' : 'select')
    const [isLoading, setIsLoading] = useState(false)

    const [aiPrompt, setAiPrompt] = useState({
        title: '',
        role: '',
        requirements: '',
    })

    // Basic manual fields
    const [formData, setFormData] = useState<Partial<CreateJobInput>>({
        title: initialData?.title || '',
        team: initialData?.team || '',
        role: initialData?.role || '',
        content_md: initialData?.content_md || '',
        location: initialData?.location || org.location || '',
        status: initialData?.status || 'draft',
        employment_type: initialData?.employment_type || ''
    })

    async function handleAiGenerate() {
        setIsLoading(true)
        try {
            const result = await generateJobDescription({
                ...aiPrompt,
                orgName: org.name,
                orgLocation: org.location
            })
            setFormData({
                title: aiPrompt.title,
                role: aiPrompt.role,
                team: 'Engineering', // Mock
                short_summary: result.short_summary,
                content_md: result.content_md,
                required_skills: result.required_skills,
                location: org.location || 'Remote',
                status: 'draft'
            })
            setMode('manual')
            toast.success("Job generated! Review and publish.")
        } catch (e) {
            toast.error("Failed to generate job")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleSave(status: 'draft' | 'published') {
        setIsLoading(true)
        try {
            let res;
            if (initialData) {
                res = await updateJob(initialData.id, org.id, { ...formData, status })
            } else {
                res = await createJob(org.id, {
                    ...formData,
                    title: formData.title || 'Untitled Job',
                    status
                } as CreateJobInput)
            }

            if (res.error) {
                toast.error(res.error as any)
            } else {
                toast.success(`Job ${status === 'published' ? 'published' : 'saved'}`)
                router.push(`/${org.id}/jobs`)
            }
        } catch (e) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    // --- SELECTION MODE ---
    if (mode === 'select') {
        return (
            <div className="w-full max-w-[1600px] mx-auto mt-8 px-4">
                <div className="grid lg:grid-cols-2 gap-8 h-[600px]">
                    {/* AI Card */}
                    <div
                        className="group relative cursor-pointer overflow-hidden rounded-3xl border bg-white p-10 shadow-sm transition-all hover:shadow-xl hover:border-indigo-500/50"
                        onClick={() => setMode('ai')}
                    >
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-indigo-50 blur-3xl transition-all group-hover:bg-indigo-100/70" />

                        <div className="relative z-10 flex h-full flex-col justify-between">
                            <div>
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm ring-1 ring-indigo-500/20 group-hover:scale-110 transition-transform">
                                    <Sparkles className="h-8 w-8" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-4">Generate with AI</h2>
                                <p className="text-lg text-zinc-500 leading-relaxed max-w-md">
                                    Provide a simple prompt and let our AI draft a comprehensive job description, requirements, and summary for you in seconds.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-indigo-600 font-medium mt-8">
                                <span>Try AI Generator</span>
                                <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </div>

                    {/* Manual Card */}
                    <div
                        className="group relative cursor-pointer overflow-hidden rounded-3xl border bg-white p-10 shadow-sm transition-all hover:shadow-xl hover:border-zinc-400/50"
                        onClick={() => setMode('manual')}
                    >
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-zinc-50 blur-3xl transition-all group-hover:bg-zinc-100/70" />

                        <div className="relative z-10 flex h-full flex-col justify-between">
                            <div>
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 shadow-sm ring-1 ring-zinc-500/20 group-hover:scale-110 transition-transform">
                                    <LayoutTemplate className="h-8 w-8" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-4">Start from Blank</h2>
                                <p className="text-lg text-zinc-500 leading-relaxed max-w-md">
                                    Use our clean markdown editor to craft your job post from scratch. Perfect if you have existing content to paste.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-600 font-medium mt-8">
                                <span>Use Blank Template</span>
                                <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // --- AI INPUT MODE ---
    if (mode === 'ai') {
        return (
            <div className="w-full max-w-[1600px] mx-auto grid lg:grid-cols-[1fr_400px] gap-8 mt-6 px-4 items-start">
                <div className="space-y-6">
                    <Button variant="ghost" onClick={() => setMode('select')} className="-ml-3 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">AI Assistant</h2>
                        <p className="text-lg text-muted-foreground">Tell us about the role you're hiring for.</p>
                    </div>

                    <Card className="border-indigo-100 shadow-md">
                        <CardContent className="p-8 space-y-8">
                            <div className="grid gap-3">
                                <Label className="text-base font-medium">Job Title</Label>
                                <Input
                                    className="h-12 text-lg bg-zinc-50/50"
                                    placeholder="e.g. Senior Frontend Engineer"
                                    value={aiPrompt.title}
                                    onChange={e => setAiPrompt({ ...aiPrompt, title: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label className="text-base font-medium">Role Level / Seniority</Label>
                                <Input
                                    className="h-12 text-lg bg-zinc-50/50"
                                    placeholder="e.g. Lead, L5, Mid-Level"
                                    value={aiPrompt.role}
                                    onChange={e => setAiPrompt({ ...aiPrompt, role: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label className="text-base font-medium">Key Requirements & Tech Stack</Label>
                                <Textarea
                                    className="min-h-[150px] text-base resize-none bg-zinc-50/50"
                                    placeholder="e.g. React, TypeScript, Next.js, Team Leadership, User Empathy..."
                                    value={aiPrompt.requirements}
                                    onChange={e => setAiPrompt({ ...aiPrompt, requirements: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">Comma separated or natural language both work.</p>
                            </div>

                            <div className="pt-4">
                                <Button
                                    onClick={handleAiGenerate}
                                    disabled={isLoading || !aiPrompt.title}
                                    size="lg"
                                    className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-lg h-12 shadow-indigo-200 shadow-lg"
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
                                    Generate Description
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side Info */}
                <div className="hidden lg:block space-y-6 pt-16">
                    <div className="rounded-2xl bg-indigo-50 p-6">
                        <div className="flex items-center gap-3 mb-4 text-indigo-700 font-semibold">
                            <Bot className="h-6 w-6" />
                            <span>What our AI does</span>
                        </div>
                        <ul className="space-y-4">
                            {['Generates a professional summary', 'Structures responsibilities clearly', 'Suggests relevant skills tags', 'Formats with clean Markdown'].map((item, i) => (
                                <li key={i} className="flex gap-3 text-indigo-900/80">
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-500" />
                                    <span className="text-sm font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

    // --- MANUAL / WIZARD MODE ---

    // Helper to parse content_md into sections
    const parseContent = (content: string) => {
        const sections = {
            responsibilities: '',
            requirements: ''
        }
        if (!content) return sections

        const parts = content.split('## Requirements')
        if (parts.length > 1) {
            sections.requirements = parts[1].trim()
            // Remove "## Responsibilities" from the first part if it exists there
            const respParts = parts[0].split('## Responsibilities')
            sections.responsibilities = respParts.length > 1 ? respParts[1].trim() : respParts[0].trim()
        } else {
            // Try just splitting responsibilities if requirements missing
            const respParts = content.split('## Responsibilities')
            sections.responsibilities = respParts.length > 1 ? respParts[1].trim() : content
        }
        return sections
    }

    // Helper to merge sections into content_md
    const mergeContent = (data: any) => {
        let md = ''
        if (data.responsibilities) {
            md += `## Responsibilities\n\n${data.responsibilities}\n\n`
        }
        if (data.requirements) {
            md += `## Requirements\n\n${data.requirements}`
        }
        return md
    }

    const { responsibilities, requirements } = parseContent(formData.content_md || '')

    // Initial data for wizard, merging parsed markdown sections
    const wizardInitialData = {
        ...formData,
        responsibilities,
        requirements,
        // Ensure apply_fields is potentially parsed if it comes from DB (it might be in formData already)
        apply_fields: Array.isArray(formData.apply_fields) ? formData.apply_fields :
            typeof formData.apply_fields === 'string' ? JSON.parse(formData.apply_fields) :
                [{ id: '1', question: 'Resume', type: 'file', required: true }] // Default fallback if empty
    }


    const handleWizardSave = async (data: any, status: 'draft' | 'published') => {
        setIsLoading(true)
        try {
            const content_md = mergeContent(data)

            // Clean up data for submission
            const submissionData = {
                ...data,
                content_md,
                status,
                // Ensure number types if schema requires, though it seems text mostly
            }

            // Remove temp fields
            delete submissionData.responsibilities
            delete submissionData.requirements

            let res;
            if (initialData) {
                res = await updateJob(initialData.id, org.id, submissionData)
            } else {
                res = await createJob(org.id, {
                    ...submissionData,
                    title: submissionData.title || 'Untitled Job',
                } as CreateJobInput)
            }

            if (res.error) {
                toast.error(res.error as any)
            } else {
                toast.success(`Job ${status === 'published' ? 'published' : 'saved'}`)
                router.push(`/${org.id}/jobs`)
            }
        } catch (e) {
            toast.error("Something went wrong")
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }




    const handleWizardDelete = async () => {
        if (!initialData?.id || !org?.id) return

        setIsLoading(true)
        try {
            const res = await deleteJob(initialData.id, org.id)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Job deleted")
                router.push(`/${org.id}/jobs`)
            }
        } catch (e) {
            toast.error("Failed to delete job")
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="w-full min-h-screen bg-zinc-50/30">
            <div className="w-full max-w-[1600px] mx-auto pt-6 px-4">
                <JobWizard
                    initialData={wizardInitialData}
                    onSave={handleWizardSave}
                    onBack={() => setMode('select')}
                    onDelete={initialData?.id ? handleWizardDelete : undefined}
                />
            </div>
        </div>
    )
}
