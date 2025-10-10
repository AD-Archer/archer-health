"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MessageCircle, Mail, Book, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"

interface HelpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<"faq" | "contact">("faq")
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [includeContactInfo, setIncludeContactInfo] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })

  // Update form data when includeContactInfo changes
  useEffect(() => {
    if (includeContactInfo && user) {
      setFormData(prev => ({
        ...prev,
        name: user.fullName || user.firstName || "",
        email: user.primaryEmailAddress?.emailAddress || ""
      }))
    } else if (!includeContactInfo) {
      setFormData(prev => ({
        ...prev,
        name: "",
        email: ""
      }))
    }
  }, [includeContactInfo, user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.subject || !formData.message) {
      toast.error("Please fill in subject and message")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Message sent successfully! We'll get back to you soon.")
        // Reset form
        setFormData({
          name: includeContactInfo && user ? (user.fullName || user.firstName || "") : "",
          email: includeContactInfo && user ? (user.primaryEmailAddress?.emailAddress || "") : "",
          subject: "",
          message: ""
        })
        // Close modal
        onOpenChange(false)
      } else {
        toast.error(data.error || "Failed to send message. Please try again.")
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error("Failed to send message. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const faqs = [
    {
      question: "How do I log my meals?",
      answer:
        "Navigate to the Log page and tap the '+' button. Search for foods or create custom entries. Select the meal type (breakfast, lunch, dinner, or snack) and add the food to your diary.",
    },
    {
      question: "How do I set my calorie goals?",
      answer:
        "Go to the Goals page and tap 'Add New Goal'. You can set custom calorie targets, macro goals, and activity goals based on your health objectives.",
    },
    {
      question: "Can I create custom foods?",
      answer:
        "Yes! When adding a meal, tap 'Create Custom Food' and enter the nutritional information. Your custom foods will be saved for future use.",
    },
    {
      question: "How do I track my water intake?",
      answer:
        "On the Dashboard, you'll see a water tracking widget. Tap the '+' button to log glasses of water throughout the day.",
    },
    {
      question: "What is the difference between goals and progress?",
      answer:
        "Goals let you set targets for weight, calories, and activity. Progress shows your historical data and trends over time with charts and analytics.",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-display">Help & Support</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "faq" ? "default" : "outline"}
            onClick={() => setActiveTab("faq")}
            className="flex-1"
          >
            <Book className="w-4 h-4 mr-2" />
            FAQs
          </Button>
          <Button
            variant={activeTab === "contact" ? "default" : "outline"}
            onClick={() => setActiveTab("contact")}
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Us
          </Button>
        </div>

        <ScrollArea className="max-h-[500px] pr-4">
          {activeTab === "faq" ? (
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Email Support</h4>
                    <p className="text-sm text-muted-foreground">antonioarcher.dev@gmail.com</p>
                    <p className="text-xs text-muted-foreground mt-1">We typically respond within 24 hours</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="name">Name <span className="text-muted-foreground">(optional)</span></Label>
                    <Input 
                      id="name" 
                      placeholder="Your name (optional)" 
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email <span className="text-muted-foreground">(optional)</span></Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="your@email.com (optional)" 
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="What do you need help with?"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Describe your issue or question..." 
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    required
                  />
                </div>
                
                {user && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeContact" 
                      checked={includeContactInfo}
                      onCheckedChange={(checked) => setIncludeContactInfo(checked as boolean)}
                    />
                    <Label htmlFor="includeContact" className="text-sm">
                      Include my contact information (name and email)
                    </Label>
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
