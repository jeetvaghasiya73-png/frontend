"use client";

import React, { useState, useEffect } from "react";
import { API_URL } from "@/lib/config";
import { Plus, Minus } from "lucide-react";
import SplitText from "@/components/animations/SplitText";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>([]);

  const fallbackFaqs = [
    {
      q: "What exactly is an AI Agent and how does it work?",
      a: "An AI Agent is an autonomous script or logic network powered by a large language model. Unlike standard linear chatbots, agents are equipped with a RAG knowledge base, computational tools, and API executors. They read context, make reasoning decisions, execute external functions (like searching databases or drafting emails), check their own errors, and complete complex multi-step workflows autonomously."
    },
    {
      q: "Do you build custom software integrations, or only automate existing tools?",
      a: "We do both. We regularly construct custom full-stack web software, React dashboards, databases, and scrape APIs from scratch using Next.js and FastAPI. We also build custom bridges and node pipelines between popular business platforms like HubSpot, Slack, Stripe, and Salesforce using platforms like n8n or direct webhook scripts."
    },
    {
      q: "How do you guarantee the security of our corporate data?",
      a: "We enforce high enterprise safety protocols. All databases utilize custom SSL certificates and encryptions. We isolate customer pipelines, host local AI models (such as Llama-3 or deepseek-coder) inside local private cloud instances (Ollama/vLLM) if you want to bypass external APIs, and enforce SOC2-compliant logging systems."
    },
    {
      q: "What is your standard delivery timeline for custom software?",
      a: "A standard workflow automation or API crawler is completed in 3 to 5 weeks. Fully custom SaaS products, multi-agent AI networks, or programmatic dashboard architectures usually take 6 to 10 weeks. This includes detailed discovery, visual layout designs, database integration, extensive QA testing, and edge network deployments."
    },
    {
      q: "Can we hire your developers for custom dedicated work?",
      a: "Yes. Our 'Dedicated AI Team' plan gives you direct access to a dedicated senior developer and designer working directly in your workspace Slack. This functions as an extension of your CTO office, enabling rapid sprints and continuous iterations."
    }
  ];

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/public/faqs`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setFaqs(data.map((f: any) => ({ q: f.question, a: f.answer })));
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch FAQs, using fallback", err);
      }
      setFaqs(fallbackFaqs);
    };
    fetchFaqs();
  }, []);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      className="py-32 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
        
        {/* Left column: Title */}
        <div className="lg:col-span-4 text-left lg:sticky lg:top-32 lg:h-[40vh]">
          <div className="inline-flex items-center gap-2 border border-border-custom bg-surface/50 px-3 py-1 rounded-full mb-6">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-custom">
              Knowledgebase
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            <SplitText text="Frequently Asked Questions." type="words" />
          </h2>
          <p className="text-sm md:text-base text-secondary-custom leading-relaxed max-w-sm">
            Can't find the answers you're looking for? Reach out to our engineers directly on our contact page.
          </p>
        </div>

        {/* Right column: Accordion List */}
        <div className="lg:col-span-8 flex flex-col gap-6 w-full">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border-b border-border-custom pb-6 transition-all duration-300"
              >
                {/* Question Trigger */}
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between text-left py-4 hover:text-accent-custom transition-colors duration-200 cursor-pointer focus:outline-none group"
                >
                  <h3 className="text-lg md:text-2xl font-bold tracking-tight text-foreground pr-8 group-hover:text-accent-custom transition-colors">
                    {faq.q}
                  </h3>
                  <div className="w-10 h-10 rounded-lg border border-border-custom bg-surface flex items-center justify-center text-foreground group-hover:border-accent-custom/50 shrink-0">
                    {isOpen ? (
                      <Minus className="w-4 h-4 text-accent-custom" />
                    ) : (
                      <Plus className="w-4 h-4 text-secondary-custom group-hover:text-accent-custom" />
                    )}
                  </div>
                </button>

                {/* Answer Content Panel */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen ? "max-h-[300px] opacity-100 mt-4" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-secondary-custom text-sm md:text-base leading-relaxed max-w-2xl pl-1">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
