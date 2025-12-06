'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden border-b border-border/40">
            {/* Grid Background */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
            </div>

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="flex flex-col items-center text-center space-y-8">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                        Reimagining Recruitment
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter max-w-5xl mx-auto leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70">
                        Hiring is chaotic. <br className="hidden md:block" />
                        HubHR makes it <span className="text-foreground">ordered.</span>
                    </h1>

                    <p className="max-w-2xl leading-normal text-muted-foreground sm:text-lg sm:leading-8 mx-auto tracking-tight">
                        The all-in-one recruitment platform for modern teams.
                        Track candidates, automate scheduling, and collaborate in real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Link href="/organization">
                            <Button size="lg" className="h-10 px-8 text-sm font-medium gap-2 w-full sm:w-auto rounded-md">
                                Start Hiring <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="#demo">
                            <Button variant="outline" size="lg" className="h-10 px-8 text-sm font-medium w-full sm:w-auto rounded-md">
                                View Demo
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-8 pt-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        <span className="flex items-center gap-1">No credit card required</span>
                        <span className="flex items-center gap-1">14-day free trial</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
