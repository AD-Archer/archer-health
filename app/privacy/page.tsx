import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-white font-display">A</span>
            </div>
            <span className="text-xl font-bold font-display">Archer Health</span>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/landing">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="container py-12 max-w-4xl">
        <Card>
          <CardContent className="pt-6 prose prose-slate max-w-none">
            <h1 className="text-4xl font-bold font-display mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 2024</p>

            <h2 className="text-2xl font-semibold font-display mt-8 mb-4">1. Information We Collect</h2>
            <p>At Archer Health, we collect information that you provide directly to us, including:</p>
            <ul>
              <li>Account information (name, email, password)</li>
              <li>Health and fitness data (weight, calorie intake, exercise logs)</li>
              <li>Dietary preferences and goals</li>
              <li>Usage data and analytics</li>
            </ul>

            <h2 className="text-2xl font-semibold font-display mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your experience and provide tailored recommendations</li>
              <li>Track your progress toward health goals</li>
              <li>Send you updates, notifications, and support messages</li>
              <li>Analyze usage patterns to enhance our platform</li>
            </ul>

            <h2 className="text-2xl font-semibold font-display mt-8 mb-4">3. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information, including:</p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Secure authentication protocols</li>
              <li>Limited access to personal data by authorized personnel only</li>
            </ul>

            <h2 className="text-2xl font-semibold font-display mt-8 mb-4">4. Data Sharing</h2>
            <p>We do not sell your personal information. We may share your data only in the following circumstances:</p>
            <ul>
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>With service providers who assist in operating our platform</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>

            <h2 className="text-2xl font-semibold font-display mt-8 mb-4">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access and download your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
              <li>Request data portability</li>
            </ul>

            <h2 className="text-2xl font-semibold font-display mt-8 mb-4">6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience, analyze usage, and provide
              personalized content. You can control cookie preferences through your browser settings.
            </p>

            <h2 className="text-2xl font-semibold font-display mt-8 mb-4">7. Children's Privacy</h2>
            <p>
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13.
            </p>

            <h2 className="text-2xl font-semibold font-display mt-8 mb-4">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-semibold font-display mt-8 mb-4">9. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p>
              Email: antonioarcher.dev@gmail.com
              <br />
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
