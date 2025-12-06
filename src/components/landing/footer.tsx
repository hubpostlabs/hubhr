import Link from "next/link"

export function Footer() {
    return (
        <footer className="py-12 bg-muted/20 border-t">
            <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="flex aspect-square size-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs">
                        H
                    </div>
                    <span className="font-bold tracking-tight">HubHR</span>
                </div>

                <div className="flex gap-8 text-sm text-muted-foreground">
                    <Link href="#" className="hover:text-foreground">Terms</Link>
                    <Link href="#" className="hover:text-foreground">Privacy</Link>
                    <Link href="#" className="hover:text-foreground">Twitter</Link>
                </div>

                <div className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} HubHR Inc.
                </div>
            </div>
        </footer>
    )
}
