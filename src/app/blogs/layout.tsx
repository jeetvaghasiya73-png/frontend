import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engineering Blog & Technical Insights | Tech Infinix",
  description:
    "Explore the technical engineering blog, system architectures, and workflow automation guides from the Tech Infinix engineering team.",
  alternates: {
    canonical: "/blogs",
  },
  openGraph: {
    title: "Engineering Blog & Technical Insights | Tech Infinix",
    description:
      "Explore the technical engineering blog, system architectures, and workflow automation guides from the Tech Infinix engineering team.",
    url: "/blogs",
  },
};

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
