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
 * AMBIGUITY RESOLVED — Topbar/Sidebar data ownership: identical
 * passthrough pattern to every already-landed screen in this worktree
 * (`Home.tsx`, `OnSideDocuments.tsx`, `StudioAsk.tsx`) — full `topbar:
 * TopbarProps` bundle, `onNavigate: SidebarProps['onNavigate']`,
 * `activeId` hardcoded to `'onside.overview'` (intrinsic to this screen).
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
 * AMBIGUITY RESOLVED — `deepLinkDomainKey` prop (the `dom-KEY` navigation
 * entry point): no router or cross-screen navigation-with-payload
 * mechanism exists in this worktree yet — `Sidebar.tsx`'s `onNavigate` is
 * `(id: string) => void`, a bare id with no room for a domain-key payload,
 * and `App.tsx` (out of allowlist) is the only place such a mechanism
 * could be threaded. This screen exposes an optional `deepLinkDomainKey`
 * prop so a future integrator (e.g. `OnSideDocuments.tsx`'s post-Adopt
 * cascade, or a URL-hash parser in `App.tsx`) has a real prop to set —
 * the screen honors it correctly today (auto-expand + scroll-into-view,
 * matching `onsideShow`'s `domKey` branch exactly) even though nothing in
 * this worktree calls it with a real value yet. STOP-item for the wiring
 * dispatch, not a gap in this screen's own behavior.
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
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import { SetupCard } from '../components/SetupCard';
import { PosturePillBar } from '../components/PosturePillBar';
import { Drawer } from '../components/Drawer';
import { DrawerContent } from '../components/DrawerContent';
import type { DrawerContentField, DrawerContentTag } from '../components/DrawerContent';
import { Toast } from '../components/Toast';
import { Button } from '../components/primitives/Button';
import { Chip } from '../components/primitives/Chip';
import { Label } from '../components/primitives/Label';
import { Tag } from '../components/primitives/Tag';
import type { TagVariant } from '../components/primitives/Tag';
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
const OBL_STATUS_VARIANT: Record<ObligationRow['st'], TagVariant> = {
  met: 'status-positive',
  partial: 'status-caution',
  gap: 'status-alert',
};

/** Same implementer-judgment value as `OnSideDocuments.tsx`'s own
 * ADOPT_COMMIT_DELAY_MS — long enough that the Button's `loading` state is
 * visibly a real wait (Core Principle 1: never claim done before the
 * server has). */
const ADOPT_COMMIT_DELAY_MS = 650;

const SCREEN_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100vh',
  background: 'var(--bg)',
  boxSizing: 'border-box',
};
const BODY_ROW_STYLE: CSSProperties = { display: 'flex', flex: '1 1 auto', minHeight: 0 };
const SIDEBAR_REGION_STYLE: CSSProperties = { flex: '0 0 240px' };
const MAIN_STYLE: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowY: 'auto',
  boxSizing: 'border-box',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
};
const TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
const SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };
const SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)' };
const KPI_GRID_STYLE: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' };
const POSTURE_GRID_STYLE: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.875rem' };
const CARD_STYLE: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md, 10px)',
  background: 'var(--panel)',
  padding: '1.25rem',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};
const SUB_TEXT_STYLE: CSSProperties = { margin: 0, fontSize: '0.875rem', color: 'var(--ink2)' };
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
        <div style={{ minWidth: 0 }}>
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
          <Label
            text={`${domain.bodies} · ${domain.appl}${domain.tot > domain.appl ? ` of ${domain.tot}` : ''} obligations in scope`}
            variant="body-secondary"
          />
        </div>
        <Tag text={DOMAIN_STATUS_LABEL[status]} variant={DOMAIN_STATUS_VARIANT[status]} />
      </div>

      <PosturePillBar segments={domainPostureSegments(current, domain.target)} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--ink2)' }}>
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

export interface OnSideOverviewProps {
  /** Full Topbar prop bundle — this screen does not own persona/profile/notification/date data (same passthrough pattern as every other screen in this worktree). */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to this screen ('onside.overview') and is not accepted as a prop. */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
  /** See file header "deepLinkDomainKey prop" note — a `dom-KEY` entry point for a future cross-screen deep link. Setting/changing this force-expands and scrolls to the matching domain's accordion row. */
  deepLinkDomainKey?: string;
}

export function OnSideOverview({ topbar, onNavigate, sidebarVersionLabel, deepLinkDomainKey }: OnSideOverviewProps) {
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

  const lastDeepLinkRef = useRef<string | undefined>(undefined);
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
    setOpenObligationTarget({ domain: domainKey, id: row.id });
  };

  const handleCloseObligation = () => setOpenObligationTarget(null);

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

  useEffect(() => {
    if (!deepLinkDomainKey || deepLinkDomainKey === lastDeepLinkRef.current) return;
    lastDeepLinkRef.current = deepLinkDomainKey;
    setExpandedDomainKeys((prev) => (prev.has(deepLinkDomainKey) ? prev : new Set(prev).add(deepLinkDomainKey)));
    setPendingScrollKey(deepLinkDomainKey);
  }, [deepLinkDomainKey]);

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

  const sidebarProps: SidebarProps = {
    activeId: 'onside.overview',
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  return (
    <div data-lf-screen="onside-overview" style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="onside-overview-main" style={MAIN_STYLE} aria-labelledby="onside-overview-title">
          <h1 id="onside-overview-title" style={TITLE_STYLE}>
            OnSide · Overview
          </h1>

          <section aria-labelledby="onside-overview-kpis-heading" style={SECTION_STYLE}>
            <h2 id="onside-overview-kpis-heading" style={{ ...SUBHEADING_STYLE, position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
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
            <p style={SUB_TEXT_STYLE}>
              Applicability is derived from the use cases the institution has declared, with determination provenance on every inclusion
              and exclusion. Click one to open the register in Studio.
            </p>
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
            <p style={SUB_TEXT_STYLE}>
              Today someone reads the policy manual, decides what it requires, and configures each system by hand: limits, approval
              chains, retention rules, disclosure requirements, access rights. That translation repeats for every product under contract
              and starts drifting the day the next policy changes. Connect is the MCP and API layer of this record, so each system reads
              the approved policy and configures itself instead.
            </p>
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
            <h2 id="onside-overview-cases-heading" style={{ ...SUBHEADING_STYLE, position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
              Cases and approvals
            </h2>
            <SetupCard
              title="Cases · approvals"
              description="Items routed to a named owner for approval, conditional approval, counsel routing, or rejection."
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
            <p style={SUB_TEXT_STYLE}>
              Every domain the institution monitors, judged against the target it set. Open any category to see its target and the gaps
              behind the score.
            </p>
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
      </div>

      {/* B-dead-interactions-02 — obligation-detail Drawer (base openObl,
          source 2949-2997): evidence-on-file field, and a real
          "Approve & adopt" action when a redline draft actually closes the
          obligation. Single local instance, matching every other screen's
          own "one Drawer, routed one screen at a time" convention. */}
      <Drawer
        open={openObligationTarget !== null}
        title={displayObligation ? `${displayObligation.id} · Obligation` : ''}
        onClose={handleCloseObligation}
        footer={obligationDrawerFooter}
      >
        {displayObligation ? <DrawerContent kind="doc" fields={obligationDrawerFields} tags={obligationDrawerTags} /> : null}
      </Drawer>

      {adoptToast ? <Toast variant="success" message={adoptToast} onDismiss={() => setAdoptToast(null)} /> : null}
    </div>
  );
}
