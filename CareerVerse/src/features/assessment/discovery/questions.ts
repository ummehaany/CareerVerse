import type { FieldWeights, DiscoveryQuestion, TraitWeights } from "./types";

/*
 * Career Discovery — question bank (v2).
 *
 * BASIC_QUESTIONS: exactly 10 questions, ~60–90 seconds. Every option carries
 * an explicit weight toward one or more of the 9 broad fields (`fields.ts`)
 * and/or the 11 work-style traits (`traits.ts`). Fields answer "which world"
 * (medicine vs. law vs. tech); traits answer "which specific career within
 * that world." Nothing here is weighted to an individual career — that's
 * computed at scoring time against the full `lib/careers/catalog.ts`.
 *
 * Changes from v1, per audit:
 *  - Added `fieldInterest` (Q1) — the broad-world question that unlocks
 *    non-tech careers.
 *  - Added `strengths` (Q6, multi) and `values` (Q8) — previously unmeasured.
 *  - Dropped `primaryGoal` (career stage) and `biggestChallenge` — weak,
 *    arbitrary signal for career-matching; better suited to onboarding.
 *  - `workEnvironment` (remote/office/hybrid — weakly weighted, low signal)
 *    replaced with `peopleOrientation`, a genuinely predictive question for
 *    medicine/education/psychology vs. solo research/technical work.
 *  - `dreamCompanies` renamed `organizationInterest` and made adaptive
 *    (see `organizations.ts`) instead of always showing tech companies.
 *
 * ADVANCED_QUESTIONS: the same 28 questions as before (content preserved —
 * they were reasonably designed), retargeted from career-id weights to the
 * 11 traits so they refine standing across the *entire* catalog rather than
 * a fixed 21-career list.
 */

function fw(weights: FieldWeights): FieldWeights {
  return weights;
}
function tw(weights: TraitWeights): TraitWeights {
  return weights;
}

// ═══════════════════════════════════════════════════════════════════════════
// BASIC — exactly 10 questions
// ═══════════════════════════════════════════════════════════════════════════

export const BASIC_QUESTIONS: DiscoveryQuestion[] = [
  {
    id: "fieldInterest",
    title: "Which of these broad worlds excites you the most?",
    helpText: "There's no wrong answer — go with your gut.",
    type: "single",
    options: [
      { value: "technology", label: "Technology & Data", description: "Software, AI, data, systems", fieldWeights: fw({ technology: 12 }), traitWeights: tw({ technical: 6, analytical: 3 }) },
      { value: "healthcare", label: "Healthcare & Medicine", description: "Medicine, care, wellbeing", fieldWeights: fw({ healthcare: 12 }), traitWeights: tw({ peopleHelping: 6, responsibility: 3 }) },
      { value: "engineering", label: "Engineering & Built Environment", description: "Structures, machines, infrastructure", fieldWeights: fw({ engineering: 12 }), traitWeights: tw({ technical: 5, structure: 3 }) },
      { value: "business", label: "Business, Finance & Management", description: "Strategy, money, operations", fieldWeights: fw({ business: 12 }), traitWeights: tw({ businessAcumen: 6, leadership: 3 }) },
      { value: "law_public", label: "Law & Public Service", description: "Justice, policy, government", fieldWeights: fw({ law_public: 12 }), traitWeights: tw({ communication: 5, responsibility: 3 }) },
      { value: "education", label: "Education & Teaching", description: "Teaching, mentoring, training", fieldWeights: fw({ education: 12 }), traitWeights: tw({ peopleHelping: 5, communication: 3 }) },
      { value: "design_creative", label: "Design & Creative Arts", description: "Visual, product, artistic work", fieldWeights: fw({ design_creative: 12 }), traitWeights: tw({ creative: 6 }) },
      { value: "media_communication", label: "Media & Communication", description: "Writing, journalism, content", fieldWeights: fw({ media_communication: 12 }), traitWeights: tw({ communication: 6, creative: 3 }) },
      { value: "science", label: "Science & Research", description: "Discovery, experimentation, research", fieldWeights: fw({ science: 12 }), traitWeights: tw({ analytical: 6, independence: 3 }) },
    ],
  },
  {
    id: "excitingActivity",
    title: "Which activity sounds the most exciting to you?",
    type: "single",
    options: [
      { value: "build_something", label: "Building or engineering something", fieldWeights: fw({ technology: 6, engineering: 6 }), traitWeights: tw({ technical: 8 }) },
      { value: "helping_people", label: "Caring for or helping people directly", fieldWeights: fw({ healthcare: 6, education: 4, law_public: 2 }), traitWeights: tw({ peopleHelping: 8 }) },
      { value: "research_analyze", label: "Solving problems through research or analysis", fieldWeights: fw({ science: 6, technology: 3, law_public: 2 }), traitWeights: tw({ analytical: 8 }) },
      { value: "design_visually", label: "Designing or creating something visually", fieldWeights: fw({ design_creative: 6, media_communication: 3 }), traitWeights: tw({ creative: 8 }) },
      { value: "debate_persuade", label: "Debating, writing, or persuading others", fieldWeights: fw({ law_public: 6, media_communication: 5 }), traitWeights: tw({ communication: 8 }) },
      { value: "lead_grow", label: "Leading a team or growing a business", fieldWeights: fw({ business: 8 }), traitWeights: tw({ leadership: 6, businessAcumen: 5 }) },
    ],
  },
  {
    id: "favoriteSubjects",
    title: "Which subjects or topics do you naturally enjoy learning?",
    type: "single",
    options: [
      { value: "programming_tech", label: "Programming & Technology", fieldWeights: fw({ technology: 8 }), traitWeights: tw({ technical: 6 }) },
      { value: "math_analytics", label: "Mathematics & Analytics", fieldWeights: fw({ technology: 4, business: 3, science: 3 }), traitWeights: tw({ analytical: 7 }) },
      { value: "science_biology", label: "Science & Biology", fieldWeights: fw({ science: 8, healthcare: 5 }), traitWeights: tw({ analytical: 6 }) },
      { value: "design_arts", label: "Design & Visual Arts", fieldWeights: fw({ design_creative: 8 }), traitWeights: tw({ creative: 7 }) },
      { value: "business_economics", label: "Business & Economics", fieldWeights: fw({ business: 8 }), traitWeights: tw({ businessAcumen: 6 }) },
      { value: "law_civics", label: "Law, Civics & Society", fieldWeights: fw({ law_public: 8 }), traitWeights: tw({ communication: 5, analytical: 3 }) },
      { value: "languages_literature", label: "Languages & Literature", fieldWeights: fw({ media_communication: 6, education: 4 }), traitWeights: tw({ communication: 7 }) },
      { value: "psychology_behavior", label: "Psychology & Human Behavior", fieldWeights: fw({ healthcare: 5, education: 4 }), traitWeights: tw({ peopleHelping: 7 }) },
    ],
  },
  {
    id: "problemSolvingStyle",
    title: "How do you naturally solve problems?",
    helpText: "This one's purely about style — every field values a different mix.",
    type: "single",
    options: [
      { value: "logic_analysis", label: "Using logic and analysis", traitWeights: tw({ analytical: 8 }) },
      { value: "creativity", label: "Through creativity", traitWeights: tw({ creative: 8 }) },
      { value: "research_deeply", label: "By researching deeply", traitWeights: tw({ analytical: 6, independence: 5 }) },
      { value: "collaborating", label: "By collaborating with others", traitWeights: tw({ communication: 5, peopleHelping: 3 }) },
      { value: "experimenting", label: "By experimenting until I find a solution", traitWeights: tw({ riskTolerance: 6, independence: 4 }) },
    ],
  },
  {
    id: "peopleOrientation",
    title: "How do you prefer to spend most of your working time?",
    type: "single",
    options: [
      { value: "independent", label: "Mostly working independently on my own tasks", fieldWeights: fw({ science: 3, technology: 2 }), traitWeights: tw({ independence: 8 }) },
      { value: "direct_people", label: "Mostly working directly with people", description: "Patients, clients, students, the public", fieldWeights: fw({ healthcare: 3, education: 3 }), traitWeights: tw({ peopleHelping: 8, communication: 3 }) },
      { value: "team_collab", label: "Mostly collaborating with a team on shared projects", fieldWeights: fw({ technology: 2, business: 2 }), traitWeights: tw({ communication: 4 }) },
      { value: "mixed", label: "A mix, depending on the situation", traitWeights: tw({}) },
    ],
  },
  {
    id: "strengths",
    title: "Which of these come most naturally to you?",
    helpText: "Choose up to 2 — what people already come to you for.",
    type: "multi",
    max: 2,
    options: [
      { value: "analytical", label: "Analytical & logical thinking", traitWeights: tw({ analytical: 8 }) },
      { value: "empathy", label: "Empathy & understanding people", traitWeights: tw({ peopleHelping: 8 }) },
      { value: "creativity", label: "Creativity & imagination", traitWeights: tw({ creative: 8 }) },
      { value: "organization", label: "Organization & planning", traitWeights: tw({ structure: 7 }) },
      { value: "communication", label: "Communication & persuasion", traitWeights: tw({ communication: 8 }) },
      { value: "leadership", label: "Leadership & motivating others", traitWeights: tw({ leadership: 8 }) },
      { value: "technical", label: "Hands-on / technical skill", traitWeights: tw({ technical: 8 }) },
      { value: "precision", label: "Attention to detail & precision", traitWeights: tw({ responsibility: 6, structure: 4 }) },
    ],
  },
  {
    id: "motivation",
    title: "What motivates you the most?",
    type: "single",
    options: [
      { value: "high_salary", label: "High salary & financial security", fieldWeights: fw({ business: 3, technology: 2 }), traitWeights: tw({ businessAcumen: 4 }) },
      { value: "innovation", label: "Innovation & new ideas", fieldWeights: fw({ technology: 3, design_creative: 2 }), traitWeights: tw({ creative: 4, riskTolerance: 3 }) },
      { value: "work_life_balance", label: "Work-life balance", traitWeights: tw({ structure: 3 }) },
      { value: "helping_others", label: "Helping others / making a difference", fieldWeights: fw({ healthcare: 3, education: 3, law_public: 2 }), traitWeights: tw({ peopleHelping: 6 }) },
      { value: "leadership_recognition", label: "Leadership & recognition", traitWeights: tw({ leadership: 6 }) },
      { value: "discovery", label: "Discovering new knowledge", fieldWeights: fw({ science: 4 }), traitWeights: tw({ analytical: 5, independence: 3 }) },
    ],
  },
  {
    id: "values",
    title: "What matters most to you in a career, long-term?",
    type: "single",
    options: [
      { value: "stability", label: "Stability & security", fieldWeights: fw({ law_public: 2, education: 2 }), traitWeights: tw({ structure: 7 }) },
      { value: "creative_freedom", label: "Creative freedom", traitWeights: tw({ creative: 6, independence: 4 }) },
      { value: "financial_growth", label: "Financial growth", fieldWeights: fw({ business: 3 }), traitWeights: tw({ businessAcumen: 6, riskTolerance: 3 }) },
      { value: "social_impact", label: "Making a social impact", fieldWeights: fw({ healthcare: 2, education: 2, law_public: 2 }), traitWeights: tw({ peopleHelping: 5, responsibility: 3 }) },
      { value: "intellectual_challenge", label: "Intellectual challenge", fieldWeights: fw({ science: 3 }), traitWeights: tw({ analytical: 6 }) },
      { value: "independence", label: "Independence & autonomy", traitWeights: tw({ independence: 7 }) },
    ],
  },
  {
    id: "learningStyle",
    title: "How do you learn best?",
    type: "single",
    options: [
      { value: "videos", label: "Watching Videos", traitWeights: tw({ creative: 2 }) },
      { value: "reading", label: "Reading", traitWeights: tw({ analytical: 3, independence: 3 }) },
      { value: "hands_on", label: "Hands-on Practice", traitWeights: tw({ technical: 4 }) },
      { value: "mentors", label: "Learning from Mentors", traitWeights: tw({ peopleHelping: 2, communication: 2 }) },
      { value: "group", label: "Group Learning", traitWeights: tw({ communication: 3 }) },
    ],
  },
  {
    id: "organizationInterest",
    title: "Which organizations or workplaces interest you?",
    helpText: "Search and select as many as you like — this is optional.",
    type: "multi",
    max: 10,
    searchable: true,
    dynamicSource: "organizations",
    options: [],
  },
];

export const TOTAL_BASIC_QUESTIONS = BASIC_QUESTIONS.length;
/** ~8s per question keeps the whole basic set inside the promised 60–90s. */
export const ESTIMATED_BASIC_SECONDS = TOTAL_BASIC_QUESTIONS * 8;

// ═══════════════════════════════════════════════════════════════════════════
// ADVANCED — optional, 28 questions across 19 work-style traits, retargeted
// to the 11 scoring traits so they refine standing across the full catalog.
// ═══════════════════════════════════════════════════════════════════════════

export const ADVANCED_QUESTIONS: DiscoveryQuestion[] = [
  {
    id: "adv_problemSolving_1",
    trait: "Problem Solving",
    title: "When faced with a complex technical problem, you…",
    type: "single",
    options: [
      { value: "break_down", label: "Break it into smaller steps and solve methodically", traitWeights: tw({ analytical: 6, structure: 3 }) },
      { value: "pattern_match", label: "Look for patterns from past experience", traitWeights: tw({ analytical: 4, independence: 3 }) },
      { value: "brainstorm", label: "Brainstorm multiple creative solutions", traitWeights: tw({ creative: 6 }) },
      { value: "ask_others", label: "Ask others for their perspective first", traitWeights: tw({ communication: 5, peopleHelping: 2 }) },
    ],
  },
  {
    id: "adv_problemSolving_2",
    trait: "Problem Solving",
    title: "A plan breaks down right before a deadline. You…",
    type: "single",
    options: [
      { value: "debug_systematically", label: "Work through it systematically until you find the issue", traitWeights: tw({ analytical: 6, structure: 3 }) },
      { value: "rollback", label: "Fall back to a safer, known-good option", traitWeights: tw({ structure: 5 }) },
      { value: "pair_up", label: "Pair with someone to solve it faster together", traitWeights: tw({ communication: 4, peopleHelping: 2 }) },
      { value: "document_escalate", label: "Document it clearly and escalate", traitWeights: tw({ communication: 4, structure: 3 }) },
    ],
  },
  {
    id: "adv_leadership_1",
    trait: "Leadership",
    title: "In group projects, you naturally…",
    type: "single",
    options: [
      { value: "take_charge", label: "Take charge and assign tasks", traitWeights: tw({ leadership: 7 }) },
      { value: "support_leader", label: "Support whoever is leading", traitWeights: tw({ communication: 3 }) },
      { value: "own_piece", label: "Focus on your individual piece", traitWeights: tw({ independence: 5, technical: 3 }) },
      { value: "mediate", label: "Mediate disagreements", traitWeights: tw({ communication: 5, peopleHelping: 3 }) },
    ],
  },
  {
    id: "adv_leadership_2",
    trait: "Leadership",
    title: "Success, for you, looks most like…",
    type: "single",
    options: [
      { value: "lead_win", label: "Leading a team to a big win", traitWeights: tw({ leadership: 7, businessAcumen: 3 }) },
      { value: "go_to_expert", label: "Being the go-to expert others rely on", traitWeights: tw({ technical: 5, analytical: 4 }) },
      { value: "ship_loved", label: "Creating something people genuinely love", traitWeights: tw({ creative: 4, technical: 3 }) },
      { value: "measurable_diff", label: "Making a measurable difference for others", traitWeights: tw({ peopleHelping: 4, responsibility: 3 }) },
    ],
  },
  {
    id: "adv_communication_1",
    trait: "Communication",
    title: "Explaining a complicated idea to someone new, you…",
    type: "single",
    options: [
      { value: "write_steps", label: "Write it out clearly, step by step", traitWeights: tw({ communication: 6, structure: 3 }) },
      { value: "diagram", label: "Use a diagram or visual", traitWeights: tw({ creative: 4, communication: 3 }) },
      { value: "talk_through", label: "Talk it through conversationally", traitWeights: tw({ communication: 6 }) },
      { value: "show_example", label: "Show a working example", traitWeights: tw({ technical: 5 }) },
    ],
  },
  {
    id: "adv_communication_2",
    trait: "Communication",
    title: "Presenting to a room, whether a class or a client, feels…",
    type: "single",
    options: [
      { value: "energizing", label: "Energizing — you look forward to it", traitWeights: tw({ communication: 7, leadership: 3 }) },
      { value: "fine_visuals", label: "Fine, especially with visuals ready", traitWeights: tw({ creative: 4, communication: 3 }) },
      { value: "manageable_prepared", label: "Manageable, if you've prepared thoroughly", traitWeights: tw({ communication: 4, structure: 3 }) },
      { value: "avoid", label: "Something you'd rather avoid", traitWeights: tw({ independence: 4, technical: 3 }) },
    ],
  },
  {
    id: "adv_creativity_1",
    trait: "Creativity",
    title: "You're most in flow when…",
    type: "single",
    options: [
      { value: "designing_visually", label: "Designing something visually", traitWeights: tw({ creative: 7 }) },
      { value: "clever_solution", label: "Building a clever technical solution", traitWeights: tw({ technical: 5, creative: 3 }) },
      { value: "new_idea", label: "Coming up with a new idea or campaign", traitWeights: tw({ creative: 5, communication: 3 }) },
      { value: "elegant_pattern", label: "Finding an elegant pattern in data or evidence", traitWeights: tw({ analytical: 6 }) },
    ],
  },
  {
    id: "adv_creativity_2",
    trait: "Creativity",
    title: "Given a blank-canvas project, you'd rather…",
    type: "single",
    options: [
      { value: "sketch_prototype", label: "Sketch and prototype it visually", traitWeights: tw({ creative: 7 }) },
      { value: "architect_system", label: "Architect the system or structure behind it", traitWeights: tw({ technical: 5, structure: 3 }) },
      { value: "write_story", label: "Write the story or content for it", traitWeights: tw({ communication: 6, creative: 3 }) },
      { value: "build_first_version", label: "Build the first working version", traitWeights: tw({ technical: 6 }) },
    ],
  },
  {
    id: "adv_decisionMaking_1",
    trait: "Decision Making",
    title: "For big decisions, you rely most on…",
    type: "single",
    options: [
      { value: "data_evidence", label: "Data and evidence", traitWeights: tw({ analytical: 7 }) },
      { value: "experience_intuition", label: "Experience and intuition", traitWeights: tw({ independence: 4, leadership: 3 }) },
      { value: "input_affected", label: "Input from the people affected", traitWeights: tw({ communication: 4, peopleHelping: 3 }) },
      { value: "framework", label: "A structured framework or checklist", traitWeights: tw({ structure: 6, responsibility: 3 }) },
    ],
  },
  {
    id: "adv_decisionMaking_2",
    trait: "Decision Making",
    title: "When two good options conflict, you…",
    type: "single",
    options: [
      { value: "run_numbers", label: "Run the numbers to compare them", traitWeights: tw({ analytical: 6, businessAcumen: 3 }) },
      { value: "safer_option", label: "Pick the safer, proven option", traitWeights: tw({ structure: 5, responsibility: 3 }) },
      { value: "bolder_option", label: "Go with the bolder option", traitWeights: tw({ riskTolerance: 7 }) },
      { value: "second_opinion", label: "Get a second opinion first", traitWeights: tw({ communication: 4, peopleHelping: 2 }) },
    ],
  },
  {
    id: "adv_adaptability_1",
    trait: "Adaptability",
    title: "Plans change at the last minute. You…",
    type: "single",
    options: [
      { value: "adjust_quickly", label: "Adjust quickly and move on", traitWeights: tw({ riskTolerance: 5 }) },
      { value: "moment_then_adapt", label: "Need a moment, then adapt fine", traitWeights: tw({ structure: 3 }) },
      { value: "stick_original", label: "Prefer to stick to the original plan", traitWeights: tw({ structure: 6 }) },
      { value: "energized_change", label: "Get energized by the change", traitWeights: tw({ riskTolerance: 6, creative: 3 }) },
    ],
  },
  {
    id: "adv_learningBehaviour_1",
    trait: "Learning Behaviour",
    title: "Learning something new and hard, you…",
    type: "single",
    options: [
      { value: "practice_immediately", label: "Practice hands-on immediately", traitWeights: tw({ technical: 5, riskTolerance: 3 }) },
      { value: "study_theory", label: "Study the theory first", traitWeights: tw({ analytical: 6 }) },
      { value: "course_mentor", label: "Find a course or mentor", traitWeights: tw({ communication: 3, structure: 3 }) },
      { value: "teach_others", label: "Teach it to someone else to lock it in", traitWeights: tw({ communication: 5, peopleHelping: 3 }) },
    ],
  },
  {
    id: "adv_careerValues_1",
    trait: "Career Values",
    title: "What matters most in a career, long-term?",
    type: "single",
    options: [
      { value: "technical_growth", label: "Constant technical or intellectual growth", traitWeights: tw({ technical: 6, analytical: 3 }) },
      { value: "creative_freedom", label: "Creative freedom", traitWeights: tw({ creative: 6, independence: 3 }) },
      { value: "stability_structure", label: "Stability and structure", traitWeights: tw({ structure: 7 }) },
      { value: "impact_people", label: "Impact on people or society", traitWeights: tw({ peopleHelping: 6, responsibility: 3 }) },
    ],
  },
  {
    id: "adv_teamwork_1",
    trait: "Teamwork",
    title: "On a team, you're most valuable when you're…",
    type: "single",
    options: [
      { value: "keeping_aligned", label: "Keeping everyone aligned", traitWeights: tw({ communication: 5, leadership: 3 }) },
      { value: "hardest_piece", label: "Solving the hardest technical piece", traitWeights: tw({ technical: 5, analytical: 3 }) },
      { value: "quality_holds", label: "Making sure quality and safety hold up", traitWeights: tw({ structure: 5, responsibility: 3 }) },
      { value: "morale", label: "Keeping morale and communication strong", traitWeights: tw({ peopleHelping: 4, communication: 3 }) },
    ],
  },
  {
    id: "adv_riskTaking_1",
    trait: "Risk Taking",
    title: "New, unproven tools or approaches — you…",
    type: "single",
    options: [
      { value: "jump_in_early", label: "Jump in early and experiment", traitWeights: tw({ riskTolerance: 7 }) },
      { value: "wait_proven", label: "Wait until they're proven, then adopt", traitWeights: tw({ structure: 6 }) },
      { value: "small_safe_piece", label: "Try them on a small, safe piece first", traitWeights: tw({ riskTolerance: 3, structure: 3 }) },
      { value: "someone_else_tests", label: "Let someone else test them first", traitWeights: tw({ structure: 4 }) },
    ],
  },
  {
    id: "adv_curiosity_1",
    trait: "Curiosity",
    title: "You're the type who…",
    type: "single",
    options: [
      { value: "how_things_work", label: "Wants to know how everything works under the hood", traitWeights: tw({ technical: 6, analytical: 3 }) },
      { value: "why_people_behave", label: "Wonders why people behave the way they do", traitWeights: tw({ peopleHelping: 5, creative: 2 }) },
      { value: "hidden_patterns", label: "Digs into numbers or evidence to find hidden patterns", traitWeights: tw({ analytical: 7 }) },
      { value: "reads_widely", label: "Reads widely across many topics", traitWeights: tw({ communication: 4, independence: 3 }) },
    ],
  },
  {
    id: "adv_criticalThinking_1",
    trait: "Critical Thinking",
    title: "Reading a claim or article, you instinctively…",
    type: "single",
    options: [
      { value: "check_data", label: "Check the data or evidence behind it", traitWeights: tw({ analytical: 7 }) },
      { value: "who_benefits", label: "Consider who benefits from it", traitWeights: tw({ communication: 4, analytical: 2 }) },
      { value: "counterargument", label: "Look for the strongest counterargument", traitWeights: tw({ analytical: 5, responsibility: 3 }) },
      { value: "face_value", label: "Take it at face value if it sounds reasonable", traitWeights: tw({ structure: 2 }) },
    ],
  },
  {
    id: "adv_criticalThinking_2",
    trait: "Critical Thinking",
    title: "You catch a flaw in a plan others missed. You…",
    type: "single",
    options: [
      { value: "point_with_data", label: "Point it out with data or evidence to back it up", traitWeights: tw({ analytical: 6 }) },
      { value: "flag_suggest_fix", label: "Flag it and suggest a fix", traitWeights: tw({ responsibility: 5, structure: 3 }) },
      { value: "raise_carefully", label: "Bring it up carefully in conversation", traitWeights: tw({ communication: 5, peopleHelping: 2 }) },
      { value: "fix_quietly", label: "Fix it yourself, quietly", traitWeights: tw({ technical: 5, independence: 3 }) },
    ],
  },
  {
    id: "adv_goalOrientation_1",
    trait: "Goal Orientation",
    title: "You work best when…",
    type: "single",
    options: [
      { value: "clear_target", label: "You have a clear target to hit", traitWeights: tw({ structure: 6 }) },
      { value: "ambitious_stretch", label: "You're chasing an ambitious stretch goal", traitWeights: tw({ leadership: 4, riskTolerance: 3 }) },
      { value: "goal_evolves", label: "The goal can evolve as you learn", traitWeights: tw({ creative: 4, riskTolerance: 2 }) },
      { value: "helping_reach_goal", label: "You're helping someone else reach their goal", traitWeights: tw({ peopleHelping: 5, communication: 3 }) },
    ],
  },
  {
    id: "adv_technicalInterest_1",
    trait: "Technical Interest",
    title: "Which of these excites you more?",
    type: "single",
    options: [
      { value: "write_code", label: "Writing code or building something that solves a real problem", traitWeights: tw({ technical: 7 }) },
      { value: "scale_secure", label: "Designing how a system scales and stays safe", traitWeights: tw({ technical: 6, structure: 3 }) },
      { value: "train_model", label: "Training a model or running an experiment", traitWeights: tw({ technical: 6, analytical: 4 }) },
      { value: "none_elsewhere", label: "None of these — you're drawn elsewhere", traitWeights: tw({ businessAcumen: 3, communication: 3 }) },
    ],
  },
  {
    id: "adv_technicalInterest_2",
    trait: "Technical Interest",
    title: "Given free time, you'd rather tinker with…",
    type: "single",
    options: [
      { value: "coding_project", label: "A personal coding or building project", traitWeights: tw({ technical: 6 }) },
      { value: "cloud_infra", label: "A system, infrastructure, or process to optimize", traitWeights: tw({ technical: 7, structure: 3 }) },
      { value: "dataset_model", label: "A dataset, case study, or research question", traitWeights: tw({ analytical: 6, technical: 3 }) },
      { value: "write_design_plan", label: "None — you'd rather write, design, or plan", traitWeights: tw({ communication: 4, creative: 4 }) },
    ],
  },
  {
    id: "adv_businessInterest_1",
    trait: "Business Interest",
    title: "How interested are you in how an organization actually runs and funds itself?",
    type: "single",
    options: [
      { value: "very_strategy", label: "Very — you like thinking about strategy and growth", traitWeights: tw({ businessAcumen: 7, leadership: 3 }) },
      { value: "somewhat_customer", label: "Somewhat — you care more about the people it serves", traitWeights: tw({ communication: 4, businessAcumen: 2 }) },
      { value: "not_much_craft", label: "Not much — you'd rather focus on the craft or subject itself", traitWeights: tw({ technical: 4, analytical: 3 }) },
      { value: "user_problems", label: "You're more interested in solving the end user's problems", traitWeights: tw({ creative: 4, peopleHelping: 3 }) },
    ],
  },
  {
    id: "adv_businessInterest_2",
    trait: "Business Interest",
    title: "Reading about an organization's performance or budget, you'd…",
    type: "single",
    options: [
      { value: "dig_into_numbers", label: "Actually enjoy digging into the numbers", traitWeights: tw({ businessAcumen: 6, analytical: 4 }) },
      { value: "skim_highlights", label: "Skim it for the highlights", traitWeights: tw({ businessAcumen: 3 }) },
      { value: "care_about_product", label: "Care more about the work itself than the finances", traitWeights: tw({ creative: 4, technical: 2 }) },
      { value: "skip_entirely", label: "Skip it entirely", traitWeights: tw({ independence: 2 }) },
    ],
  },
  {
    id: "adv_innovation_1",
    trait: "Innovation",
    title: "New ideas, tools, or methods in your field — you…",
    type: "single",
    options: [
      { value: "early_adopter", label: "Try to be an early adopter", traitWeights: tw({ riskTolerance: 6, creative: 3 }) },
      { value: "follow_wait_mature", label: "Follow closely but wait for them to mature", traitWeights: tw({ structure: 5 }) },
      { value: "adopt_with_team", label: "Adopt once your team or organization does", traitWeights: tw({ communication: 3, structure: 2 }) },
      { value: "prefer_proven", label: "Prefer proven, established approaches", traitWeights: tw({ structure: 6 }) },
    ],
  },
  {
    id: "adv_confidence_1",
    trait: "Confidence",
    title: "Presenting your work to critics, you feel…",
    type: "single",
    options: [
      { value: "confident_defend", label: "Confident — you can defend your reasoning", traitWeights: tw({ leadership: 5, communication: 4 }) },
      { value: "nervous_prepared", label: "Nervous but prepared", traitWeights: tw({ structure: 3, responsibility: 2 }) },
      { value: "fine_know_material", label: "Fine, once you know the material well", traitWeights: tw({ analytical: 3, structure: 2 }) },
      { value: "anxious_speak_itself", label: "Anxious — you'd rather the work speak for itself", traitWeights: tw({ independence: 4, technical: 3 }) },
    ],
  },
  {
    id: "adv_confidence_2",
    trait: "Confidence",
    title: "Taking on a task you've never done, you…",
    type: "single",
    options: [
      { value: "dive_in_figure_out", label: "Dive in — you'll figure it out", traitWeights: tw({ riskTolerance: 6 }) },
      { value: "clarifying_questions", label: "Ask a few clarifying questions first", traitWeights: tw({ communication: 4, structure: 2 }) },
      { value: "research_thoroughly", label: "Research thoroughly before starting", traitWeights: tw({ analytical: 5, independence: 3 }) },
      { value: "guided_first", label: "Prefer someone experienced guides you first", traitWeights: tw({ peopleHelping: 3, structure: 2 }) },
    ],
  },
  {
    id: "adv_timeManagement_1",
    trait: "Time Management",
    title: "Juggling multiple deadlines, you…",
    type: "single",
    options: [
      { value: "prioritize_track", label: "Prioritize ruthlessly and track everything", traitWeights: tw({ structure: 6, leadership: 3 }) },
      { value: "focus_one_thing", label: "Focus deeply on one thing at a time", traitWeights: tw({ independence: 5, technical: 3 }) },
      { value: "bursts_closer", label: "Work in bursts closer to each deadline", traitWeights: tw({ riskTolerance: 4 }) },
      { value: "ask_reprioritize", label: "Ask for help re-prioritizing", traitWeights: tw({ communication: 3, peopleHelping: 2 }) },
    ],
  },
  {
    id: "adv_selfManagement_1",
    trait: "Self Management",
    title: "Without anyone checking in, your motivation…",
    type: "single",
    options: [
      { value: "stays_high", label: "Stays high — you set your own goals", traitWeights: tw({ independence: 6, structure: 3 }) },
      { value: "needs_structure", label: "Needs some structure to stay on track", traitWeights: tw({ structure: 5 }) },
      { value: "depends_project", label: "Depends heavily on the project", traitWeights: tw({ creative: 3, riskTolerance: 2 }) },
      { value: "drops_accountability", label: "Drops — you do better with accountability", traitWeights: tw({ peopleHelping: 2, communication: 2 }) },
    ],
  },
];

export const TOTAL_ADVANCED_QUESTIONS = ADVANCED_QUESTIONS.length;
/** ~12s per question — lands the full advanced set inside 5–7 minutes. */
export const ESTIMATED_ADVANCED_MINUTES = Math.max(5, Math.round((TOTAL_ADVANCED_QUESTIONS * 12) / 60));

export const ADVANCED_TRAITS: string[] = Array.from(
  new Set(ADVANCED_QUESTIONS.map((q) => q.trait).filter((t): t is NonNullable<typeof t> => Boolean(t))),
);

export function questionById(id: string): DiscoveryQuestion | undefined {
  return BASIC_QUESTIONS.find((q) => q.id === id) ?? ADVANCED_QUESTIONS.find((q) => q.id === id);
}
