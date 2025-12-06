'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, Users, UserCheck, Calendar, Users2, Settings, Building2, Command, LayoutDashboard } from 'lucide-react'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar'
import { Icons } from '@/components/icons'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    orgId: string
}

export function AppSidebar({ orgId, ...props }: AppSidebarProps) {
    const pathname = usePathname()

    const items = [
        { title: 'Dashboard', url: `/${orgId}/dashboard`, icon: LayoutDashboard },
        { title: 'Jobs', url: `/${orgId}/jobs`, icon: Briefcase },
        { title: 'Candidates', url: `/${orgId}/candidates`, icon: Users },
        { title: 'Shortlist', url: `/${orgId}/shortlist`, icon: UserCheck },
        { title: 'Interviews', url: `/${orgId}/interviews`, icon: Calendar },
        { title: 'Team', url: `/${orgId}/team`, icon: Users2 },
        { title: 'AI Settings', url: `/${orgId}/ai-settings`, icon: Settings },
        { title: 'Org Settings', url: `/${orgId}/settings`, icon: Building2 },
    ]

    return (
        <Sidebar collapsible="icon" className="border-r" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={`/${orgId}/dashboard`}>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Icons.spinner className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left leading-tight">
                                    <span className="truncate font-semibold">HubHR</span>
                                    <span className="truncate text-xs">Hiring Platform</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {/* Footer content if needed */}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
