// This file wraps the sidebar provider. 
// We can inject theme or specific props here if needed.
'use client'

import { SidebarProvider } from '@/components/ui/sidebar'

export function DashboardSidebarProvider({ children }: { children: React.ReactNode }) {
    // Using defaultOpen={true} to replicate Shopify's always-visible sidebar preference usually
    return (
        <SidebarProvider defaultOpen={true}>
            {children}
        </SidebarProvider>
    )
}
