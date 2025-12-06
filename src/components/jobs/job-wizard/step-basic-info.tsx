'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreateJobInput } from '@/types/jobs'
import { LayoutDashboard, Users, MapPin, Briefcase } from 'lucide-react'

interface StepBasicInfoProps {
    data: Partial<CreateJobInput>
    updateData: (data: Partial<CreateJobInput>) => void
    errors?: Record<string, string>
}

export function StepBasicInfo({ data, updateData, errors }: StepBasicInfoProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">Basic Information</h2>
                <p className="text-muted-foreground">This information will be displayed publicly to candidates.</p>
            </div>

            <div className="space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="title" className="flex items-center gap-2">
                        Job Title <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <LayoutDashboard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="title"
                            placeholder="e.g. Senior Product Designer"
                            className="pl-9 h-11"
                            value={data.title}
                            onChange={(e) => updateData({ title: e.target.value })}
                        />
                    </div>
                    {errors?.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="role" className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" /> Role Level
                        </Label>
                        <Input
                            id="role"
                            placeholder="e.g. Senior, Manager, L5"
                            className="h-11"
                            value={data.role}
                            onChange={(e) => updateData({ role: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="team" className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" /> Department / Team
                        </Label>
                        <Input
                            id="team"
                            placeholder="e.g. Design, Engineering"
                            className="h-11"
                            value={data.team}
                            onChange={(e) => updateData({ team: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="location" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" /> Location
                        </Label>
                        <Input
                            id="location"
                            placeholder="e.g. San Francisco, CA"
                            className="h-11"
                            value={data.location}
                            onChange={(e) => updateData({ location: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Employment Type</Label>
                        <Select
                            value={data.employment_type}
                            onValueChange={(val) => updateData({ employment_type: val })}
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Full-time">Full-time</SelectItem>
                                <SelectItem value="Part-time">Part-time</SelectItem>
                                <SelectItem value="Contract">Contract</SelectItem>
                                <SelectItem value="Internship">Internship</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    )
}
