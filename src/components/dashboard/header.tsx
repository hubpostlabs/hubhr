'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from '@/actions/user'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronsUpDown, LogOut, Plus, User } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Separator } from '../ui/separator'

interface HeaderProps {
    user: any
    currentOrg: any
    userOrgs: any[]
}

export function Header({ user, currentOrg, userOrgs }: HeaderProps) {
    const router = useRouter()

    const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U'
    const orgInitials = currentOrg?.name?.substring(0, 2).toUpperCase() || 'OR'

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-6 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" onClick={() => router.push(`/${currentOrg.id}/dashboard`)}>
                        {currentOrg.name}
                    </span>
                    <span className="text-muted-foreground/40">/</span>
                    <span className="text-foreground">Dashboard</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Org Switcher - Minimalist */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed font-normal text-muted-foreground hover:bg-transparent hover:border-solid hover:text-foreground transition-all">
                            <Avatar className="h-4 w-4 rounded-sm">
                                <AvatarFallback className="rounded-sm text-[8px]">{orgInitials}</AvatarFallback>
                            </Avatar>
                            <span className="max-w-[100px] truncate">{currentOrg.name}</span>
                            <ChevronsUpDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Organization</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {userOrgs.map((org) => (
                            <DropdownMenuItem key={org.id} onClick={() => router.push(`/${org.id}/dashboard`)} className="cursor-pointer">
                                <span className={cn("text-sm", org.id === currentOrg.id ? "font-medium" : "")}>{org.name}</span>
                                {org.id === currentOrg.id && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/organization')} className="cursor-pointer text-muted-foreground">
                            <Plus className="mr-2 h-3 w-3" />
                            Create New
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Profile - Minimalist */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                            <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{userInitials}</AvatarFallback>
                            </Avatar>
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.email?.split('@')[0]}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" disabled>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" disabled>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
