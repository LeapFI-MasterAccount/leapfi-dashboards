/**
 * OnSideOverview — new screen, parity_ia_addendum.md §Batch 1
 * "OnSide · Overview & Domains" (D16 full-functional-parity addendum to
 * design_system_spec.md — this screen is not one of that document's 7
 * script-screen anatomies §5.1-§5.7; it extends the IA additively per the
 * addendum's own precedence rules).
 *
 * Hosts the merged base-engine `overview` + `domains`/`targets`/`dom-`
 * views (`osOverview` 3069-3084, `osKpis` 3055-3068, `osDomainsMaster`/
 * `domBody` 3664-3709, `setTarget` 3726-33, the `onsideShow` router's
 * `dom-` deep-link handling 3021-3054).
 *
 * Region map, top to bottom (addendum §Batch 1 / §1.1 rows 1-2): KPI
 * strip (6 StatCards, `osKpis`) → domain-posture grid (one summary card
 * per domain: name/scope, 5-point band via PosturePillBar, status Tag,
 * "Open →" row action) → "Scope changes this session" list → "Objectives
 * driving scope" Chip strip (cross-links into Studio · Ask's register) →
 * Connect teaser paragraph → a "Cases · approvals" entry-point row → the
 * Domains accordion (`views/DomainsAccordion.tsx`, this dispatch's sibling
 * file). Components per addendum: StatCard (C1) ×6, Label (P3) + Tag (P4)
 * + PosturePillBar (C12) for each posture card, Chip (P5, `suggestion`)
 * for the objectives strip, SetupCard (C15, `interactive`) for the Cases
 * entry point, Button (P2, `ghost`) for the Connect teaser link.
 *
 * SUPERSEDED — Topbar/Sidebar data ownership (amendment A11,
 * design_system_spec.md §3.0): both composites now mount exactly once, in
 * App.tsx's persistent Shell — this screen no longer accepts a `topbar`
 * prop or builds a local `SidebarProps`; it keeps only `onNavigate` for its
 * own in-content links (KPI cards, objective chips, the Connect teaser,
 * the Cases entry point) — unrelated to rendering Sidebar itself.
 * Per the dispatch brief, `Sidebar.tsx`'s `NAV` array does not carry an
 * `onside.overview` child yet (that is this dispatch's flagged, explicitly
 * out-of-allowlist wiring note — parity_ia_addendum.md §0/OQ-A) — until
 * that follow-up edit lands, this screen simply renders with no Sidebar
 * row highlighted for it, the same harmless gap every screen built ahead
 * of its own Sidebar wiring already carries in this worktree.
 *
 * AMBIGUITY RESOLVED — no live OS_SCOPE domain filter: source's
 * `osKpis`/`osOverview` both read a shared `OS_SCOPE` global (the
 * cross-view "scope to one domain" filter, `osScopeBar()`) that lives
 * outside any view this dispatch's data-module list names and has no
 * shell-level home yet in this worktree. This screen always renders the
 * all-domains figures (`OS_SCOPE==='all'` branch of every `osKpis`
 * ternary) — the scoped variant is a STOP-item for whichever future
 * dispatch introduces a shared scope-filter mechanism across OnSide's
 * screens.
 *
 * FIX WAVE (ONSIDE-02 consumer / STU-01 receiving side) — "Scope changes
 * this session" now reads the real producer: `state/demoStore.ts`'s
 * `getScopeEvents()` (fed by the store's `acceptOpportunity`, the base
 * acceptProposed port), with `useDemoStore()` subscribing this whole
 * screen to every store write. The earlier local
 * `useState<ScopeChangeEvent[]>([])` stand-in (recorded here as awaiting
 * a real producer) is gone. The same subscription is what makes the KPI
 * strip, posture cards, and Domains accordion move when the Step-3 Adopt
 * cascade flips obligations: every figure is computed per render from the
 * live `DOMAINS`/`OBL` singletons the store's `applyGapClosure` mutates
 * (base refreshAll semantics, source 2510-2516) — the previous
 * module-scope KPI constants could never see an adoption and contradicted
 * OnSideDocuments two clicks away.
 *
 * FIX WAVE (B-dead-interactions-14) — StatCard (C1) still has no press
 * affordance or subtitle slot of its own (`StatCardProps` is
 * `label`/`value`/`unit?`/`state?` only — `components/StatCard.tsx` is
 * outside this dispatch's allowlist, unmodified), but source's `kpi()`
 * helper (leapfi-platform.html:4194, `osKpis` 3055-3068) rendered every
 * KPI as a clickable `.kpi.click` card with a `→` affordance navigating
 * onsideShow('docs'/'domains'/'gaps'/'targets'/'feed-lifecycle') — a real,
 * shipped v1 interaction, not a cosmetic one (the previous revision of
 * this note mischaracterized the gap as "not a defect"; the hostile-review
 * finding is CONFIRMED). Recovered here the same way `DomainPostureCard`
 * below already recovers click-through around a non-interactive
 * primitive: a local, unexported `KpiNavCard` wraps StatCard in a real
 * `<button>` (StatCard's own markup is a non-interactive `role="group"`
 * div/span/div — safe to nest inside a button, no interactive-in-
 * interactive violation) rather than modifying StatCard.tsx. Targets:
 * "Documents monitored" → OnSide · Documents (base `onsideShow('docs')`);
 * "Gaps to your targets" → OnSide · Documents' gap board (base
 * `onsideShow('gaps')` — the same screen two clicks away the finding's own
 * scenario names); "Obligations in scope/met" and "Domains at/above
 * target" → scroll+focus this page's own Domains accordion (base
 * `onsideShow('domains'/'targets')`, both in-page destinations here, no
 * separate screen exists for either); "Change events · 14 days" → OnSide ·
 * Regulatory feed (base `onsideShow('feed-lifecycle')`, the lifecycle
 * section rendered on that screen). No long descriptive subtext line is
 * added — C1's prop surface still has no slot for one — only the real
 * click-through source actually shipped.
 *
 * DEEP-LINK CONTRACT MIGRATION (B3 dispatch — closes this note's own
 * STOP-item below, superseding it): `App.tsx`'s NAVIGATION-WITH-PAYLOAD
 * contract (that file's header, lines 120-188) now exists and is spread
 * onto every routed screen, `deepLink`/`onDeepLink`/`onDeepLinkConsumed`
 * included. This screen has migrated its 'domain'-kind consumption fully
 * onto that contract: `deepLink` is read in an effect keyed on
 * `deepLink?.nonce` (App.tsx's documented CONSUME contract) — when
 * `deepLink.kind === 'domain'`, `deepLink.id` auto-expands + scrolls to
 * the matching domain's accordion row (unchanged end behavior, matching
 * `onsideShow`'s `domKey` branch), then calls `onDeepLinkConsumed`. The
 * former `lastDeepLinkRef`-based dedupe is gone — App's own nonce already
 * guarantees a fresh value per press, so a same-key re-press no longer
 * needs a local ref to detect it as new (the same SH-8-generalized
 * guarantee every other nonce-consuming screen in this worktree relies
 * on).
 *
 * LEGACY `deepLinkDomainKey` PROP (STOP-item, not this screen's gap):
 * kept in `OnSideOverviewProps` and still accepted so `App.tsx`'s existing
 * call site — out of this dispatch's ALLOWLIST — keeps compiling; `App.tsx`
 * still passes it (its own `case 'onside.overview'` bridge, lines ~586-598)
 * alongside the real `deepLink` payload for the 'domain' kind, both built
 * from the same `deepLinkTarget`, so no behavior actually depends on the
 * legacy prop anymore — this screen's own logic never reads it. STOP-item
 * for whichever dispatch next holds `App.tsx`: delete the
 * `deepLinkDomainKey: deepLinkTarget.id` bridge (that file's header lines
 * 174-180 documents it as a "known legacy-prop limit" already superseded
 * here) and drop the prop from `OnSideOverviewProps` once `App.tsx` stops
 * passing it.
 *
 * AMBIGUITY RESOLVED — domain-posture-grid card is a bespoke composite:
 * the addendum's own component list for this row ("a small per-domain
 * summary card built from Label (P3) + Tag (P4, status variants) +
 * PosturePillBar (C12)... row-action") names three primitives/composites,
 * not a single named C-id — there is no existing shared card component
 * matching this exact shape, so it is built as a private, unexported
 * render helper inside this screen file (`DomainPostureCard` below), the
 * same "local subcomponent, not a new shared file" pattern `DataTable.tsx`
 * already uses for its own `SortHeaderButton`. This is not a duplicate
 * component invention — it composes only already-built primitives/
 * composites, verbatim, with no new visual vocabulary of its own.
 *
 * Accessibility gate (persona directive 7): every table below the fold is
 * a real DataTable (C6, inside `DomainsAccordion.tsx`); each domain's
 * accordion header is a real `<button aria-expanded>`; the KPI strip's
 * live values are wrapped by StatCard's own `aria-live="polite"` region
 * (unmodified, inherited). FIX WAVE (ONSIDE-14): each posture-grid card
 * is a `<div>` whose title is a real `<button>` (accessible name = the
 * domain name) stretched over the card via an absolutely-positioned inner
 * span — the earlier whole-card `<button>` wrapped `<ul>`/`<div>` flow
 * content inside a phrasing-content element (invalid HTML) and flattened
 * the entire card, PosturePillBar list semantics included, into one
 * run-on accessible name.
 *
 * Irreversibility gate (persona directive 6): this screen performs no
 * irreversible action — every control here is either read-only display or
 * plain navigation (`onNavigate`, in-page expand/scroll). N/A, not
 * omitted.
 *
 * Tests: this worktree now carries Vitest + Testing Library — this
 * screen's regression suite lives in `src/__tests__/onside/` (the earlier
 * "no test runner installed" STOP-item recorded here is resolved and
 * removed).
 *
 * FIX WAVE copy corrections: the Domains-section instruction line no
 * longer promises "work its lever" (ONSIDE-03 — the target lever/Slider
 * is deliberately unported pending a real role/permission system, per
 * `DomainsAccordion.tsx`'s own header; shipped copy must not advertise a
 * capability the page cannot perform), and the Objectives strip says
 * "open the register in Studio" rather than "open it" (ONSIDE-15 — every
 * chip navigates to Studio · Ask's register with no per-play payload, the
 * cross-link the addendum's own row sanctions; the old copy promised the
 * base's per-play `openPlay` drawer, which this navigation cannot keep).
 *
 * Layout constants (240px sidebar column, 2rem content padding): copied
 * verbatim from `Home.tsx`/`OnSideDocuments.tsx`'s own documented
 * implementer judgment call for visual consistency across screens, not
 * re-derived independently — design_system_spec.md §1.4 is token-only and
 * does not specify layout dimensions.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { DeepLinkScreenProps } from '../App';
import type { SidebarProps } from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import { SetupCard } from '../components/SetupCard';
import { PosturePillBar } from '../components/PosturePillBar';
import { Drawer } from '../components/Drawer';
import { DrawerContent } from '../components/DrawerContent';
import type { DrawerContentField, DrawerContentTag } from '../components/DrawerContent';
import { AskChatPanel } from '../components/AskChatPanel';
import { ONSIDE_CHAT_MODULE_CONFIG } from '../data/askChatModuleConfig';
import { PANEL_STYLE } from '../theme/panelStyle';
import { Toast } from '../components/Toast';
import { Button } from '../components/primitives/Button';
import { Chip } from '../components/primitives/Chip';
import { Label } from '../components/primitives/Label';
import { Tag } from '../components/primitives/Tag';
import type { NonRaciTagVariant } from '../components/primitives/Tag';
import {
  DomainsAccordion,
  DOMAIN_STATUS_LABEL,
  DOMAIN_STATUS_VARIANT,
  curOf,
  domainPostureSegments,
  findRedlineDocForObligation,
  oblToClose,
  statusOf,
} from '../views/DomainsAccordion';
import { DOMAINS, OBL, SRC_ITEMS } from '../data/onside';
import type { ObligationRow, OnsideDomain } from '../data/onside';
import { DOCLIB } from '../data/doclib';
import type { DocEntry } from '../data/doclib';
import { CURRENT, OPPS } from '../data/studio';
import { applyGapClosure, getScopeEvents, useDemoStore } from '../state/demoStore';

/** Source line 1855: `function feedEventCount(days){...}` — counts every
 * SRC_ITEMS entry whose `daysAgo` (tuple index 0) falls within `days`. */
function feedEventCount(days: number): number {
  let count = 0;
  for (const key of Object.keys(SRC_ITEMS)) {
    for (const item of SRC_ITEMS[key]?.items ?? []) {
      if (item[0] <= days) count++;
    }
  }
  return count;
}

const OBJECTIVES_PREVIEW_COUNT = 8;

/** PI2-D5 (Sprint 1 DeepLinkKind union extension) — 'control'-kind deep
 * link resolution: id is a BARE control id (e.g. 'MRM-09', no domKey
 * prefix — the r16 QuickFind "type MRM-09 anywhere" shape), unlike
 * 'obligation''s `${domKey}:${oblId}` encoding, which already carries its
 * domain. Scans `OBL` (every domain's obligation register) for the owning
 * domain key. Returns `null` for an id no domain's register carries —
 * never a fabricated domain guess. */
function resolveControlDomain(controlId: string): string | null {
  for (const [domainKey, rows] of Object.entries(OBL)) {
    if (rows.some((row) => row.id === controlId)) return domainKey;
  }
  return null;
}

/** B-dead-interactions-02 obligation drawer — same live-mutation shape
 * `OnSideDocuments.tsx` uses for its own doc-adopt path (base rlAction
 * 'adopted' marker, source 2478): runtime bookkeeping attached to the
 * live DOCLIB entry, not part of `doclib.ts`'s seeded shape. */
interface DocRlState {
  act: 'adopted';
  who: string;
  when: string;
}
type LiveDoc = DocEntry & { rlState?: DocRlState };
const LIVE_DOCLIB = DOCLIB as Record<string, LiveDoc>;

function isDocAdopted(docId: string): boolean {
  return LIVE_DOCLIB[docId]?.rlState?.act === 'adopted';
}

const OBL_STATUS_LABEL: Record<ObligationRow['st'], string> = { met: 'Met', partial: 'Partial', gap: 'Gap' };
const OBL_STATUS_VARIANT: Record<ObligationRow['st'], NonRaciTagVariant> = {
  met: 'status-positive',
  partial: 'status-caution',
  gap: 'status-alert',
};

/** Same implementer-judgment value as `OnSideDocuments.tsx`'s own
 * ADOPT_COMMIT_DELAY_MS — long enough that the Button's `loading` state is
 * visibly a real wait (Core Principle 1: never claim done before the
 * server has). */
const ADOPT_COMMIT_DELAY_MS = 650;

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
const SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)' };
const KPI_GRID_STYLE: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' };
const POSTURE_GRID_STYLE: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.875rem' };
export const CARD_STYLE: CSSProperties = {
  ...PANEL_STYLE,
  padding: '1.25rem',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};
const SCOPE_EVENT_ROW_STYLE: CSSProperties = { display: 'flex', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--ink2)' };
const CHIP_STRIP_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' };

/** B-dead-interactions-14 — local, unexported click-through wrapper around
 * StatCard (C1); see file header note. `KPI_BUTTON_STYLE` strips all
 * button chrome so the rendered result is visually identical to a bare
 * StatCard, plus a real accessible press target and a `→` affordance
 * matching source's `.kpi.click` cue (leapfi-platform.html:4194). */
const KPI_BUTTON_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  borderRadius: 'var(--radius-md, 10px)',
};

function KpiNavCard({ label, value, unit, onOpen }: { label: string; value: string | number; unit?: string; onOpen: () => void }) {
  return (
    <button type="button" style={KPI_BUTTON_STYLE} onClick={onOpen}>
      <StatCard label={label} value={value} {...(unit !== undefined ? { unit } : {})} />
    </button>
  );
}

/** Local, unexported render helper — see file header "domain-posture-grid
 * card is a bespoke composite." Not a new shared component; composes only
 * already-built Label/Tag/PosturePillBar.
 *
 * ONSIDE-14 — stretched-button structure: the card is a `<div>`; the
 * domain-name title is the real `<button>` (phrasing content only, so the
 * markup is valid HTML and the accessible name is the domain name, not a
 * run-on dump of the whole card), and an absolutely-positioned inner span
 * extends its hit area over the full card so the whole surface stays
 * clickable exactly as before. */
function DomainPostureCard({ domain, onOpen }: { domain: OnsideDomain; onOpen: (key: string) => void }) {
  const current = curOf(domain);
  const toClose = oblToClose(domain);
  const status = statusOf(domain);

  return (
    <div style={{ ...CARD_STYLE, position: 'relative' }} data-lf-composite="domain-posture-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        {/* flex column + gap — matches the sibling composite convention
            (SetupCard.tsx's `BODY_STYLE`) so the domain-name title
            (button) and its "bodies · N obligations in scope" meta line
            (Label) always render on distinct lines, never concatenated
            onto one run of text (both are inline-level elements with no
            `display` of their own — this wrapper's stacking is what
            separates them). */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <button
            type="button"
            onClick={() => onOpen(domain.key)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0,
              font: 'inherit',
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'var(--ink)',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            {domain.name}
            {/* Stretched hit area — part of the button, covers the card. */}
            <span aria-hidden="true" style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} />
          </button>
          {/* A14 (design_system_spec.md §2.7): rendered inside CARD_STYLE
              (spreads PANEL_STYLE, position:'relative' override does not
              touch background) — panel-seated. */}
          <Label
            text={`${domain.bodies} · ${domain.appl}${domain.tot > domain.appl ? ` of ${domain.tot}` : ''} obligations in scope`}
            variant="body-secondary"
            surface="panel"
          />
        </div>
        <Tag text={DOMAIN_STATUS_LABEL[status]} variant={DOMAIN_STATUS_VARIANT[status]} />
      </div>

      <PosturePillBar segments={domainPostureSegments(current, domain.target)} />

      {/* FIX WAVE (Class C, C1): rendered inside CARD_STYLE (spreads
          PANEL_STYLE) — --ink2 fails AA on --panel in light theme;
          --chart-axis is the prescribed panel-seated substitute. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--chart-axis)' }}>
        <span>
          {domain.met} at required maturity · {toClose} to close for target
        </span>
        <span aria-hidden="true" style={{ color: 'var(--accent)', fontWeight: 700 }}>
          Open →
        </span>
      </div>
    </div>
  );
}

export interface OnSideOverviewProps extends DeepLinkScreenProps {
  /** Navigation hook for this screen's own in-content links (KPI cards, objective chips, the Connect teaser, the Cases entry point) — unrelated to Sidebar, which App.tsx's Shell owns (see file header). */
  onNavigate: SidebarProps['onNavigate'];
  /** LEGACY — see file header "LEGACY deepLinkDomainKey PROP." Superseded by `deepLink`/`onDeepLinkConsumed` (`DeepLinkScreenProps`, above); accepted only so `App.tsx`'s existing call site keeps compiling. No longer read by this screen's own logic. */
  deepLinkDomainKey?: string;
}

export function OnSideOverview({ onNavigate, deepLink, onDeepLink, onDeepLinkConsumed }: OnSideOverviewProps) {
  // Re-renders this screen on every demo-store write (Adopt cascade,
  // Discovery accepts, resetDemo) — see the ONSIDE-02 file-header note.
  useDemoStore();
  const [expandedDomainKeys, setExpandedDomainKeys] = useState<ReadonlySet<string>>(new Set());
  const [pendingScrollKey, setPendingScrollKey] = useState<string | null>(null);
  // The store's live session scope events (base SCOPE_EVENTS) — see the
  // ONSIDE-02 / STU-01 file-header note.
  const scopeEvents = getScopeEvents();

  // Computed per render from the live DOMAINS singleton (never module
  // scope — the Adopt cascade mutates d.met/OBL in place; base osKpis
  // recomputes on every refreshAll, source 3055-3068, 2510-2516).
  const docsTotal = DOMAINS.reduce((sum, d) => sum + d.docs, 0);
  const obligationsInScope = DOMAINS.reduce((sum, d) => sum + d.appl, 0);
  const obligationsMet = DOMAINS.reduce((sum, d) => sum + d.met, 0);
  const gapsToTarget = DOMAINS.reduce((sum, d) => sum + oblToClose(d), 0);
  const domainsAtOrAbove = DOMAINS.filter((d) => statusOf(d) !== 'below').length;

  // B-dead-interactions-14 — in-page scroll target for the KPI tiles whose
  // v1 destination (onsideShow('domains'/'targets')) is this same page's
  // Domains accordion, not a separate screen.
  const domainsSectionRef = useRef<HTMLElement | null>(null);
  const scrollToDomains = () => {
    domainsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    domainsSectionRef.current?.focus();
  };

  // B-dead-interactions-02 — the obligation-detail drawer (base openObl,
  // source 2949-2997): DomainsAccordion.tsx's "Gaps & partials" rows had
  // no entry point anywhere in the twin. Target is a domain+obligation id
  // pair (mirrors OnSideDocuments.tsx's own openObligation shape) so this
  // screen's Drawer reads the live OBL/DOCLIB singletons directly rather
  // than caching a stale row snapshot across the Adopt cascade.
  const [openObligationTarget, setOpenObligationTarget] = useState<{ domain: string; id: string } | null>(null);
  // §2.9 — the "Ask OnSide" chat as a second, mutually-exclusive content
  // target on this SAME shared Drawer (never a second instance). Bumping
  // `chatOpenNonce` forces AskChatPanel to remount fresh on every open
  // (§2.9.5 fresh-open reseed, AC-A16-8).
  const [chatOpen, setChatOpen] = useState(false);
  const [chatOpenNonce, setChatOpenNonce] = useState(0);
  const [adoptingDocId, setAdoptingDocId] = useState<string | null>(null);
  const [adoptToast, setAdoptToast] = useState<string | null>(null);
  const requestSeqRef = useRef(0);
  const lastObligationTargetRef = useRef<{ domain: string; id: string } | null>(null);
  if (openObligationTarget) lastObligationTargetRef.current = openObligationTarget;
  // Keeps the drawer showing the last real obligation through its ~200ms
  // closing animation instead of blanking the instant the target clears
  // (same pattern OnSideDocuments.tsx's own `lastOpenDocRef` uses).
  const displayObligationTarget = openObligationTarget ?? lastObligationTargetRef.current;
  const displayObligation: ObligationRow | null = displayObligationTarget
    ? (OBL[displayObligationTarget.domain]?.find((row) => row.id === displayObligationTarget.id) ?? null)
    : null;
  const obligationRedlineDocId = displayObligationTarget
    ? findRedlineDocForObligation(displayObligationTarget.domain, displayObligationTarget.id)
    : null;
  const obligationRedlineDoc = obligationRedlineDocId ? LIVE_DOCLIB[obligationRedlineDocId] : undefined;
  const isObligationRedlineAdopted = obligationRedlineDocId ? isDocAdopted(obligationRedlineDocId) : false;

  const handleOpenObligation = (domainKey: string, row: ObligationRow) => {
    setChatOpen(false);
    setOpenObligationTarget({ domain: domainKey, id: row.id });
  };

  const handleCloseObligation = () => {
    setOpenObligationTarget(null);
    setChatOpen(false);
  };

  /** §2.9.5 entry affordance — "Ask OnSide" utility-corner trigger. */
  const handleOpenChat = () => {
    setOpenObligationTarget(null);
    setChatOpenNonce((n) => n + 1);
    setChatOpen(true);
  };

  // Same request-key idempotency guard as OnSideDocuments.tsx's own
  // handleAdopt (Core Principle 1 / irreversibility gate — directive 6): a
  // stale, superseded commit never applies, and the live rlState marker
  // plus `adoptingDocId` both serialize Adopt globally.
  const handleApproveAndAdopt = (docId: string) => {
    if (isDocAdopted(docId) || adoptingDocId !== null) return;
    const requestKey = ++requestSeqRef.current;
    setAdoptingDocId(docId);
    window.setTimeout(() => {
      if (requestSeqRef.current !== requestKey) return;
      const live = LIVE_DOCLIB[docId];
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
      // Base-verbatim cascade (applyGapClosure) — re-renders every
      // subscriber, this screen's KPI strip and posture grid included.
      applyGapClosure(docId);
      setAdoptingDocId(null);
      setAdoptToast(live ? `${live.t} adopted.` : 'Redline adopted.');
    }, ADOPT_COMMIT_DELAY_MS);
  };

  // DEEP-LINK CONTRACT MIGRATION (B3 dispatch, see file header) — same
  // expand+scroll behavior the legacy `deepLinkDomainKey` effect used to
  // perform (identical to `openDomain` below, inlined here since this
  // effect fires before `openDomain` is declared in this component body),
  // now driven by App.tsx's documented CONSUME contract: keyed on
  // `deepLink?.nonce`, never a bare prop-value comparison, so App's own
  // nonce (never reused, even after consumption) is what marks a re-press
  // as new — no local ref needed to detect it.
  useEffect(() => {
    if (!deepLink || deepLink.kind !== 'domain') return;
    const domainKey = deepLink.id;
    setExpandedDomainKeys((prev) => (prev.has(domainKey) ? prev : new Set(prev).add(domainKey)));
    setPendingScrollKey(domainKey);
    onDeepLinkConsumed?.(deepLink.nonce);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires only on a NEW nonce, per the documented CONSUME contract (App.tsx header); onDeepLinkConsumed read fresh from closure, not tracked as a re-trigger dep
  }, [deepLink?.nonce]);

  // PI2-D5 (Sprint 1 DeepLinkKind union extension) — 'control'-kind deep
  // link: bare control id (r16 QuickFind's "type MRM-09 anywhere" shape),
  // resolved to its owning domain via `resolveControlDomain` (OBL scan),
  // then both force-expands that domain row (same effect as 'domain') AND
  // opens this screen's own obligation drawer for that exact control (r16:
  // "kind: 'control', id: controlId → ... OnSideOverview domain detail").
  // An id no domain's register carries still consumes the nonce but opens
  // nothing (never a fabricated domain guess).
  useEffect(() => {
    if (!deepLink || deepLink.kind !== 'control') return;
    const domainKey = resolveControlDomain(deepLink.id);
    if (domainKey) {
      setExpandedDomainKeys((prev) => (prev.has(domainKey) ? prev : new Set(prev).add(domainKey)));
      setPendingScrollKey(domainKey);
      setOpenObligationTarget({ domain: domainKey, id: deepLink.id });
    }
    onDeepLinkConsumed?.(deepLink.nonce);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires only on a NEW nonce, per the documented CONSUME contract (App.tsx header); onDeepLinkConsumed read fresh from closure, not tracked as a re-trigger dep
  }, [deepLink?.nonce]);

  // HOSTILE-REVIEW FIX WAVE (Class A, finding A2) — 'obligation'-kind deep
  // link: id already carries its domain (`${domKey}:${oblId}`, e.g.
  // 'mrm:MRM-08' — unlike 'control''s bare id, which needs the OBL scan
  // above to find its owning domain). Mirrors the 'control' effect
  // immediately above verbatim (design authority ruling, amendment A12:
  // "OnSideOverview.tsx gains an 'obligation' consumer effect, mirroring
  // its existing 'control' effect's shape"): force-expands + scrolls the
  // owning domain row and opens this screen's own obligation drawer for
  // that exact obligation. Confirmed live producers (Sprint 1 hostile
  // review, finding A2): Reporting.tsx's obligation quick-open
  // (`handleOpenObligation`) and HomePanels.tsx's Strategic Signal touch
  // chips (`touchToDeepLinkRequest`'s `obl` branch) — both previously
  // landed on this screen and opened nothing. An id whose domain segment
  // or obligation id doesn't resolve in OBL still consumes the nonce but
  // opens nothing (never a fabricated obligation, same guard shape as the
  // 'control' effect's own unresolved-id branch).
  useEffect(() => {
    if (!deepLink || deepLink.kind !== 'obligation') return;
    const sep = deepLink.id.indexOf(':');
    const domainKey = sep === -1 ? deepLink.id : deepLink.id.slice(0, sep);
    const oblId = sep === -1 ? '' : deepLink.id.slice(sep + 1);
    if (oblId && OBL[domainKey]?.some((row) => row.id === oblId)) {
      setExpandedDomainKeys((prev) => (prev.has(domainKey) ? prev : new Set(prev).add(domainKey)));
      setPendingScrollKey(domainKey);
      setOpenObligationTarget({ domain: domainKey, id: oblId });
    }
    onDeepLinkConsumed?.(deepLink.nonce);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires only on a NEW nonce, per the documented CONSUME contract (App.tsx header); onDeepLinkConsumed read fresh from closure, not tracked as a re-trigger dep
  }, [deepLink?.nonce]);

  const openDomain = (key: string) => {
    setExpandedDomainKeys((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
    setPendingScrollKey(key);
  };

  const toggleDomain = (key: string) => {
    setExpandedDomainKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const objectivesPreview = OPPS.slice(0, OBJECTIVES_PREVIEW_COUNT);
  const objectivesRemaining = OPPS.length - objectivesPreview.length;

  const obligationDrawerFields: DrawerContentField[] =
    displayObligation && displayObligationTarget
      ? [
          { label: 'Domain', value: DOMAINS.find((d) => d.key === displayObligationTarget.domain)?.name ?? displayObligationTarget.domain },
          { label: 'Requirement', value: displayObligation.s },
          { label: 'Citation', value: displayObligation.cite },
          ...(displayObligation.gp ? [{ label: 'Gap', value: displayObligation.gp }] : []),
          ...(displayObligation.fx ? [{ label: 'Remediation plan', value: displayObligation.fx }] : []),
          {
            label: 'Evidence on file',
            value: displayObligation.docs.length > 0 ? displayObligation.docs.map((docId) => LIVE_DOCLIB[docId]?.t ?? docId).join(', ') : 'None on file',
          },
        ]
      : [];

  const obligationDrawerTags: DrawerContentTag[] = displayObligation
    ? [{ text: OBL_STATUS_LABEL[displayObligation.st], variant: OBL_STATUS_VARIANT[displayObligation.st] }]
    : [];

  // B-dead-interactions-02 "approve-&-adopt path" — only offered when a
  // real redline draft closes this obligation (findRedlineDocForObligation)
  // and it is not already adopted; base openObl's other action ("Attach
  // evidence to close this item") has no backing mutation for
  // non-redline-backed gaps in this worktree (no attach-evidence store
  // exists) — never rendered as a live-looking control with nothing behind
  // it (Core Principle 1).
  const obligationDrawerFooter =
    displayObligation && displayObligation.st !== 'met' && obligationRedlineDocId && obligationRedlineDoc?.redline && !isObligationRedlineAdopted ? (
      <Button
        variant="primary"
        label="Approve & adopt"
        loading={adoptingDocId === obligationRedlineDocId}
        disabled={adoptingDocId !== null && adoptingDocId !== obligationRedlineDocId}
        onPress={() => handleApproveAndAdopt(obligationRedlineDocId)}
      />
    ) : null;

  return (
    <>
      <main id="onside-overview-main" style={MAIN_STYLE} aria-labelledby="onside-overview-title">
          <div style={HEADER_ROW_STYLE}>
            <h1 id="onside-overview-title" style={TITLE_STYLE}>
              OnSide · Overview
            </h1>
            {/* §5.8 entry affordance (amendment A16, PI2-D42) — uniform
                across all four onside.* screens. */}
            <Button variant="ghost" label={ONSIDE_CHAT_MODULE_CONFIG.entryLabel} onPress={handleOpenChat} />
          </div>

          <section aria-labelledby="onside-overview-kpis-heading" style={SECTION_STYLE}>
            {/* Visually-hidden — `top`/`left` pinned to 0 is load-bearing;
                see the invariant note on DataTable.tsx's `srOnlyStyle`. */}
            <h2 id="onside-overview-kpis-heading" style={{ ...SUBHEADING_STYLE, position: 'absolute', top: 0, left: 0, width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
              Key figures
            </h2>
            <div style={KPI_GRID_STYLE}>
              <KpiNavCard label="Documents monitored" value={docsTotal} unit="documents" onOpen={() => onNavigate('onside.documents')} />
              <KpiNavCard label="Obligations in scope" value={obligationsInScope} unit="obligations" onOpen={scrollToDomains} />
              <KpiNavCard label="Obligations met" value={obligationsMet} unit="obligations" onOpen={scrollToDomains} />
              <KpiNavCard label="Gaps to your targets" value={gapsToTarget} unit="gaps" onOpen={() => onNavigate('onside.documents')} />
              <KpiNavCard label="Domains at / above target" value={`${domainsAtOrAbove} / ${DOMAINS.length}`} onOpen={scrollToDomains} />
              <KpiNavCard label="Change events · 14 days" value={feedEventCount(14)} unit="events" onOpen={() => onNavigate('onside.feed')} />
            </div>
          </section>

          <section aria-labelledby="onside-overview-posture-heading" style={SECTION_STYLE}>
            <h2 id="onside-overview-posture-heading" style={SUBHEADING_STYLE}>
              Posture by domain · judged against your own targets
            </h2>
            <div style={POSTURE_GRID_STYLE}>
              {DOMAINS.map((domain) => (
                <DomainPostureCard key={domain.key} domain={domain} onOpen={openDomain} />
              ))}
            </div>
          </section>

          {scopeEvents.length > 0 ? (
            <section aria-labelledby="onside-overview-scope-events-heading" style={SECTION_STYLE}>
              <h2 id="onside-overview-scope-events-heading" style={SUBHEADING_STYLE}>
                Scope changes this session
              </h2>
              {scopeEvents.map((event, index) => (
                // eslint-disable-next-line react/no-array-index-key -- session-local, append-only, no stable id in source shape
                <div key={index} style={SCOPE_EVENT_ROW_STYLE}>
                  <span aria-hidden="true">◈</span>
                  <span>
                    <strong>{event.uc}</strong> entered the portfolio: pulls <strong>{event.obl} obligations</strong> into scope across{' '}
                    {event.doms.join(', ')}. Targets re-evaluated.
                  </span>
                </div>
              ))}
            </section>
          ) : null}

          <section aria-labelledby="onside-overview-objectives-heading" style={CARD_STYLE}>
            <h2 id="onside-overview-objectives-heading" style={SUBHEADING_STYLE}>
              Objectives driving scope
            </h2>
            <div style={CHIP_STRIP_STYLE}>
              {objectivesPreview.map((opportunity) => (
                <Chip key={opportunity.n} text={opportunity.n} variant="suggestion" onPress={() => onNavigate('studio.ask')} />
              ))}
              {objectivesRemaining > 0 ? (
                <Chip text={`+ ${objectivesRemaining} more in the register`} variant="suggestion" onPress={() => onNavigate('studio.ask')} />
              ) : null}
            </div>
          </section>

          <section aria-labelledby="onside-overview-connect-heading" style={CARD_STYLE}>
            <h2 id="onside-overview-connect-heading" style={SUBHEADING_STYLE}>
              Every system reads this record · LeapFI · Connect
            </h2>
            <div>
              {/* B-dead-interactions-09 — this button's own label and the
                  base's identical card (leapfi-platform.html:3080
                  onclick="go('connect')") both name the Connect module
                  splash, not AllRailz; 'connect' is App.tsx's own routed
                  ScreenId for that splash. */}
              <Button variant="ghost" label="Open Connect →" onPress={() => onNavigate('connect')} />
            </div>
          </section>

          <section aria-labelledby="onside-overview-cases-heading" style={SECTION_STYLE}>
            {/* Visually-hidden — `top`/`left` pinned to 0 is load-bearing;
                see the invariant note on DataTable.tsx's `srOnlyStyle`. */}
            <h2 id="onside-overview-cases-heading" style={{ ...SUBHEADING_STYLE, position: 'absolute', top: 0, left: 0, width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
              Cases and approvals
            </h2>
            <SetupCard
              title="Cases · approvals"
              variant="interactive"
              onPress={() => onNavigate('cases')}
            />
          </section>

          <section
            ref={domainsSectionRef}
            tabIndex={-1}
            aria-labelledby="onside-overview-domains-heading"
            style={SECTION_STYLE}
          >
            <h2 id="onside-overview-domains-heading" style={SUBHEADING_STYLE}>
              Domains · gaps &amp; levers on one page
            </h2>
            <DomainsAccordion
              domains={DOMAINS}
              expandedKeys={expandedDomainKeys}
              onToggle={toggleDomain}
              pendingScrollKey={pendingScrollKey}
              onScrollHandled={() => setPendingScrollKey(null)}
              onOpenObligation={handleOpenObligation}
            />
          </section>
      </main>

      {/* B-dead-interactions-02 — obligation-detail Drawer (base openObl,
          source 2949-2997): evidence-on-file field, and a real
          "Approve & adopt" action when a redline draft actually closes the
          obligation. Single local instance, matching every other screen's
          own "one Drawer, routed one screen at a time" convention. */}
      <Drawer
        open={openObligationTarget !== null || chatOpen}
        title={chatOpen ? ONSIDE_CHAT_MODULE_CONFIG.drawerTitle : displayObligation ? `${displayObligation.id} · Obligation` : ''}
        onClose={handleCloseObligation}
        footer={chatOpen ? undefined : obligationDrawerFooter}
      >
        {chatOpen ? (
          // §2.9.1 item 2 — one more content state of this SAME Drawer.
          <AskChatPanel key={chatOpenNonce} config={ONSIDE_CHAT_MODULE_CONFIG} {...(onDeepLink ? { onDeepLinkPress: onDeepLink } : {})} />
        ) : displayObligation ? (
          <DrawerContent kind="doc" fields={obligationDrawerFields} tags={obligationDrawerTags} />
        ) : null}
      </Drawer>

      {adoptToast ? <Toast variant="success" message={adoptToast} onDismiss={() => setAdoptToast(null)} /> : null}
    </>
  );
}
