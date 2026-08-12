/*
 * Central registry of external company links.
 *
 * This is the single place to maintain each company's official careers page and
 * the domain used to fetch its logo. Add or edit a company here and every
 * surface (cards, profile hero, "Official Careers" button) updates. Careers URLs
 * are best-effort canonical links and should be reviewed periodically.
 */

export interface CompanyLink {
  /** Root domain, used to resolve the official logo via the logo CDN. */
  domain: string;
  /** Official careers / jobs page. */
  careersUrl: string;
}

export const COMPANY_LINKS: Record<string, CompanyLink> = {
  // Big Tech
  google: { domain: "google.com", careersUrl: "https://careers.google.com/" },
  microsoft: { domain: "microsoft.com", careersUrl: "https://careers.microsoft.com/" },
  amazon: { domain: "amazon.com", careersUrl: "https://www.amazon.jobs/" },
  apple: { domain: "apple.com", careersUrl: "https://www.apple.com/careers/" },
  meta: { domain: "meta.com", careersUrl: "https://www.metacareers.com/" },
  netflix: { domain: "netflix.com", careersUrl: "https://jobs.netflix.com/" },
  nvidia: { domain: "nvidia.com", careersUrl: "https://www.nvidia.com/en-us/about-nvidia/careers/" },
  adobe: { domain: "adobe.com", careersUrl: "https://careers.adobe.com/" },
  salesforce: { domain: "salesforce.com", careersUrl: "https://careers.salesforce.com/" },
  oracle: { domain: "oracle.com", careersUrl: "https://www.oracle.com/careers/" },
  ibm: { domain: "ibm.com", careersUrl: "https://www.ibm.com/careers/" },
  intel: { domain: "intel.com", careersUrl: "https://www.intel.com/content/www/us/en/jobs/jobs-at-intel.html" },
  cisco: { domain: "cisco.com", careersUrl: "https://jobs.cisco.com/" },
  sap: { domain: "sap.com", careersUrl: "https://jobs.sap.com/" },

  // High-Growth
  uber: { domain: "uber.com", careersUrl: "https://www.uber.com/us/en/careers/" },
  airbnb: { domain: "airbnb.com", careersUrl: "https://careers.airbnb.com/" },
  stripe: { domain: "stripe.com", careersUrl: "https://stripe.com/jobs" },
  openai: { domain: "openai.com", careersUrl: "https://openai.com/careers" },
  tesla: { domain: "tesla.com", careersUrl: "https://www.tesla.com/careers" },
  spotify: { domain: "spotify.com", careersUrl: "https://www.lifeatspotify.com/" },

  // Consulting
  accenture: { domain: "accenture.com", careersUrl: "https://www.accenture.com/us-en/careers" },
  deloitte: { domain: "deloitte.com", careersUrl: "https://www2.deloitte.com/global/en/careers.html" },
  pwc: { domain: "pwc.com", careersUrl: "https://www.pwc.com/gx/en/careers.html" },
  ey: { domain: "ey.com", careersUrl: "https://www.ey.com/en_gl/careers" },
  kpmg: { domain: "kpmg.com", careersUrl: "https://kpmg.com/xx/en/careers.html" },

  // Finance
  "goldman-sachs": { domain: "goldmansachs.com", careersUrl: "https://www.goldmansachs.com/careers/" },
  "jpmorgan-chase": { domain: "jpmorganchase.com", careersUrl: "https://careers.jpmorgan.com/" },
  "morgan-stanley": { domain: "morganstanley.com", careersUrl: "https://www.morganstanley.com/careers" },

  // IT Services
  tcs: { domain: "tcs.com", careersUrl: "https://www.tcs.com/careers" },
  infosys: { domain: "infosys.com", careersUrl: "https://www.infosys.com/careers/" },
  wipro: { domain: "wipro.com", careersUrl: "https://careers.wipro.com/" },
  hcltech: { domain: "hcltech.com", careersUrl: "https://www.hcltech.com/careers" },
  cognizant: { domain: "cognizant.com", careersUrl: "https://careers.cognizant.com/global-en" },
  capgemini: { domain: "capgemini.com", careersUrl: "https://www.capgemini.com/careers/" },

  // EdTech
  edmentor: { domain: "edmentor.app", careersUrl: "https://www.edmentor.app/careers" },
};

export function getCompanyLink(slug: string): CompanyLink | null {
  return COMPANY_LINKS[slug] ?? null;
}

export function getCareersUrl(slug: string): string | null {
  return COMPANY_LINKS[slug]?.careersUrl ?? null;
}

export function getCompanyDomain(slug: string): string | null {
  return COMPANY_LINKS[slug]?.domain ?? null;
}

/** Resolve an official logo image URL from a domain (logo CDN). */
export function logoUrl(domain: string): string {
  return `https://logo.clearbit.com/${domain}`;
}
