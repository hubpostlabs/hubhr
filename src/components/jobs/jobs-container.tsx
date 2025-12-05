'use client'

import { useState, useMemo } from 'react'
import { JobWithStats } from '@/types/jobs'
import { JobsFilter } from './jobs-filter'
import { GroupedJobList } from './grouped-job-list'

interface JobsContainerProps {
    initialJobs: JobWithStats[]
    orgId: string
}

export function JobsContainer({ initialJobs, orgId }: JobsContainerProps) {
    const [search, setSearch] = useState('')
    const [teamFilter, setTeamFilter] = useState<string>('all')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // Extract unique teams and roles for filters
    const teams = useMemo(() => Array.from(new Set(initialJobs.map(j => j.team).filter(Boolean))) as string[], [initialJobs])
    const roles = useMemo(() => Array.from(new Set(initialJobs.map(j => j.role).filter(Boolean))) as string[], [initialJobs])

    // Filter Logic
    const filteredJobs = useMemo(() => {
        return initialJobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
                (job.team?.toLowerCase().includes(search.toLowerCase()))
            const matchesTeam = teamFilter === 'all' || job.team === teamFilter
            const matchesRole = roleFilter === 'all' || job.role === roleFilter
            const matchesStatus = statusFilter === 'all' || job.status === statusFilter

            return matchesSearch && matchesTeam && matchesRole && matchesStatus
        })
    }, [initialJobs, search, teamFilter, roleFilter, statusFilter])

    return (
        <div className="flex flex-col gap-6">
            <JobsFilter
                search={search} onSearchChange={setSearch}
                team={teamFilter} onTeamChange={setTeamFilter} teams={teams}
                role={roleFilter} onRoleChange={setRoleFilter} roles={roles}
                status={statusFilter} onStatusChange={setStatusFilter}
            />
            <GroupedJobList jobs={filteredJobs} />
        </div>
    )
}
