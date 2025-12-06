'use client'

import { Sparkles, LayoutDashboard, BarChart3, Users, Zap, Search } from 'lucide-react'

export function FeatureShowcase() {
    return (
        <section id="features" className="py-24 bg-background border-b border-border/40">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">Everything you need.</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Powerful features packaged in a clean, intuitive interface.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
                    {/* Large Card 1: AI */}
                    <div className="col-span-1 md:col-span-2 row-span-2 rounded-xl border bg-muted/20 p-8 flex flex-col justify-between hover:border-primary/20 transition-colors group">
                        <div className="space-y-2">
                            <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight">AI-Powered Job Descriptions</h3>
                            <p className="text-muted-foreground max-w-md">
                                Stop staring at a blank page. Generate professional, inclusive job postings in seconds with our advanced Gemini integration.
                            </p>
                        </div>
                        <div className="mt-8 rounded-lg border bg-background/50 h-48 w-full relative overflow-hidden">
                            {/* Abstract UI Mockup */}
                            <div className="absolute top-4 left-4 right-4 h-2 bg-muted rounded-full w-1/3 animate-pulse" />
                            <div className="absolute top-8 left-4 right-4 h-2 bg-muted/50 rounded-full w-2/3" />
                            <div className="absolute top-12 left-4 right-4 h-2 bg-muted/50 rounded-full w-1/2" />
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
                        </div>
                    </div>

                    {/* Small Card 2: Analytics */}
                    <div className="col-span-1 rounded-xl border bg-muted/20 p-6 flex flex-col hover:border-primary/20 transition-colors group">
                        <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold tracking-tight mb-2">Real-time Analytics</h3>
                        <p className="text-sm text-muted-foreground">
                            Track velocity and sources with beautiful accuracy.
                        </p>
                    </div>

                    {/* Small Card 3: Pipelines */}
                    <div className="col-span-1 rounded-xl border bg-muted/20 p-6 flex flex-col hover:border-primary/20 transition-colors group">
                        <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                            <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold tracking-tight mb-2">Visual Pipelines</h3>
                        <p className="text-sm text-muted-foreground">
                            Drag-and-drop candidates through custom stages.
                        </p>
                    </div>

                    {/* Wide Card 4: Team */}
                    <div className="col-span-1 md:col-span-3 rounded-xl border bg-muted/20 p-8 flex flex-col md:flex-row items-center gap-8 hover:border-primary/20 transition-colors group">
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center mb-4 shadow-sm inline-flex group-hover:scale-105 transition-transform">
                                <Users className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">Built for Collaboration</h3>
                            <p className="text-muted-foreground">
                                Invite your entire hiring team. Leave private notes, rate candidates asynchronously, and make decisions faster without endless meetings.
                            </p>
                        </div>
                        <div className="flex-1 flex items-center justify-center gap-4 opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                            <div className="h-12 w-12 rounded-full bg-red-100 border-2 border-background" />
                            <div className="h-12 w-12 rounded-full bg-blue-100 border-2 border-background -ml-6" />
                            <div className="h-12 w-12 rounded-full bg-green-100 border-2 border-background -ml-6" />
                            <div className="h-12 w-12 rounded-full bg-yellow-100 border-2 border-background -ml-6 flex items-center justify-center text-xs font-bold text-yellow-700">+4</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
