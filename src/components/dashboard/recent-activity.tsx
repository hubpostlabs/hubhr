import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RecentActivityProps {
    activity: {
        id: string
        candidateName: string
        jobTitle: string
        appliedAt: string
        status: string
    }[]
}

export function RecentActivity({ activity }: RecentActivityProps) {
    return (
        <Card className="col-span-3 shadow-sm">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    Latest applications received.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {activity.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
                    ) : (
                        activity.map((item) => (
                            <div key={item.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{item.candidateName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{item.candidateName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Applied for {item.jobTitle}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-xs text-muted-foreground">
                                    {new Date(item.appliedAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
