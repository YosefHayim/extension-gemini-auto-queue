import type { OptimizationPersona, PersonaOption } from "./types";

export const PERSONA_OPTIONS: PersonaOption[] = [
  { id: "creative", label: "Creative" },
  { id: "technical", label: "Technical" },
  { id: "punchy", label: "Short & Punchy" },
];

export const getPersonaDescription = (persona: OptimizationPersona): string => {
  switch (persona) {
    case "creative":
      return "rich atmospheric details";
    case "technical":
      return "precise technical parameters";
    case "punchy":
      return "punchy visual impact";
  }
};
