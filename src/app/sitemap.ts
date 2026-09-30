import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { API_URL } from "@/lib/config";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techinfinix.com";
  const now = new Date();
  
  // 1. Recursively find all static pages in src/app
  // This ensures if you add new folders/pages in the future, they automatically appear.
  const appDir = path.join(process.cwd(), "src", "app");
  
  function getStaticRoutes(dir: string, basePath = ""): string[] {
    let routes: string[] = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          // Skip dynamic route folders like [slug]
          if (entry.name.startsWith("[") && entry.name.endsWith("]")) {
            continue;
          }
          // Skip api routes, admin dashboard, and system folders
          if (entry.name === "api" || entry.name === "admin" || entry.name.startsWith("_")) {
            continue;
          }
          // Handle Next.js route groups like (group)
          if (entry.name.startsWith("(") && entry.name.endsWith(")")) {
            routes.push(...getStaticRoutes(path.join(dir, entry.name), basePath));
          } else {
            const newBasePath = basePath ? `${basePath}/${entry.name}` : `/${entry.name}`;
            routes.push(...getStaticRoutes(path.join(dir, entry.name), newBasePath));
          }
        } else if (entry.isFile() && entry.name === "page.tsx") {
          const routePath = basePath === "" ? "/" : basePath;
          routes.push(routePath);
        }
      }
    } catch (e) {
      console.error("Error reading directory:", e);
    }
    return routes;
  }

  const staticPaths = getStaticRoutes(appDir);
  
  const routes: MetadataRoute.Sitemap = staticPaths.map((route) => {
    // Dynamic priority/frequency logic based on URL depth
    let priority = 0.8;
    let changeFrequency: "daily" | "weekly" | "monthly" | "yearly" | "always" | "hourly" | "never" = "weekly";
    
    if (route === "/") {
      priority = 1.0;
      changeFrequency = "daily";
    } else if (route === "/services" || route === "/portfolio" || route === "/contact") {
      priority = 0.9;
    } else if (route.startsWith("/services/")) {
      priority = 0.95;
    }

    return {
      url: `${baseUrl}${route === "/" ? "" : route}`,
      lastModified: now,
      changeFrequency,
      priority,
    };
  });

  // 2. Fetch all dynamic blogs directly from database via API
  try {
    const blogsRes = await fetch(`${API_URL}/api/v1/blogs/`, { cache: 'no-store' });
    if (blogsRes.ok) {
      const blogs = await blogsRes.json();
      const activeBlogs = blogs.filter((b: any) => b.published);
      activeBlogs.forEach((blog: any) => {
        if (blog.slug) {
          routes.push({
            url: `${baseUrl}/blogs/${blog.slug}`,
            lastModified: blog.updated_at ? new Date(blog.updated_at) : now,
            changeFrequency: "monthly",
            priority: 0.75,
          });
        }
      });
    }
  } catch (err) {
    console.error("Failed to fetch blogs for sitemap:", err);
  }

  // 3. Fetch all dynamic portfolio case studies
  try {
    const portRes = await fetch(`${API_URL}/api/v1/public/portfolio`, { cache: 'no-store' });
    if (portRes.ok) {
      const portfolio = await portRes.json();
      portfolio.forEach((p: any) => {
        if (p.slug) {
          routes.push({
            url: `${baseUrl}/portfolio/${p.slug}`,
            lastModified: p.year ? new Date(p.year.toString()) : now,
            changeFrequency: "monthly",
            priority: 0.8,
          });
        }
      });
    }
  } catch (err) {
    console.error("Failed to fetch portfolio for sitemap:", err);
  }

  return routes;
}
