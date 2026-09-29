# Services Hierarchy Architecture Standard (`herarci.md`)

This document defines the mandatory organizational, routing, file system, and component standards for all services at **Tech Infinix**.
Whenever a new service, sub-service, or geo-targeted landing page is created, this hierarchy **must** be followed strictly.

---

## 1. High-Level Hierarchy Concept

Every service follows a strict 4-tier tree structure designed for maximum search engine indexation, topical authority clustering, and user conversion:

```
[Level 1: Services Index]
       └── /services                               (Catalog & Scope Estimator)
               │
               ▼
[Level 2: Main Service Domain]
       └── /services/[service-slug]                 (e.g., /services/seo)
               │
               ├──► [Level 3: Pillar Sub-Services]
               │      ├── /services/[service-slug]/[sub-service-1]    (e.g., /services/seo/on-page)
               │      ├── /services/[service-slug]/[sub-service-2]    (e.g., /services/seo/off-page)
               │      └── /services/[service-slug]/[sub-service-3]    (e.g., /services/seo/technical)
               │
               └──► [Level 4: Geo / Location-Targeted Pages]
                      ├── /services/[service-slug]/[location]         (e.g., /services/seo/new-york)
                      └── /services/[service-slug]/[sub-service]/[location]
                                                                      (e.g., /services/seo/on-page/london)
```

---

## 2. Directory & Route File Map

### A. Next.js App Router Structure:
```text
src/app/
├── services/
│   ├── page.tsx                           # Master Services Catalog (/services)
│   ├── layout.tsx                         # Global Services Layout
│   │
│   └── seo/                               # [MAIN SERVICE] SEO Hub (/services/seo)
│       ├── layout.tsx                     # SEO Schema (Service, Org, Breadcrumb, FAQ)
│       ├── page.tsx                       # Main SEO Pillar & Architecture Page
│       │
│       ├── on-page/                       # [SUB-SERVICE 1] On-Page SEO (/services/seo/on-page)
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── [location]/                # [GEO EXTENSION] Location-specific On-Page
│       │       ├── layout.tsx
│       │       └── page.tsx
│       │
│       ├── off-page/                      # [SUB-SERVICE 2] Off-Page SEO (/services/seo/off-page)
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── [location]/                # [GEO EXTENSION] Location-specific Off-Page
│       │       ├── layout.tsx
│       │       └── page.tsx
│       │
│       ├── technical/                     # [SUB-SERVICE 3] Technical SEO (/services/seo/technical)
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── [location]/                # [GEO EXTENSION] Location-specific Technical
│       │       ├── layout.tsx
│       │       └── page.tsx
│       │
│       └── [location]/                    # [GEO MAIN] City/Region Hub (/services/seo/[location])
│           ├── layout.tsx
│           └── page.tsx
```

---

## 3. Page Blueprint Requirements (Every Page Must Implement)

Each service or sub-service page must adhere to these 9 standardized sections:

| Order | Section Component | Purpose & Requirement |
| :--- | :--- | :--- |
| **01** | **Breadcrumb & Pill Badge** | Clear navigation trail (`Home > Services > SEO > [Pillar]`) with font-mono tracking pill. |
| **02** | **Hero Section** | High-impact headline using `<SplitText />`, subheadline highlighting ROI and algorithmic dominance, dual CTAs. |
| **03** | **Key Performance Metrics (KPIs)** | 4 verifiable metric cards (e.g. Traffic Growth %, Core Web Vitals score, Ranking velocity). |
| **04** | **Interactive Visualization / Simulator** | Interactive element matching the service (SERP preview, audit checklist, or ROI calculator). |
| **05** | **Sub-Services / Core Capabilities Grid** | Deep-dive feature cards with direct links to child pillars or sibling services. |
| **06** | **4-Phase Execution Framework** | Step-by-step engineering roadmap explaining how we deliver results. |
| **07** | **Interactive Estimator / ROI Tool** | Dynamic slider or scope toggle computing project cost or traffic potential. |
| **08** | **Accordion FAQ with Schema.org** | 5-7 targeted questions matching user search intent (`FAQPage` JSON-LD). |
| **09** | **Conversion CTA Banner** | Direct booking buttons linking to `/contact?service=[slug]` and direct WhatsApp support. |

---

## 4. SEO & Schema.org Standards for Ranking

1. **Title Formula**:
   - Main Service: `[Primary Keyword] Services & Systems Architecture \| Tech Infinix`
   - Sub-Service: `[Sub-Service Keyword] Services & Auditing \| Tech Infinix`
   - Location Page: `Best [Service] in [City, Country] \| [Key Outcome] \| Tech Infinix`
2. **Canonical URLs**: Every `layout.tsx` must supply an absolute canonical URL via `metadata.alternates.canonical`.
3. **Structured Data (JSON-LD)**:
   - `Service` schema detailing provider, offers, areaServed, description.
   - `BreadcrumbList` schema showing root, parent service, and current node.
   - `FAQPage` schema matching accordion questions.
   - `Organization` schema linking to brand contact points.

---

## 5. Design System Rules

- **Theme Compatibility**: Must support both Dark (`#000000`) and Light (`#FAFAFA`) modes using standard project CSS tokens:
  - `bg-background`, `text-foreground`, `bg-surface/30`, `border-border-custom`, `text-secondary-custom`
  - Accent color: `text-accent-custom`, `bg-accent-custom`, `bg-accent-glow`
- **Responsive**: 100% fluid from 320px mobile screens to 4K ultra-wide monitors.
- **Glassmorphism**: Backdrop blur (`backdrop-blur-md` or `backdrop-blur-xl`) with semi-transparent borders.
- **Micro-Animations**: Hover glows, subtle scale transforms (`transition-all duration-300`), and interactive tabs.

---

## 6. Sibling Service Replicability

This exact hierarchy pattern is applied when adding any other core service to Tech Infinix:
- `/services/web-development` (Sub-folders: `nextjs-apps`, `ecommerce`, `saas-platforms`, `[location]`)
- `/services/ai-automation` (Sub-folders: `crm-workflows`, `voice-agents`, `rag-chatbots`, `[location]`)
- `/services/data-scraping` (Sub-folders: `directory-crawlers`, `b2b-lead-enrichment`, `ecommerce-monitoring`, `[location]`)
