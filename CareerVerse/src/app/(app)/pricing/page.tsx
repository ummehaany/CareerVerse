import type { Metadata } from "next";
import { verifySession } from "@/lib/firebase/auth";
import { getSubscriptionSnapshot } from "@/lib/firebase/firestore/subscription";
import { PricingView } from "@/features/subscription/components/pricing-view";

export const metadata: Metadata = { title: "Pricing" };

export default async function PricingPage() {
  const decoded = await verifySession();
  const snapshot = decoded ? await getSubscriptionSnapshot(decoded.uid) : null;
  return <PricingView isPro={snapshot?.isPro ?? false} />;
}
