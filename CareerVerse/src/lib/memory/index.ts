/**
 * AI Memory — reusable long-term memory service.
 *
 * Clear separation of concerns:
 *   - storage/updates  → @/lib/firebase/firestore/memory
 *   - retrieval        → ./service (buildMemoryProfile, buildMemoryTimeline)
 *   - AI context       → ./context (buildMemoryContext, formatMemoryContext, withMemory)
 *   - types            → ./types
 *
 * Any future AI feature gets personalization "for free" by calling
 * buildMemoryContext(uid) and passing the result into its prompt.
 */
export * from "@/lib/memory/types";
export { buildMemoryProfile, buildMemoryTimeline } from "@/lib/memory/service";
export { buildMemoryContext, formatMemoryContext, withMemory } from "@/lib/memory/context";
