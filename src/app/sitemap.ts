import type { MetadataRoute } from "next";
export default function sitemap():MetadataRoute.Sitemap{return ["","/pricing","/docs","/privacy","/terms"].map(path=>({url:`https://mirrorqa-ai.vercel.app${path}`,lastModified:new Date(),changeFrequency:path?"monthly":"weekly",priority:path?0.7:1}))}
