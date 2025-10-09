import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Target, TrendingUp, Users, Utensils, Activity, Award, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  const features = [
    {
      icon: Utensils,
      title: "Smart Meal Tracking",
      description: "Log your meals effortlessly with our extensive food database and custom meal builder.",
    },
    {
      icon: Target,
      title: "Personalized Goals",
      description: "Set and track custom calorie, macro, and activity goals tailored to your needs.",
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Visualize your journey with detailed charts and insights into your health trends.",
    },
    {
      icon: Activity,
      title: "Workout Logging",
      description: "Track your exercises and see how they contribute to your overall health goals.",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with others on similar health journeys for motivation and tips.",
    },
    {
      icon: Award,
      title: "Achievements",
      description: "Celebrate milestones and stay motivated with our achievement system.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-white font-display">A</span>
            </div>
            <span className="text-xl font-bold font-display">Archer Health</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium hover:text-primary">
              Log In
            </Link>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold font-display text-balance">
              Your Journey to Better Health Starts Here
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Track calories, log meals, monitor progress, and achieve your health goals with Archer Health - your
              all-in-one wellness companion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4 flex items-center justify-center">
              <Image
                src="/banner.webp"
                alt="Archer Health App"
                width={600}
                height={300}
                className="rounded-xl object-cover w-full h-auto max-h-[300px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Everything You Need to Succeed</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you track, analyze, and achieve your health goals.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title}>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold font-display mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Get started in three simple steps</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Create Your Profile",
              description: "Sign up and set your health goals, dietary preferences, and activity level.",
            },
            {
              step: "2",
              title: "Track Your Progress",
              description: "Log meals, workouts, and daily activities to monitor your journey.",
            },
            {
              step: "3",
              title: "Achieve Your Goals",
              description: "Use insights and analytics to stay on track and reach your targets.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold font-display flex items-center justify-center mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold font-display mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold font-display">Ready to Transform Your Health?</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of users who are already achieving their health goals with Archer Health.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-lg font-bold text-white font-display">A</span>
                </div>
                <span className="font-bold font-display">Archer Health</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your all-in-one wellness companion for a healthier lifestyle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-primary">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-primary">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 Archer Health. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
