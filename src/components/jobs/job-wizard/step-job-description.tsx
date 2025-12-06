'use client'

import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

interface StepJobDescriptionProps {
    data: {
        short_summary?: string
        responsibilities?: string
        requirements?: string
    }
    updateData: (data: any) => void
}

export function StepJobDescription({ data, updateData }: StepJobDescriptionProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">Job Description</h2>
                <p className="text-muted-foreground">Describe the role, responsibilities, and requirements in detail.</p>
            </div>

            <div className="space-y-8">
                <div className="grid gap-2">
                    <Label className="text-base">Job Brief</Label>
                    <p className="text-sm text-muted-foreground mb-1">A short summary of the role (displayed in list views).</p>
                    <RichTextEditor
                        value={data.short_summary || ''}
                        onChange={(val) => updateData({ short_summary: val })}
                        placeholder="We are looking for a..."
                        className="min-h-[120px]"
                    />
                </div>

                <div className="grid gap-2">
                    <Label className="text-base">Responsibilities</Label>
                    <RichTextEditor
                        value={data.responsibilities || ''}
                        onChange={(val) => updateData({ responsibilities: val })}
                        placeholder="List the key responsibilities..."
                        className="min-h-[200px]"
                    />
                </div>

                <div className="grid gap-2">
                    <Label className="text-base">Requirements and Skills</Label>
                    <RichTextEditor
                        value={data.requirements || ''}
                        onChange={(val) => updateData({ requirements: val })}
                        placeholder="List the required skills and qualifications..."
                        className="min-h-[200px]"
                    />
                </div>
            </div>
        </div>
    )
}
