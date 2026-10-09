import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Tech Infinix — IT Solutions Provider, Ahmedabad",
  description:
    "Learn about Tech Infinix — a full-service digital solutions company based in Ahmedabad. Meet our founders and understand our approach to SEO, web development, automation, and business growth.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Tech Infinix — IT Solutions Provider, Ahmedabad",
    description:
      "Meet the team behind Tech Infinix. We help businesses grow through strategic SEO, custom web applications, data extraction, and workflow automation.",
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
