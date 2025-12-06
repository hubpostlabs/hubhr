'use client'

import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, LucideIcon } from 'lucide-react'

interface Step {
    id: string
    label: string
    icon?: LucideIcon
}

interface StepsSidebarProps {
    steps: Step[]
    currentStepIndex: number
    onStepClick: (index: number) => void
    completedSteps: number[]
}

export function StepsSidebar({ steps, currentStepIndex, onStepClick, completedSteps }: StepsSidebarProps) {
    return (
        <div className="w-64 shrink-0 hidden lg:block pr-8 sticky top-6 self-start">
            <div className="space-y-6">
                {steps.map((step, index) => {
                    const isCurrent = currentStepIndex === index
                    const isCompleted = completedSteps.includes(index)
                    const isClickable = isCompleted || index === currentStepIndex || index === Math.max(...completedSteps, -1) + 1

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "group flex items-center gap-3 py-2 transition-colors cursor-pointer",
                                !isClickable && "opacity-50 cursor-not-allowed pointer-events-none"
                            )}
                            onClick={() => isClickable && onStepClick(index)}
                        >
                            <div className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all",
                                isCompleted ? "bg-indigo-600/10 border-indigo-600 text-indigo-600" :
                                    isCurrent ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300 text-zinc-400"
                            )}>
                                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-xs font-medium">{index + 1}</span>}
                            </div>
                            <span className={cn(
                                "text-sm font-medium transition-colors",
                                isCurrent ? "text-zinc-900" : isCompleted ? "text-zinc-600" : "text-zinc-400"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
