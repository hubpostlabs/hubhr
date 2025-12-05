import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { Header } from '@/components/dashboard/header'
import { getUserOrganizations } from '@/actions/organizations'
import { SidebarInset } from '@/components/ui/sidebar'
import { DashboardSidebarProvider } from '@/components/dashboard/dashboard-provider'

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ orgId: string }>
}) {
    const { orgId } = await params
    const supabase = await createClient()

    // 1. Verify User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/auth/login')
    }

    // 2. Fetch User's Orgs
    const orgsResult = await getUserOrganizations()
    if (orgsResult.error || !orgsResult.data) {
        redirect('/auth/login')
    }

    const userOrgs: any[] = orgsResult.data

    // 3. Verify Access to Current Org
    const currentOrg = userOrgs.find((org) => org.id === orgId)
    if (!currentOrg) {
        if (userOrgs.length > 0) {
            redirect(`/${userOrgs[0].id}/dashboard`)
        } else {
            redirect('/organization')
        }
    }

    return (
        <DashboardSidebarProvider>
            <AppSidebar orgId={orgId} />
            <SidebarInset>
                <Header user={user} currentOrg={currentOrg} userOrgs={userOrgs} />
                <div className="flex flex-1 flex-col gap-4 p-2 lg:gap-6 lg:p-4 bg-sidebar">
                    <div className="w-full bg-white h-full p-6 shadow-xs">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </DashboardSidebarProvider>
    )
}
