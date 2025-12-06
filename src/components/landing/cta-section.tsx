'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CtaSection() {
    return (
        <section className="py-24 bg-background border-t border-border/40">
            <div className="container px-4 md:px-6 mx-auto text-center space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">Ready to fix your hiring?</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Join thousands of teams who have switched from spreadsheets to HubHR.
                    Start your free 14-day trial today.
                </p>
                <div className="pt-4">
                    <Link href="/organization">
                        <Button size="lg" className="h-12 px-8 text-base rounded-md">
                            Get Started for Free
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
