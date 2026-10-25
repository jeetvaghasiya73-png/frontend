export interface FaqItem {
  question: string;
  answer: string;
}

export const faqsList: FaqItem[] = [
  {
    question: "What is the LeadFlow WhatsApp Automation Dashboard?",
    answer:
      "LeadFlow is an enterprise CRM and communication workspace designed to centralize outbound WhatsApp outreach, omni-channel conversation replies, interested prospect qualification, and sales telecalling desks into one interface.",
  },
  {
    question: "How does the WhatsApp outreach engine connect and send messages?",
    answer:
      "The outreach engine connects via direct QR device pairing ('Pair QR'). To protect phone accounts from spam flags, the dashboard enforces safe pacing quotas (such as 20 messages allowance per day), offers a Test Mode toggle with test send dispatch, and executes queued broadcasts via background worker runners ('▷ Start Worker').",
  },
  {
    question: "Can I import custom lead lists into the dashboard?",
    answer:
      "Yes. The Leads Database supports lead records from outbound scraped batches (with specific tags for Google Maps scraped pools), inbound web inquiries captured via website contact forms, and custom CSV imports and exports.",
  },
  {
    question: "How does the Unified Message Center manage conversations?",
    answer:
      "The Message Center is a two-pane omni-channel inbox where sales reps can switch between All Channels, WhatsApp, Website Inquiries, and Email Replies. Incoming conversations can be filtered by status tags such as Replied, Interested, Combined, or AI-triaged.",
  },
  {
    question: "How are 'Interested Leads' identified in the dashboard?",
    answer:
      "Instead of forcing sales agents to scroll through hundreds of silent threads, prospects who reply positively or engage with outreach are filtered into a dedicated 'Interested Leads' workspace with search by phone, business, city, or category, allowing reps to jump straight to action.",
  },
  {
    question: "How does the Sales Calling Desk integrate with WhatsApp leads?",
    answer:
      "Once a prospect is marked as interested, they can be pulled directly into the calling queue. Supervisors can generate queues for the entire team or assign individual telecallers, while agents monitor their dial progress and access the prior conversation context before picking up the phone.",
  },
  {
    question: "Does LeadFlow guarantee spam-free delivery or bypass WhatsApp rules?",
    answer:
      "No. LeadFlow does not bypass WhatsApp policies or encourage spam. The software includes real-time spam and block telemetry (tracking blocked vs reported counts) and enforces sensible daily pacing limits. Businesses are responsible for using the product in compliance with WhatsApp terms and local consent laws.",
  },
  {
    question: "When will the product launch and how can I get early access?",
    answer:
      "LeadFlow is currently in active private preview. Subscribing via our Early Access waitlist guarantees you priority notifications, private beta invitations, and early adopter onboarding assistance as soon as the launch rolls out.",
  },
];
