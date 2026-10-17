import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Tech Infinix — IT Solutions Provider, Ahmedabad",
  description:
    "Learn about Tech Infinix — a full-service digital solutions company based in Ahmedabad. Discover our leadership pillars, core capabilities, and approach to SEO, web development, automation, and business growth.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Tech Infinix — IT Solutions Provider, Ahmedabad",
    description:
      "Discover the leadership and capabilities behind Tech Infinix. We help businesses grow through strategic SEO, custom web applications, data extraction, and workflow automation.",
    url: "https://techinfinix.com/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
