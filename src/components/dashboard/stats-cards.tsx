import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BriefcaseIcon, Users, Calendar } from 'lucide-react'

interface DashboardStatsProps {
    stats: {
        activeJobs: number
        totalCandidates: number
        activeInterviews: number
    }
}

export function StatsCards({ stats }: DashboardStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                    <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activeJobs}</div>
                    <p className="text-xs text-muted-foreground">Currently published</p>
                </CardContent>
            </Card>
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalCandidates}</div>
                    <p className="text-xs text-muted-foreground">Across all jobs</p>
                </CardContent>
            </Card>
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Interviews</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activeInterviews}</div>
                    <p className="text-xs text-muted-foreground">Scheduled or in-progress</p>
                </CardContent>
            </Card>
        </div>
    )
}
