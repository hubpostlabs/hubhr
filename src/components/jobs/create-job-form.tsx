'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createJob, generateJobDescription, updateJob } from '@/actions/jobs'
import { toast } from 'sonner'
import { Loader2, Wand2, FileText, ArrowLeft, Sparkles, LayoutTemplate, CheckCircle2, Bot } from 'lucide-react'
import { CreateJobInput, Job } from '@/types/jobs'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

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

    // --- MANUAL / EDITOR MODE (Split View) ---
    return (
        <div className="w-full h-[calc(100vh-140px)] flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {mode === 'manual' && formData.title ? formData.title : 'New Job Post'}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        {formData.status === 'draft' ? 'Draft - Unsaved changes' : 'Published'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => setMode('select')} className="text-muted-foreground hover:text-foreground">
                        Discard
                    </Button>
                    <div className="h-6 w-px bg-border mx-1" />
                    <Button
                        variant="outline"
                        onClick={() => handleSave('draft')}
                        disabled={isLoading || formData.status === 'draft'}
                    >
                        {formData.status === 'draft' ? 'Saved as Draft' : 'Save Draft'}
                    </Button>
                    <Button
                        onClick={() => handleSave('published')}
                        disabled={isLoading || formData.status === 'published'}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                    >
                        {formData.status === 'published' ? 'Published' : 'Publish Now'}
                    </Button>
                </div>
            </div>

            {/* Main Editor Area - Split View */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 min-h-0">

                {/* Left Column: Inputs */}
                <div className="flex flex-col gap-6 overflow-y-auto pr-4 pb-10">
                    <Card className="border-0 shadow-none bg-transparent">
                        <CardContent className="p-0 space-y-6">
                            {/* Core Info */}
                            <div className="space-y-4 p-5 bg-white rounded-xl border shadow-sm">
                                <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                                    <FileText className="h-4 w-4" /> Core Details
                                </h3>
                                <div className="grid gap-4">
                                    <div className="grid gap-1.5">
                                        <Label>Job Title</Label>
                                        <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="font-medium" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-1.5">
                                            <Label>Team</Label>
                                            <Input value={formData.team} onChange={e => setFormData({ ...formData, team: e.target.value })} />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label>Role</Label>
                                            <Input value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-1.5">
                                            <Label>Location</Label>
                                            <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label>Employment Type</Label>
                                            <Input value={formData.employment_type} onChange={e => setFormData({ ...formData, employment_type: e.target.value })} placeholder="Full-time" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Editor */}
                            <div className="flex flex-col flex-1 p-5 bg-white rounded-xl border shadow-sm h-full">
                                <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider mb-4">
                                    <LayoutTemplate className="h-4 w-4" /> Description
                                </h3>
                                <div className="flex-1">
                                    <Textarea
                                        className="min-h-[500px] h-full font-mono text-sm leading-relaxed border-zinc-200 resize-none focus-visible:ring-indigo-500"
                                        value={formData.content_md}
                                        onChange={e => setFormData({ ...formData, content_md: e.target.value })}
                                        placeholder="# Role Summary..."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Preview */}
                <div className="hidden lg:flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="border-b bg-zinc-50/50 px-4 py-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            Live Preview
                            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px]">Mobile Ready</span>
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 prose prose-zinc max-w-none dark:prose-invert">
                        {/* Header Preview */}
                        <div className="mb-8 border-b pb-6 not-prose">
                            <h1 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900">{formData.title || "Job Title"}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{formData.team || "Team"}</span>
                                <span>•</span>
                                <span>{formData.location || "Location"}</span>
                                <span>•</span>
                                <span>{formData.employment_type || "Type"}</span>
                            </div>
                        </div>

                        {formData.content_md ? (
                            <ReactMarkdown>
                                {formData.content_md}
                            </ReactMarkdown>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground italic">
                                Start typing description to preview...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
