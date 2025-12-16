"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="flex items-center justify-center min-h-[50vh] p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-6 w-6" />
                        <CardTitle>Something went wrong!</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        We encountered an error while loading this brand. This might be a temporary issue.
                    </p>
                    {process.env.NODE_ENV === "development" && (
                        <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                            {error.message}
                        </pre>
                    )}
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button onClick={reset} variant="default">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try again
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/brands">Back to Brands</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
