import { verifySession } from "@/lib/firebase/auth";
import { getLatestRoadmap } from "@/lib/firebase/firestore/roadmaps";
import type { TimelineItem, TimelinePageData } from "./types";

function parseWeeks(text: string): number {
  const lower = text.toLowerCase();
  const nums = (lower.match(/\d+/g) ?? []).map(Number);
  const avg = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 2;
  if (lower.includes("month")) return Math.max(1, Math.round(avg * 4.3));
  if (lower.includes("day")) return Math.max(1, Math.round(avg / 7));
  return Math.max(1, Math.round(avg));
}

/** Build a dated, visual timeline from the user's active roadmap. */
export async function getTimelinePageData(): Promise<TimelinePageData> {
  const decoded = await verifySession();
  if (!decoded) return { careerTitle: null, items: [], totalWeeks: 0, completed: 0 };

  const roadmap = await getLatestRoadmap(decoded.uid);
  if (!roadmap) return { careerTitle: null, items: [], totalWeeks: 0, completed: 0 };

  const now = new Date();
  const fmt = (weeks: number) =>
    new Date(now.getTime() + weeks * 7 * 86_400_000).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

  const items: TimelineItem[] = [
    {
      id: "start",
      label: "Today",
      detail: "Your journey begins",
      weekOffset: 0,
      dateLabel: fmt(0),
      type: "checkpoint",
      done: true,
    },
  ];

  let offset = 0;
  let completed = 0;

  for (const stage of roadmap.stages) {
    for (const milestone of stage.milestones) {
      offset += parseWeeks(milestone.estimatedTime);
      const done = roadmap.progress?.[milestone.id] === "completed";
      if (done) completed += 1;
      items.push({
        id: milestone.id,
        label: milestone.title,
        detail: `${stage.title} · ${milestone.estimatedTime}`,
        weekOffset: offset,
        dateLabel: fmt(offset),
        type: "milestone",
        done,
      });
    }
  }

  offset += 3;
  items.push({
    id: "portfolio",
    label: "Polish your portfolio",
    detail: "Showcase 2–3 standout projects",
    weekOffset: offset,
    dateLabel: fmt(offset),
    type: "checkpoint",
    done: false,
  });
  offset += 2;
  items.push({
    id: "interview",
    label: "Interview preparation",
    detail: "Run mock interviews and refine your answers",
    weekOffset: offset,
    dateLabel: fmt(offset),
    type: "checkpoint",
    done: false,
  });
  offset += 1;
  items.push({
    id: "jobready",
    label: "Job-ready",
    detail: `Start applying for ${roadmap.careerTitle} roles`,
    weekOffset: offset,
    dateLabel: fmt(offset),
    type: "checkpoint",
    done: false,
  });

  return { careerTitle: roadmap.careerTitle, items, totalWeeks: offset, completed };
}
