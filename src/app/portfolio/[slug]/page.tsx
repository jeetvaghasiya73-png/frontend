"use client";

import React, { use, useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import { ArrowLeft, ExternalLink, Calendar, Layers, ShieldCheck, CheckCircle } from "lucide-react";

export default function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fallbackProjects: Record<string, any> = {
    "apex-lead-automator": {
      title: "Apex Lead Automator",
      client: "Apex Growth",
      description: "A custom outbound automated system generating over 50k monthly leads with OpenAI routing and custom scraping triggers.",
      image: "from-blue-600/30 to-purple-800/30",
      services_used: ["AI Automation", "OpenAI APIs", "Lead Generation"],
      year: 2025,
      url: "https://apex-growth.com",
      challenge: "Apex Growth spent over 120 manual hours weekly mapping, clean-filtering, and scraping outbound targets across 4 platforms, experiencing a 15% duplicate entry rate in Salesforce.",
      solution: "Nexora AI engineered a headless n8n pipeline containing OpenAI GPT-4o intelligence nodes. The system scrapes lead tables, matches profiles, performs real-time deduplication, and appends validated records to Salesforce. Running on a secure VPS, it performs 24/7 with zero human intervention.",
      results: [
        "Eliminated 100% of duplicate outbound lead inputs",
        "Generated over 55,000 leads in the first month",
        "Saved 120+ hours of manual data entry weekly",
        "Decreased lead routing latency to under 3 seconds"
      ]
    },
    "vortex-agent-support-node": {
      title: "Vortex Agent Support Node",
      client: "Vortex Analytics",
      description: "An agentic helpdesk solution that queries secure databases using vector index lookups and coordinates appointments.",
      image: "from-purple-900/30 to-indigo-950/30",
      services_used: ["AI Agents", "LangGraph", "Vector Indexing"],
      year: 2026,
      url: "https://vortex-analytics.com",
      challenge: "Vortex Analytics support agents experienced high ticket latency when indexing internal documents and databases, resulting in customer drop-offs and high support costs.",
      solution: "We designed a multi-agent helpdesk coordinator using LangGraph. The coordinator parses customer intents, maps queries to vector database embeddings (Pinecone), retrieves exact documents, and initiates actions (appointment scheduling) via APIs. Support tickets are resolved instantly.",
      results: [
        "Reduced average ticket response time by 92%",
        "Successfully answered 84% of queries without escalation",
        "Indexed over 10,000 product reference documents",
        "Integrated secure vector embedding indexes"
      ]
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/portfolio/`);
        if (response.ok) {
          const data = await response.json();
          const found = data.find((p: any) => p.slug === slug);
          if (found) {
            setProject({
              title: found.title,
              client: found.client,
              description: found.description,
              image: found.image || "from-blue-600/30 to-purple-800/30",
              services_used: found.services_used || [],
              year: found.year || 2025,
              url: found.url || "",
              challenge: found.challenge || "The client required an automated structure to handle operational bottlenecks, reduce manual entry overhead, and synchronize lead intelligence files.",
              solution: found.solution || `Nexora AI constructed an end-to-end orchestration pipeline. By routing data through clean middleware layers and integrating custom LLM nodes, we automated manual processing tasks and established reliable monitoring channels.`,
              results: found.results || [
                "Streamlined operations workflow loops",
                "Automated document classification and database entries",
                "Saved dozens of manual team execution hours",
                "Minimized routing errors and latency spikes"
              ]
            });
          } else {
            setProject(fallbackProjects[slug] || fallbackProjects["apex-lead-automator"]);
          }
        } else {
          setProject(fallbackProjects[slug] || fallbackProjects["apex-lead-automator"]);
        }
      } catch (err) {
        console.error("Fetch error, using fallback case study details", err);
        setProject(fallbackProjects[slug] || fallbackProjects["apex-lead-automator"]);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent-custom border-t-transparent animate-spin" />
        <span className="font-mono text-xs text-[#B0B0B0]">Loading case study...</span>
      </div>
    );
  }

  if (!project) return null;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background pt-32 pb-24 text-left">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          {/* Back Button */}
          <a
            href="/portfolio"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-secondary-custom hover:text-accent-custom transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Case Studies
          </a>

          {/* Title Header */}
          <div className="max-w-3xl mb-16">
            <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-3">
              Case Study Details
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
              {project.title}
            </h1>
            <p className="text-sm md:text-base text-secondary-custom leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Cover gradient */}
          <div className={`w-full h-[320px] md:h-[450px] rounded-3xl bg-gradient-to-tr ${project.image} border border-border-custom relative overflow-hidden mb-20 flex items-center justify-center`}>
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
          </div>

          {/* Metadata & Case Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            {/* Left Side: Metadata Panel */}
            <div className="lg:col-span-4 border border-border-custom bg-surface/30 backdrop-blur-md rounded-2xl p-8 space-y-8 text-left">
              <div>
                <span className="text-[9px] font-mono font-bold tracking-widest text-[#666666] uppercase block mb-1">
                  Client Partner
                </span>
                <span className="text-sm font-bold text-white block">
                  {project.client}
                </span>
              </div>

              <div>
                <span className="text-[9px] font-mono font-bold tracking-widest text-[#666666] uppercase block mb-2">
                  Metadata Parameters
                </span>
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center gap-3 text-secondary-custom font-medium">
                    <Calendar className="w-4 h-4 text-accent-custom shrink-0" />
                    <span>Project Year: {project.year}</span>
                  </div>
                  <div className="flex items-center gap-3 text-secondary-custom font-medium">
                    <Layers className="w-4 h-4 text-accent-custom shrink-0" />
                    <span>Scope: Enterprise Engine</span>
                  </div>
                  <div className="flex items-center gap-3 text-secondary-custom font-medium">
                    <ShieldCheck className="w-4 h-4 text-accent-custom shrink-0" />
                    <span>Compliance: Secure Auth & VPS</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-mono font-bold tracking-widest text-[#666666] uppercase block mb-3">
                  Services Utilized
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.services_used.map((srv: string, sIdx: number) => (
                    <span
                      key={sIdx}
                      className="text-[9px] font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded text-[#D0D0D0]"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-accent-custom hover:text-white py-3.5 rounded-lg transition-all shadow"
                >
                  Visit Client Site
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Right Side: Case Narratives */}
            <div className="lg:col-span-8 space-y-12 text-left">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">
                  The Challenge
                </h3>
                <p className="text-xs md:text-sm text-secondary-custom leading-relaxed font-medium">
                  {project.challenge}
                </p>
              </div>

              <div className="border-t border-border-custom/50 pt-8">
                <h3 className="text-xl font-bold text-white mb-4">
                  The Engineering Solution
                </h3>
                <p className="text-xs md:text-sm text-secondary-custom leading-relaxed font-medium">
                  {project.solution}
                </p>
              </div>

              <div className="border-t border-border-custom/50 pt-8">
                <h3 className="text-xl font-bold text-white mb-6">
                  Key Metrics & Results
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.results?.map((res: string, rIdx: number) => (
                    <div
                      key={rIdx}
                      className="border border-border-custom/50 bg-surface/20 p-4 rounded-xl flex items-start gap-3"
                    >
                      <CheckCircle className="w-4 h-4 text-accent-custom shrink-0 mt-0.5" />
                      <span className="text-xs text-[#E0E0E0] font-medium leading-normal">
                        {res}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Call to Action */}
          <div className="border border-border-custom bg-surface/20 rounded-3xl p-8 md:p-12 text-center mt-28 relative overflow-hidden">
            <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-3">
              Start Your Integration
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Construct a similar automated network
            </h2>
            <p className="text-xs text-secondary-custom leading-relaxed max-w-xl mx-auto mb-8">
              We engineer custom solutions tailored for your business metrics. Speak to our technical lead today.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-accent-custom text-white hover:bg-blue-600 px-8 py-4 rounded-lg shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              Book Consultation Call
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </a>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
