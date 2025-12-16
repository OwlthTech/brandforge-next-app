"use client"

import * as React from "react"

interface Breadcrumb {
    label: string
    href?: string
}

interface BreadcrumbContextValue {
    breadcrumbs: Breadcrumb[]
    setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void
}

const BreadcrumbContext = React.createContext<BreadcrumbContextValue | null>(null)

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
    const [breadcrumbs, setBreadcrumbs] = React.useState<Breadcrumb[]>([])

    return (
        <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
            {children}
        </BreadcrumbContext.Provider>
    )
}

export function useBreadcrumbs() {
    const context = React.useContext(BreadcrumbContext)
    if (!context) {
        throw new Error("useBreadcrumbs must be used within a BreadcrumbProvider")
    }
    return context
}

/**
 * Hook to set breadcrumbs for the current page.
 * Call this in your page component to update the header breadcrumbs.
 * 
 * @example
 * useSetBreadcrumbs([
 *   { label: "Brands", href: "/brands" },
 *   { label: "My Brand" }
 * ])
 */
export function useSetBreadcrumbs(breadcrumbs: Breadcrumb[]) {
    const { setBreadcrumbs } = useBreadcrumbs()

    React.useEffect(() => {
        setBreadcrumbs(breadcrumbs)
        // Cleanup: reset breadcrumbs when component unmounts
        return () => setBreadcrumbs([])
    }, [JSON.stringify(breadcrumbs), setBreadcrumbs])
}

export type { Breadcrumb }
