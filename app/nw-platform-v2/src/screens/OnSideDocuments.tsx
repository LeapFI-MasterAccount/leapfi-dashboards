/**
 * OnSideDocuments — Screen anatomy §5.3 "OnSide · Documents — Step 3 'Rules
 * made executable'" (design_system_spec.md), fed by demo_script_draft.md
 * Step 3 and its G4 gap-register entry.
 *
 * Region map (§5.3): Topbar → page title → FilterBar (doc-status filters,
 * optional) → DataTable (`row kind: redline-row/doc-row`, ~130 entries) →
 * (on row open) Drawer with RedlineDiffView (C9) + HITL Tag (P4) + footer
 * actions. Components used per spec: Topbar, Sidebar, FilterBar (C5),
 * DataTable (C6), Drawer (C7), DrawerContent (C8, `kind: doc`),
 * RedlineDiffView (C9), Tag (`hitl`), Button (`primary`/`ghost`/`row`),
 * Toast (C17).
 *
 * SUPERSEDED — Topbar/Sidebar data ownership (amendment A11,
 * design_system_spec.md §3.0): both composites now mount exactly once, in
 * App.tsx's persistent Shell — this screen no longer accepts a `topbar`
 * prop or builds a local `SidebarProps`. It also no longer accepts
 * `onNavigate`: unlike most sibling screens, this one never called it
 * directly (every internal action here is a Drawer open/close or a
 * deep-link, not a screen change), so that plumbing was dead the moment
 * its only consumer (the local `sidebarProps` construction) was removed.
 *
 * AMBIGUITY RESOLVED — Drawer single-instance scoping (C7 a11y baseline:
 * "single shared instance app-wide... never a second instance"): this
 * dispatch's allowlist is this file alone, and no router/shell wiring
 * exists yet in this worktree (`App.tsx` is still the D14 scaffold
 * placeholder) — screens are standalone. This file mounts its own local
 * `<Drawer>`, which trivially satisfies "never a second simultaneous
 * instance" under normal SPA routing (only one screen mounts at a time);
 * same "defer final ownership to the integrator" pattern `Home.tsx` already
 * uses for Topbar/Sidebar. STOP-item for whoever wires real routing: confirm
 * only one screen's Drawer is ever mounted at a time, or hoist Drawer to a
 * shared shell.
 *
 * FIX WAVE (ONSIDE-02 / ONSIDE-11) — Adopt cascade routed through the
 * shared demo store, base semantics VERBATIM: the earlier screen-local
 * cascade (`cascadeTargetsForDoc` + `obligationOverrides`/
 * `resolvedGapKeys` useState) trapped the Step-3 adoption inside this
 * screen — OnSide Overview and the Domains accordion still showed the
 * pre-adopt truth ("every view moves together" is the base's own
 * guarantee, applyGapClosure comment at source 3204), and navigating away
 * discarded the adoption entirely. Now:
 *   - `handleAdopt` calls `state/demoStore.ts`'s `applyGapClosure(docId)`
 *     (base 3205–3211 verbatim: keyed STRICTLY on `(g.rl||g.doc)===docId`
 *     over GAPS, flips the OBL row + `d.met++` on the live singletons and
 *     emits to every subscribed screen). The screen's former extra
 *     `doc.obl`-driven branch (b) — which closed MRM-11 on gen-ai-draft
 *     adoption, EXCEEDING the base anchor — is REMOVED per ONSIDE-11: in
 *     base, adopting gen-ai-draft flips nothing.
 *   - Document-level adopted state is no longer session-local `useState`:
 *     the base rlAction('adopted') cosmetics (source 2474–2483 — version
 *     minor bump, `status='good'`, an `rlState` marker) are applied to
 *     the live `DOCLIB` entry, so the adoption survives navigation, every
 *     DOCLIB reader agrees, and `resetDemo()` restores it (the store
 *     reseeds DOCLIB from its DEMO_SEED snapshot). Gap-board closure is
 *     derived from that same `rlState` (base gapState, source 3195–3202).
 *   - This screen subscribes via `useDemoStore()`; obligation registers
 *     render the live `OBL` rows directly (no overrides layer).
 *
 * AMBIGUITY RESOLVED — no dedicated "domain view" screen: §5.3 describes a
 * post-Adopt `dom-` deep link landing on "a separate domain view (below),
 * one hop deeper... still reached via the existing single-level nav
 * engine... not a new nesting layer" — but design_system_spec.md §2.3's own
 * 7-screen inventory has no dedicated domain-view screen, and this
 * dispatch's allowlist is `OnSideDocuments.tsx`/`StudioAsk.tsx` only, with
 * no domain-view file named anywhere. The "Domain impact" section below is
 * therefore built as an in-page section of this same screen (visible below
 * the fold, scrolled/focused into on Toast's "View impact →" link) rather
 * than a new screen file — literally "one hop deeper," not a new screen.
 *
 * AMBIGUITY RESOLVED — cascade timing vs. spec's `CascadePlaying`/
 * `CascadeAnnounced` states (§5.3 state machine): the obligation data
 * itself flips the moment the (simulated) server commit resolves
 * (`Adopted`) — Core Principle 3 forbids a screen showing stale/wrong
 * status once the server has actually confirmed a change, so the source of
 * truth updates immediately, not lazily. What is deliberately *deferred*
 * to the "View impact →" click (`CascadePlaying`) is the **presentational**
 * cascade — the transient row-highlight pulse and the single summarized
 * `aria-live` announcement — matching the spec's own reasoning for not
 * auto-navigating on Adopt ("keeps the next click visible and
 * discoverable... a pattern that depends on presenter memory is not a
 * pattern").
 *
 * HTML entity/inline-tag decoding: doclib.ts's own file header notes the
 * source renders `t`/`line`/`secs`/`redline` fields via `innerHTML` and
 * instructs the consuming component to decode them the same way to
 * reproduce the original output. `DrawerContent`, `RedlineDiffView`, and
 * `DataTable` cell text all take plain strings (no `dangerouslySetInnerHTML`
 * anywhere in this worktree's composites), so `decodeDocText` below decodes
 * the small set of named entities this dataset actually uses and strips the
 * handful of inline tags (`<b>`, `&amp;` etc.) rather than leaving literal
 * "&rsquo;"/"<b>" text on screen — not a general HTML parser, deliberately
 * scoped to this dataset's known vocabulary.
 *
 * Irreversibility gate (persona directive 6): Adopt is the "irreversible-
 * feeling approval action" §7 names explicitly. Double-submission is
 * prevented two ways: (1) UX courtesy — the Adopt Button's own `loading`
 * state disables it the instant a press starts; (2) the actual guarantee —
 * a monotonically-incrementing `requestSeqRef` counter is captured at press
 * time and re-checked when the simulated commit resolves, so only the
 * *latest* Adopt press for a screen ever applies its cascade (a stale,
 * superseded commit is a silent no-op), and the live `rlState` adopted
 * marker plus `adoptingDocId` both serialize Adopt globally (only one
 * commit in flight at a time, and a doc already adopted can never be
 * re-adopted). The cascade write itself is also idempotent by construction
 * (the store's `applyGapClosure` skips GAPS entries already `applied` and
 * obligations already `'met'`), so even a slipped-through double-press
 * cannot double-apply a state change.
 *
 * FIX WAVE (ONSIDE-13) — focus fallback after a filtered-away Adopt: with
 * the "Pending" redline filter active, adopting removes the triggering
 * row from the table, so Drawer's own restore-to-trigger guard
 * (`document.body.contains(target)`) correctly skips and focus would land
 * on `document.body`. The adopt commit therefore schedules a fallback
 * (after the Drawer's 200ms close transition): if focus is on body, it
 * moves to this screen's page heading (`tabIndex={-1}`) — never fighting
 * the Drawer's own restore when the row is still mounted.
 *
 * Accessibility gate (persona directive 7): main document table and both
 * obligation registers are real `<table>` semantics via `DataTable` (C6);
 * FilterBar (C5) supplies keyboard-operable disclosure filters; Drawer (C7)
 * traps focus, moves initial focus to its heading, and restores focus to
 * the triggering row button on close (all inherited from `Drawer.tsx`,
 * unmodified here); the redline diff is never color-only (`RedlineDiffView`
 * C9's own +/− glyph + `<ins>`/`<del>` baseline, unmodified here); the
 * cascade's status change is announced once via a screen-owned
 * `aria-live="polite"` region (never per-row, matching C6's own a11y
 * baseline reservation) triggered by the discoverable Toast link, not
 * silently on Adopt.
 *
 * Tests: this worktree now carries Vitest + Testing Library — this
 * screen's regression suite lives in `src/__tests__/onside/` (the earlier
 * "no test runner installed" STOP-item recorded here is resolved and
 * removed). FIX WAVE (ONSIDE-12): Status filter chip counts are computed
 * per render from the same live doc status the filter matches against —
 * the previous module-scope `DOC_STATUS_COUNTS` snapshot advertised
 * pre-adoption counts while the filter yielded post-adoption rows.
 *
 * FIX WAVE (B-dead-interactions-01 / -02 / -07) — the gap board and both
 * domain-impact obligation registers had no `rowAction` at all (base
 * anchors: gap-board rows onclick openObl/openDocView, leapfi-platform.html
 * 3226; obligation-register rows onclick openObl, 3106) — the v1 obligation-
 * detail drawer (evidence trail, "Approve & adopt" path) had no entry point
 * anywhere in the twin. Both tables now carry a real `rowAction` that opens
 * an obligation-detail Drawer (reusing this screen's existing single
 * `<Drawer>` instance via a discriminated `openDocId`/`openObligation`
 * target — never a second instance); the gap board opens the obligation
 * drawer when a row's `obl` is set, else the doc drawer for its `doc`. The
 * doc drawer's own "Obligations evidenced" field (previously a flattened,
 * comma-joined string — B-dead-interactions-07) is now a row of real
 * `DrawerContent` action Buttons, one per evidenced obligation id, each
 * opening that obligation's own drawer (`findRedlineDocForObligation`,
 * exported by this dispatch's sibling `views/DomainsAccordion.tsx`, locates
 * the domain an obligation id belongs to and the redline doc — if any —
 * whose Adopt actually closes it). "Approve & adopt" from the obligation
 * drawer reuses this screen's existing `handleAdopt` verbatim (same
 * request-key idempotency, same live DOCLIB mutation, same
 * `applyGapClosure` cascade) — one real closing mechanism, opened from two
 * entry points. Base's other openObl action ("Attach evidence to close this
 * item") has no backing store mutation in this worktree for non-redline-
 * backed gaps (no attach-evidence engine exists) and is not rendered as a
 * live-looking control with nothing behind it (Core Principle 1).
 *
 * FIX WAVE (A-overlap-04 cleanup) — `Toast.tsx` is now self-positioning
 * (fixed bottom-center, its own anchor) per that fix's own file header;
 * this screen's local `TOAST_WRAP_STYLE` fixed top-right wrapper is
 * removed as the now-inert leftover that fix's header flagged for the
 * screen-owning batch to clear.
 *
 * Layout constants (240px sidebar column, 2rem content padding): not in
 * design_system_spec.md §1.4's token-only scope by design; copied verbatim
 * from `Home.tsx`'s own documented implementer judgment call for visual
 * consistency across screens, not re-derived independently.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { DeepLinkScreenProps } from '../App';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn, DataTableRowAction } from '../components/DataTable';
import { FilterBar } from '../components/FilterBar';
import type { FilterGroup } from '../components/FilterBar';
import { Drawer } from '../components/Drawer';
import { DrawerContent } from '../components/DrawerContent';
import type { DrawerContentAction, DrawerContentField, DrawerContentTag } from '../components/DrawerContent';
import { RedlineDiffView } from '../components/RedlineDiffView';
import { Toast } from '../components/Toast';
import { Button } from '../components/primitives/Button';
import { Tag } from '../components/primitives/Tag';
import type { NonRaciTagVariant } from '../components/primitives/Tag';
import { AskChatPanel } from '../components/AskChatPanel';
import { DOCLIB } from '../data/doclib';
import type { DocEntry, DocStatus } from '../data/doclib';
import { DOMAINS, GAPS, OBL } from '../data/onside';
import type { GapItem, ObligationRow } from '../data/onside';
import { CURRENT } from '../data/studio';
import { findRedlineDocForObligation } from '../views/DomainsAccordion';
import { applyGapClosure, useDemoStore } from '../state/demoStore';
import { ONSIDE_CHAT_MODULE_CONFIG } from '../data/askChatModuleConfig';

/** Base rlAction's document-level adopted marker (source 2478) — runtime
 * bookkeeping attached to the live DOCLIB entry, not part of doclib.ts's
 * seeded shape (same intersection pattern the store uses for GAPS'
 * `applied` flag). */
interface DocRlState {
  act: 'adopted';
  who: string;
  when: string;
}

type LiveDoc = DocEntry & { rlState?: DocRlState };

const LIVE_DOCLIB = DOCLIB as Record<string, LiveDoc>;

type DocRow = LiveDoc & { id: string };

interface CascadeTarget {
  domain: string;
  oblId: string;
}

interface ToastState {
  variant: 'success' | 'info';
  message: string;
  cascade: CascadeTarget[];
}

const HTML_ENTITY_MAP: Record<string, string> = {
  '&amp;': '&',
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&rdquo;': '”',
  '&ldquo;': '“',
  '&ndash;': '–',
  '&mdash;': '—',
  '&quot;': '"',
  '&#39;': '’',
  '&nbsp;': ' ',
};

/** See file header "HTML entity/inline-tag decoding." */
function decodeDocText(input: string): string {
  return input
    .replace(/<\/?(b|strong|em|br)\s*\/?>/gi, '')
    .replace(/&[a-z#0-9]+;/gi, (match) => HTML_ENTITY_MAP[match] ?? match);
}

const DOMAIN_LABEL: Record<string, string> = Object.fromEntries(DOMAINS.map((d) => [d.key, d.name]));

const STATUS_TAG_VARIANT: Record<DocStatus, NonRaciTagVariant> = {
  good: 'status-positive',
  warn: 'status-caution',
  crit: 'status-alert',
};

const STATUS_LABEL: Record<DocStatus, string> = {
  good: 'Current',
  warn: 'Needs attention',
  crit: 'Critical',
};

const OBL_STATUS_LABEL: Record<ObligationRow['st'], string> = { met: 'Met', partial: 'Partial', gap: 'Gap' };
const OBL_STATUS_VARIANT: Record<ObligationRow['st'], NonRaciTagVariant> = {
  met: 'status-positive',
  partial: 'status-caution',
  gap: 'status-alert',
};

// Domain membership and redline presence are structural (never mutated at
// runtime; resetDemo reseeds identical structure), so these two stay
// module-scope. Status counts are NOT here — they are live (ONSIDE-12).
const DOC_DOMAIN_COUNTS: Record<string, number> = {};
for (const doc of Object.values(DOCLIB)) DOC_DOMAIN_COUNTS[doc.dom] = (DOC_DOMAIN_COUNTS[doc.dom] ?? 0) + 1;

const REDLINE_DOC_COUNT = Object.values(DOCLIB).filter((doc) => doc.redline).length;

function isDocAdopted(docId: string): boolean {
  return LIVE_DOCLIB[docId]?.rlState?.act === 'adopted';
}

/** Base gapState (source 3195–3202): a gap board entry is closed when the
 * doc behind it (`g.rl||g.doc`) carries an adopted rlState. */
function isGapClosed(gap: GapItem): boolean {
  const key = gap.rl ?? gap.doc;
  return key !== null && key !== undefined && isDocAdopted(key);
}

/** Which obligations THIS adoption will flip — the store's applyGapClosure
 * semantics (base 3205–3211: GAPS keyed on `(g.rl||g.doc)===docId`, target
 * obligation not yet met). No `doc.obl` branch — ONSIDE-11. */
function cascadeTargetsForDoc(docId: string): CascadeTarget[] {
  const targets: CascadeTarget[] = [];
  for (const gap of GAPS) {
    if ((gap.rl ?? gap.doc) !== docId || !gap.obl) continue;
    const [domainKey, oblId] = gap.obl;
    const row = OBL[domainKey]?.find((o) => o.id === oblId);
    if (row && row.st !== 'met') targets.push({ domain: domainKey, oblId });
  }
  return targets;
}

function gapKey(gap: GapItem): string {
  return gap.t;
}

/** B-dead-interactions-07 — which domain's obligation register a given
 * obligation id belongs to (OBL's own keying — obligation ids are not
 * globally namespaced by domain in the data model, so this is a real
 * lookup, not a string-prefix guess). Used to un-flatten a doc's
 * "Obligations evidenced" list into real per-obligation drawer links. */
function findObligationDomain(oblId: string): string | null {
  for (const [domainKey, rows] of Object.entries(OBL)) {
    if (rows.some((row) => row.id === oblId)) return domainKey;
  }
  return null;
}

/** ADOPT_COMMIT_DELAY_MS: implementer judgment call (no value in
 * design_system_spec.md §1.4's token-only scope) — long enough that the
 * Button's `loading` state is visibly a real wait, matching Core Principle
 * 1 ("the UI said done before anything was" is this persona's formative
 * failure) rather than an instant, indistinguishable-from-fake flip. */
const ADOPT_COMMIT_DELAY_MS = 650;

/** Drawer.tsx's close transition is 200ms; the ONSIDE-13 focus fallback
 * runs just after it so it never races the Drawer's own restore. */
const FOCUS_FALLBACK_DELAY_MS = 260;

// `position: 'relative'` makes this scrolling region the containing
// block for any absolutely-positioned descendant (sr-only spans today,
// third-party overlays tomorrow) so an unpinned absolute box resolves
// inside the scroll context instead of against the document root —
// see the invariant note on DataTable.tsx's `srOnlyStyle`.
const MAIN_STYLE: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowY: 'auto',
  position: 'relative',
  boxSizing: 'border-box',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
};
const TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
/** §5.8 region map addition (amendment A16, PI2-D42) — utility corner
 * (§5.1's originally-named placement), seated beside the page title. */
const HEADER_ROW_STYLE: CSSProperties = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' };
const SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };
const SUBHEADING_STYLE: CSSProperties = {
  margin: 0,
  font: 'inherit',
  fontSize: '1.125rem',
  fontWeight: 700,
  color: 'var(--ink)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
};
// FIX WAVE (Class C, C1): background is literally var(--panel) here —
// --ink2 fails AA on it in light theme; --chart-axis is the prescribed
// panel-seated substitute.
const COUNT_BADGE_STYLE: CSSProperties = {
  font: 'inherit',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--chart-axis)',
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-pill, 999px)',
  padding: '0.15rem 0.6rem',
};
const DOMAIN_HEADING_STYLE: CSSProperties = { margin: '0 0 0.625rem', font: 'inherit', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' };
const DOMAIN_SECTION_STYLE: CSSProperties = { outline: 'none' };
/** FIX WAVE (documents-scroll-collapse) — `flexShrink: 0` added: at its
 * `:815` use, this div is a direct flex ITEM of `MAIN_STYLE`'s
 * `flex-direction:column` container (`main` has a resolved,
 * height-constrained size — flexed to fill the viewport minus Topbar —
 * the intentional "scroll inside the shell" pattern via `overflowY:'auto'`
 * on `main`, not itself a defect). Declaring only `overflowX:'auto'` here,
 * with `overflow-y` left at its initial `visible`, trips the CSS Overflow
 * spec's implicit rule that the *other* axis also computes to `auto`
 * whenever one axis is non-visible — so this element is actually a scroll
 * container in both axes. Per CSS Flexbox, a scroll container's automatic
 * `min-height:auto` resolves to `0`, while this div's non-scroll-container
 * siblings under `<main>` (`h1`, `FilterBar`, the below-the-fold
 * `<section>`s) keep their content-based automatic minimum and refuse to
 * shrink below it. With the default `flex-shrink:1` this wrapper was
 * therefore the ONLY direct-main-child sibling the flex algorithm could
 * shrink to fit `main`'s constrained height — and it shrank to 0, taking
 * the entire Document library `<table>` (all rows) down with it
 * (regression test:
 * `src/__tests__/onside/documents-scroll-collapse.test.tsx`). `flexShrink:
 * 0` excludes it from shrinking at all, so it renders at its full content
 * height and `main`'s existing `overflow-y:auto` scrolls the page, exactly
 * as that property was already set up to do. Same fix layer as
 * `OnSideFeed.tsx`'s `SCROLL_WRAP_STYLE` (feed-scroll-collapse fix wave) —
 * that screen's identical mechanism, applied here for consistency.
 *
 * This constant is also reused at `:832` (Open governance gaps) and `:862`
 * (per-domain Domain impact tables), where the scroll-wrap div is NOT a
 * direct child of `<main>` — it sits inside a `<section style={SECTION_STYLE}>`
 * / a plain per-domain `<div>` respectively, so `<main>`'s shrink algorithm
 * never reaches it and those two were never crushed. `flexShrink: 0` is a
 * no-op there today (no shrink pressure reaches them), and keeps all three
 * uses of this shared style on one contract rather than forking it. */
const SCROLL_WRAP_STYLE: CSSProperties = { overflowX: 'auto', flexShrink: 0 };
/** Visually-hidden recipe — `top`/`left` pinned to 0 is load-bearing;
 * see the invariant note on `DataTable.tsx`'s `srOnlyStyle`. Without it
 * an unpositioned absolute box falls back to its in-flow static
 * position, which can extend `html.scrollHeight` past this screen's
 * scrolling `<main>` (now also `position: 'relative'`, same reason). */
const SR_ONLY_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/** No screen-specific members — `DeepLinkScreenProps` (deep-link consume) supplies every prop this screen actually reads; `topbar`/`onNavigate` were removed as dead once Sidebar/Topbar mount moved to App.tsx's Shell (see file header). */
export type OnSideDocumentsProps = DeepLinkScreenProps;

export function OnSideDocuments({ deepLink, onDeepLink, onDeepLinkConsumed }: OnSideDocumentsProps) {
  // Re-renders this screen on every demo-store write (its own adopt
  // cascade included) — see the ONSIDE-02 file-header note.
  useDemoStore();
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRedlineFilter, setSelectedRedlineFilter] = useState<string[]>([]);
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  // B-dead-interactions-01/-02 — the obligation-detail drawer target
  // (gap board + domain-impact registers). Mutually exclusive with
  // `openDocId`: opening one clears the other (see `openObligationDrawer`/
  // `handleDrawerClose` below) so the single shared Drawer never has to
  // reconcile two simultaneous "which content" truths.
  const [openObligation, setOpenObligation] = useState<{ domain: string; id: string } | null>(null);
  // §2.9 — the "Ask OnSide" chat as a third mutually-exclusive content
  // target on this SAME shared Drawer (never a second instance). Bumping
  // `chatOpenNonce` on every open forces AskChatPanel to remount fresh
  // (§2.9.5 fresh-open reseed, AC-A16-8).
  const [chatOpen, setChatOpen] = useState(false);
  const [chatOpenNonce, setChatOpenNonce] = useState(0);
  const [adoptingDocId, setAdoptingDocId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [updatingObligationIds, setUpdatingObligationIds] = useState<ReadonlySet<string>>(new Set());
  const [cascadeAnnouncement, setCascadeAnnouncement] = useState('');

  const requestSeqRef = useRef(0);
  const domainSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const updatingTimeoutRef = useRef<number | undefined>(undefined);
  const lastOpenDocRef = useRef<DocRow | null>(null);
  const lastOpenObligationRef = useRef<{ domain: string; id: string } | null>(null);
  const lastDrawerKindRef = useRef<'doc' | 'obligation' | 'chat' | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  // Rebuilt per render from the LIVE DOCLIB singleton — adoption mutates
  // doc status/version in place (ONSIDE-02/ONSIDE-12).
  const allDocs: DocRow[] = Object.entries(LIVE_DOCLIB).map(([id, doc]) => ({ id, ...doc }));

  // PI2-D5 (Sprint 1 DeepLinkKind union extension, ONS-CASE-18/r10) —
  // 'document'-kind deep-link consumption: lands on the SPECIFIC document
  // (full `secs` text + redline, this screen's own existing doc Drawer —
  // never the generic, unfiltered Documents table a plain nav would show).
  // Same nonce-keyed CONSUME pattern every other deep-link-consuming
  // screen uses; `setOpenObligation(null)` matches this file's own
  // mutual-exclusivity precedent (row-click doc opens clear it too, see
  // e.g. the row-open handler below). An id with no matching document
  // still consumes the nonce but opens nothing (never a fabricated doc).
  useEffect(() => {
    if (!deepLink || deepLink.kind !== 'document') return;
    const match = allDocs.find((doc) => doc.id === deepLink.id);
    if (match) {
      setOpenObligation(null);
      setChatOpen(false);
      setOpenDocId(match.id);
    }
    onDeepLinkConsumed?.(deepLink.nonce);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires only on a NEW nonce, per the documented CONSUME contract (App.tsx header); onDeepLinkConsumed/allDocs read fresh from closure, not tracked as a re-trigger dep
  }, [deepLink?.nonce]);

  // ONSIDE-12 — live counts from the same status the filter matches.
  const docStatusCounts: Record<DocStatus, number> = { good: 0, warn: 0, crit: 0 };
  for (const doc of allDocs) docStatusCounts[doc.status]++;
  const adoptedCount = allDocs.filter((doc) => doc.rlState?.act === 'adopted').length;

  const openDoc = openDocId ? (allDocs.find((d) => d.id === openDocId) ?? null) : null;
  if (openDoc) lastOpenDocRef.current = openDoc;
  // Keeps Drawer's title/body populated with the last real doc through its
  // ~200ms closing animation instead of blanking the instant openDocId is
  // cleared (Adopt/Reject both clear it immediately) — a genuinely closed
  // Drawer (open=false, phase 'closed') still renders nothing at all, since
  // Drawer.tsx returns null in that phase regardless of what we pass it.
  const displayDoc = openDoc ?? lastOpenDocRef.current;

  if (openObligation) lastOpenObligationRef.current = openObligation;
  const displayObligationTarget = openObligation ?? lastOpenObligationRef.current;
  const displayObligation: ObligationRow | null = displayObligationTarget
    ? (OBL[displayObligationTarget.domain]?.find((row) => row.id === displayObligationTarget.id) ?? null)
    : null;

  // Which content the Drawer shows, including through its ~200ms closing
  // transition (mirrors the `lastOpenDocRef`/`lastOpenObligationRef`
  // pattern above — the last *opened* kind, not whichever id is
  // currently non-null, since Adopt clears `openDocId` on success too).
  if (openDocId !== null) lastDrawerKindRef.current = 'doc';
  else if (openObligation !== null) lastDrawerKindRef.current = 'obligation';
  else if (chatOpen) lastDrawerKindRef.current = 'chat';
  const activeDrawerKind = lastDrawerKindRef.current;

  /** B-dead-interactions-01/-02 — opens the obligation-detail drawer,
   * closing the doc drawer if one was open (never two simultaneous
   * targets on the one shared Drawer instance). */
  function openObligationDrawer(domain: string, id: string) {
    setOpenDocId(null);
    setChatOpen(false);
    setOpenObligation({ domain, id });
  }

  const handleDrawerClose = () => {
    setOpenDocId(null);
    setOpenObligation(null);
    setChatOpen(false);
  };

  /** §2.9.5 entry affordance — "Ask OnSide" utility-corner trigger. Always
   * opens (or content-swaps, §2.9.1 item 2) at the fresh idle state. */
  const handleOpenChat = () => {
    setOpenDocId(null);
    setOpenObligation(null);
    setChatOpenNonce((n) => n + 1);
    setChatOpen(true);
  };

  const handleAdopt = (doc: DocRow) => {
    if (isDocAdopted(doc.id) || adoptingDocId !== null) return;
    const requestKey = ++requestSeqRef.current;
    setAdoptingDocId(doc.id);
    window.setTimeout(() => {
      // Superseded (a later Adopt press started, or requestSeqRef moved on)
      // — this stale commit never applies. See file header irreversibility
      // gate note.
      if (requestSeqRef.current !== requestKey) return;

      // Computed BEFORE the store write so the toast/impact view knows
      // exactly which rows this adoption flipped.
      const cascade = cascadeTargetsForDoc(doc.id);

      // Base rlAction('adopted') document cosmetics (source 2474–2483):
      // version minor bump, status flip, adopted marker — on the live
      // DOCLIB entry so every reader agrees and resetDemo restores it.
      const live = LIVE_DOCLIB[doc.id];
      if (live) {
        const versionMatch = /^v(\d+)\.(\d+)/.exec(live.v || '');
        if (versionMatch) live.v = `v${versionMatch[1]}.${Number(versionMatch[2]) + 1}`;
        live.status = 'good';
        live.rlState = {
          act: 'adopted',
          who: `${CURRENT.first} ${CURRENT.role ? `(${CURRENT.role})` : ''}`.trim(),
          when: 'Aug 15, 2026',
        };
      }

      // The store's base-verbatim cascade (applyGapClosure 3205–3211);
      // its emit() re-renders this screen and every other subscriber.
      applyGapClosure(doc.id);

      setAdoptingDocId(null);
      setOpenDocId(null);
      // Also closes the obligation drawer when Adopt was pressed from
      // there (B-dead-interactions-02 "Approve & adopt" path) — no-op
      // when Adopt was pressed from the doc drawer instead.
      setOpenObligation(null);
      setToast({ variant: 'success', message: `${decodeDocText(doc.t)} adopted.`, cascade });

      // ONSIDE-13 — if the Drawer's restore-to-trigger found the row
      // unmounted (e.g. "Pending" filter active), catch focus from body.
      window.setTimeout(() => {
        const active = document.activeElement;
        if (active === null || active === document.body) titleRef.current?.focus();
      }, FOCUS_FALLBACK_DELAY_MS);
    }, ADOPT_COMMIT_DELAY_MS);
  };

  const handleReject = (doc: DocRow) => {
    setOpenDocId(null);
    setToast({ variant: 'info', message: `${decodeDocText(doc.t)} redline rejected — no changes made.`, cascade: [] });
  };

  const handleViewImpact = () => {
    if (!toast || toast.cascade.length === 0) return;
    const domains = Array.from(new Set(toast.cascade.map((c) => c.domain)));
    setUpdatingObligationIds(new Set(toast.cascade.map((c) => c.oblId)));
    if (updatingTimeoutRef.current !== undefined) window.clearTimeout(updatingTimeoutRef.current);
    updatingTimeoutRef.current = window.setTimeout(() => setUpdatingObligationIds(new Set()), 1600);

    const summary = domains
      .map((domain) => {
        const rows = OBL[domain] ?? [];
        const closedNow = toast.cascade.filter((c) => c.domain === domain).length;
        const stillOpen = rows.filter((row) => row.st !== 'met').length;
        const label = DOMAIN_LABEL[domain] ?? domain;
        return `${label}: ${closedNow} obligation${closedNow === 1 ? '' : 's'} closed — ${stillOpen} of ${rows.length} still open`;
      })
      .join('. ');
    setCascadeAnnouncement(summary);

    const firstDomain = domains[0];
    const target = firstDomain ? domainSectionRefs.current[firstDomain] : null;
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target?.focus();
  };

  const filteredDocs = allDocs.filter((doc) => {
    if (selectedDomains.length > 0 && !selectedDomains.includes(doc.dom)) return false;
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(doc.status)) return false;
    if (selectedRedlineFilter.length > 0) {
      const isAdopted = doc.rlState?.act === 'adopted';
      const isPending = Boolean(doc.redline) && !isAdopted;
      const matches = (selectedRedlineFilter.includes('pending') && isPending) || (selectedRedlineFilter.includes('adopted') && isAdopted);
      if (!matches) return false;
    }
    return true;
  });

  const columns: DataTableColumn<DocRow>[] = [
    { id: 'title', header: 'Document', sortable: true, sortValue: (row) => decodeDocText(row.t), render: (row) => <span>{decodeDocText(row.t)}</span> },
    {
      id: 'domain',
      header: 'Domain',
      sortable: true,
      sortValue: (row) => DOMAIN_LABEL[row.dom] ?? row.dom,
      render: (row) => <span>{DOMAIN_LABEL[row.dom] ?? row.dom}</span>,
    },
    { id: 'type', header: 'Type', render: (row) => <span>{row.type}</span> },
    { id: 'owner', header: 'Owner', render: (row) => <span>{decodeDocText(row.owner)}</span> },
    {
      id: 'status',
      header: 'Status',
      render: (row) => <Tag text={STATUS_LABEL[row.status]} variant={STATUS_TAG_VARIANT[row.status]} />,
    },
    {
      id: 'redline',
      header: 'Redline',
      render: (row) => {
        if (!row.redline) return <span style={{ color: 'var(--ink3)' }}>—</span>;
        return row.rlState?.act === 'adopted' ? <Tag text="Adopted" variant="status-positive" /> : <Tag text="Redline pending" variant="hitl" />;
      },
    },
  ];

  const rowAction: DataTableRowAction<DocRow> = {
    label: (row) => (row.redline ? 'Review' : 'View'),
    onPress: (row) => {
      setOpenObligation(null);
      setChatOpen(false);
      setOpenDocId(row.id);
    },
  };

  /** B-dead-interactions-01 — gap board row action (base gap-board rows:
   * onclick openObl/openDocView, leapfi-platform.html:3226): opens the
   * obligation drawer when the gap names one, else the doc drawer for the
   * gap's own document. */
  const gapRowAction: DataTableRowAction<GapItem> = {
    label: () => 'Open',
    onPress: (gap) => {
      if (gap.obl) {
        openObligationDrawer(gap.obl[0], gap.obl[1]);
      } else if (gap.doc) {
        setOpenObligation(null);
        setChatOpen(false);
        setOpenDocId(gap.doc);
      }
    },
  };

  /** B-dead-interactions-01/-02 — domain-impact obligation register row
   * action (base oblRow: onclick openObl, source 3106). One per domain
   * section, closed over that section's own domain key. */
  function obligationRowAction(domainKey: string): DataTableRowAction<ObligationRow> {
    return {
      label: () => 'Open',
      onPress: (row) => openObligationDrawer(domainKey, row.id),
    };
  }

  const domainFilterGroup: FilterGroup = {
    id: 'domain',
    label: 'Domain',
    options: DOMAINS.map((d) => ({ id: d.key, label: d.name, count: DOC_DOMAIN_COUNTS[d.key] ?? 0 })),
    selectedIds: selectedDomains,
    onToggle: (id) => setSelectedDomains((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
  };

  const statusFilterGroup: FilterGroup = {
    id: 'status',
    label: 'Status',
    // Live counts (ONSIDE-12) — same source the filter predicate reads.
    options: (['good', 'warn', 'crit'] as DocStatus[]).map((s) => ({ id: s, label: STATUS_LABEL[s], count: docStatusCounts[s] })),
    selectedIds: selectedStatuses,
    onToggle: (id) => setSelectedStatuses((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
  };

  const redlineFilterGroup: FilterGroup = {
    id: 'redline',
    label: 'Redlines',
    options: [
      { id: 'pending', label: 'Pending', count: REDLINE_DOC_COUNT - adoptedCount },
      { id: 'adopted', label: 'Adopted', count: adoptedCount },
    ],
    selectedIds: selectedRedlineFilter,
    onToggle: (id) => setSelectedRedlineFilter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
  };

  // Live read by id (never the displayDoc snapshot, which is pre-adoption
  // during the Drawer's closing animation).
  const isDisplayDocAdopted = displayDoc ? isDocAdopted(displayDoc.id) : false;
  const isAdoptingDisplayDoc = displayDoc ? adoptingDocId === displayDoc.id : false;

  const drawerFields: DrawerContentField[] = displayDoc
    ? [
        { label: 'Version', value: displayDoc.v },
        { label: 'Domain', value: DOMAIN_LABEL[displayDoc.dom] ?? displayDoc.dom },
        { label: 'Type', value: displayDoc.type },
        { label: 'Owner', value: decodeDocText(displayDoc.owner) },
        { label: 'Summary', value: decodeDocText(displayDoc.line) },
        ...displayDoc.secs.map(([heading, body]) => ({ label: heading, value: decodeDocText(body) })),
      ]
    : [];

  // B-dead-interactions-07 — "Obligations evidenced" un-flattened from a
  // joined string into real action Buttons, one per obligation id, each
  // opening that obligation's own drawer (findObligationDomain resolves
  // which domain register it lives in). An id this dataset never enumerates
  // in OBL (none currently exist) is simply omitted rather than rendered as
  // a dead link.
  const drawerActions: DrawerContentAction[] = displayDoc
    ? displayDoc.obl
        .map((oblId) => ({ oblId, domainKey: findObligationDomain(oblId) }))
        .filter((entry): entry is { oblId: string; domainKey: string } => entry.domainKey !== null)
        .map(({ oblId, domainKey }) => ({
          label: `Obligation ${oblId} →`,
          variant: 'ghost' as const,
          onPress: () => openObligationDrawer(domainKey, oblId),
        }))
    : [];

  const displayDocStatus: DocStatus = displayDoc ? (LIVE_DOCLIB[displayDoc.id]?.status ?? displayDoc.status) : 'good';
  const drawerTags: DrawerContentTag[] = displayDoc
    ? [{ text: STATUS_LABEL[displayDocStatus], variant: STATUS_TAG_VARIANT[displayDocStatus] }]
    : [];

  // B-dead-interactions-02 obligation-detail drawer content (base openObl,
  // source 2949-2997).
  const obligationDrawerFields: DrawerContentField[] =
    displayObligation && displayObligationTarget
      ? [
          { label: 'Domain', value: DOMAIN_LABEL[displayObligationTarget.domain] ?? displayObligationTarget.domain },
          { label: 'Requirement', value: displayObligation.s },
          { label: 'Citation', value: displayObligation.cite },
          ...(displayObligation.gp ? [{ label: 'Gap', value: displayObligation.gp }] : []),
          ...(displayObligation.fx ? [{ label: 'Remediation plan', value: displayObligation.fx }] : []),
        ]
      : [];

  const obligationDrawerTags: DrawerContentTag[] = displayObligation
    ? [{ text: OBL_STATUS_LABEL[displayObligation.st], variant: OBL_STATUS_VARIANT[displayObligation.st] }]
    : [];

  // "Evidence chips" — one action Button per evidence doc, opening that
  // doc's own drawer (base openObl's evidence dchips → openDocView).
  const obligationDrawerActions: DrawerContentAction[] = displayObligation
    ? displayObligation.docs
        .filter((docId) => LIVE_DOCLIB[docId] !== undefined)
        .map((docId) => ({
          label: `Evidence: ${decodeDocText(LIVE_DOCLIB[docId]!.t)} →`,
          variant: 'ghost' as const,
          onPress: () => {
            setOpenObligation(null);
            setOpenDocId(docId);
          },
        }))
    : [];

  const obligationRedlineDocId = displayObligationTarget
    ? findRedlineDocForObligation(displayObligationTarget.domain, displayObligationTarget.id)
    : null;
  const obligationRedlineDoc = obligationRedlineDocId ? LIVE_DOCLIB[obligationRedlineDocId] : undefined;
  const isObligationRedlineAdopted = obligationRedlineDocId ? isDocAdopted(obligationRedlineDocId) : false;

  // B-dead-interactions-02 "approve-&-adopt path" — reuses handleAdopt
  // verbatim (same request-key idempotency, same live-DOCLIB mutation,
  // same applyGapClosure cascade) whenever a real redline draft closes
  // this obligation. Base's other openObl action ("Attach evidence to
  // close this item") has no backing mutation for non-redline-backed gaps
  // in this worktree and is not rendered as a live-looking control with
  // nothing behind it (Core Principle 1) — the evidence chips above are
  // this drawer's real "attach/inspect evidence" surface.
  const obligationDrawerFooter: ReactNode =
    displayObligation && displayObligation.st !== 'met' && obligationRedlineDocId && obligationRedlineDoc?.redline && !isObligationRedlineAdopted ? (
      <Button
        variant="primary"
        label="Approve & adopt"
        loading={adoptingDocId === obligationRedlineDocId}
        disabled={adoptingDocId !== null && adoptingDocId !== obligationRedlineDocId}
        onPress={() => handleAdopt({ id: obligationRedlineDocId, ...obligationRedlineDoc })}
      />
    ) : null;

  const drawerFooter: ReactNode = displayDoc && displayDoc.redline && !isDisplayDocAdopted && (
    <>
      <Button
        variant="primary"
        label="Adopt"
        loading={isAdoptingDisplayDoc}
        disabled={adoptingDocId !== null && adoptingDocId !== displayDoc.id}
        onPress={() => handleAdopt(displayDoc)}
      />
      <Button variant="ghost" label="Reject" disabled={isAdoptingDisplayDoc} onPress={() => handleReject(displayDoc)} />
    </>
  );

  // Base gapState-derived closure (see isGapClosed) — survives navigation,
  // resets with resetDemo.
  const openGaps = GAPS.filter((g) => !isGapClosed(g));

  const gapColumns: DataTableColumn<GapItem>[] = [
    {
      id: 'sev',
      header: 'Severity',
      render: (g) => <Tag text={g.sev === 'crit' ? 'Critical' : 'Warning'} variant={g.sev === 'crit' ? 'status-alert' : 'status-caution'} />,
    },
    { id: 'item', header: 'Open item', render: (g) => <span>{decodeDocText(g.t)}</span> },
    { id: 'domain', header: 'Domain', render: (g) => <span>{g.dom}</span> },
    { id: 'owner', header: 'Owner', render: (g) => <span>{decodeDocText(g.owner)}</span> },
    { id: 'action', header: 'Action', render: (g) => <span style={{ color: 'var(--ink2)' }}>{decodeDocText(g.act)}</span> },
  ];

  function obligationColumns(): DataTableColumn<ObligationRow>[] {
    return [
      { id: 'id', header: 'Obligation', render: (row) => <strong>{row.id}</strong> },
      { id: 'requirement', header: 'Requirement', render: (row) => <span>{decodeDocText(row.s)}</span> },
      { id: 'citation', header: 'Citation', render: (row) => <span style={{ color: 'var(--ink2)' }}>{decodeDocText(row.cite)}</span> },
      {
        id: 'status',
        header: 'Status',
        // Live OBL rows — the store's applyGapClosure mutates row.st/rev
        // in place (no overrides layer; ONSIDE-02).
        render: (row) => <Tag text={OBL_STATUS_LABEL[row.st]} variant={OBL_STATUS_VARIANT[row.st]} />,
      },
    ];
  }

  return (
    <>
      <main id="onside-documents-main" style={MAIN_STYLE} aria-labelledby="onside-documents-title">
        <div style={HEADER_ROW_STYLE}>
          <h1 id="onside-documents-title" ref={titleRef} tabIndex={-1} style={TITLE_STYLE}>
            OnSide · Documents
          </h1>
          {/* §5.8 entry affordance (amendment A16, PI2-D42) — uniform
              across all four onside.* screens. */}
          <Button variant="ghost" label={ONSIDE_CHAT_MODULE_CONFIG.entryLabel} onPress={handleOpenChat} />
        </div>

          <FilterBar groups={[domainFilterGroup, statusFilterGroup, redlineFilterGroup]} />

          <div style={SCROLL_WRAP_STYLE}>
            <DataTable
              caption="Document library"
              columns={columns}
              rows={filteredDocs}
              getRowId={(row) => row.id}
              rowAction={rowAction}
              emptyMessage="No documents match the current filters."
              defaultSortColumnId="title"
            />
          </div>

          <section aria-labelledby="onside-gaps-heading" style={SECTION_STYLE}>
            <h2 id="onside-gaps-heading" style={SUBHEADING_STYLE}>
              Open governance gaps
              <span style={COUNT_BADGE_STYLE}>{openGaps.length} open</span>
            </h2>
            <div style={SCROLL_WRAP_STYLE}>
              <DataTable
                caption="Open governance gaps board"
                columns={gapColumns}
                rows={openGaps}
                getRowId={gapKey}
                emptyMessage="All tracked gaps closed."
                rowAction={gapRowAction}
              />
            </div>
          </section>

          <section aria-labelledby="onside-domain-impact-heading" style={SECTION_STYLE}>
            <h2 id="onside-domain-impact-heading" style={SUBHEADING_STYLE}>
              Domain impact
            </h2>
            <span role="status" aria-live="polite" style={SR_ONLY_STYLE}>
              {cascadeAnnouncement}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {Object.entries(OBL).map(([domainKey, rows]) => (
                <div
                  key={domainKey}
                  ref={(el) => {
                    domainSectionRefs.current[domainKey] = el;
                  }}
                  tabIndex={-1}
                  style={DOMAIN_SECTION_STYLE}
                >
                  <h3 style={DOMAIN_HEADING_STYLE}>{DOMAIN_LABEL[domainKey] ?? domainKey}</h3>
                  <div style={SCROLL_WRAP_STYLE}>
                    <DataTable
                      caption={`${DOMAIN_LABEL[domainKey] ?? domainKey} obligation register`}
                      columns={obligationColumns()}
                      rows={rows}
                      getRowId={(row) => row.id}
                      updatingRowIds={updatingObligationIds}
                      rowAction={obligationRowAction(domainKey)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
      </main>

      {/* B-dead-interactions-01/-02 — one shared Drawer, branched on which
          kind was opened last (`activeDrawerKind`): the doc/redline
          content (unchanged) or the obligation-detail content (evidence
          chips + Approve & adopt). Never two simultaneous targets. */}
      <Drawer
        open={openDocId !== null || openObligation !== null || chatOpen}
        title={
          activeDrawerKind === 'chat'
            ? ONSIDE_CHAT_MODULE_CONFIG.drawerTitle
            : activeDrawerKind === 'obligation'
              ? displayObligation
                ? `${displayObligation.id} · Obligation`
                : ''
              : displayDoc
                ? decodeDocText(displayDoc.t)
                : ''
        }
        onClose={handleDrawerClose}
        footer={activeDrawerKind === 'chat' ? undefined : activeDrawerKind === 'obligation' ? obligationDrawerFooter : drawerFooter}
      >
        {activeDrawerKind === 'chat' ? (
          // §2.9.1 item 2 — one more content state of this SAME Drawer;
          // AskChatPanel owns its own body, no DrawerContent involved.
          <AskChatPanel key={chatOpenNonce} config={ONSIDE_CHAT_MODULE_CONFIG} {...(onDeepLink ? { onDeepLinkPress: onDeepLink } : {})} />
        ) : activeDrawerKind === 'obligation' ? (
          displayObligation ? <DrawerContent kind="doc" fields={obligationDrawerFields} tags={obligationDrawerTags} actions={obligationDrawerActions} /> : null
        ) : displayDoc ? (
          <>
            <DrawerContent kind="doc" fields={drawerFields} tags={drawerTags} actions={drawerActions} />
            {displayDoc.redline ? (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <RedlineDiffView
                  before={decodeDocText(displayDoc.redline.old)}
                  after={decodeDocText(displayDoc.redline.nw)}
                  hitl
                  hitlText={isDisplayDocAdopted ? 'Adopted' : 'HITL review'}
                />
                {/* FIX WAVE (Class C, C1): rendered inside the shared
                    Drawer, whose root background is var(--panel) —
                    --ink2 fails AA there in light theme; --chart-axis is
                    the prescribed panel-seated substitute. */}
                <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--chart-axis)' }}>{decodeDocText(displayDoc.redline.note)}</p>
              </div>
            ) : null}
          </>
        ) : null}
      </Drawer>

      {toast ? (
        <Toast
          variant={toast.variant}
          message={toast.message}
          onDismiss={() => setToast(null)}
          {...(toast.cascade.length > 0 ? { linkLabel: 'View impact →', onLinkPress: handleViewImpact, dismissOnLinkPress: true } : {})}
        />
      ) : null}
    </>
  );
}
