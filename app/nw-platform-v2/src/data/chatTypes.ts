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
  /** NEW (amendment A20, PI2-D47). Discriminates which of the response
   * canvas's four layouts (Section 2.9.9) StudioAsk renders this entry through.
   * Omitted = 'instructional'-equivalent rendering -- backward compatible
   * with every pre-A20 entry in both `ONSIDE_CHAT`/`STUDIO_CHAT`. Read
   * ONLY by StudioAsk's response canvas; `AskChatPanel`/`ChatHero`'s
   * Drawer-hosted bubble surface (unchanged, all six remaining
   * `onside.*`/`studio.*` screens) ignores this field entirely and always
   * renders `responseText`+`deepLinks` regardless of its presence -- this
   * is how "the OnSide drawer chat gains the compliance-attainment
   * response type via content" (PI2-D47) ships with zero surface change. */
  response?: ChatEntryResponse;
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

/* ============================================================
 * Amendment A20 (PI2-D47) -- response-type vocabulary, spec Section 2.9.9/2.9.10.
 * Additive only: every field below is new; `ChatEntry.response` is
 * optional and its absence renders exactly as every pre-A20 entry already
 * does today ('instructional'-equivalent -- see `ChatEntry.response`'s own
 * doc comment below). Nothing above this block changes shape.
 * ============================================================ */

/** One discriminant per Section 2.9.9's four response-canvas layouts, matching
 * PI2-D47(a)-(d) verbatim: document questions, policy/how-to questions,
 * opportunity-project questions, OnSide-context questions. */
export type ChatResponseType = 'document' | 'instructional' | 'opportunity-status' | 'compliance-attainment';

/** 'document'/'instructional' carry no extra fields -- their canvas layout
 * needs nothing beyond `responseText`/`deepLinks` (Section 2.9.9(a)/(b)). The
 * discriminant alone decides whether `deepLinks` is required non-empty
 * (`document`) or optional (`instructional`) -- enforced by the response
 * canvas, not by these two interfaces' shape (both are structurally
 * identical on purpose; the distinction is authoring intent, Section 2.9.9(b)). */
export interface ChatEntryDocumentResponse {
  responseType: 'document';
}
export interface ChatEntryInstructionalResponse {
  responseType: 'instructional';
}

/** `opportunityId` is `PlanOpportunity.n` (engine/plan.ts) -- the SAME id
 * the live `OPPS`/`DETAIL` pool and the relocated register (Section 2.9.11) key
 * on. The response canvas resolves cost/value/horizon/gate/status LIVE by
 * this id at render time; this schema never carries a duplicate of those
 * fields (PI2-D28, restated at Section 2.9.10). */
export interface ChatEntryOpportunityStatusResponse {
  responseType: 'opportunity-status';
  opportunityId: string;
}

/** `domainKey` is `OnsideDomain.key` (`data/onside.ts` `DOMAINS`) -- the
 * response canvas resolves name/bodies (the OCC/NCUA/CFPB/FFIEC/FinCEN
 * framing text)/met/target LIVE by this key; this schema never carries a
 * duplicate of those fields (PI2-D28, restated at Section 2.9.10). */
export interface ChatEntryComplianceAttainmentResponse {
  responseType: 'compliance-attainment';
  domainKey: string;
}

export type ChatEntryResponse =
  | ChatEntryDocumentResponse
  | ChatEntryInstructionalResponse
  | ChatEntryOpportunityStatusResponse
  | ChatEntryComplianceAttainmentResponse;
