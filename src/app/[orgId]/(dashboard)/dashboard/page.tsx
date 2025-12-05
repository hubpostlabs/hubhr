import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, Calendar, ArrowUpRight } from 'lucide-react'

export default async function DashboardPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

    return (
        <div className="flex flex-col gap-8">
            {/* Greeting Section */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Bonjour, {userName} 👋</h1>
                <p className="text-muted-foreground">Here's what's happening at your organization today.</p>
            </div>

            {/* Quick Stats / Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Candidates</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">248</div>
                        <p className="text-xs text-muted-foreground">+18% from last month</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Scheduled for today</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area: Recent Activity & Quick Actions */}
            <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            You have 3 unread notifications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">New candidate applied for "Senior React Dev"</p>
                                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-sm border-dashed">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks you might want to perform.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Button variant="outline" className="justify-start gap-2 h-12" disabled>
                            <Plus className="h-4 w-4" />
                            Post a New Job
                        </Button>
                        <Button variant="outline" className="justify-start gap-2 h-12" disabled>
                            <Users className="h-4 w-4" />
                            Add Team Member
                        </Button>
                        <Button variant="outline" className="justify-start gap-2 h-12" disabled>
                            <Calendar className="h-4 w-4" />
                            Schedule Interview
                        </Button>
                    </CardContent>
                </Card>
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
