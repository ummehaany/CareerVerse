"use client";

import type { ComponentType, ReactNode } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import type { IconProps } from "@/components/ui/icon";
import {
  TrendingUpIcon,
  SparklesIcon,
  MicIcon,
  FileTextIcon,
  RouteIcon,
  PuzzleIcon,
  ChartIcon,
  FlagIcon,
  ClockIcon,
} from "@/components/ui/icon";
import { AwardIcon } from "@/components/ui/icons-extended";
import type { AnalyticsData } from "../types";
import { LevelCard } from "./level-card";
import { LineChart } from "./line-chart";
import { BarChart } from "./bar-chart";
import { ProgressRing } from "./progress-ring";
import { AchievementCard } from "./achievement-card";
import { WeeklyReport } from "./weekly-report";

function Tile({
  icon: Icon,
  label,
  children,
  accent = "--primary",
}: {
  icon: ComponentType<IconProps>;
  label: string;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <Card className="space-y-1.5 p-4">
      <div className="flex items-center gap-1.5">
        <Icon size={14} style={{ color: `var(${accent})` }} />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">{label}</p>
      </div>
      {children}
    </Card>
  );
}

function ChartCard({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<IconProps>;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon size={16} />
        </span>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

export function AnalyticsView({ data }: { data: AnalyticsData }) {
  const c = data.charts;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-up">
      <PageHeader
        title="Career Analytics & Achievements"
        description="Track your growth, unlock achievements, and level up across your entire career journey."
      />

      <LevelCard level={data.level} sources={data.xpSources} />

      {/* Quick-glance widgets */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Tile icon={SparklesIcon} label="Current level" accent="--primary">
          <p className="text-lg font-bold">
            Lv {data.level.level}
            <span className="ml-1 text-xs font-medium text-subtle">{data.level.title}</span>
          </p>
        </Tile>
        <Tile icon={TrendingUpIcon} label="Learning streak" accent="--accent-interview">
          <p className="text-lg font-bold tabular-nums">
            {data.streak}
            <span className="ml-1 text-xs font-medium text-subtle">days</span>
          </p>
        </Tile>
        <Tile icon={ChartIcon} label="Readiness" accent="--accent-assessment">
          <p className="text-lg font-bold tabular-nums">{data.careerReadiness}%</p>
        </Tile>
        <Tile icon={AwardIcon} label="Recent achievement" accent="--accent-mentor">
          <p className="truncate text-sm font-semibold">{data.recentAchievement?.title ?? "None yet"}</p>
        </Tile>
        <Tile icon={FlagIcon} label="Weekly goal" accent="--accent-roadmap">
          <p className="text-sm font-semibold leading-snug">{data.weeklyGoal}</p>
        </Tile>
        <Tile icon={SparklesIcon} label="Daily motivation" accent="--accent-resume">
          <p className="text-xs italic leading-snug text-muted">{data.dailyMotivation}</p>
        </Tile>
      </div>

      {/* Interactive charts */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Your analytics</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard icon={TrendingUpIcon} title="Career readiness over time">
            <LineChart points={c.readinessTrend} color="var(--primary)" suffix="%" ariaLabel="Career readiness over time" />
          </ChartCard>
          <ChartCard icon={PuzzleIcon} title="Skills acquired">
            <LineChart points={c.skillsAcquired} color="var(--accent-roadmap)" ariaLabel="Skills acquired over time" />
          </ChartCard>
          <ChartCard icon={MicIcon} title="Interview scores">
            <BarChart points={c.interviewScores} color="var(--accent-interview)" suffix="" ariaLabel="Interview scores" />
          </ChartCard>
          <ChartCard icon={FileTextIcon} title="Resume score improvements">
            <LineChart points={c.resumeHistory} color="var(--accent-resume)" suffix="%" ariaLabel="Resume score improvements" />
          </ChartCard>
          <ChartCard icon={TrendingUpIcon} title="Learning streak">
            <BarChart points={c.learningStreak} color="var(--accent-interview)" suffix="%" ariaLabel="Learning streak" />
          </ChartCard>
          <ChartCard icon={ClockIcon} title="Weekly learning hours">
            <BarChart points={c.weeklyLearningHours} color="var(--accent-roadmap)" suffix="h" ariaLabel="Weekly learning hours" />
          </ChartCard>
          <ChartCard icon={ChartIcon} title="Weekly activity">
            <BarChart points={c.weeklyActivity} color="var(--accent-mentor)" suffix="%" ariaLabel="Weekly activity" />
          </ChartCard>
          <ChartCard icon={TrendingUpIcon} title="Monthly progress">
            <LineChart points={c.monthlyProgress} color="var(--primary)" suffix="%" ariaLabel="Monthly progress" />
          </ChartCard>
          <ChartCard icon={PuzzleIcon} title="Skill growth timeline">
            <LineChart points={c.skillGrowth} color="var(--accent-assessment)" suffix="%" ariaLabel="Skill growth timeline" />
          </ChartCard>
          <ChartCard icon={RouteIcon} title="Roadmap completion">
            <div className="flex items-center justify-center gap-6 py-2">
              <ProgressRing value={c.roadmapCompletion} size={128} color="var(--accent-roadmap)">
                <span className="text-2xl font-bold tabular-nums">{c.roadmapCompletion}%</span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-subtle">complete</span>
              </ProgressRing>
              <p className="max-w-[160px] text-sm text-muted">
                Milestones completed across your active learning roadmap.
              </p>
            </div>
          </ChartCard>
        </div>
      </section>

      {/* Achievements */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Achievements</h2>
          <p className="text-sm text-muted">
            <span className="font-semibold text-foreground tabular-nums">{data.achievementsUnlocked}</span> / {data.achievementsTotal} unlocked
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data.achievements.map((a) => (
            <AchievementCard key={a.id} achievement={a} />
          ))}
        </div>
      </section>

      <WeeklyReport report={data.weeklyReport} />
    </div>
  );
}
