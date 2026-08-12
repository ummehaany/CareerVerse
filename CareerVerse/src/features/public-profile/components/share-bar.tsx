"use client";

import { useState } from "react";
import { buildShareLinks } from "@/lib/profile/public-config";
import { recordProfileShare } from "../actions";

function Icon({ path, size = 16 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

const P = {
  copy: "M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z",
  check: "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z",
  linkedin: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.5 8.65 22 10.6 22 14v7h-4v-6.2c0-1.48-.03-3.38-2.06-3.38-2.06 0-2.38 1.6-2.38 3.27V21H9z",
  x: "M18.9 2H22l-7.5 8.6L23 22h-6.8l-5-6.6L5.4 22H2l8-9.2L1.5 2h6.9l4.6 6.1zM17.6 20h1.9L7.5 4H5.4z",
  whatsapp: "M20 11.9a8 8 0 0 1-11.9 7L4 20l1.2-4a8 8 0 1 1 14.8-4.1zm-8-6.4A6.4 6.4 0 0 0 6.5 15l-.7 2.3 2.4-.6a6.4 6.4 0 1 0 3.8-11.2zm3.7 8.1c-.2-.1-1.2-.6-1.4-.6-.2-.1-.3-.1-.5.1l-.6.7c-.1.1-.2.2-.4.1a5.2 5.2 0 0 1-2.6-2.2c-.2-.3.2-.3.5-.9.1-.1 0-.3 0-.4l-.6-1.4c-.2-.4-.3-.3-.5-.3h-.4a.8.8 0 0 0-.6.3c-.2.2-.7.7-.7 1.7s.8 2 .9 2.1c.1.2 1.5 2.4 3.7 3.3 1.4.6 1.9.6 2.6.5.4 0 1.2-.5 1.4-1 .2-.5.2-.9.1-1z",
  mail: "M2 4h20v16H2zm2 2v.5l8 5 8-5V6H4zm16 3-8 5-8-5v9h16z",
};

export function ShareBar({ url, name, username }: { url: string; name: string; username: string }) {
  const [copied, setCopied] = useState(false);
  const links = buildShareLinks(url, name);

  const open = (href: string) => {
    void recordProfileShare(username);
    window.open(href, "_blank", "noopener,noreferrer");
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard may be blocked */
    }
    setCopied(true);
    void recordProfileShare(username);
    setTimeout(() => setCopied(false), 1600);
  };

  const btn = "inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-foreground/5";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={copy} className={btn} aria-label="Copy profile link">
        <Icon path={copied ? P.check : P.copy} />
        {copied ? "Copied" : "Copy link"}
      </button>
      <button type="button" onClick={() => open(links.linkedin)} className={btn} aria-label="Share on LinkedIn"><Icon path={P.linkedin} /> LinkedIn</button>
      <button type="button" onClick={() => open(links.twitter)} className={btn} aria-label="Share on X"><Icon path={P.x} /> X</button>
      <button type="button" onClick={() => open(links.whatsapp)} className={btn} aria-label="Share on WhatsApp"><Icon path={P.whatsapp} /> WhatsApp</button>
      <button type="button" onClick={() => open(links.email)} className={btn} aria-label="Share via email"><Icon path={P.mail} /> Email</button>
    </div>
  );
}
