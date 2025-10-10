'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const { user } = useUser()
  const [includeContactInfo, setIncludeContactInfo] = useState(false)

  useEffect(() => {
    // Report error to admin in production
    if (process.env.NODE_ENV === 'production') {
      reportErrorToAdmin(error, includeContactInfo)
    }

    // Log error details
    console.error('Application Error:', error)
  }, [error, includeContactInfo])

  const reportErrorToAdmin = async (error: Error, includeContact: boolean) => {
    try {
      const userInfo = includeContact && user ? `
User Information:
-----------------
Name: ${user.fullName || user.firstName || 'Anonymous'}
${user.primaryEmailAddress?.emailAddress ? `Email: ${user.primaryEmailAddress.emailAddress}` : ''}
`.trim() : ''

      const errorReport = {
        subject: 'Archer Health - Application Error Report',
        message: `
Application Error Report
========================

Time: ${new Date().toISOString()}
Environment: Production
User Agent: ${typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}

${userInfo}
Error Details:
--------------
Name: ${error.name}
Message: ${error.message}
Stack: ${error.stack}

Error Digest: ${(error as any).digest || 'N/A'}

Please investigate this error immediately.
        `,
        name: 'Archer Health Error Reporter',
        email: 'system@archerhealth.com'
      }

      await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      })
    } catch (reportError) {
      console.error('Failed to report error to admin:', reportError)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-display">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We encountered an unexpected error. Our team has been notified and is working to fix this issue.
          </p>

          {user && (
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <Checkbox 
                id="includeContact" 
                checked={includeContactInfo}
                onCheckedChange={(checked) => setIncludeContactInfo(checked as boolean)}
              />
              <Label htmlFor="includeContact" className="text-sm">
                Include my contact information (name and email) in the error report
              </Label>
            </div>
          )}

          {process.env.NODE_ENV === 'development' && (
            <div className="bg-muted p-3 rounded-lg text-left">
              <p className="text-sm font-medium mb-2">Error Details (Development Only):</p>
              <p className="text-xs text-muted-foreground font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            If this problem persists, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}