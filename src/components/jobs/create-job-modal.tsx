'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createJob, generateJobDescription } from '@/actions/jobs'
import { toast } from 'sonner'
import { Loader2, Wand2 } from 'lucide-react'
import { CreateJobInput } from '@/types/jobs'

interface CreateJobModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    orgId: string
}

export function CreateJobModal({ open, onOpenChange, orgId }: CreateJobModalProps) {
    const [tab, setTab] = useState('ai')
    const [isLoading, setIsLoading] = useState(false)
    const [aiPrompt, setAiPrompt] = useState({
        title: '',
        requirements: '',
        role: '',
        tone: 'Professional'
    })

    // Basic manual fields
    const [formData, setFormData] = useState<Partial<CreateJobInput>>({
        title: '',
        team: '',
        role: '',
        content_md: ''
    })

    async function handleAiGenerate() {
        setIsLoading(true)
        try {
            const result = await generateJobDescription(aiPrompt)
            setFormData({
                title: aiPrompt.title,
                role: aiPrompt.role,
                team: 'Engineering', // Mock
                short_summary: result.short_summary,
                content_md: result.content_md,
                required_skills: result.required_skills
            })
            setTab('preview') // Switch to preview/edit mode
        } catch (e) {
            toast.error("Failed to generate job")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleSave(status: 'draft' | 'published') {
        setIsLoading(true)
        try {
            const res = await createJob(orgId, {
                ...formData,
                title: formData.title || 'Untitled Job',
                status
            } as CreateJobInput)

            if (res.error) {
                toast.error("Error creating job")
                console.error(res.error)
            } else {
                toast.success(`Job ${status === 'published' ? 'published' : 'saved as draft'}`)
                onOpenChange(false)
            }
        } catch (e) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Job</DialogTitle>
                </DialogHeader>

                <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ai">AI Generator</TabsTrigger>
                        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai" className="space-y-4 py-4">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Job Title</Label>
                                <Input placeholder="e.g. Senior React Developer" value={aiPrompt.title} onChange={e => setAiPrompt({ ...aiPrompt, title: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Role/Level</Label>
                                <Input placeholder="e.g. Senior IC" value={aiPrompt.role} onChange={e => setAiPrompt({ ...aiPrompt, role: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Key Requirements & Skills</Label>
                                <Textarea placeholder="List the must-haves..." value={aiPrompt.requirements} onChange={e => setAiPrompt({ ...aiPrompt, requirements: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleAiGenerate} disabled={isLoading || !aiPrompt.title} className="gap-2">
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                <Wand2 className="h-4 w-4" />
                                Generate with AI
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="manual" className="space-y-4 py-4">
                        <ManualForm formData={formData} setFormData={setFormData} />
                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={() => handleSave('draft')} disabled={isLoading}>Save Draft</Button>
                            <Button onClick={() => handleSave('published')} disabled={isLoading}>Publish</Button>
                        </DialogFooter>
                    </TabsContent>

                    <TabsContent value="preview" className="space-y-4 py-4">
                        <div className="p-4 bg-muted/30 rounded-md border">
                            <h3 className="font-semibold mb-2">Review & Edit</h3>
                            <ManualForm formData={formData} setFormData={setFormData} />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => handleSave('draft')} disabled={isLoading}>Save Draft</Button>
                            <Button onClick={() => handleSave('published')} disabled={isLoading}>Publish</Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

function ManualForm({ formData, setFormData }: { formData: any, setFormData: any }) {
    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Team</Label>
                    <Input value={formData.team} onChange={e => setFormData({ ...formData, team: e.target.value })} />
                </div>
                <div className="grid gap-2">
                    <Label>Role</Label>
                    <Input value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                </div>
            </div>
            <div className="grid gap-2">
                <Label>Description (Markdown)</Label>
                <Textarea className="min-h-[200px] font-mono text-sm" value={formData.content_md} onChange={e => setFormData({ ...formData, content_md: e.target.value })} />
            </div>
        </div>
    )
}
