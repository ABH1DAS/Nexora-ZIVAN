import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://zivan.health";
  const routes = [
    "",
    "/health",
    "/wellbeing",
    "/emergency",
    "/rewards",
    "/profile",
    "/about",
    "/login",
    "/signup",
    "/dashboard",
    "/hospital",
    "/hospital/login",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : route.startsWith("/dashboard") ? 0.8 : 0.7,
  }));
}
