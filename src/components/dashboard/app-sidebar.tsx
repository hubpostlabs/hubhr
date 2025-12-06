'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, Users, UserCheck, Calendar, Users2, Settings, Building2, Command } from 'lucide-react'

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
        { title: 'Jobs', url: `/${orgId}/jobs`, icon: Briefcase },
        { title: 'Candidates', url: `/${orgId}/candidates`, icon: Users },
        { title: 'Shortlist', url: `/${orgId}/shortlist`, icon: UserCheck },
        { title: 'Interviews', url: `/${orgId}/interviews`, icon: Calendar },
        { title: 'Team', url: `/${orgId}/team`, icon: Users2 },
    ]

    const settingsItems = [
        { title: 'AI Settings', url: `/${orgId}/ai-settings`, icon: Settings },
        { title: 'Org Settings', url: `/${orgId}/settings`, icon: Building2 },
    ]

    return (
        <Sidebar collapsible="icon" className="border-r border-zinc-200/80" {...props}>
            <SidebarHeader className="border-b border-zinc-200/80 h-16">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent data-[state=open]:bg-transparent">
                            <Link href={`/${orgId}/dashboard`} className="gap-3">
                                <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm">
                                    <Icons.spinner className="size-5" />
                                </div>
                                <div className="grid flex-1 text-left leading-tight">
                                    <span className="truncate font-bold text-[15px] text-zinc-900">HubHR</span>
                                    <span className="truncate text-xs text-zinc-500">Hiring Platform</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="px-2 py-4">
                <SidebarGroup className="px-0">
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname.startsWith(item.url)}
                                        tooltip={item.title}
                                        className="h-9 px-3 font-medium text-[13px] text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 data-[active=true]:bg-zinc-900 data-[active=true]:text-white data-[active=true]:hover:bg-zinc-900 data-[active=true]:hover:text-white rounded-md transition-all"
                                    >
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="size-[18px]" strokeWidth={2} />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="h-px bg-zinc-200 my-3 mx-2" />

                <SidebarGroup className="px-0">
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
                            {settingsItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname.startsWith(item.url)}
                                        tooltip={item.title}
                                        className="h-9 px-3 font-medium text-[13px] text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 data-[active=true]:bg-zinc-900 data-[active=true]:text-white data-[active=true]:hover:bg-zinc-900 data-[active=true]:hover:text-white rounded-md transition-all"
                                    >
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="size-[18px]" strokeWidth={2} />
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
                {/* Footer content if needed, e.g. User Profile could go here if moving from Header */}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
