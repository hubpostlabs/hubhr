'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Rocket, Construction } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ComingSoonProps {
    title?: string
    description?: string
    variant?: 'coming-soon' | 'not-found'
    backUrl?: string
}

export function ComingSoon({
    title = "Coming Soon",
    description = "We're working hard to bring you this feature. Stay tuned!",
    variant = 'coming-soon',
    backUrl
}: ComingSoonProps) {
    const router = useRouter()

    const Icon = variant === 'coming-soon' ? Rocket : Construction

    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-lg border-dashed">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                        <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-8">
                    {backUrl ? (
                        <Link href={backUrl}>
                            <Button variant="outline" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <Button variant="outline" onClick={() => router.back()} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
