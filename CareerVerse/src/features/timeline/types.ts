export type TimelineItemType = "milestone" | "checkpoint";

export interface TimelineItem {
  id: string;
  label: string;
  detail: string;
  weekOffset: number;
  dateLabel: string;
  type: TimelineItemType;
  done: boolean;
}

export interface TimelinePageData {
  careerTitle: string | null;
  items: TimelineItem[];
  totalWeeks: number;
  completed: number;
}
