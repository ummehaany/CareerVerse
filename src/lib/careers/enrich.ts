import type { Career } from "./types";

/**
 * Deterministic enrichment overlay for careers. Derives the richer detail the
 * Career Explorer shows (responsibilities, tools, growth path, work
 * environment, India demand, and top Indian recruiters) from the catalog's
 * base fields — no AI required, always available.
 */
export interface CareerEnrichment {
  responsibilities: string[];
  tools: string[];
  growthPath: string[];
  workEnvironment: string;
  futureDemandIndia: string;
  topRecruitersIndia: string[];
}

const INDIA_RECRUITERS: Record<string, string[]> = {
  Technology: ["TCS", "Infosys", "Wipro", "Flipkart", "Zoho", "Freshworks"],
  "Data & AI": ["Fractal Analytics", "Mu Sigma", "TCS", "Flipkart", "Swiggy", "Google India"],
  Design: ["Zomato", "Swiggy", "Razorpay", "CRED", "Flipkart"],
  "Product & Management": ["Flipkart", "Razorpay", "Zomato", "PhonePe", "Meesho"],
  Finance: ["HDFC Bank", "ICICI Bank", "Deloitte India", "KPMG India", "Kotak Mahindra", "Zerodha"],
  Business: ["Reliance Industries", "Tata Group", "McKinsey India", "BCG India", "Accenture"],
  "Marketing & Media": ["Ogilvy India", "Dentsu", "Nykaa", "Zomato", "Times Internet"],
  Healthcare: ["Apollo Hospitals", "Fortis Healthcare", "Max Healthcare", "Cipla", "Sun Pharma"],
  "Law & Public": ["Cyril Amarchand Mangaldas", "AZB & Partners", "Trilegal", "Government of India"],
  Engineering: ["Larsen & Toubro", "Tata Motors", "Mahindra", "BHEL", "ISRO", "Siemens India"],
  Science: ["CSIR", "DRDO", "ISRO", "Biocon", "Dr. Reddy's Laboratories"],
  Education: ["BYJU'S", "Unacademy", "Vedantu", "Universities & schools"],
  "Aviation & Transport": ["IndiGo", "Air India", "Vistara", "Delhivery", "Blue Dart"],
};

const TOOLS_BY_CATEGORY: Record<string, string[]> = {
  Technology: ["Git & GitHub", "VS Code", "Docker", "AWS / GCP / Azure", "CI/CD pipelines"],
  "Data & AI": ["Python", "SQL", "Pandas / NumPy", "TensorFlow / PyTorch", "Tableau / Power BI"],
  Design: ["Figma", "Adobe Creative Suite", "Sketch", "Framer", "Design systems"],
  "Product & Management": ["Jira", "Notion", "Figma", "Amplitude / Mixpanel", "Roadmapping tools"],
  Finance: ["Advanced Excel", "SAP / Tally", "Bloomberg Terminal", "Power BI", "Financial modeling tools"],
  Business: ["Excel & PowerPoint", "Notion / Jira", "Salesforce CRM", "Analytics dashboards"],
  "Marketing & Media": ["Google Analytics", "Meta Ads Manager", "Ahrefs / SEMrush", "HubSpot", "Canva"],
  Healthcare: ["EHR / EMR systems", "Diagnostic equipment", "Telemedicine platforms", "Medical databases"],
  "Law & Public": ["Case-management software", "SCC / Manupatra research", "Document automation"],
  Engineering: ["AutoCAD / SolidWorks", "MATLAB", "Simulation software", "PLM tools"],
  Science: ["Lab instrumentation", "MATLAB / R", "Statistical software", "Research databases"],
  Education: ["LMS platforms", "Google Classroom", "Presentation tools", "Assessment software"],
  "Aviation & Transport": ["Flight-planning systems", "Logistics / TMS software", "GPS & tracking tools"],
};

const ENV_BY_CATEGORY: Record<string, string> = {
  Technology:
    "Primarily office or fully remote, with flexible hours and strong async collaboration. Expect agile teams, code reviews, and occasional on-call rotations.",
  "Data & AI":
    "Office or remote, collaborating closely with engineering and business teams. Work is project-based with a mix of deep focus and stakeholder reviews.",
  Design:
    "Collaborative studio or remote setup working alongside product and engineering. Balanced between creative deep work and cross-functional critique.",
  "Product & Management":
    "Hybrid and highly collaborative, spanning discovery, planning, and delivery with engineering, design, and business stakeholders.",
  Finance:
    "Structured office environment, often client-facing, with peak intensity around reporting cycles, audits, and deal timelines.",
  Business:
    "Fast-paced and people-centric, spanning meetings, travel, and cross-team coordination in office or hybrid settings.",
  "Marketing & Media":
    "Dynamic, deadline-driven, and creative, blending office and remote work with frequent campaigns and content cycles.",
  Healthcare:
    "Clinical or hospital settings with shifts, high responsibility, and direct patient interaction; some roles are lab- or research-based.",
  "Law & Public":
    "Formal office or courtroom settings with rigorous documentation, research, and long hours during active matters.",
  Engineering:
    "A mix of office, site, and lab work depending on the discipline, with safety standards and firm project deadlines.",
  Science:
    "Laboratory and research settings with structured experimentation, documentation, and peer collaboration.",
  Education:
    "Classroom, campus, or online settings centered on people, with preparation, teaching, and mentoring cycles.",
  "Aviation & Transport":
    "Operational environments — airfields, control centers, or logistics hubs — with strict safety protocols and shift schedules.",
};

function titleCore(title: string): string {
  return title.replace(/^(Senior|Junior|Lead|Chief)\s+/i, "").trim();
}

export function getCareerEnrichment(career: Career): CareerEnrichment {
  const core = titleCore(career.title);
  const topSkills = career.skills.slice(0, 3);

  const responsibilities = [
    career.whatDoes,
    `Apply ${topSkills.join(", ") || "core skills"} to real problems day to day.`,
    "Collaborate with cross-functional teams and stakeholders to deliver outcomes.",
    `Keep up with best practices and emerging trends in ${career.category.toLowerCase()}.`,
    "Document work, communicate progress, and uphold quality and ethical standards.",
  ];

  const tools =
    TOOLS_BY_CATEGORY[career.category] ??
    ["Industry-standard tools", "Collaboration software", "Productivity suites"];

  const growthPath = [
    `Entry-level ${core}`,
    core,
    `Senior ${core}`,
    `Lead / Principal ${core}`,
    `Manager / Head of ${career.category}`,
  ];

  const workEnvironment =
    ENV_BY_CATEGORY[career.category] ??
    "A professional setting (office, hybrid, or remote depending on the employer), balancing focused individual work with team collaboration.";

  const demandWord =
    career.demand === "Very High" || career.demand === "High"
      ? "strong and growing"
      : career.demand === "Growing"
        ? "steadily rising"
        : "stable";

  const futureDemandIndia = `Demand for ${core.toLowerCase()} roles in India is ${demandWord}, supported by rapid digital adoption, a large startup ecosystem, and global capability centers across hubs like Bengaluru, Hyderabad, Pune, and the NCR. Outlook: ${career.growth}.`;

  const topRecruitersIndia = INDIA_RECRUITERS[career.category] ?? career.companies;

  return {
    responsibilities,
    tools,
    growthPath,
    workEnvironment,
    futureDemandIndia,
    topRecruitersIndia,
  };
}
