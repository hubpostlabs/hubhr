'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export function CreateJobButton({ orgId }: { orgId: string }) {
    return (
        <Button asChild className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Link href={`/${orgId}/jobs/new`}>
                <Plus className="h-4 w-4" />
                Create Job
            </Link>
        </Button>
    )
}
