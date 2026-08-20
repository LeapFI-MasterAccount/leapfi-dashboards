/**
 * Ask chat content schema — design_system_spec.md §2.9.4 (amendment A16,
 * PI2-D42, "Content schema — scripted Q&A, per module").
 *
 * The ruling defines four TypeScript-flavored interfaces "for precision,
 * not as a code hand-off — the implementer lane owns the concrete `.ts`
 * authoring." This file is that concrete authoring: the TYPE CONTRACT only,
 * no content. Marisol's concurrent, disjoint lane authors the SCRIPTED
 * CONTENT (the `ChatEntry[]` arrays, plus each module's fixed chrome
 * fields) against these same types in her own content file — this dispatch
 * (Lena's) deliberately does not create or touch that file, so neither
 * lane edits the other's territory (§2.9.4: "Marisol authors content into
 * this schema; Lena builds the consumer of it; neither improvises the
 * shape").
 *
 * `ChatEntryDeepLink.request` is typed as the real `DeepLinkRequest` (not
 * the schema's own generic `{ screen: string; kind: string; id: string }`
 * placeholder) — the ruling itself states the field is "passed verbatim to
 * onDeepLink — App.tsx's existing DeepLinkRequest contract... unchanged,"
 * so importing the real, already-generated type here (rather than
 * hand-rolling a shadow shape) is Core Principle 2 ("the contract is
 * generated, not remembered"): drift between this schema and App.tsx's
 * `ScreenId`/`DeepLinkKind` unions is now a compile-time error, not a
 * runtime surprise.
 */
import type { DeepLinkRequest } from '../App';

export type ChatModule = 'onside' | 'studio';

/** One inline cross-reference a scripted answer can carry — rendered per
 * §2.9.3 item 3 as a keyboard-operable inline navigating link beneath the
 * assistant's message bubble. */
export interface ChatEntryDeepLink {
  /** Visible inline-link text, e.g. "See MRM-09 in Ownership." */
  label: string;
  /** Passed verbatim to `onDeepLink` (App.tsx's existing contract). */
  request: DeepLinkRequest;
}

/** One scripted question/answer pair. */
export interface ChatEntry {
  id: string;
  /** The suggestion Chip's visible AND fill text, and simultaneously the
   * exact-match key a freely-typed submission is checked against
   * (case-insensitive, trimmed). One field, not two — see §2.9.4. */
  question: string;
  /** `ChatMessage.text` for the assistant's reply — plain text, no markup. */
  responseText: string;
  /** Zero or more inline references into real screens. */
  deepLinks?: ChatEntryDeepLink[];
}

/** One module's chat configuration — chrome fields authored per §2.9.4/
 * §2.9.5 (this amendment's own text; not Marisol's per-entry content) plus
 * the module's scripted `entries` set (Marisol's territory). */
export interface ChatModuleConfig {
  module: ChatModule;
  /** Drawer `title` — the scoping indicator: "OnSide chat" / "Studio chat"
   * (§2.9.4, §2.9.1 item 2's C7-baseline reuse). */
  drawerTitle: string;
  /** Utility-corner trigger Button label (§2.9.5): "Ask OnSide" / "Ask
   * Studio". */
  entryLabel: string;
  /** ChatHero's `inputLabel`/`inputPlaceholder` (§2.9.3 item 1) — required
   * at this amendment's call sites (ChatHero.tsx's own Studio·Ask-specific
   * defaults are factually wrong for a module-scoped chat). */
  inputLabel: string;
  inputPlaceholder: string;
  /** Seeds the first assistant `ChatMessage.text` at every fresh open
   * (§2.9.5 — never resumes a prior session's transcript). */
  greeting: string;
  /** ChatHero's existing `noMatchMessage` prop. */
  defaultNoMatchMessage: string;
  /** Marisol's scripted set for this module. */
  entries: ChatEntry[];
}
