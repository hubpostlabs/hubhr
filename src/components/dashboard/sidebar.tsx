'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import { Briefcase, Users, UserCheck, Calendar, Users2, Settings, Building2 } from 'lucide-react'

interface SidebarProps {
    orgId: string
}

export function Sidebar({ orgId }: SidebarProps) {
    const pathname = usePathname()

    const links = [
        { name: 'Jobs', href: `/${orgId}/jobs`, icon: Briefcase },
        { name: 'Candidates', href: `/${orgId}/candidates`, icon: Users },
        { name: 'Shortlist', href: `/${orgId}/shortlist`, icon: UserCheck },
        { name: 'Interviews', href: `/${orgId}/interviews`, icon: Calendar },
        { name: 'Team', href: `/${orgId}/team`, icon: Users2 },
        { name: 'AI Settings', href: `/${orgId}/ai-settings`, icon: Settings },
        { name: 'Org Settings', href: `/${orgId}/settings`, icon: Building2 },
    ]

    return (
        <div className="flex h-full w-64 flex-col border-r bg-zinc-50/40 dark:bg-zinc-900/40">
            <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6 border-b border-transparent">
                <Link href={`/${orgId}/dashboard`} className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                    <div className="rounded-md bg-primary/10 p-1">
                        <Icons.spinner className="h-5 w-5 text-primary" />
                    </div>
                    <span className="tracking-tight">HubHR</span>
                </Link>
            </div>
            <div className="flex-1 py-4">
                <nav className="grid items-start px-3 text-sm font-medium lg:px-4 space-y-1">
                    {links.map((link) => {
                        const isActive = pathname.startsWith(link.href)
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200",
                                    isActive
                                        ? "bg-zinc-200/50 text-zinc-900 dark:bg-zinc-800/50 dark:text-zinc-50 font-medium"
                                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800/50"
                                )}
                            >
                                <link.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-zinc-400 dark:text-zinc-500")} />
                                {link.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}
