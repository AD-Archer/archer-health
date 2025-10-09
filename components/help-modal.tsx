"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MessageCircle, Mail, Book } from "lucide-react"
import { useState } from "react"

interface HelpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<"faq" | "contact">("faq")

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
                    <p className="text-sm text-muted-foreground">support@archerhealth.com</p>
                    <p className="text-xs text-muted-foreground mt-1">We typically respond within 24 hours</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What do you need help with?" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Describe your issue or question..." rows={5} />
                </div>
                <Button className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
