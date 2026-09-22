import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Studies & Production Blueprints | Tech Infinix",
  description:
    "Review real-world engineering blueprints, enterprise client ROI, and production deployments built by Tech Infinix.",
  alternates: {
    canonical: "/portfolio",
  },
  openGraph: {
    title: "Case Studies & Production Blueprints | Tech Infinix",
    description:
      "Review real-world engineering blueprints, enterprise client ROI, and production deployments built by Tech Infinix.",
    url: "/portfolio",
  },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
