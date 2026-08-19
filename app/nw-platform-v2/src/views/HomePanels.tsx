/**
 * HomePanels — view (parity_ia_addendum.md §1.7 "Home customization",
 * Batch 7): the 5 gated panels — Risk posture, Strategic signal,
 * Investment and return, Your queue, Quick actions — composed below
 * `Home.tsx`'s existing, untouched StatCard row + "Start the demo" primary
 * CTA by a future wiring dispatch. See `HomeCustomizeBar.tsx`'s own file
 * header "WIRING RECIPE" for the exact integration snippet; `Home.tsx` is
 * outside this dispatch's ALLOWLIST.
 *
 * Ports the non-`kpis` sections of `renderHome()` (leapfi-platform.html
 * 4197-4285) as five independently-gated `<section>`s, rendered in
 * `visibleKeys`' own order (never a fixed order) — matching
 * `applyHomePanels()`'s own DOM-reordering behavior (source 4172-4188:
 * "put the DOM in the picked sequence").
 *
 * AMBIGUITY RESOLVED — "reuses the domain summary card built in batch-1"
 * (dispatch brief): `screens/OnSideOverview.tsx`'s own per-domain card
 * (`DomainPostureCard`) is a **local, unexported** render helper (that
 * file's own header: "built as a private, unexported render helper inside
 * this screen file... the same 'local subcomponent, not a new shared file'
 * pattern DataTable.tsx already uses") — there is no importable "domain
 * summary card" component to reuse literally. What Batch 1 actually made
 * reusable is `views/DomainsAccordion.tsx`'s exported pure derivations
 * (`curOf`, `statusOf`, `oblToClose`, `domainPostureSegments`,
 * `DOMAIN_STATUS_LABEL`, `DOMAIN_STATUS_VARIANT`) plus the shared
 * `PosturePillBar` (C12) composite both files already build on — this
 * panel reuses exactly those (imported below, not reimplemented), which is
 * the substantive reuse the brief is pointing at. The posture band itself
 * is built as a `DataTable` (C6) — one of the two shapes
 * parity_ia_addendum.md §1.7 names for this exact row ("PosturePillBar ×8
 * or DataTable rows with an inline Tag") — rather than a second card grid
 * duplicating `OnSideOverview.tsx`'s own visual, per that same row's
 * "reuses, does not duplicate" instruction.
 *
 * AMBIGUITY RESOLVED — Strategic signal panel scope: `sigImpact()`/
 * `sigTouch()` (source 4053-4088) compute a *live* cross-check against
 * `OBL`/`DOCLIB`/domain state ("N in force would need updating," clickable
 * per-touch links into obligation/doc/domain views). Neither `OBL` nor
 * `DOCLIB` is named in this dispatch's Data modules line (`data/misc.ts`
 * SIGNAL, `data/onside.ts` DOMAINS, `engine/plan.ts` only) — that live
 * impact calculation is controller/render logic layered on top of the
 * `SIGNAL` data itself, the same category of exclusion `data/misc.ts`'s own
 * header already applies to `startIntake`/`acceptProposed`/etc. This panel
 * instead renders each `SIGNAL` entry's own literal fields (scope,
 * instrument, status, age, the `read` paragraph, and the touch list as
 * plain text) in the shared Drawer — matching exactly what
 * `OnSideFeed.tsx`'s own signal Drawer already does for its comparable
 * `SRC_ITEMS` rows (field rows, no live cross-domain computation, no
 * fabricated clickable sub-links to screens that don't exist). Direct
 * reuse of that same Drawer/DrawerContent (`kind: 'signal'`) pattern, per
 * the dispatch brief.
 *
 * DRAWER OWNERSHIP: this view mounts its own local `<Drawer>` instance for
 * the Strategic signal panel — matching `OnSideFeed.tsx`'s own documented
 * "single local `<Drawer>` instance, not hoisted" reasoning verbatim: in
 * this worktree's single-active-screen-at-a-time model, `HomePanels` is
 * only ever rendered as part of the one currently-mounted screen (`Home`),
 * so this can never coexist with a second simultaneously-open Drawer.
 * `HomeCustomizeBar.tsx` and `NotificationBellPanel.tsx` (this dispatch's
 * other two files) own no Drawer of their own, so no conflict exists
 * within this dispatch either.
 *
 * "YOUR QUEUE" DATA SCOPE: role-bucket content (source 4243-4270) branches
 * on `CURRENT.roleKey` across analyst/cro/ceo/ai/default. Every subtitle
 * below is derived only from data this dispatch's Data modules line
 * actually names (`DOMAINS` + `DomainsAccordion.tsx`'s exported
 * `oblToClose`/`statusOf`, already imported for the posture panel;
 * `engine/plan.ts`'s `deriveRecomputeView`, already computed for the
 * Investment panel; `data/cases.ts` `CASES`) — never `GAPS`/`gapState`,
 * `DIGEST`/`digestCount()`, or `hitlCount()` (source's own data for the
 * "Open gaps," "Regulatory digest," and "Human review queue" rows
 * respectively), none of which is named in this dispatch's scope and each
 * of which lives in files/functions outside it. Per Core Principle 3
 * (never fabricate a number the data doesn't back), rows that would have
 * needed one of those are given honest, qualitative copy instead of an
 * invented count — flagged here rather than silently approximated.
 *
 * CASES SEEDING: identical guarded self-seed to `screens/Cases.tsx`'s own
 * (`if (CASES.length === 0) seedCases(DOCLIB)`), for the same reason that
 * file states — no real app-boot sequence exists yet in this worktree
 * (App.tsx, out of every batch's allowlist) to own this call once, so
 * every consumer that needs `CASES` populated guards its own idempotent
 * seed. Recommending (per `Cases.tsx`'s own note) this be relocated to a
 * real boot sequence once one exists.
 *
 * NAVIGATION TARGETS (STOP-item, flagged rather than silently worked
 * around): row/card actions below call `onNavigate('cases')` and
 * `onNavigate('onside.overview')` — the two screens this dispatch's own
 * data depends on (Batch 4 `Cases.tsx`, Batch 1 `OnSideOverview.tsx`), both
 * of which now exist as files but are **not yet in `App.tsx`'s
 * `SCREEN_IDS` union** (confirmed by reading `App.tsx` at dispatch time).
 * Every other sibling screen/view already documents this identical class of
 * gap under its own "wiring note"/STOP-item (e.g. Batch 1's own wiring
 * note: "App.tsx gains the onside.overview ScreenId case"). Until that
 * follow-up `App.tsx` dispatch lands, clicking these two targets is an
 * honest no-op (`App.tsx`'s `isScreenId` guard silently declines an
 * unrecognized id) — not a broken handler in this file, and it will start
 * working the moment those ids are added, with no change needed here.
 * `'reporting'`, `'onside.feed'`, `'onside.documents'`, `'studio.ask'`,
 * `'studio.investment-design'`, and `'studio.roadmap'` are all already real,
 * wired `ScreenId`s today, so those specific row actions work end to end
 * right now.
 *
 * Accessibility gate (persona directive 7): every panel is a labelled
 * `<section>`; posture/signal/queue panels are real `DataTable` (C6)
 * instances (semantic tables, sortable headers where meaningful, a single
 * row-action `Button`); Quick actions is 3 real `SetupCard`
 * (`interactive`) buttons — same pattern `Roadmap.tsx`'s own "What's next"
 * row already uses, reused verbatim per the dispatch brief; the signal
 * Drawer inherits `Drawer.tsx`'s own full focus-trap/Esc/restore-focus
 * baseline unmodified.
 *
 * Irreversibility gate (persona directive 6): N/A — every control in this
 * file is read-only navigation or a Drawer open/close; no irreversible
 * operation is triggered from here.
 *
 * STOP-item — no executable test run: matches every sibling file in this
 * worktree — no test runner installed (`package.json`, outside this
 * dispatch's ALLOWLIST). Verified via `npx tsc --noEmit` (strict,
 * `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) against the
 * whole `src/` tree instead.
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn, DataTableRowAction } from '../components/DataTable';
import { StatCard } from '../components/StatCard';
import { SetupCard } from '../components/SetupCard';
import { PosturePillBar } from '../components/PosturePillBar';
import { Drawer } from '../components/Drawer';
import { DrawerContent } from '../components/DrawerContent';
import type { DrawerContentField } from '../components/DrawerContent';
import { Tag } from '../components/primitives/Tag';
import { curOf, statusOf, oblToClose, domainPostureSegments, DOMAIN_STATUS_LABEL, DOMAIN_STATUS_VARIANT } from './DomainsAccordion';
import type { HomePanelKey } from './HomeCustomizeBar';
import { HOME_PANEL_DEFS } from './HomeCustomizeBar';
import { DOMAINS } from '../data/onside';
import type { OnsideDomain } from '../data/onside';
import { SIGNAL } from '../data/misc';
import type { SignalEntry } from '../data/misc';
import { CASES, seedCases } from '../data/cases';
import { DOCLIB } from '../data/doclib';
import { OPPS } from '../data/studio';
import { deriveRecomputeView, fmt } from '../engine/plan';
import type { SliderState, PlanOpportunity } from '../engine/plan';

// See file header "CASES SEEDING."
if (CASES.length === 0) {
  seedCases(DOCLIB);
}

/** Same corrected default lever state `InvestmentDesign.tsx` seeds itself
 * with (survey_map.md §a line 59 fix) — duplicated here rather than
 * imported since `InvestmentDesign.tsx`'s `INITIAL_SLIDERS` is a private,
 * unexported module constant. */
const DEFAULT_SLIDERS: SliderState = { amb: 3, tol: 52, speed: 50, budget: 450000, roi: 2.5, eff: 70 };

/** Ported verbatim, `caseWaitingOn` (leapfi-platform.html 2617-2622) — same
 * small pure derivation `screens/Cases.tsx`'s own local `waitingOnRoleKey`
 * already ports independently (that function is not exported). */
function waitingOnRoleKey(stage: string): string | null {
  if (stage === 'analyst') return 'analyst';
  if (stage === 'cro' || stage === 'final' || stage === 'committee') return 'cro';
  if (stage === 'legal') return 'legal';
  return null;
}

interface QueueRow {
  id: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  onOpen: () => void;
}

interface QueueBucket {
  title: string;
  sub: string;
  rows: QueueRow[];
}

/** Ports `renderHome()`'s 5-way role branch (source 4243-4270) — see file
 * header "'YOUR QUEUE' DATA SCOPE" for exactly which source subtitles were
 * trimmed to honest, non-fabricated copy and why. */
function buildQueueBucket(roleKey: string, gapsTotal: number, below: OnsideDomain[], gatedCount: number, gatedFirstName: string | null, onNavigate: (id: string) => void): QueueBucket {
  const myCases = CASES.filter((c) => waitingOnRoleKey(c.stage) === roleKey);

  if (roleKey === 'analyst') {
    return {
      title: 'Your queue · review',
      sub: 'Language drafted by OnSide, waiting on your read',
      rows: [
        {
          id: 'q-cases',
          title: `${myCases.length} case${myCases.length === 1 ? '' : 's'} waiting on you`,
          subtitle: myCases.length > 0 ? `Oldest: ${myCases[0]?.title ?? ''}` : 'Nothing in your queue',
          actionLabel: 'Open',
          onOpen: () => onNavigate('cases'),
        },
        {
          id: 'q-gaps',
          title: 'Open gaps',
          subtitle: `${gapsTotal} obligation${gapsTotal === 1 ? '' : 's'} to close, across all domains`,
          actionLabel: 'Gaps',
          onOpen: () => onNavigate('onside.documents'),
        },
        {
          id: 'q-feed',
          title: 'Regulatory feed',
          subtitle: "Today's signal and sourcing detail",
          actionLabel: 'Feed',
          onOpen: () => onNavigate('onside.feed'),
        },
      ],
    };
  }

  if (roleKey === 'cro') {
    const rows: QueueRow[] = [];
    if (myCases.length > 0) {
      rows.push({
        id: 'q-cases',
        title: `${myCases.length} case${myCases.length === 1 ? '' : 's'} awaiting your approval`,
        subtitle: myCases[0]?.title ?? '',
        actionLabel: 'Approve',
        onOpen: () => onNavigate('cases'),
      });
    }
    rows.push(
      {
        id: 'q-below',
        title: 'Below-target domains',
        subtitle: `${below.length} of ${DOMAINS.length} · worst gap: ${below[0]?.name ?? 'none'}`,
        actionLabel: 'Domains',
        onOpen: () => onNavigate('onside.overview'),
      },
      {
        id: 'q-signal',
        title: 'Strategic signal to watch',
        subtitle: `${SIGNAL.length} instrument${SIGNAL.length === 1 ? '' : 's'} tracked this cycle`,
        actionLabel: 'Track',
        onOpen: () => onNavigate('onside.feed'),
      },
    );
    return { title: 'Your queue · risk', sub: 'Routed to you with proposed language drafted', rows };
  }

  if (roleKey === 'ceo') {
    return {
      title: 'Your queue · strategy',
      sub: 'What to bring to the board',
      rows: [
        { id: 'q-board', title: 'Board pack', subtitle: 'Posture, portfolio, return, recommendation · one page', actionLabel: 'Generate', onOpen: () => onNavigate('reporting') },
        { id: 'q-roadmap', title: 'Roadmaps', subtitle: 'Year 1 by quarter, then years 2 and 3', actionLabel: 'Open', onOpen: () => onNavigate('studio.roadmap') },
        { id: 'q-ask', title: 'Ask the platform', subtitle: 'Price the next idea before the next meeting', actionLabel: 'Ask', onOpen: () => onNavigate('studio.ask') },
      ],
    };
  }

  if (roleKey === 'ai') {
    return {
      title: 'Your queue · build',
      sub: 'In flight and waiting on governance',
      rows: [
        { id: 'q-udf', title: 'Unified data foundation', subtitle: 'The dependency the strategic plays wait on', actionLabel: 'Open', onOpen: () => onNavigate('studio.investment-design') },
        {
          id: 'q-gated',
          title: `${gatedCount} play${gatedCount === 1 ? '' : 's'} sequence-gated`,
          subtitle: gatedFirstName ? `Highest value: ${gatedFirstName}` : 'None waiting',
          actionLabel: 'Design',
          onOpen: () => onNavigate('studio.investment-design'),
        },
        { id: 'q-mrm', title: 'Model Risk register', subtitle: 'The obligations your builds answer to', actionLabel: 'Open', onOpen: () => onNavigate('onside.overview') },
      ],
    };
  }

  return {
    title: 'Your queue · program',
    sub: 'This week',
    rows: [
      { id: 'q-ask', title: 'Ask the platform', subtitle: 'Scope the next idea before the next meeting', actionLabel: 'Register', onOpen: () => onNavigate('studio.ask') },
      {
        id: 'q-gaps',
        title: 'Open governance gaps',
        subtitle: `${gapsTotal} obligation${gapsTotal === 1 ? '' : 's'} to close, across all domains`,
        actionLabel: 'Gaps',
        onOpen: () => onNavigate('onside.documents'),
      },
      { id: 'q-board', title: 'Board pack prep', subtitle: 'Posture, portfolio, and return, ready to generate', actionLabel: 'Generate', onOpen: () => onNavigate('reporting') },
    ],
  };
}

export interface HomePanelsProps {
  /** Ordered, controlled — see `HomeCustomizeBar.tsx`'s "WIRING RECIPE." Only panels present here render, in this order. */
  visibleKeys: readonly HomePanelKey[];
  currentRoleKey: string;
  /** Generic screen navigation (`Sidebar.tsx`'s own `onNavigate` shape) — see file header "NAVIGATION TARGETS." */
  onNavigate: (id: string) => void;
  /** Unused by any row this dispatch's own scope reaches (see file header) — accepted for prop-shape symmetry with `NotificationBellPanel`'s identical dependency; present so this component's shape doesn't need to change once a queue row deep-links to a specific case. */
  onOpenCase?: (caseId: string) => void;
  /** Testing/override hook, mirrors `InvestmentDesign.tsx`'s own optional `initialSliders`. Defaults to the same corrected lever defaults. */
  sliders?: SliderState;
  /** Testing/override hook, mirrors `InvestmentDesign.tsx`'s own optional `opportunities`. Defaults to the full 15-play catalog. */
  opportunities?: PlanOpportunity[];
}

const sectionStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const sectionHeadingStyle: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--ink)' };
const sectionSubStyle: CSSProperties = { margin: 0, font: 'inherit', fontSize: '0.8125rem', color: 'var(--ink2)' };
const statRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '1rem' };
const setupCardRowStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '1rem' };
const scrollWrapStyle: CSSProperties = { overflowX: 'auto' };
const scoreCellStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.375rem', minWidth: '10rem' };
const itemCellStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.15rem', maxWidth: '28rem' };
const itemTitleStyle: CSSProperties = { color: 'var(--ink)', fontSize: '0.9375rem', fontWeight: 600 };
const itemSubStyle: CSSProperties = { color: 'var(--ink2)', fontSize: '0.8125rem' };

function PostureBand({ onOpenDomains }: { onOpenDomains: () => void }) {
  const columns: DataTableColumn<OnsideDomain>[] = [
    { id: 'domain', header: 'Domain', sortable: true, sortValue: (d) => d.name, render: (d) => <span style={itemTitleStyle}>{d.name}</span> },
    {
      id: 'score',
      header: 'Score',
      render: (d) => (
        <span style={scoreCellStyle}>
          <span style={itemSubStyle}>
            {curOf(d).toFixed(1)} of target {d.target}
          </span>
          <PosturePillBar segments={domainPostureSegments(curOf(d), d.target)} />
        </span>
      ),
    },
    { id: 'status', header: 'Status', render: (d) => <Tag text={DOMAIN_STATUS_LABEL[statusOf(d)]} variant={DOMAIN_STATUS_VARIANT[statusOf(d)]} /> },
  ];
  const rowAction: DataTableRowAction<OnsideDomain> = { label: () => 'Open →', onPress: onOpenDomains };
  return (
    <div style={scrollWrapStyle}>
      <DataTable caption="Risk posture by domain" columns={columns} rows={DOMAINS} getRowId={(d) => d.key} rowAction={rowAction} defaultSortColumnId="domain" />
    </div>
  );
}

interface SignalRow extends SignalEntry {
  rowId: string;
}

function StrategicSignalPanel() {
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const rows: SignalRow[] = SIGNAL.map((s, index) => ({ ...s, rowId: `sig-${index}` }));
  const selected = rows.find((r) => r.rowId === openRowId) ?? null;

  const columns: DataTableColumn<SignalRow>[] = [
    { id: 'scope', header: 'Scope', render: (r) => <Tag text={r.sc} variant="count" /> },
    {
      id: 'instrument',
      header: 'Instrument',
      render: (r) => (
        <span style={itemCellStyle}>
          <span style={itemTitleStyle}>{r.t}</span>
          <span style={itemSubStyle}>{r.age}</span>
        </span>
      ),
    },
    { id: 'status', header: 'Status', render: (r) => <span style={itemSubStyle}>{r.stS || r.st}</span> },
  ];
  const rowAction: DataTableRowAction<SignalRow> = { label: () => 'Review', onPress: (r) => setOpenRowId(r.rowId) };

  const fields: DrawerContentField[] = selected
    ? [
        { label: 'Scope', value: selected.sc },
        { label: 'Instrument', value: selected.instr ?? selected.t },
        { label: 'Status', value: selected.st },
        { label: 'Proposed', value: selected.age },
        { label: 'What it would mean here', value: selected.read },
        { label: 'Would touch', value: selected.touch.map((t) => t[2] ?? t[1]).join(', ') },
      ]
    : [];

  return (
    <>
      <div style={scrollWrapStyle}>
        <DataTable caption="Strategic signal" columns={columns} rows={rows} getRowId={(r) => r.rowId} rowAction={rowAction} />
      </div>
      <Drawer open={selected !== null} title={selected ? `Strategic signal · ${selected.sc}` : 'Strategic signal'} onClose={() => setOpenRowId(null)}>
        <DrawerContent kind="signal" fields={fields} />
      </Drawer>
    </>
  );
}

function InvestmentReturnPanel({ sliders, opportunities }: { sliders: SliderState; opportunities: PlanOpportunity[] }) {
  const view = deriveRecomputeView(sliders, opportunities);
  return (
    <div style={statRowStyle}>
      <StatCard label={`Return on investment · vs ${view.L.roiTgt.toFixed(1)}× hurdle`} value={view.plan.roi.toFixed(1)} unit="×" />
      <StatCard label="One-time build cost" value={view.economics.buildCostText} />
      <StatCard label="Recurring annual value" value={view.economics.annualValueText} />
      <StatCard label="Payback period" value={view.economics.paybackText} />
      <StatCard label="Compliance capacity freed" value={fmt(540000)} unit="/yr" />
    </div>
  );
}

function YourQueuePanel({ roleKey, onNavigate, sliders, opportunities }: { roleKey: string; onNavigate: (id: string) => void; sliders: SliderState; opportunities: PlanOpportunity[] }) {
  const gapsTotal = DOMAINS.reduce((sum, d) => sum + oblToClose(d), 0);
  const below = DOMAINS.filter((d) => statusOf(d) === 'below');
  const view = deriveRecomputeView(sliders, opportunities);
  const gatedFirst = view.plan.gated[0] ?? null;
  const bucket = buildQueueBucket(roleKey, gapsTotal, below, view.plan.gated.length, gatedFirst ? gatedFirst.n : null, onNavigate);

  const columns: DataTableColumn<QueueRow>[] = [
    {
      id: 'item',
      header: 'Item',
      render: (row) => (
        <span style={itemCellStyle}>
          <span style={itemTitleStyle}>{row.title}</span>
          <span style={itemSubStyle}>{row.subtitle}</span>
        </span>
      ),
    },
  ];
  const rowAction: DataTableRowAction<QueueRow> = { label: (row) => row.actionLabel, onPress: (row) => row.onOpen() };

  return (
    <>
      <p style={sectionSubStyle}>{bucket.sub}</p>
      <div style={scrollWrapStyle}>
        <DataTable caption={bucket.title} columns={columns} rows={bucket.rows} getRowId={(row) => row.id} rowAction={rowAction} />
      </div>
    </>
  );
}

function QuickActionsPanel({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div style={setupCardRowStyle}>
      <SetupCard
        title="Ask the platform"
        description="Ideas priced, policy cited, new use cases scoped. One conversation."
        variant="interactive"
        onPress={() => onNavigate('studio.ask')}
      />
      <SetupCard
        title="Domains · gaps & levers"
        description="Every category, its target, and the gaps behind the score."
        variant="interactive"
        onPress={() => onNavigate('onside.overview')}
      />
      <SetupCard title="Reporting" description="Standing reports on one screen, from IT to the board." variant="interactive" onPress={() => onNavigate('reporting')} />
    </div>
  );
}

export function HomePanels({ visibleKeys, currentRoleKey, onNavigate, sliders = DEFAULT_SLIDERS, opportunities = OPPS }: HomePanelsProps) {
  const labelByKey = new Map(HOME_PANEL_DEFS.map((p) => [p.key, p.label]));

  function renderPanel(key: HomePanelKey) {
    switch (key) {
      case 'posture':
        return <PostureBand onOpenDomains={() => onNavigate('onside.overview')} />;
      case 'legis':
        return <StrategicSignalPanel />;
      case 'invest':
        return <InvestmentReturnPanel sliders={sliders} opportunities={opportunities} />;
      case 'queue':
        return <YourQueuePanel roleKey={currentRoleKey} onNavigate={onNavigate} sliders={sliders} opportunities={opportunities} />;
      case 'qa':
        return <QuickActionsPanel onNavigate={onNavigate} />;
      default:
        return null;
    }
  }

  return (
    <>
      {visibleKeys.map((key) => (
        <section key={key} aria-labelledby={`home-panel-${key}-heading`} style={sectionStyle} data-lf-home-panel={key}>
          <h2 id={`home-panel-${key}-heading`} style={sectionHeadingStyle}>
            {labelByKey.get(key) ?? key}
          </h2>
          {renderPanel(key)}
        </section>
      ))}
    </>
  );
}
