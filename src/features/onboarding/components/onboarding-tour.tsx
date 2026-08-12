"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SparklesIcon, ArrowRightIcon, ChevronLeftIcon, XIcon, CheckCircleIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { TOUR_STEPS, START_TOUR_EVENT } from "../steps";
import { completeTourAction } from "../actions";

type Phase = "idle" | "welcome" | "tour" | "done";
const PAD = 8;
const CARD_W = 340;
const EST_CARD_H = 230;

function findTarget(key: string): HTMLElement | null {
  const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${key}"]`));
  return els.find((el) => el.offsetParent !== null && el.getBoundingClientRect().width > 0) ?? null;
}

export function OnboardingTour({ startOpen }: { startOpen: boolean }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const persisted = useRef(false);

  useEffect(() => {
    if (startOpen) setPhase("welcome");
  }, [startOpen]);

  useEffect(() => {
    const onStart = () => {
      persisted.current = false;
      setStep(0);
      setPhase("welcome");
    };
    window.addEventListener(START_TOUR_EVENT, onStart);
    return () => window.removeEventListener(START_TOUR_EVENT, onStart);
  }, []);

  useEffect(() => {
    if (phase !== "tour") return;
    const measure = () => {
      const el = findTarget(TOUR_STEPS[step].target);
      if (el) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };
    measure();
    const t = window.setTimeout(measure, 120);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [phase, step]);

  useEffect(() => {
    if (phase !== "idle") cardRef.current?.focus();
  }, [phase, step]);

  const persist = useCallback(() => {
    if (persisted.current) return;
    persisted.current = true;
    void completeTourAction();
  }, []);

  const close = useCallback(() => {
    persist();
    setPhase("idle");
  }, [persist]);

  const next = useCallback(() => {
    setStep((s) => {
      if (s < TOUR_STEPS.length - 1) return s + 1;
      setPhase("done");
      return s;
    });
  }, []);

  const prev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  useEffect(() => {
    if (phase !== "tour") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, close, next, prev]);

  function goAssessment() {
    persist();
    setPhase("idle");
    router.push(ROUTES.assessment);
  }
  function goDashboard() {
    persist();
    setPhase("idle");
    router.push(ROUTES.dashboard);
  }

  if (phase === "idle") return null;

  if (phase === "welcome") {
    return (
      <Overlay dim>
        <div
          ref={cardRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cv-tour-welcome-title"
          className="animate-fade-up w-full max-w-md rounded-2xl border border-border bg-background p-6 text-center shadow-2xl outline-none sm:p-8"
        >
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <SparklesIcon size={28} />
          </span>
          <h2 id="cv-tour-welcome-title" className="mt-4 text-2xl font-bold tracking-tight">Welcome to CareerVerse</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Let&apos;s take a quick 60-second tour to help you discover everything CareerVerse can do.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => setPhase("tour")}>
              Start tour <ArrowRightIcon size={16} />
            </Button>
            <Button variant="outline" onClick={close}>Skip for now</Button>
          </div>
        </div>
      </Overlay>
    );
  }

  if (phase === "done") {
    return (
      <Overlay dim>
        <div
          ref={cardRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cv-tour-done-title"
          className="animate-fade-up w-full max-w-md rounded-2xl border border-border bg-background p-6 text-center shadow-2xl outline-none sm:p-8"
        >
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success/10 text-success">
            <CheckCircleIcon size={30} />
          </span>
          <h2 id="cv-tour-done-title" className="mt-4 text-2xl font-bold tracking-tight">You&apos;re Ready!</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            You now know everything CareerVerse has to offer. Start your journey with Career Discovery.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={goAssessment}>
              Start assessment <ArrowRightIcon size={16} />
            </Button>
            <Button variant="outline" onClick={goDashboard}>Go to dashboard</Button>
          </div>
        </div>
      </Overlay>
    );
  }

  const s = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  let cardPos: React.CSSProperties;
  if (rect) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const spaceRight = vw - rect.right;
    if (spaceRight > CARD_W + 24) {
      cardPos = { top: Math.min(Math.max(rect.top - 8, 12), vh - EST_CARD_H - 12), left: rect.right + 14, width: CARD_W };
    } else {
      cardPos = { top: Math.min(vh - EST_CARD_H - 12, Math.max(12, vh / 2 - EST_CARD_H / 2)), left: Math.max(12, vw / 2 - CARD_W / 2), width: CARD_W };
    }
  } else {
    cardPos = { top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: CARD_W };
  }

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="cv-tour-step-title">
      <div className="absolute inset-0" onClick={close} aria-hidden="true" />

      {rect ? (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-primary transition-all duration-300"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
      )}

      <div
        ref={cardRef}
        tabIndex={-1}
        style={cardPos}
        className="animate-fade-up absolute max-w-[calc(100vw-24px)] rounded-2xl border border-border bg-background p-4 shadow-2xl outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            Step {step + 1} of {TOUR_STEPS.length}
          </span>
          <button type="button" onClick={close} aria-label="Skip tour" className="rounded-md p-0.5 text-subtle hover:text-foreground">
            <XIcon size={15} />
          </button>
        </div>
        <h3 id="cv-tour-step-title" className="mt-1 text-base font-semibold tracking-tight">{s.title}</h3>
        <p className="mt-1 text-sm text-muted">{s.body}</p>

        <div className="mt-3 flex items-center gap-1">
          {TOUR_STEPS.map((_, i) => (
            <span key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-4 bg-primary" : "w-1.5 bg-foreground/20")} />
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button type="button" onClick={close} className="text-xs font-medium text-subtle hover:text-foreground">
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={prev} disabled={step === 0}>
              <ChevronLeftIcon size={16} /> Previous
            </Button>
            <Button size="sm" onClick={next}>
              {isLast ? "Finish" : "Next"} <ArrowRightIcon size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Overlay({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <div className={cn("fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in", dim && "bg-black/55")}>
      {children}
    </div>
  );
}
