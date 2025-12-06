'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function FloatingHeader() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header
            className={cn(
                "fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 transition-all duration-300 w-[95%] max-w-6xl rounded-sm",
                scrolled
                    ? "bg-background/80 backdrop-blur-md border shadow-sm"
                    : "bg-background/40 backdrop-blur-sm border border-transparent"
            )}
        >
            <div className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background">
                    <span className="font-bold text-lg">H</span>
                </div>
                <span className="font-bold text-xl tracking-tight">HubHR</span>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
                <Link href="#problem" className="hover:text-foreground transition-colors">Solutions</Link>
                <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            </nav>

            <div className="flex items-center gap-4">
                <Link href="/auth/login" className="text-sm font-medium hover:underline underline-offset-4">
                    Sign In
                </Link>
                <Link href="/organization">
                    <Button>Get Started</Button>
                </Link>
            </div>
        </header>
    )
}
