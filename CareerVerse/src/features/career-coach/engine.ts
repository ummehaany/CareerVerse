import type {
  CoachContext,
  CoachInsight,
  CoachRecommendationGroup,
} from "./types";

/*
 * Placeholder AI engine for the Career Coach. Fully deterministic and
 * client-safe — it turns the user's aggregated CareerVerse context into
 * genuinely useful, personalized guidance. This is the swap point for a real
 * LLM: replace generateReply()/buildDailyAdvice() with an API call and keep the
 * same signatures. buildInsights / buildRecommendations stay useful either way.
 */

export const SUGGESTED_PROMPTS: string[] = [
  "Which career suits me best?",
  "How can I improve my Resume Score?",
  "What should I learn next?",
  "How do I prepare for Google?",
  "Why is my Career Readiness Score low?",
  "Compare AI Engineer vs Data Scientist.",
  "Suggest projects for my roadmap.",
  "Help me prepare for interviews.",
  "Review my skills.",
  "Recommend certifications.",
];

function bullets(items: string[]): string {
  return items.filter(Boolean).map((i) => `• ${i}`).join("\n");
}

function readinessBand(score: number): string {
  if (score >= 80) return "interview-ready";
  if (score >= 60) return "nearly there";
  if (score >= 40) return "developing";
  return "at an early stage";
}

/* ── Insight cards ─────────────────────────────────────────────────────────*/

export function buildInsights(c: CoachContext): CoachInsight[] {
  const insights: CoachInsight[] = [];

  insights.push({
    key: "today",
    label: "Today's recommendation",
    value: c.biggestGap ? `Focus on ${c.biggestGap}` : c.roadmap ? "Advance your roadmap" : "Start Career Discovery",
    detail: c.biggestGap
      ? "The fastest way to lift your readiness right now."
      : "One focused step keeps momentum going.",
    accentVar: "--accent-mentor",
    tone: "default",
  });

  insights.push({
    key: "milestone",
    label: "Next milestone",
    value: c.nextMilestone ?? (c.roadmap ? "Roadmap in progress" : "Generate a roadmap"),
    detail: c.roadmap ? `${c.roadmap.title} · ${c.roadmap.percent}% done` : "Turn your goal into a plan.",
    accentVar: "--accent-roadmap",
    tone: "default",
  });

  insights.push({
    key: "weakness",
    label: "Biggest weakness",
    value: c.biggestGap ?? "None flagged",
    detail: c.biggestGap ? "Prioritize this to unblock your target roles." : "Great — no critical gaps detected.",
    accentVar: "--accent-interview",
    tone: c.biggestGap ? "warn" : "good",
  });

  insights.push({
    key: "strength",
    label: "Strongest skill",
    value: c.strongestSkill ?? "Add your skills",
    detail: c.strongestSkill ? "Lead with this in your resume and interviews." : "Complete your profile to surface strengths.",
    accentVar: "--accent-roadmap",
    tone: "good",
  });

  insights.push({
    key: "dream",
    label: "Target company readiness",
    value: c.dreamCompany ? `${c.dreamCompany.readiness}% · ${c.dreamCompany.name}` : "Pick a target company",
    detail: c.dreamCompany
      ? `For ${c.dreamCompany.roleTitle} — ${readinessBand(c.dreamCompany.readiness)}.`
      : "Choose a target in Target Companies to personalize this.",
    accentVar: "--accent-assessment",
    tone: "default",
  });

  insights.push({
    key: "timeline",
    label: "Estimated prep timeline",
    value: c.dreamCompany ? c.dreamCompany.prepTime : c.missingSkills.length ? `~${Math.max(2, c.missingSkills.length * 2)} weeks` : "You're on track",
    detail: "Based on your current gaps and pace.",
    accentVar: "--accent-resume",
    tone: "default",
  });

  return insights;
}

/* ── Proactive recommendations ─────────────────────────────────────────────*/

export function buildRecommendations(c: CoachContext): CoachRecommendationGroup[] {
  const groups: CoachRecommendationGroup[] = [];

  groups.push({
    category: "Skills to learn next",
    icon: "puzzle",
    items: c.missingSkills.length
      ? c.missingSkills.slice(0, 4)
      : ["Deepen a core skill with an advanced project", "Add a trending skill in your field"],
  });

  groups.push({
    category: "Resume improvements",
    icon: "file",
    items: [
      c.hasResume ? `Lift your resume completeness from ${c.resumeCompletion}%` : "Create your first resume in Resume Builder",
      "Quantify impact with metrics on every bullet",
      c.dreamCompany ? `Mirror keywords for ${c.dreamCompany.name}` : "Mirror keywords from your target role",
    ],
  });

  groups.push({
    category: "Interview preparation",
    icon: "mic",
    items: [
      c.interviewBest !== null ? `Beat your best mock score of ${c.interviewBest}/100` : "Run your first mock interview",
      "Prepare 5–6 STAR behavioral stories",
      "Practice thinking out loud on coding problems",
    ],
  });

  groups.push({
    category: "Roadmap milestones",
    icon: "route",
    items: c.nextMilestone
      ? [`Complete: ${c.nextMilestone}`, "Ship a project for this milestone"]
      : ["Generate a learning roadmap toward your goal", "Set a weekly study cadence"],
  });

  groups.push({
    category: "Certifications & projects",
    icon: "award",
    items: [
      c.targetRoles.length ? `A recognized cert for ${c.targetRoles[0]}` : "A recognized cert in your field",
      "A portfolio project that mirrors real work",
      "One collaborative or open-source contribution",
    ],
  });

  groups.push({
    category: "This week's goals",
    icon: "flag",
    items: [
      c.biggestGap ? `Spend 3–4 focused hours on ${c.biggestGap}` : "Advance your top roadmap milestone",
      "Run one mock interview",
      "Polish one resume section",
    ],
  });

  return groups;
}

/* ── Daily advice ──────────────────────────────────────────────────────────*/

/**
 * Turn the first-run onboarding answers into an honest, specific welcome —
 * shown only before Career Discovery has produced real data. It reflects
 * what the student told us, not an AI-generated match, and disappears the
 * moment Career Discovery (the authoritative source) has run.
 */
function onboardingWelcome(o: NonNullable<CoachContext["onboarding"]>): string {
  const { careerGoal, careerField, currentLevel } = o;
  const goalPhrase = careerGoal && careerField ? `${careerGoal} in ${careerField}` : careerGoal || careerField;
  const who = currentLevel ? `As a ${currentLevel}, you` : "You";
  const goalPart = goalPhrase ? ` told us your goal is to ${goalPhrase}.` : " told us a bit about where you're starting from.";
  return `Welcome! ${who}${goalPart} Start Career Discovery and I'll turn that into real career matches, a roadmap, and a plan.`;
}

export function buildDailyAdvice(c: CoachContext): { advice: string; priority: string } {
  if (!c.hasData) {
    return {
      advice: c.onboarding
        ? onboardingWelcome(c.onboarding)
        : "Welcome! Start Career Discovery to unlock personalized guidance across every module.",
      priority: "Complete Career Discovery",
    };
  }
  const advice = c.biggestGap
    ? `Your readiness is ${c.careerReadiness}% (${readinessBand(c.careerReadiness)}). The single highest-leverage move today is building ${c.biggestGap}.`
    : `You're ${readinessBand(c.careerReadiness)} at ${c.careerReadiness}%. Keep momentum by shipping a project and running a mock interview.`;
  const priority = c.nextMilestone
    ? `Work on: ${c.nextMilestone}`
    : c.biggestGap
      ? `Learn: ${c.biggestGap}`
      : c.hasResume
        ? "Run a mock interview"
        : "Build your resume";
  return { advice, priority };
}

/* ── Conversational reply (placeholder for the LLM) ────────────────────────*/

function greeting(c: CoachContext): string {
  const hi = `Hi ${c.firstName || "there"}! I'm your AI Career Coach.`;
  if (!c.hasData) {
    return `${hi} I can see you're just getting started — start Career Discovery and I'll tailor everything to you. In the meantime, ask me anything about careers, resumes, skills, or interviews.`;
  }
  return `${hi} I can see your full CareerVerse profile — career matches, roadmap, resume, skills, and interview history. Ask me anything, or tap a suggested question below.`;
}

function careerFitReply(c: CoachContext): string {
  if (c.careerMatch) {
    return `Based on your assessment, your strongest match is ${c.careerMatch.title} at a ${c.careerMatch.fit}% fit.\n\nWhy it fits: it aligns with your strengths${c.strongestSkill ? ` (especially ${c.strongestSkill})` : ""} and interests. To go deeper:\n${bullets([
      "Open Career Matches to see your full Top 5",
      c.roadmap ? `Continue your roadmap toward ${c.roadmap.title}` : "Generate a learning roadmap for this path",
      "Compare it against a second option to pressure-test the choice",
    ])}`;
  }
  return `I don't have your career matches yet. Start Career Discovery, and I'll rank the careers that fit you best with a clear reason for each.`;
}

function resumeReply(c: CoachContext): string {
  if (!c.hasResume) {
    return `You haven't built a resume yet. Open the Resume Builder to create one — then I'll score it against your target roles.\n\nStart with:\n${bullets([
      "A crisp headline matching your target role",
      "3–5 impact bullets with metrics",
      "A skills section mirroring the job's keywords",
    ])}`;
  }
  return `Your resume is ${c.resumeCompletion}% complete. To raise your Resume Score${c.dreamCompany ? ` for ${c.dreamCompany.name}` : ""}:\n${bullets([
    "Quantify every bullet (numbers, %, scale, outcomes)",
    c.dreamCompany ? `Add keywords for ${c.dreamCompany.name}'s roles` : "Mirror keywords from your target role",
    "Feature 1–2 projects that match the role",
    "Keep it one page, single-column, ATS-friendly",
  ])}\n\nOpen Target Companies → Resume Match for a company-specific breakdown.`;
}

function learnNextReply(c: CoachContext): string {
  if (c.missingSkills.length) {
    return `Your highest-impact skills to learn next:\n${bullets(c.missingSkills.slice(0, 5))}\n\nStart with ${c.missingSkills[0]} — it unblocks the most for your target roles. Use the Skill Gap Analysis to track progress and the Learning Roadmap for a structured path.`;
  }
  return `You're covering your core skills well${c.strongestSkill ? ` (strong in ${c.strongestSkill})` : ""}. Next, go deeper: pick an advanced project, add a trending skill in your field, and reinforce with a certification. Check Skill Gap Analysis for the exact gaps against a target role.`;
}

function companyReply(c: CoachContext): string {
  if (c.dreamCompany) {
    return `For ${c.dreamCompany.name} (${c.dreamCompany.roleTitle}), your readiness is ${c.dreamCompany.readiness}% — ${readinessBand(c.dreamCompany.readiness)}. Estimated prep: ${c.dreamCompany.prepTime}.\n\nYour plan:\n${bullets([
      c.biggestGap ? `Close your biggest gap: ${c.biggestGap}` : "Reinforce core skills with projects",
      "Follow the personalized roadmap on the company page",
      "Practice the company-specific mock interview (HR, technical, behavioral, values)",
      "Tailor your resume to the role's keywords",
    ])}\n\nOpen Target Companies → ${c.dreamCompany.name} for the full readiness, roadmap, and interview kit.`;
  }
  return `Pick your target in Target Companies and I'll compute your exact readiness, a step-by-step roadmap, a resume match, and a company-specific interview kit.\n\nGenerally, top companies test:\n${bullets([
    "Data structures & algorithms (coding rounds)",
    "System design (for experienced roles)",
    "Behavioral / values fit",
  ])}`;
}

function readinessReply(c: CoachContext): string {
  const factors: string[] = [];
  factors.push(`Skills coverage${c.missingSkills.length ? ` — ${c.missingSkills.length} gaps (e.g. ${c.missingSkills.slice(0, 2).join(", ")})` : " — strong"}`);
  factors.push(`Resume${c.hasResume ? ` — ${c.resumeCompletion}% complete` : " — not created yet"}`);
  factors.push(`Roadmap${c.roadmap ? ` — ${c.roadmap.percent}% complete` : " — none active"}`);
  factors.push(`Interview practice${c.interviewBest !== null ? ` — best ${c.interviewBest}/100` : " — no sessions yet"}`);
  return `Your Career Readiness is ${c.careerReadiness}% (${readinessBand(c.careerReadiness)}). It's a blend of:\n${bullets(factors)}\n\nTo raise it fastest:\n${bullets([
    c.biggestGap ? `Learn ${c.biggestGap}` : "Deepen an advanced skill",
    c.hasResume ? "Push your resume toward 100%" : "Build your resume",
    "Run a mock interview to lift that component",
  ])}`;
}

function compareReply(message: string, c: CoachContext): string {
  const m = message.toLowerCase();
  if (m.includes("ai engineer") && m.includes("data scientist")) {
    return `AI Engineer vs Data Scientist — a quick comparison:\n\nAI Engineer\n${bullets([
      "Builds AI-powered product features (LLMs, APIs, MLOps)",
      "Strong software engineering + system design",
      "More production/shipping focused",
    ])}\nData Scientist\n${bullets([
      "Extracts insight with statistics & ML",
      "Strong on experimentation, analysis, storytelling",
      "More research/analysis focused",
    ])}\n${c.strongestSkill ? `\nGiven your strength in ${c.strongestSkill}, ` : "\n"}if you enjoy shipping software, lean AI Engineer; if you love analysis and stats, lean Data Scientist. Open Explore Careers to compare salaries and demand side by side.`;
  }
  return `Tell me the two roles you'd like to compare (e.g. "Compare Frontend Engineer vs Backend Engineer") and I'll break down responsibilities, skills, salary, and which fits your profile better. You can also use Explore Careers to compare any two roles directly.`;
}

function projectsReply(c: CoachContext): string {
  const focus = c.biggestGap ?? c.strongestSkill ?? (c.targetRoles[0] ?? "your target role");
  return `Portfolio projects tailored to you:\n${bullets([
    `A substantial project applying ${focus}`,
    c.dreamCompany ? `Something in ${c.dreamCompany.name}'s domain` : "A project mirroring real work in your field",
    "An end-to-end app (data → logic → interface)",
    "One collaborative or open-source contribution",
  ])}\n\nAdd these to your Smart Profile & Portfolio and reference them in your resume. Your Learning Roadmap also suggests milestone projects.`;
}

function interviewReply(c: CoachContext): string {
  return `Interview prep plan${c.dreamCompany ? ` for ${c.dreamCompany.name}` : ""}:\n${bullets([
    c.interviewBest !== null ? `Beat your best mock score (${c.interviewBest}/100)` : "Run your first AI Mock Interview",
    "Drill coding: arrays, hashing, trees/graphs, DP",
    "Prepare 5–6 STAR behavioral stories",
    "Review one system-design topic per week",
    c.dreamCompany ? `Use the ${c.dreamCompany.name} interview kit (HR, technical, values)` : "Study your target company's values",
  ])}\n\nJump into AI Mock Interview to practice with instant feedback.`;
}

function skillsReply(c: CoachContext): string {
  const parts: string[] = [];
  if (c.strongSkills.length) parts.push(`Strengths: ${c.strongSkills.slice(0, 6).join(", ")}`);
  if (c.missingSkills.length) parts.push(`Gaps: ${c.missingSkills.slice(0, 6).join(", ")}`);
  if (!parts.length) return `I don't have your skills yet. Complete Career Discovery or Skill Gap Analysis and I'll review your strengths and gaps in detail.`;
  return `Here's your skill review:\n${bullets(parts)}\n\nRecommendation: lead with ${c.strongestSkill ?? "your strengths"} everywhere, and prioritize ${c.biggestGap ?? "one gap"} next. Open Skill Gap Analysis for a role-by-role breakdown.`;
}

function certsReply(c: CoachContext): string {
  const role = c.targetRoles[0] ?? (c.careerMatch?.title ?? "your target role");
  return `Certifications worth pursuing for ${role}:\n${bullets([
    "A cloud cert (AWS / Azure / GCP) if you're in engineering or data",
    "A role-specific cert (e.g. TensorFlow, CKA, Security+, Google UX)",
    "A vendor cert your target companies recognize",
  ])}\n\nCerts support — but don't replace — projects. Pair each with something you've built. Target Companies lists the certs each role values.`;
}

function weeklyGoalsReply(c: CoachContext): string {
  return `Your goals for this week:\n${bullets([
    c.biggestGap ? `Spend 3–4 focused hours on ${c.biggestGap}` : "Advance your top roadmap milestone",
    "Run one AI Mock Interview",
    c.hasResume ? "Improve one resume section with metrics" : "Draft your resume in Resume Builder",
    "Ship or progress one portfolio project",
  ])}\n\nSmall, consistent steps compound. Check in with me next week and we'll adjust.`;
}

export function generateReply(message: string, context: CoachContext): string {
  const m = message.toLowerCase().trim();
  const has = (...ks: string[]) => ks.some((k) => m.includes(k));

  if (!m) return greeting(context);
  if (m.length < 6 && has("hi", "hey", "yo", "hello")) return greeting(context);
  if (has("compare", " vs ", " versus ")) return compareReply(message, context);
  if (has("resume", "cv", "ats")) return resumeReply(context);
  if (has("readiness", "ready", "why is my", "score low", "low score")) return readinessReply(context);
  if (has("prepare for", "get into", "crack", "google", "company", "faang")) return companyReply(context);
  if (has("learn next", "what should i learn", "learn", "study next", "upskill")) return learnNextReply(context);
  if (has("project")) return projectsReply(context);
  if (has("interview", "mock")) return interviewReply(context);
  if (has("skill", "review my", "strength", "weakness")) return skillsReply(context);
  if (has("certification", "certificate", "cert ")) return certsReply(context);
  if (has("weekly", "this week", "goal", "plan for")) return weeklyGoalsReply(context);
  if (has("which career", "career suit", "best career", "what career", "suits me")) return careerFitReply(context);
  if (has("hello", "hi ", "hey", "who are you", "what can you")) return greeting(context);

  // Fallback: acknowledge + steer with context.
  return `Great question. Here's how I'd approach it given your profile (readiness ${context.careerReadiness}%${context.careerMatch ? `, top match ${context.careerMatch.title}` : ""}):\n${bullets([
    context.biggestGap ? `Prioritize ${context.biggestGap}` : "Deepen your strongest skill",
    context.hasResume ? "Keep your resume tailored and quantified" : "Build your resume",
    "Practice interviews and ship projects",
  ])}\n\nTry one of the suggested questions for a more specific answer, or ask me about your resume, skills, roadmap, a company, or interviews.`;
}
