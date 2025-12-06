'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ghost, FileSpreadsheet, Inbox, ArrowRight } from "lucide-react"

const problems = [
    {
        title: "Spreadsheet Chaos",
        description: "Static rows don't tell the full story. Stop managing humans like inventory.",
        icon: FileSpreadsheet
    },
    {
        title: "Inbox Overload",
        description: "Resumes shouldn't get lost in email threads. Centralize every application.",
        icon: Inbox
    },
    {
        title: "Candidate Ghosting",
        description: "Slow processes lose top talent. Speed up your pipeline with automation.",
        icon: Ghost
    }
]

export function ProblemSection() {
    return (
        <section id="problem" className="py-24 bg-background border-b border-border/40">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
                            Designed for speed, <br />
                            <span className="text-muted-foreground">built for teams.</span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-lg">
                            Traditional tools are bloated and slow. HubHR strips away the complexity so you can focus on the people.
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {problems.map((item, index) => (
                            <div key={index} className="group flex items-start gap-4 p-4 rounded-lg hover:bg-muted/30 transition-colors">
                                <div className="mt-1 h-10 w-10 shrink-0 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg leading-none">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
