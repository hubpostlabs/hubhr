'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createOrganization, getUserOrganizations } from '@/actions/organizations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Icons } from '@/components/icons'

// Steps: 0 = Org Selection/Intro, 1 = Name, 2 = Location, 3 = Industry

export default function OnboardingPage() {
    const router = useRouter()
    // If user has orgs, show step 0 (list), else default to step 1 (create intro)
    // We'll determine this in useEffect
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [fetchingOrgs, setFetchingOrgs] = useState(true)
    const [existingOrgs, setExistingOrgs] = useState<any[]>([])

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        industry: ''
    })

    useEffect(() => {
        const fetchOrgs = async () => {
            setFetchingOrgs(true)
            const result = await getUserOrganizations()
            if (result.data && result.data.length > 0) {
                setExistingOrgs(result.data)
                setStep(0) // Show list
            } else {
                setStep(1) // Go directly to create
            }
            setFetchingOrgs(false)
        }
        fetchOrgs()
    }, [])

    // Basic validation
    const isStepValid = () => {
        if (step === 1) return formData.name.length >= 2
        if (step === 2) return formData.location.length > 0
        if (step === 3) return formData.industry.length > 0
        return false
    }

    const handleNext = async () => {
        if (step < 3) {
            setStep(step + 1)
        } else {
            // Submit
            setLoading(true)
            try {
                const result = await createOrganization(formData)
                if (result.error) {
                    toast.error(result.error)
                } else if (result.data) {
                    toast.success('Organization created successfully!')
                    router.push(`/${result.data.id}/dashboard`)
                }
            } catch (error) {
                toast.error('Something went wrong')
            } finally {
                setLoading(false)
            }
        }
    }

    const handleBack = () => {
        // If we have existing orgs, we can go back to step 0 from step 1
        if (existingOrgs.length > 0) {
            if (step > 0) setStep(step - 1)
        } else {
            // If no existing orgs, step 1 is the first step, so can't go back
            if (step > 1) setStep(step - 1)
        }
    }

    if (fetchingOrgs) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>
                        {step === 0 && "Your Organizations"}
                        {step === 1 && "What's your company called?"}
                        {step === 2 && "Where are you located?"}
                        {step === 3 && "What's your industry?"}
                    </CardTitle>
                    <CardDescription>
                        {step === 0 ? "Select an organization to continue or create a new one." : `Step ${step} of 3`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {step === 0 && (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                {existingOrgs.map((org) => (
                                    <Button
                                        key={org.id}
                                        variant="outline"
                                        className="justify-start h-auto py-3 px-4"
                                        onClick={() => router.push(`/${org.id}/dashboard`)}
                                    >
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="font-semibold">{org.name}</span>
                                            <span className="text-xs text-muted-foreground">{org.role}</span>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                                </div>
                            </div>
                            <Button className="w-full" onClick={() => setStep(1)}>
                                Create New Organization
                            </Button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input
                                id="name"
                                placeholder="Acme Inc."
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && isStepValid() && handleNext()}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="San Francisco, CA"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && isStepValid() && handleNext()}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Input
                                id="industry"
                                placeholder="Technology, Healthcare, etc."
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && isStepValid() && handleNext()}
                            />
                        </div>
                    )}
                </CardContent>
                {step > 0 && (
                    <CardFooter className="flex justify-between">
                        <Button variant="ghost" onClick={handleBack} disabled={loading}>
                            Back
                        </Button>
                        <Button onClick={handleNext} disabled={!isStepValid() || loading}>
                            {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            {step === 3 ? 'Create Organization' : 'Next'}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
