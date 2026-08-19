/**
 * ReportView — Reporting screen's kind-dispatching report body
 * (design_system_spec.md §2.2 components C1/C6/C7/C8/C18/C19; parity_ia_addendum.md
 * §1.3 "Reporting" table + §6 "Batch 5 — Reporting").
 *
 * Renders inside the app's existing shared Drawer (Reporting.tsx mounts the one
 * `<Drawer>` instance; this file is pure body content, never a second Drawer —
 * survey_map.md §d-5). Base engine anchor: `openReport`, all 11 kinds, source
 * lines 1474-1686; `osReports` 9-card index 3710-3725 (see Reporting.tsx for the
 * index itself).
 *
 * SCOPE: this file renders the 11 report kinds as StatCard (C1) tile rows +
 * DataTable (C6) sections. Decorative bar/donut/spark/gauge visualizations
 * (`segBar`/`vbar`/`donut`/`spark`/`gaugeSVG`, source 2449-2484) are DROPPED per
 * parity_ia_addendum.md §1.3/§3 item 3 (Open Question OQ-B) — every chart's
 * information is already present in an adjacent StatCard/DataTable row in
 * source, so dropping is a strict information superset, not a content cut.
 * `board` embeds the already-built DeckView/DeckSlide (C18/C19,
 * `../components/DeckView.tsx` / `DeckSlide.tsx`) read-only, per the same
 * addendum row — no deck-rendering code is duplicated here.
 *
 * STOP-ITEM — Drawer has no "wide" variant: the base engine's `#drawer` gets a
 * `.wide` CSS modifier for every report (`dr.classList.add('wide')`, source line
 * 1679), and this dispatch's brief describes Reporting as using "the existing
 * shared Drawer, wide variant." `../components/Drawer.tsx`'s own header already
 * flags this exact gap ("AMBIGUITY RESOLVED — no 'wide' variant... STOP-item if a
 * future screen composite needs the wider layout — that is new spec surface, not
 * a restyle") and design_system_spec.md §2.2 C7 lists no size variant at all.
 * Drawer.tsx is outside this dispatch's ALLOWLIST, so no `wide` prop is added
 * here or there. This file renders inside the Drawer's existing `min(480px,
 * 100vw)` width instead, and every DataTable below is wrapped in its own
 * `overflow-x: auto` container so a wide table scrolls inside the narrow drawer
 * rather than blowing out the layout. Flagged for design-authority / a future
 * Drawer `size`/`wide` prop addition — not silently worked around by widening
 * Drawer.tsx from this file.
 *
 * STOP-ITEM — forward references to not-yet-wired screens: (1) `gapboard`'s
 * "Open cases →" link is wired through the same `onNavigate` mechanism every
 * screen already uses (`onNavigate('cases')`), per this dispatch's brief
 * ("targets batch-4's Cases screen") — but `App.tsx`'s `SCREEN_IDS` union has no
 * `'cases'` entry yet (Batch 4's `screens/Cases.tsx` has not landed as of this
 * writing, only its `views/CaseDetail.tsx` sibling has), so today this call
 * silently no-ops via `navigateToScreen`'s `isScreenId` guard. (2) The base
 * engine's `head()` also renders an "Open full governance detail · OnSide →"
 * utility link on every report (source line 1482); this file does NOT build it —
 * it is not named in this dispatch's brief (only the gapboard/Cases link is), and
 * inventing it now would be new UX beyond the brief's stated scope even though
 * `screens/OnSideOverview.tsx` has since landed (its own `ScreenId` is likewise
 * not yet wired into `App.tsx`). Both are follow-up wiring, not this file's job.
 *
 * STOP-ITEM — CASES starts empty: `data/cases.ts` exports `CASES` as
 * `export let CASES: Case[] = []`, populated only by that module's own
 * `seedCases(DOCLIB)`, which nothing in this worktree calls yet (Batch 4's
 * `Cases.tsx`, not landed, is the presumed caller). `boardCases()` below is a
 * verbatim-ported pure function over whatever `CASES` holds at render time — an
 * honest empty state today, and correct once Batch 4 lands and seeds/advances
 * real cases (ES module singleton, so this screen picks up that state without
 * any wiring of its own). This matches the base engine's own genuinely-empty
 * pre-interaction state for the Gap Closure Board report (source lines
 * 1503-1504's fallback message + "Open cases" link), not a defect.
 *
 * AMBIGUITY RESOLVED — domain-aggregate derive functions have no engine home:
 * `curOf`/`oblToClose`/`statusOf`/`domByKey`/`boardCases` (source lines
 * 1847, 1881-1884, 2797) are render/derive functions, not datasets — per
 * `data/onside.ts`'s and `data/cases.ts`'s own file headers, those explicitly
 * are NOT ported into the data modules ("belong to whichever component
 * consumes this data"). No `OnSideOverview`/`Cases` engine module claims them
 * either (Batch 1's `screens/OnSideOverview.tsx` has landed but exports no
 * shared engine). Ported verbatim as local, pure, unexported functions here —
 * the same resolution `OnSideFeed.tsx` (`normalizeAmp`/`parseNoteBadge`) and
 * `Roadmap.tsx` (`buildRoadmapPhases`) already established for their own
 * screen-local derive helpers.
 *
 * AMBIGUITY RESOLVED — `gapsClosed()` always returns empty: the source's real
 * `gapsClosed()` (line 3203) filters on `gapState(g).k==='closed'`, which reads
 * `DOCLIB[key].rlState` — a mutable, per-document redline-adoption flag that
 * `OnSideDocuments.tsx` (this worktree) never writes back to the shared
 * `DOCLIB` module; per `App.tsx`'s own header note, every screen's adopted-
 * redline state stays screen-local React state, never lifted to shared scope.
 * There is therefore no real cross-screen signal this file can read for "which
 * gap closed." Rendering a fabricated non-zero count would violate Core
 * Principle 3 ("render server truth, including the unflattering parts"); this
 * file's `gapsClosed()` always returns `[]`, which is the honest answer today
 * and matches the base engine's own identical count before any redline is
 * adopted in a session. STOP-item for whichever dispatch lifts redline-adoption
 * state to shared scope.
 *
 * AMBIGUITY RESOLVED — `regchange`'s standing 7-row table is a LOCAL literal:
 * the addendum's own data-module note for `regchange` names a **new**
 * `data/boardLog.ts` (§2 item 2) as the source for this table — but that module
 * is explicitly Batch 8's deliverable, and Batch 8's own dependency line says it
 * "depends on Batch 5's ReportView.tsx existing to compose into, and on the new
 * data/boardLog.ts module... landing first" — i.e. Batch 8 depends on Batch 5,
 * so Batch 5 cannot depend on Batch 8's not-yet-existing file without a real
 * ordering cycle. Resolved conservatively: `STANDING_ROWS` below ports the
 * static 7-row table literal (source `boardStandingHTML`, lines 3594-3612)
 * directly into this file, the same "copy, not shared data, port verbatim as a
 * local literal" treatment `parity_ia_addendum.md` §6 Batch 6 already sanctions
 * for Settings·About's changelog. The "Log an update →" sub-flow itself
 * (`BoardLogForm.tsx`, session-appended `BOARD_LOG` entries) is Batch 8's
 * addition and is intentionally NOT built here — this file renders the standing
 * table read-only. STOP-item, flagged for whoever ratifies Batch 8: once
 * `data/boardLog.ts` lands, `STANDING_ROWS` here should be superseded by it
 * rather than kept as a second, drifting copy.
 *
 * AMBIGUITY RESOLVED — `plan`/`roadmap` (report kind) audience labels: these two
 * kinds are, per the addendum, "unreached in the base engine" (no
 * `openReport('plan'/'roadmap')` call site exists anywhere in source) — so
 * unlike the other 9 kinds, source never assigned them an `osReports()` audience
 * string. `REPORT_META` below infers a short, content-matched audience label for
 * each ("For investment planning" / "For delivery sequencing") from the report's
 * own real sections (Funded/Ready/Gated; Now/Next/Later/Blocked) rather than
 * fabricating a business-role claim source never made. Flagged for
 * design-authority confirmation, same category as `Roadmap.tsx`'s own
 * "AMBIGUITY RESOLVED" notes on inferred-not-sourced copy.
 *
 * DEFAULT_SLIDERS: `engine/plan.ts`'s `computePlan`/`deriveRecomputeView` take
 * lever state as a parameter (no default global position ships in that module).
 * `InvestmentDesign.tsx`'s own `INITIAL_SLIDERS` constant (same source anchor,
 * the base engine's initial DOM slider values) is not exported from that screen
 * file, so the identical literal is re-declared here as this file's own
 * `DEFAULT_SLIDERS` — same values, same source anchor, not re-derived.
 *
 * STOP-item — no executable test run: identical to every sibling screen already
 * landed in this worktree — no test runner is installed (`package.json`, out of
 * this dispatch's ALLOWLIST, has `dev`/`build`/`preview` scripts only). Verified
 * via `npx tsc --noEmit` against the whole `src/` tree (strict mode,
 * `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) instead; recommending
 * the same test-tooling follow-up dispatch every sibling screen already
 * recommends.
 */
import type { CSSProperties, ReactNode } from 'react';
import { StatCard } from '../components/StatCard';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn } from '../components/DataTable';
import { DeckView } from '../components/DeckView';
import type { DeckViewSlide } from '../components/DeckView';
import { Label } from '../components/primitives/Label';
import { Tag } from '../components/primitives/Tag';
import type { TagVariant } from '../components/primitives/Tag';
import { Button } from '../components/primitives/Button';
import {
  deriveRecomputeView,
  fmt,
  riskLabel,
} from '../engine/plan';
import type { SliderState, RecomputeView, PlanOpportunity } from '../engine/plan';
import {
  CTRL,
  GREEN,
  GOV,
  REGMAP,
  BANDS,
  CUR,
  DETAIL,
} from '../data/studio';
import { DOMAINS, OBL, DOM_OPEN, SRC_ROWS } from '../data/onside';
import type { OnsideDomain, ObligationRow, DomOpenItem } from '../data/onside';
import { APPROVAL, CASES, CASE_STAGES_B } from '../data/cases';
import type { Case } from '../data/cases';
import { DOCLIB } from '../data/doclib';

/* ============================================================
 * Local derive helpers — ported verbatim (see file header
 * "AMBIGUITY RESOLVED — domain-aggregate derive functions").
 * ============================================================ */

/** Source line 1881: `function curOf(d){return d.met/d.appl*5;}` */
function curOf(d: OnsideDomain): number {
  return (d.met / d.appl) * 5;
}

/** Source line 1882: `Math.max(0,Math.round(d.target/5*d.appl - d.met))`. */
function oblToClose(d: OnsideDomain): number {
  return Math.max(0, Math.round((d.target / 5) * d.appl - d.met));
}

type DomainStatus = 'below' | 'at' | 'above';

/** Source line 1883. */
function statusOf(d: OnsideDomain): DomainStatus {
  if (oblToClose(d) > 0) return 'below';
  return curOf(d) >= d.target + 0.5 ? 'above' : 'at';
}

const STATUS_LABEL: Record<DomainStatus, string> = {
  below: 'Below target',
  at: 'At target',
  above: 'Above target',
};

const STATUS_TAG_VARIANT: Record<DomainStatus, TagVariant> = {
  below: 'status-alert',
  at: 'status-caution',
  above: 'status-positive',
};

/** Source line 1847: `function domByKey(k){return DOMAINS.filter(...)[0];}` */
function domByKey(key: string): OnsideDomain | undefined {
  return DOMAINS.find((d) => d.key === key);
}

/** Source line 1472: `function playsGatedBy(k){return OPPS.filter(...).map(...);}` */
function playsGatedBy(controlKey: string, opportunities: PlanOpportunity[]): string[] {
  return opportunities.filter((o) => o.g.includes(controlKey)).map((o) => o.n);
}

/** Source line 2797: `function boardCases(){return CASES.filter(...);}` — see file header STOP-item on `CASES` starting empty. */
function boardCases(): Case[] {
  return CASES.filter(
    (c) => c.cond === APPROVAL.conditions[0] && (c.stage === 'committee' || c.stage === 'final' || c.stage === 'closed'),
  );
}

/** See file header "AMBIGUITY RESOLVED — gapsClosed() always returns empty." */
function gapsClosed(): unknown[] {
  return [];
}

/** Source ternary: `L.tol<34?'conservative':L.tol<67?'balanced':'aggressive'`. */
function toleranceWord(tol: number): string {
  return tol < 34 ? 'conservative' : tol < 67 ? 'balanced' : 'aggressive';
}

const CASE_STAGE_LABEL = new Map<string, string>(CASE_STAGES_B.map(([key, label]) => [key, label]));

/** Source: `stage==='closed'?'Adopted':stage==='final'?'Voted · awaiting final approval':'For a vote'`. */
function caseStageMeta(stage: string): { label: string; variant: TagVariant } {
  if (stage === 'closed') return { label: 'Adopted', variant: 'status-positive' };
  if (stage === 'final') return { label: 'Voted · awaiting final approval', variant: 'status-caution' };
  if (stage === 'committee') return { label: 'For a vote', variant: 'hitl' };
  return { label: CASE_STAGE_LABEL.get(stage) ?? stage, variant: 'count' };
}

/* ============================================================
 * Default lever position — see file header "DEFAULT_SLIDERS."
 * ============================================================ */

const DEFAULT_SLIDERS: SliderState = {
  amb: 3,
  tol: 52,
  speed: 50,
  budget: 450000,
  roi: 2.5,
  eff: 70,
};

/** Computed once — same "seed data precomputed as a module constant" idiom `Roadmap.tsx`'s `ROADMAP_PHASES` already uses. */
const REPORT_VIEW: RecomputeView = deriveRecomputeView(DEFAULT_SLIDERS);

/* ============================================================
 * Report kinds + index/drawer copy (single source of truth —
 * Reporting.tsx imports this to build its 11-card index).
 * ============================================================ */

export type ReportKind =
  | 'board'
  | 'regchange'
  | 'posture'
  | 'compliance'
  | 'mrm'
  | 'tprm'
  | 'infosec'
  | 'roi'
  | 'gapboard'
  | 'plan'
  | 'roadmap';

export interface ReportMeta {
  /** ReportIndex SetupCard title — may differ from `title` (verbatim source behavior: the index card reads "Board Pack," the opened report reads "Board Presentation," source lines 3714 vs 1509). */
  indexTitle: string;
  /** Drawer heading once the report is open (source `head()` title argument). */
  title: string;
  audience: string;
  description: string;
}

/** Order matches `osReports()`'s own `rc()` call sequence (source 3714-3722) for the 9 already-reached kinds, with `plan`/`roadmap` appended as the two new cards per revision_plan.md §3.5 ("cards ADDED for unreached kinds, nothing cut"). */
export const REPORT_KIND_ORDER: ReportKind[] = [
  'board',
  'regchange',
  'posture',
  'compliance',
  'mrm',
  'tprm',
  'infosec',
  'roi',
  'gapboard',
  'plan',
  'roadmap',
];

export const REPORT_META: Record<ReportKind, ReportMeta> = {
  board: {
    indexTitle: 'Board Pack',
    title: 'Board Presentation',
    audience: 'For the board',
    description: 'One-page executive read: posture, the funded portfolio, expected return, and the recommendation.',
  },
  regchange: {
    indexTitle: 'Regulatory Change Briefing',
    title: 'Regulatory Change Briefing',
    audience: 'For the board',
    description:
      'The standing view: what changed, what applies to this institution, what we are doing, what remains open.',
  },
  posture: {
    indexTitle: 'Risk Posture & Targets',
    title: 'Risk Posture & Targets',
    audience: 'For the CRO',
    description: 'Every domain against the bar the institution set, with the target and the gaps behind each score.',
  },
  compliance: {
    indexTitle: 'Compliance · Open Items',
    title: 'Compliance · Open Items',
    audience: 'For the CCO',
    description: 'Every open control family, its gap to green, the plays it blocks, and the action that closes it.',
  },
  mrm: {
    indexTitle: 'Model Risk Report',
    title: 'Model Risk Report',
    audience: 'For model risk',
    description: 'The 2026-13 register: inventory, validation status, open obligations, and the validation calendar.',
  },
  tprm: {
    indexTitle: 'Third-Party & Vendor Risk',
    title: 'Third-Party & Vendor Risk',
    audience: 'For vendor mgmt',
    description: 'Critical vendors, due-diligence and SOC 2 status, exit planning, and the open register items.',
  },
  infosec: {
    indexTitle: 'IT & Information Security',
    title: 'IT & Information Security',
    audience: 'For IT',
    description: 'GLBA safeguards posture, the incident-response escalation item, CAT sunset transition, and connector health.',
  },
  roi: {
    indexTitle: 'Investment & ROI',
    title: 'Platform ROI',
    audience: 'For the CEO / CFO',
    description: 'Why the platform pays for itself against compliance spend, with the funded portfolio behind the number.',
  },
  gapboard: {
    indexTitle: 'Gap Closure Board Approval Report',
    title: 'Gap Closure Board Approval Report',
    audience: 'For the risk committee',
    description:
      'Every change conditionally approved by the CRO and waiting on a committee vote, with the language, why it is needed, and space for the minutes.',
  },
  // `plan`/`roadmap` below: see file header "AMBIGUITY RESOLVED — plan/roadmap audience labels."
  plan: {
    indexTitle: 'Investment Plan',
    title: 'Investment Plan',
    audience: 'For investment planning',
    description: 'The funded portfolio, the ready backlog waiting on budget, and what stays gated by controls.',
  },
  roadmap: {
    indexTitle: 'Sequencing Roadmap',
    title: 'Sequencing Roadmap',
    audience: 'For delivery sequencing',
    description: "What ships now, what's next, what waits on the data foundation, and what stays blocked on controls.",
  },
};

/* ============================================================
 * Shared layout + small local composites.
 * ============================================================ */

const sectionStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };
const statRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.75rem' };
const tableScrollStyle: CSSProperties = { overflowX: 'auto' };
const bodyTextStyle: CSSProperties = { font: 'inherit', fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--ink2)', margin: 0 };
const warnTextStyle: CSSProperties = { ...bodyTextStyle, color: 'var(--sem-alert)' };
const listStyle: CSSProperties = { margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const listItemStyle: CSSProperties = { font: 'inherit', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--ink2)' };
const cellColumnStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.15rem' };
const cellPrimaryStyle: CSSProperties = { color: 'var(--ink)', fontWeight: 600, fontSize: '0.875rem' };
const cellSecondaryStyle: CSSProperties = { color: 'var(--ink3)', fontSize: '0.75rem' };

function TableSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div style={sectionStyle}>
      <Label text={heading} variant="eyebrow" />
      <div style={tableScrollStyle}>{children}</div>
    </div>
  );
}

/** Shared "Play/Category/Build/Annual value/Payback/Risk" columns — `plan` and `roi` kinds both render a funded-portfolio table with this exact shape (source 1549 vs 1672-1674). */
const FUNDED_COLUMNS: DataTableColumn<PlanOpportunity>[] = [
  { id: 'play', header: 'Play', render: (o) => o.n, sortable: true, sortValue: (o) => o.n },
  { id: 'category', header: 'Category', render: (o) => o.c },
  { id: 'build', header: 'Build', render: (o) => fmt(o.cost), align: 'end' },
  { id: 'annual', header: 'Annual value', render: (o) => fmt(o.val * REPORT_VIEW.L.eff), align: 'end' },
  {
    id: 'payback',
    header: 'Payback',
    render: (o) => `${Math.round((o.cost / (o.val * REPORT_VIEW.L.eff)) * 12)} mo`,
    align: 'end',
  },
  {
    id: 'risk',
    header: 'Risk',
    render: (o) => (
      <Tag text={riskLabel(o.r)} variant={o.r === 'low' ? 'status-positive' : o.r === 'med' ? 'status-caution' : 'status-alert'} />
    ),
  },
];

const BENCH_COLUMNS: DataTableColumn<PlanOpportunity>[] = [
  { id: 'play', header: 'Play', render: (o) => o.n, sortable: true, sortValue: (o) => o.n },
  { id: 'add-cost', header: 'To add', render: (o) => `+${fmt(o.cost)}`, align: 'end' },
  { id: 'annual', header: 'Annual value', render: (o) => fmt(o.val * REPORT_VIEW.L.eff), align: 'end' },
];

const GATED_COLUMNS: DataTableColumn<PlanOpportunity>[] = [
  { id: 'play', header: 'Play', render: (o) => o.n, sortable: true, sortValue: (o) => o.n },
  { id: 'unlocks-after', header: 'Unlocks after', render: (o) => o.weakGate },
  { id: 'gate-score', header: 'Control score', render: (o) => `${CTRL[o.weakGate] ?? 0}%`, align: 'end' },
];

/* ============================================================
 * Per-kind report bodies.
 * ============================================================ */

function GapboardReport({ onOpenCases }: { onOpenCases?: () => void }) {
  const cases = boardCases();
  const pending = cases.filter((c) => c.stage === 'committee');
  const adopted = cases.filter((c) => c.stage === 'closed');
  const closedCount = gapsClosed().length;

  const columns: DataTableColumn<Case>[] = [
    { id: 'case', header: 'Case', render: (c) => `${c.id} · ${c.title}` },
    {
      id: 'stage',
      header: 'Status',
      render: (c) => {
        const meta = caseStageMeta(c.stage);
        return <Tag text={meta.label} variant={meta.variant} />;
      },
    },
    { id: 'owner', header: 'Owner', render: (c) => c.owner },
    { id: 'detected', header: 'Detected', render: (c) => c.detected },
    { id: 'why', header: 'Why', render: (c) => c.trigger },
  ];

  return (
    <div style={sectionStyle}>
      <p style={bodyTextStyle}>
        Each item below is a policy change OnSide detected, drafted, and the Chief Risk Officer has conditionally
        approved. Under the institution&rsquo;s approval matrix, board-level policy is adopted only after this
        committee votes. Approving an item authorises the CRO to give final approval and adopt the language exactly
        as it reads here.
      </p>
      <div style={statRowStyle}>
        <StatCard label="For a vote" value={pending.length} />
        <StatCard label="Adopted since last" value={adopted.length} />
        <StatCard label="Obligations closed" value={closedCount} />
      </div>
      <TableSection heading={`For the ${APPROVAL.committee} meeting`}>
        {cases.length === 0 ? (
          <div style={sectionStyle}>
            <p style={bodyTextStyle}>
              Nothing is waiting on the committee. Items appear here the moment the CRO gives conditional approval on
              a board-level change. Open a board-tier case, approve it subject to committee approval, and it lands in
              this report.
            </p>
            {onOpenCases ? <Button variant="ghost" label="Open cases →" onPress={onOpenCases} /> : null}
          </div>
        ) : (
          <DataTable caption="Board approval cases" columns={columns} rows={cases} getRowId={(c) => c.id} />
        )}
      </TableSection>
      <TableSection heading="Recommended motion">
        <p style={bodyTextStyle}>
          {`That the ${APPROVAL.committee} approve the ${pending.length} policy change${pending.length === 1 ? '' : 's'} set out above as drafted, and authorise the Chief Risk Officer to adopt them in the policy record.`}
        </p>
      </TableSection>
    </div>
  );
}

function BoardReport() {
  const view = REPORT_VIEW;
  const topThree = [...view.plan.funded].sort((a, b) => b.val * view.L.eff - a.val * view.L.eff).slice(0, 3);

  const slides: DeckViewSlide[] = [
    {
      id: 'board-report-recommendation',
      kind: 'economics',
      eyebrow: 'Board presentation',
      heading: 'Investment posture & recommendation',
      body: [
        `At a ${toleranceWord(view.L.tol)} risk tolerance and a ${view.levers.budgetLabel} annual budget, the plan funds ${view.plan.funded.length} of ${view.economics.totalOpportunities} plays for a one-time build of ${view.economics.buildCostText}, returning an expected ${view.economics.roiText} over three years (${view.economics.annualValueText}/yr at ${view.levers.adoptionLabel} adoption, ~${view.economics.paybackText} payback). Ambition is set to ${view.levers.ambitionLabel} against a current ${BANDS[CUR] ?? ''} posture; closing ${view.economics.controlsToCloseCount} control families releases the remaining ${view.plan.gated.length} higher-value plays.`,
      ],
      stats: [
        { value: `${view.plan.funded.length} / ${view.economics.totalOpportunities}`, label: 'Plays funded' },
        { value: view.economics.buildCostText, label: 'Build cost' },
        { value: view.economics.annualValueText, label: 'Annual value' },
        { value: view.economics.roiText, label: '3-yr ROI' },
        { value: view.economics.paybackText, label: 'Payback' },
      ],
    },
    {
      id: 'board-report-first-moves',
      kind: 'generic',
      heading: 'Recommended first moves',
      body: topThree.map(
        (o) =>
          `${o.n}: ${fmt(o.val * view.L.eff)}/yr at ${fmt(o.cost)} build, ${Math.round((o.cost / (o.val * view.L.eff)) * 12)}-mo payback.`,
      ),
    },
    {
      id: 'board-report-governance',
      kind: 'generic',
      heading: `Governance to close (${view.plan.toClose.length})`,
      body: view.plan.toClose.map((k) => `${k}: ${CTRL[k] ?? 0}% today, ${GREEN - (CTRL[k] ?? 0)} points to green. ${GOV[k] ?? ''}`),
    },
  ];

  if (view.plan.gated.length > 0) {
    slides.push({
      id: 'board-report-gated',
      kind: 'generic',
      heading: `Gated until controls close (${view.plan.gated.length})`,
      body: view.plan.gated
        .slice(0, 6)
        .map((o) => `${o.n}: waits on ${o.weakGate} (${CTRL[o.weakGate] ?? 0}%).`),
    });
  }

  return (
    <div style={{ height: '32rem' }}>
      <DeckView slides={slides} />
    </div>
  );
}

function ComplianceReport() {
  const view = REPORT_VIEW;
  const allKeys = Object.keys(CTRL);
  const orderedKeys = [...view.plan.toClose, ...allKeys.filter((k) => !view.plan.toClose.includes(k))];

  interface ControlRow {
    key: string;
    score: number;
    open: boolean;
  }

  const rows: ControlRow[] = orderedKeys.map((key) => ({ key, score: CTRL[key] ?? 0, open: (CTRL[key] ?? 0) < GREEN }));

  const columns: DataTableColumn<ControlRow>[] = [
    {
      id: 'control',
      header: 'Control',
      render: (r) => (
        <span style={cellColumnStyle}>
          <span style={cellPrimaryStyle}>{r.key}</span>
          <span style={cellSecondaryStyle}>{REGMAP[r.key] ?? ''}</span>
        </span>
      ),
    },
    { id: 'status', header: 'Status', render: (r) => <Tag text={r.open ? 'Open' : 'Green'} variant={r.open ? 'status-caution' : 'status-positive'} /> },
    { id: 'score', header: 'Now', render: (r) => `${r.score}%`, align: 'end', sortable: true, sortValue: (r) => r.score },
    { id: 'gap', header: 'Gap to 80', render: (r) => (r.open ? `${GREEN - r.score} pts` : '—'), align: 'end' },
    { id: 'plays', header: 'Plays it blocks', render: (r) => playsGatedBy(r.key, view.plan.ready.concat(view.plan.gated)).join(', ') || '—' },
    { id: 'action', header: 'Action to close', render: (r) => (r.open ? GOV[r.key] ?? '' : '—') },
  ];

  return (
    <div style={sectionStyle}>
      <div style={statRowStyle}>
        <StatCard label="Open control families" value={view.plan.toClose.length} />
        <StatCard label="Already green" value={allKeys.length - view.plan.toClose.length} />
      </div>
      <TableSection heading={`${view.plan.toClose.length} of ${allKeys.length} control families open`}>
        <DataTable caption="Control-family coverage" columns={columns} rows={rows} getRowId={(r) => r.key} />
      </TableSection>
    </div>
  );
}

function PlanReport() {
  const view = REPORT_VIEW;
  return (
    <div style={sectionStyle}>
      <div style={statRowStyle}>
        <StatCard label="Funded now" value={`${view.plan.funded.length} / ${view.economics.totalOpportunities}`} />
        <StatCard label="Build cost" value={view.economics.buildCostText} />
        <StatCard label="Annual value" value={view.economics.annualValueText} />
        <StatCard label="Payback" value={view.economics.paybackText} />
      </div>
      <TableSection heading={`Funded now (${view.plan.funded.length})`}>
        <DataTable caption="Funded plays" columns={FUNDED_COLUMNS} rows={view.plan.funded} getRowId={(o) => o.n} />
      </TableSection>
      <TableSection heading={`Ready, not yet funded (${view.plan.bench.length})`}>
        {view.plan.bench.length ? (
          <DataTable caption="Ready, not yet funded plays" columns={BENCH_COLUMNS} rows={view.plan.bench} getRowId={(o) => o.n} />
        ) : (
          <p style={bodyTextStyle}>Everything ready is funded.</p>
        )}
      </TableSection>
      <TableSection heading={`Gated by controls (${view.plan.gated.length})`}>
        {view.plan.gated.length ? (
          <DataTable caption="Gated plays" columns={GATED_COLUMNS} rows={view.plan.gated} getRowId={(o) => o.n} />
        ) : (
          <p style={bodyTextStyle}>Nothing gated at this tolerance.</p>
        )}
      </TableSection>
    </div>
  );
}

function RoadmapReport() {
  const view = REPORT_VIEW;
  const afterSpine = view.plan.gated.filter((o) => (DETAIL[o.n]?.deps ?? []).includes('Unified data foundation'));
  const afterCtrl = view.plan.gated.filter((o) => !(DETAIL[o.n]?.deps ?? []).includes('Unified data foundation'));

  interface RoadmapRow {
    play: string;
    detail: string;
  }

  const nowRows: RoadmapRow[] = view.plan.funded.map((o) => ({ play: o.n, detail: `${o.c}, ${fmt(o.cost)}.` }));
  const nextRows: RoadmapRow[] = view.plan.bench.map((o) => ({ play: o.n, detail: `+${fmt(o.cost)} to add.` }));
  const laterRows: RoadmapRow[] = afterSpine.map((o) => ({
    play: o.n,
    detail: `Depends on the data foundation + ${o.weakGate} (${CTRL[o.weakGate] ?? 0}%).`,
  }));
  const blockedRows: RoadmapRow[] = afterCtrl.map((o) => ({
    play: o.n,
    detail: `Unlocks after ${o.weakGate} (${CTRL[o.weakGate] ?? 0}%).`,
  }));

  const columns: DataTableColumn<RoadmapRow>[] = [
    { id: 'play', header: 'Play', render: (r) => r.play },
    { id: 'detail', header: 'Detail', render: (r) => r.detail },
  ];

  const bucket = (heading: string, rows: RoadmapRow[], emptyText: string) => (
    <TableSection heading={heading} key={heading}>
      {rows.length ? (
        <DataTable caption={heading} columns={columns} rows={rows} getRowId={(r) => r.play} />
      ) : (
        <p style={bodyTextStyle}>{emptyText}</p>
      )}
    </TableSection>
  );

  return (
    <div style={sectionStyle}>
      {bucket(`▶ Now · ready & funded (${nowRows.length})`, nowRows, 'None at this budget.')}
      {bucket(`▷ Next · ready, raise budget to add (${nextRows.length})`, nextRows, 'Nothing waiting on budget.')}
      {bucket(`◔ Later · after the data foundation (${laterRows.length})`, laterRows, 'None.')}
      {bucket(`○ Blocked · waiting on controls (${blockedRows.length})`, blockedRows, 'None.')}
    </div>
  );
}

type StandingStatus = 'open' | 'tracking' | 'closed';

interface StandingRow {
  title: string;
  layer: string;
  applies: string;
  doing: string;
  status: StandingStatus;
}

/** See file header "AMBIGUITY RESOLVED — regchange's standing 7-row table is a LOCAL literal." Ported verbatim from `boardStandingHTML()`, source lines 3595-3602. */
const STANDING_ROWS: StandingRow[] = [
  {
    title: 'Interagency Guidance 2026-13 · Model Risk Management',
    layer: 'Financial',
    applies: 'Applies: model program in scope for all decisioning models',
    doing: 'Policy updated Apr 2026 · validation clauses rolling into 9 legacy contracts. Target compliance Q1 2027 · last update Aug 12.',
    status: 'open',
  },
  {
    title: 'Reg B Circular 2026-C1 · adverse-action specificity',
    layer: 'Financial',
    applies: 'Applies: model-assisted denials in consumer lending',
    doing: 'Attribution-to-code matrix redlined · quarterly accuracy testing drafted. Target compliance Nov 2026 · last update Aug 9.',
    status: 'open',
  },
  {
    title: 'New Mexico Artificial Intelligence Act',
    layer: 'Regional',
    applies: 'Applies: NM footprint · automated decision systems',
    doing: 'Vendor disclosure clause pre-drafted · HB 210 extension tracked.',
    status: 'tracking',
  },
  {
    title: 'CFPB §1033 · Personal Financial Data Rights',
    layer: 'Financial',
    applies: 'Applies at our asset tier · compliance date tracked',
    doing: 'Data-sharing interface assessment scheduled Q4.',
    status: 'tracking',
  },
  {
    title: 'CTA / BOI reporting volatility',
    layer: 'Systemic',
    applies: 'Applies: beneficial-ownership program',
    doing: 'Lifecycle status watched · no policy change until scope settles.',
    status: 'tracking',
  },
  {
    title: 'OFAC · sanctions list update (Aug 8)',
    layer: 'Systemic',
    applies: 'Applies: screening program',
    doing: 'Screening configuration re-verified same day via Connect.',
    status: 'closed',
  },
  {
    title: 'FFIEC CAT sunset transition',
    layer: 'Systemic',
    applies: 'Applies: information security program',
    doing: 'Mapping to successor frameworks in progress.',
    status: 'tracking',
  },
];

const STANDING_STATUS_META: Record<StandingStatus, { label: string; variant: TagVariant }> = {
  open: { label: 'Open', variant: 'status-caution' },
  tracking: { label: 'Tracking', variant: 'count' },
  closed: { label: 'Closed', variant: 'status-positive' },
};

function RegchangeReport() {
  const openCount = STANDING_ROWS.filter((r) => r.status === 'open').length;
  const trackingCount = STANDING_ROWS.filter((r) => r.status === 'tracking').length;
  const closedCount = STANDING_ROWS.filter((r) => r.status === 'closed').length;

  const columns: DataTableColumn<StandingRow>[] = [
    { id: 'what', header: 'What changed', render: (r) => r.title },
    { id: 'layer', header: 'Layer', render: (r) => r.layer },
    { id: 'applies', header: 'Applies to us?', render: (r) => r.applies },
    { id: 'doing', header: 'What we are doing', render: (r) => r.doing },
    { id: 'status', header: 'Status', render: (r) => <Tag text={STANDING_STATUS_META[r.status].label} variant={STANDING_STATUS_META[r.status].variant} /> },
  ];

  return (
    <div style={sectionStyle}>
      <p style={bodyTextStyle}>
        Boards carry the obligation to govern a regulatory environment that changes faster than any quarterly pack
        can track. This is the standing, sourced view: what changed, which changes apply to this institution given
        its charter, size, and business lines, what the institution is doing about each one, and what remains open.
      </p>
      <div style={statRowStyle}>
        <StatCard label="Open" value={openCount} />
        <StatCard label="Tracking" value={trackingCount} />
        <StatCard label="Closed" value={closedCount} />
      </div>
      <TableSection heading={`The standing view · ${STANDING_ROWS.length} instruments`}>
        <DataTable caption="Regulatory change standing view" columns={columns} rows={STANDING_ROWS} getRowId={(r) => r.title} />
      </TableSection>
      <p style={bodyTextStyle}>
        <strong>Tracking</strong> = watching an item that has not become relevant yet · <strong>Open</strong> = it
        applies, work is in progress with a target compliance date · <strong>Closed</strong> = done and evidenced.
      </p>
    </div>
  );
}

function PostureReport() {
  const belowTarget = DOMAINS.filter((d) => statusOf(d) === 'below');
  const gapsTotal = DOMAINS.reduce((sum, d) => sum + oblToClose(d), 0);
  const worst = [...belowTarget].sort((a, b) => oblToClose(b) - oblToClose(a))[0];
  const worstLabel = worst ? (worst.name.split(' · ')[0] ?? worst.name) : 'None';

  const columns: DataTableColumn<OnsideDomain>[] = [
    { id: 'domain', header: 'Domain', render: (d) => d.name },
    { id: 'target', header: 'Target', render: (d) => `${d.target} · ${BANDS[d.target - 1] ?? ''}`, sortable: true, sortValue: (d) => d.target },
    { id: 'met', header: 'Met / applicable', render: (d) => `${d.met} of ${d.appl}` },
    {
      id: 'to-close',
      header: 'To close',
      render: (d) => (oblToClose(d) > 0 ? String(oblToClose(d)) : 'At the bar'),
      sortable: true,
      sortValue: (d) => oblToClose(d),
      align: 'end',
    },
    { id: 'status', header: 'Status', render: (d) => <Tag text={STATUS_LABEL[statusOf(d)]} variant={STATUS_TAG_VARIANT[statusOf(d)]} /> },
  ];

  return (
    <div style={sectionStyle}>
      <div style={statRowStyle}>
        <StatCard label="At / above target" value={`${DOMAINS.length - belowTarget.length} / ${DOMAINS.length}`} />
        <StatCard label="Gaps to targets" value={gapsTotal} />
        <StatCard label="Largest gap" value={worstLabel} />
        <StatCard label="High priority" value={1} />
      </div>
      <TableSection heading="Posture by domain">
        <DataTable
          caption="Domain posture"
          columns={columns}
          rows={DOMAINS}
          getRowId={(d) => d.key}
          defaultSortColumnId="to-close"
          defaultSortDirection="descending"
        />
      </TableSection>
      <p style={bodyTextStyle}>
        Targets are set from risk appetite and the use cases in the portfolio, with determination provenance on
        every inclusion. A score below its target means the institution chose that maturity band on purpose, not
        that it failed a generic bar.
      </p>
    </div>
  );
}

const OBLIGATION_COLUMNS: DataTableColumn<ObligationRow>[] = [
  { id: 'id', header: 'ID', render: (o) => o.id },
  { id: 'requirement', header: 'Requirement', render: (o) => o.s },
  {
    id: 'status',
    header: 'Status',
    render: (o) => <Tag text={o.st === 'partial' ? 'Partial' : 'Gap'} variant={o.st === 'partial' ? 'status-caution' : 'status-alert'} />,
  },
  {
    id: 'hitl',
    header: 'Review',
    render: (o) => <Tag text={o.rev === 'ok' ? 'Approved' : 'HITL queue'} variant={o.rev === 'ok' ? 'status-positive' : 'hitl'} />,
  },
];

function MrmReport() {
  const domain = domByKey('mrm');
  if (!domain) return <p style={bodyTextStyle}>Model Risk domain data is unavailable.</p>;
  const openItems = (OBL.mrm ?? []).filter((o) => o.st !== 'met');

  return (
    <div style={sectionStyle}>
      <div style={statRowStyle}>
        <StatCard label="Score" value={`${curOf(domain).toFixed(1)} / ${domain.target}`} />
        <StatCard label="Obligations met" value={`${domain.met} / ${domain.appl}`} />
        <StatCard label="To close" value={oblToClose(domain)} />
        <StatCard label="Models in inventory" value={23} />
        <StatCard label="Internal / vendor split" value="14 / 9" />
      </div>
      <TableSection heading={`Open register items (${openItems.length})`}>
        <DataTable caption="Model risk register — open items" columns={OBLIGATION_COLUMNS} rows={openItems} getRowId={(o) => o.id} />
      </TableSection>
      <TableSection heading="Validation calendar">
        <ul style={listStyle}>
          <li style={listItemStyle}>
            <strong>Fraud model refresh</strong>: independent validation slot booked Q4 with{' '}
            {DOCLIB['mrm-validation-fraud']?.t ?? 'the current validation report'} as baseline.
          </li>
          <li style={listItemStyle}>
            <strong>AI-assisted transaction monitoring</strong>: independent validation scheduled · evidence lands
            against MRM-08.
          </li>
          <li style={listItemStyle}>
            <strong>Generative &amp; agentic models</strong>: {DOCLIB['gen-ai-draft']?.t ?? 'interim governance language'}{' '}
            pre-staged pending RFI 2026-04 final scope.
          </li>
        </ul>
      </TableSection>
    </div>
  );
}

function TprmReport() {
  const domain = domByKey('tprm');
  if (!domain) return <p style={bodyTextStyle}>Third-Party Risk domain data is unavailable.</p>;
  const openItems = (OBL.tprm ?? []).filter((o) => o.st !== 'met');

  return (
    <div style={sectionStyle}>
      <div style={statRowStyle}>
        <StatCard label="Score" value={`${curOf(domain).toFixed(1)} / ${domain.target}`} />
        <StatCard label="Obligations met" value={`${domain.met} / ${domain.appl}`} />
        <StatCard label="Critical vendors" value={12} />
        <StatCard label="SOC 2 on file" value="11 / 12" />
      </div>
      <TableSection heading={`Open register items (${openItems.length})`}>
        <DataTable caption="Third-party risk register — open items" columns={OBLIGATION_COLUMNS} rows={openItems} getRowId={(o) => o.id} />
      </TableSection>
      <TableSection heading="Program notes">
        <ul style={listStyle}>
          <li style={listItemStyle}>
            <strong>Exit planning</strong>: {DOCLIB['exit-draft']?.t ?? 'draft exit-plan standard'} in HITL review ·
            closes TPRM-08 for the four critical vendors without one.
          </li>
          <li style={listItemStyle}>
            <strong>Contract riders</strong>: {DOCLIB['contract-rider']?.t ?? 'model-risk clauses'} rolling into 9
            legacy contracts · 4 executed.
          </li>
          <li style={listItemStyle}>
            <strong>Core processor</strong>: {DOCLIB['soc2-core']?.t ?? 'SOC 2 Type II'} reviewed · two CUECs mapped
            to internal controls.
          </li>
        </ul>
      </TableSection>
    </div>
  );
}

function InfosecReport() {
  const domain = domByKey('infosec');
  if (!domain) return <p style={bodyTextStyle}>InfoSec domain data is unavailable.</p>;
  const openItems: Array<DomOpenItem & { id: string }> = (DOM_OPEN.infosec ?? []).map((item, index) => ({
    ...item,
    id: `infosec-open-${index}`,
  }));

  const itemColumns: DataTableColumn<DomOpenItem & { id: string }>[] = [
    { id: 'item', header: 'Open item', render: (r) => r.t },
    { id: 'citation', header: 'Citation', render: (r) => r.cite ?? (r.doc ? DOCLIB[r.doc]?.t ?? r.doc : '—') },
  ];

  return (
    <div style={sectionStyle}>
      <div style={statRowStyle}>
        <StatCard label="Score" value={`${curOf(domain).toFixed(1)} / ${domain.target}`} />
        <StatCard label="Obligations met" value={`${domain.met} / ${domain.appl}`} />
        <StatCard label="High priority" value={1} />
        <StatCard label="Connector health" value="4 live" />
      </div>
      <p style={warnTextStyle}>
        Incident Response Plan: escalation path for member-facing automation is not yet defined. Redline drafted,
        awaiting {domain.owner.split(' · ')[0] ?? domain.owner}.
      </p>
      <TableSection heading={`Open items (${openItems.length})`}>
        <DataTable caption="InfoSec open items" columns={itemColumns} rows={openItems} getRowId={(r) => r.id} />
      </TableSection>
      <TableSection heading="Program status">
        <ul style={listStyle}>
          <li style={listItemStyle}>
            <strong>GLBA Safeguards</strong>: {DOCLIB['glba-program']?.t ?? 'program document'} current · access
            reviews and MFA evidence on file for the quarter.
          </li>
          <li style={listItemStyle}>
            <strong>FFIEC CAT sunset</strong>: mapping to successor frameworks in progress · tracked in the
            regulatory feed lifecycle.
          </li>
          <li style={listItemStyle}>
            <strong>Vendor security</strong>: core processor {DOCLIB['soc2-core']?.t ?? 'SOC 2'} reviewed · no open
            complementary-control exceptions.
          </li>
          <li style={listItemStyle}>
            <strong>Platform feeds</strong>: all live connectors healthy, same-day change detection verified.
          </li>
        </ul>
      </TableSection>
    </div>
  );
}

function RoiReport() {
  const view = REPORT_VIEW;
  const opex = 45000000;
  const compPct = 0.1;
  const comp = opex * compPct;
  const platformCost = 180000;
  const save = Math.round(comp * 0.12);
  const net = save + view.plan.annual - platformCost;

  return (
    <div style={sectionStyle}>
      <p style={bodyTextStyle}>
        Community and regional institutions spend roughly 10% of noninterest expense on compliance (CSBS survey
        data, 2015&ndash;2024, with the smallest banks running higher). For NorthWinds, on an estimated {fmt(opex)}{' '}
        noninterest expense, that is {fmt(comp)}/yr of compliance spend, most of it manual monitoring,
        re-interpretation, and document upkeep the platform industrializes.
      </p>
      <div style={statRowStyle}>
        <StatCard label="Compliance spend" value={fmt(comp)} unit="/yr" />
        <StatCard label="Platform subscription" value={fmt(platformCost)} unit="/yr" />
        <StatCard label="Compliance capacity freed" value={fmt(save)} unit="/yr" />
        <StatCard label="Portfolio value" value={view.economics.annualValueText} unit="/yr" />
        <StatCard label="Net annual impact" value={fmt(net)} unit="/yr" />
      </div>
      <TableSection heading="Where the savings come from">
        <ul style={listStyle}>
          <li style={listItemStyle}>
            <strong>Regulatory monitoring</strong>: {SRC_ROWS.length} sources across three layers watched
            continuously instead of by hand, with same-day change detection and mapped impact.
          </li>
          <li style={listItemStyle}>
            <strong>Document upkeep</strong>: 500+ monitored governance documents with proposed redlines drafted on
            change, cutting policy-maintenance hours.
          </li>
          <li style={listItemStyle}>
            <strong>Exam preparation</strong>: evidence exports assembled on demand from the obligation registers
            instead of weeks of document assembly.
          </li>
          <li style={listItemStyle}>
            <strong>Judged against your own bar</strong>: effort goes only to the obligations your use cases and
            appetite actually trigger.
          </li>
        </ul>
      </TableSection>
      <TableSection heading="The funded portfolio behind the number">
        <DataTable caption="Funded portfolio" columns={FUNDED_COLUMNS} rows={view.plan.funded} getRowId={(o) => o.n} />
      </TableSection>
      <p style={bodyTextStyle}>
        The platform pays for itself on compliance capacity alone. The funded portfolio return ({view.economics.roiText}{' '}
        over three years) is upside on top. Figures are planning envelopes for discussion.
      </p>
    </div>
  );
}

/* ============================================================
 * Kind dispatch + exported component.
 * ============================================================ */

function renderReportBody(kind: ReportKind, onOpenCases?: () => void): ReactNode {
  switch (kind) {
    case 'gapboard':
      return <GapboardReport {...(onOpenCases !== undefined ? { onOpenCases } : {})} />;
    case 'board':
      return <BoardReport />;
    case 'compliance':
      return <ComplianceReport />;
    case 'plan':
      return <PlanReport />;
    case 'roadmap':
      return <RoadmapReport />;
    case 'regchange':
      return <RegchangeReport />;
    case 'posture':
      return <PostureReport />;
    case 'mrm':
      return <MrmReport />;
    case 'tprm':
      return <TprmReport />;
    case 'infosec':
      return <InfosecReport />;
    case 'roi':
      return <RoiReport />;
  }
}

export interface ReportViewProps {
  kind: ReportKind;
  /**
   * Wired to the shell's navigation, e.g. `() => onNavigate('cases')` — see
   * file header STOP-item (Batch 4's Cases screen not yet wired into
   * `App.tsx`'s `ScreenId` union). Omit to hide the "Open cases →" link
   * entirely rather than render a control with nowhere to go (same
   * defensive pattern `Topbar`'s own `onOpenNotifications` already uses).
   */
  onOpenCases?: () => void;
}

export function ReportView({ kind, onOpenCases }: ReportViewProps) {
  const meta = REPORT_META[kind];
  return (
    <div data-lf-view="report" data-kind={kind} style={sectionStyle}>
      <Label
        text={`LEAPFI · Reporting · ${meta.audience} · NorthWinds Credit Union · illustrative model on sample data`}
        variant="body-secondary"
      />
      {renderReportBody(kind, onOpenCases)}
    </div>
  );
}
