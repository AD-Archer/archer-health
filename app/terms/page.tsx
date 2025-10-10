import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-background">
			<header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
				<div className="container flex h-16 items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
							<span className="text-2xl font-bold text-white font-display">
								A
							</span>
						</div>
						<span className="text-xl font-bold font-display">
							Archer Health
						</span>
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
						<h1 className="text-4xl font-bold font-display mb-2">
							Terms of Service
						</h1>
						<p className="text-muted-foreground mb-8">
							Last updated: January 2024
						</p>

						<h2 className="text-2xl font-semibold font-display mt-8 mb-4">
							1. Acceptance of Terms
						</h2>
						<p>
							By accessing and using Archer Health, you accept and agree to be
							bound by the terms and provisions of this agreement. If you do not
							agree to these terms, please do not use our services.
						</p>

						<h2 className="text-2xl font-semibold font-display mt-8 mb-4">
							2. Use of Service
						</h2>
						<p>
							Archer Health provides health and fitness tracking services. You
							agree to use the service only for lawful purposes and in
							accordance with these Terms of Service.
						</p>
						<p>You agree not to:</p>
						<ul>
							<li>Use the service in any way that violates applicable laws</li>
							<li>Impersonate or attempt to impersonate another user</li>
							<li>
								Interfere with or disrupt the service or servers connected to
								the service
							</li>
							<li>
								Attempt to gain unauthorized access to any portion of the
								service
							</li>
						</ul>

						<h2 className="text-2xl font-semibold font-display mt-8 mb-4">
							3. User Accounts
						</h2>
						<p>
							To use certain features of the service, you must create an
							account. You are responsible for:
						</p>
						<ul>
							<li>
								Maintaining the confidentiality of your account credentials
							</li>
							<li>All activities that occur under your account</li>
							<li>Notifying us immediately of any unauthorized use</li>
							<li>Providing accurate and complete information</li>
						</ul>

						<h2 className="text-2xl font-semibold font-display mt-8 mb-4">
							4. Health Disclaimer
						</h2>
						<p>
							Archer Health is not a substitute for professional medical advice,
							diagnosis, or treatment. Always seek the advice of your physician
							or other qualified health provider with any questions you may have
							regarding a medical condition.
						</p>
						<p>
							The information provided through our service is for informational
							purposes only and should not be relied upon as medical advice.
						</p>

						<h2 className="text-2xl font-semibold font-display mt-8 mb-4">
							5. Subscription and Payment
						</h2>
						<p>
							Some features of Archer Health require a paid subscription. By
							purchasing a subscription, you agree to:
						</p>
						<ul>
							<li>Pay all fees associated with your subscription</li>
							<li>
								Automatic renewal unless cancelled before the renewal date
							</li>
							<li>
								Our refund policy as stated in your subscription agreement
							</li>
						</ul>

						<h2 className="text-2xl font-semibold font-display mt-8 mb-4">
							6. Intellectual Property
						</h2>
						<p>
							The service and its original content, features, and functionality
							are owned by Archer Health and are protected by international
							copyright, trademark, patent, trade secret, and other intellectual
							property laws.
						</p>

						<h2 className="text-2xl font-semibold font-display mt-8 mb-4">
							7. User Content
						</h2>
						<p>
							You retain ownership of any content you submit to the service. By
							submitting content, you grant us a worldwide, non-exclusive,
							royalty-free license to use, reproduce, and display your content
							in connection with the service.
						</p>

						<h2 className="text-2xl font-semibold font-display mt-8 mb-4">
							8. Termination
						</h2>
						<p>
							We may terminate or suspend your account and access to the service
							immediately, without prior notice, for any reason, including
							breach of these Terms of Service.
						</p>

						<h2 className="text-2xl font-semibold font-display mt-8 mb-4">
							9. Limitation of Liability
						</h2>
						<p>
							In no event shall Archer Health be liable for any indirect,
							incidental, special, consequential, or punitive damages resulting
							from your use of or inability to use the service.
						</p>

						<h2 className="text-2xl font-semibold font-display mt-8 mb-4">
							10. Changes to Terms
						</h2>
						<p>
							We reserve the right to modify these terms at any time. We will
							notify users of any material changes by posting the new Terms of
							Service on this page.
						</p>

						<h2 className="text-2xl font-semibold font-display mt-8 mb-4">
							11. Contact Information
						</h2>
						<p>
							If you have any questions about these Terms of Service, please
							contact us:
						</p>
						<p>
							Email: antonioarcher.dev@gmail.com
							<br />
						</p>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
