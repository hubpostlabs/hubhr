import { createClient } from '@/lib/supabase/server'
import { getApplicationStats, getDashboardStats, getRecentActivity } from '@/actions/dashboard'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { OverviewChart } from '@/components/dashboard/overview-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { Button } from '@/components/ui/button'
import { Plus, Users, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

    // Fetch dashboard data in parallel
    const [stats, appStats, recentActivity] = await Promise.all([
        getDashboardStats(orgId),
        getApplicationStats(orgId),
        getRecentActivity(orgId)
    ])

    return (
        <div className="flex flex-col gap-8">
            {/* Greeting Section */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Bonjour, {userName} 👋</h1>
                <p className="text-muted-foreground">Here's what's happening at your organization today.</p>
            </div>

            {/* Quick Stats / Overview */}
            <StatsCards stats={stats} />

            {/* Main Content Area: Charts & Activity */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <OverviewChart data={appStats} />
                <RecentActivity activity={recentActivity} />
            </div>

            {/* Quick Actions - Keeping this for now as user requested interactive elements */}
            <div className="grid gap-4 md:grid-cols-3">
                <Link href={`/${orgId}/jobs/new`}>
                    <Button variant="outline" className="w-full justify-start gap-2 h-12">
                        <Plus className="h-4 w-4" />
                        Post a New Job
                    </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start gap-2 h-12" disabled>
                    <Users className="h-4 w-4" />
                    Add Team Member (Soon)
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-12" disabled>
                    <Calendar className="h-4 w-4" />
                    Schedule Interview (Soon)
                </Button>
            </div>
        </div>
    )
}

function BriefcaseIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}
