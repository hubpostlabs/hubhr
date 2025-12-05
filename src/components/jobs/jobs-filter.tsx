'use client'

import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

interface JobsFilterProps {
    search: string
    onSearchChange: (val: string) => void
    team: string
    onTeamChange: (val: string) => void
    teams: string[]
    role: string
    onRoleChange: (val: string) => void
    roles: string[]
    status: string
    onStatusChange: (val: string) => void
}

export function JobsFilter({
    search, onSearchChange,
    team, onTeamChange, teams,
    role, onRoleChange, roles,
    status, onStatusChange
}: JobsFilterProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search jobs..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8 bg-white"
                />
            </div>
            <Select value={team} onValueChange={onTeamChange}>
                <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teams.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
            </Select>

            <Select value={role} onValueChange={onRoleChange}>
                <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
            </Select>

            <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
