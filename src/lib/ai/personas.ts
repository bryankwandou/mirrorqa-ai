import { personas } from "@/lib/data";

export const personaPolicies = Object.fromEntries(personas.map((persona) => [persona.key, `${persona.name}: ${persona.note}`])) as Record<string, string>;
