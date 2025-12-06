import { ComingSoon } from '@/components/coming-soon'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <ComingSoon
                title="Page Not Found"
                description="The page you are looking for does not exist or has been moved."
                variant="not-found"
                backUrl="/"
            />
        </div>
    )
}
