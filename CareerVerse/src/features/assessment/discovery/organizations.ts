import { getCompanyRecords } from "@/lib/companies/catalog";
import { getCareers } from "@/lib/careers/catalog";
import { FIELDS_BY_ID } from "./fields";
import type { DiscoveryOption, FieldId } from "./types";

/*
 * Adaptive "organizations" question (was: hard-coded "dream companies").
 *
 * Technology and Business students see the existing Target Companies catalog
 * (`lib/companies/catalog.ts`) — genuinely the right fit for those fields,
 * unmodified, still deep-links into the real Companies module.
 *
 * Every other field gets its options built from the `companies` arrays
 * *already present* on each matching career in `lib/careers/catalog.ts` (e.g.
 * Doctor → "Hospitals, Clinics, Health systems, Private practice"; Lawyer →
 * "Law firms, Corporates, Government, Nonprofits"; Teacher → "Schools,
 * Districts, International schools"). No new dataset, no duplication — just
 * reading data that was already there but unused by this question.
 */

export interface OrganizationQuestionContent {
  title: string;
  helpText: string;
  options: DiscoveryOption[];
}

const FIELD_TITLES: Partial<Record<FieldId, string>> = {
  technology: "Which companies would you love to work for?",
  business: "Which companies or firms would you love to work for?",
  healthcare: "Which kinds of healthcare workplaces interest you?",
  law_public: "Which kinds of legal or public-service workplaces interest you?",
  education: "Which kinds of education workplaces interest you?",
  engineering: "Which kinds of engineering organizations interest you?",
  design_creative: "Which kinds of design studios or organizations interest you?",
  media_communication: "Which kinds of media organizations interest you?",
  science: "Which kinds of research organizations interest you?",
};

function slugifyOrgName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Dedupe by lowercase label — different careers in the same field often list the same workplace. */
function optionsFromCareerCompanies(categories: string[]): DiscoveryOption[] {
  const seen = new Set<string>();
  const options: DiscoveryOption[] = [];
  getCareers()
    .filter((c) => categories.includes(c.category))
    .forEach((career) => {
      career.companies.forEach((name) => {
        const key = name.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        options.push({ value: slugifyOrgName(name), label: name });
      });
    });
  return options;
}

export function organizationOptionsForField(fieldId: FieldId | null): OrganizationQuestionContent {
  if (fieldId === "technology" || fieldId === "business") {
    return {
      title: FIELD_TITLES[fieldId]!,
      helpText: "Search and select as many as you like — this is optional.",
      options: getCompanyRecords().map((c) => ({ value: c.slug, label: c.name })),
    };
  }

  if (fieldId) {
    const field = FIELDS_BY_ID[fieldId];
    return {
      title: FIELD_TITLES[fieldId] ?? "Which organizations or workplaces interest you?",
      helpText: "Search and select as many as you like — this is optional.",
      options: optionsFromCareerCompanies(field.categories),
    };
  }

  // Fallback if this ever renders before the field question is answered.
  return {
    title: "Which organizations or workplaces interest you?",
    helpText: "Optional — pick any that appeal to you.",
    options: getCompanyRecords()
      .slice(0, 20)
      .map((c) => ({ value: c.slug, label: c.name })),
  };
}
