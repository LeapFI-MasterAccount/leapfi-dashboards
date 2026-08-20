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
 * WIDE DRAWER RESOLVED (RPT-03 fix wave — supersedes this file's original
 * STOP-item): `../components/Drawer.tsx` now ships the addendum-required
 * `size="wide"` variant (base `dr.classList.add('wide')`, source 1679;
 * `.drawer.wide{width:min(920px,97vw)}`, source 326) and `Reporting.tsx`
 * passes it in report mode. The `overflow-x: auto` wrappers on every
 * DataTable are kept as a defensive floor for narrow viewports.
 *
 * GOVERNANCE CROSS-NAVIGATION RESTORED (B-06 fix batch — supersedes this
 * file's original STOP-item on base `head()`'s "Open full governance detail
 * · OnSide →" utility link, source line 1482): every report now renders that
 * link via the new optional `onOpenGovernance` prop (plain nav, base
 * `closeDrawer();goOnside('overview')` — the drawer needs no explicit close
 * since navigating `Reporting.tsx` away from `'reporting'` unmounts this
 * screen, and with it the Drawer, exactly like the base's explicit call).
 * The compliance control-family table's per-row doclink (control →
 * `goOnside('dom-KEY')`, source ~1542) and its "Plays it blocks" cell
 * (`playLink` → `openPlay(n)`) are restored via `onOpenDomain`/`onOpenPlay`,
 * and the mrm/tprm "Open register items" tables regain their row → `openObl`
 * click-through via `onOpenObligation` (source 1590/1612) — all four wired
 * through `Reporting.tsx`'s `onDeepLink` (App.tsx's NAV-PAYLOAD contract;
 * `onOpenGovernance` alone is a plain nav, not a deep link, since v1's own
 * head-bar link carries no item payload). Every new prop is optional and
 * defensively omitted-renders-nothing, the same pattern `onOpenCases`
 * already established here.
 *
 * CASES note: `boardCases()` below is a verbatim-ported pure function over
 * whatever the live `CASES` singleton holds at render time — empty until a
 * board-tier case is conditionally approved, matching the base engine's own
 * pre-interaction empty state (source 1503-1504). `Cases.tsx` seeds CASES at
 * module scope, and this view re-renders on every store write via
 * `useDemoStore()` (RPT-04 fix wave), so case advances appear live here.
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
 * gapsClosed() UPDATE (fix wave): the shared adopt-cascade now lives in
 * `state/demoStore.ts` (`applyGapClosure`, base 3205-3211 verbatim — stamps
 * `applied` on the GAPS rows it closes). `gapsClosed()` below counts those
 * `applied` rows: still honestly 0 before any adoption (identical to the base
 * pre-interaction count), and live once the OnSide screens route adoption
 * through the store. The original "always returns []" resolution is obsolete —
 * a real cross-screen signal now exists.
 *
 * STANDING_ROWS SUPERSEDED (parity-wiring wave, gate dispatch — closing this
 * file's own original STOP-item "once `data/boardLog.ts` lands, `STANDING_ROWS`
 * here should be superseded by it rather than kept as a second, drifting
 * copy"): Batch 8's `data/boardLog.ts` has landed (W4), so the module-private
 * `STANDING_ROWS` literal this file originally carried (lines 671-721 at HEAD
 * eb0ebe9) is deleted and `RegchangeReport` now renders that module's
 * `BOARD_STANDING_ROWS` — field values byte-identical to the deleted literal
 * per that module's own "STANDING_ROWS SUPERSESSION" header, so the swap is
 * render-identical for the pre-interaction standing table. The Batch 8
 * "Log an update →" sub-flow is now wired too (addendum §1.8): rows gain the
 * affordance gated on `status === 'open'` (data/boardLog.ts's own file-header
 * guidance — reproduces the base's hand-written per-row cite gating exactly
 * for this dataset, source lines 3596-3597), emitted through the new optional
 * `onLogUpdate` prop; the composing screen (`Reporting.tsx`) owns the shared
 * Drawer's sequential content swap to `BoardLogForm` and the `BOARD_LOG`
 * commit (base `boardUpdate`/`boardSave` → `closeDrawer();openReport('regchange')`,
 * source 3577-3593). Session-logged `BOARD_LOG[row.id]` entries render as
 * secondary lines under the row's "What we are doing" cell so the reopened
 * report shows the appended update (gate dispatch's "return to the regchange
 * report showing it"; the base report itself never re-rendered BOARD_LOG —
 * its "Saved to the standing view" pill claimed a landing the standing table
 * never visually showed — flagged as an interpretive addition, empty-by-default
 * so the scripted first paint is unchanged).
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
 * LIVE LEVERS (RPT-04 fix wave — supersedes this file's original
 * "DEFAULT_SLIDERS" module-constant note): the base recomputes every report
 * from the live lever state on each open (`openReport` begins
 * `var P=computePlan(), L=P.L`, source 1477). This file's original
 * `REPORT_VIEW` module constant froze the boot position forever, so reports
 * contradicted whatever the presenter had just shown in Investment Design.
 * Now every report body derives its view per render via
 * `state/demoStore.ts`'s `deriveLiveRecomputeView()` (live sliders + live
 * opportunity pool, including Discovery-accepted plays), and the exported
 * `ReportView` subscribes with `useDemoStore()` so lever/store writes
 * re-render the open report — the base's recompute-on-open behavior and
 * better (live while open, matching React's continuous-render model).
 *
 * Report chrome (RPT-11 fix wave): base `head()` (source 1479-1482) renders
 * the category line 'LEAPFI · Reporting · generated from the live record'
 * plus a PER-REPORT `repmeta` subtitle ('Investment posture &
 * recommendation', 'Register status · {owner} · Interagency Guidance
 * 2026-13', …). `reportSub()` below ports every kind's subtitle verbatim;
 * the original single generic audience line is gone. Base `tile()`
 * sub-captions ('est. 10% of NIE', 'conservative 12%', 'of 87 in
 * inventory', …) are restored via the local `CaptionedStat` wrapper.
 *
 * Tests: `src/__tests__/reporting_cases/` (vitest is installed; the original
 * "no test runner" STOP-item is obsolete and removed).
 */
import type { CSSProperties, ReactNode } from 'react';
import { StatCard } from '../components/StatCard';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn, DataTableRowAction } from '../components/DataTable';
import { DeckView } from '../components/DeckView';
import type { DeckViewSlide } from '../components/DeckView';
import { Label } from '../components/primitives/Label';
import { Tag } from '../components/primitives/Tag';
import type { NonRaciTagVariant } from '../components/primitives/Tag';
import { Button } from '../components/primitives/Button';
import { fmt, riskLabel } from '../engine/plan';
import type { RecomputeView, PlanOpportunity } from '../engine/plan';
import { deriveLiveRecomputeView, useDemoStore } from '../state/demoStore';
import {
  CTRL,
  CTRLDOM,
  GREEN,
  GOV,
  REGMAP,
  BANDS,
  CUR,
  DETAIL,
} from '../data/studio';
import { DOMAINS, GAPS, OBL, DOM_OPEN, SRC_ROWS } from '../data/onside';
import type { GapItem, OnsideDomain, ObligationRow, DomOpenItem } from '../data/onside';
import { APPROVAL, CASES, CASE_STAGES_B } from '../data/cases';
import type { Case } from '../data/cases';
import { DOCLIB } from '../data/doclib';
import { BOARD_LOG, BOARD_STANDING_ROWS } from '../data/boardLog';
import type { BoardStandingRow, BoardStandingStatus } from '../data/boardLog';

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

const STATUS_TAG_VARIANT: Record<DomainStatus, NonRaciTagVariant> = {
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

/** See file header "gapsClosed() UPDATE": counts GAPS rows the shared
 * adopt-cascade has closed (`state/demoStore.ts` `applyGapClosure` stamps
 * `applied`, base 3209). 0 before any adoption — the base's own
 * pre-interaction count (base gapsClosed, source 3203). */
function gapsClosed(): GapItem[] {
  return (GAPS as Array<GapItem & { applied?: boolean }>).filter((g) => g.applied === true);
}

/** Source ternary: `L.tol<34?'conservative':L.tol<67?'balanced':'aggressive'`. */
function toleranceWord(tol: number): string {
  return tol < 34 ? 'conservative' : tol < 67 ? 'balanced' : 'aggressive';
}

const CASE_STAGE_LABEL = new Map<string, string>(CASE_STAGES_B.map(([key, label]) => [key, label]));

/** Source: `stage==='closed'?'Adopted':stage==='final'?'Voted · awaiting final approval':'For a vote'`. */
function caseStageMeta(stage: string): { label: string; variant: NonRaciTagVariant } {
  if (stage === 'closed') return { label: 'Adopted', variant: 'status-positive' };
  if (stage === 'final') return { label: 'Voted · awaiting final approval', variant: 'status-caution' };
  if (stage === 'committee') return { label: 'For a vote', variant: 'hitl' };
  return { label: CASE_STAGE_LABEL.get(stage) ?? stage, variant: 'count' };
}

/* ============================================================
 * Live lever view — see file header "LIVE LEVERS" (RPT-04). Never
 * cached at module scope: every report body calls this per render,
 * the port of base openReport's `var P=computePlan(), L=P.L`
 * (source 1477).
 * ============================================================ */

function liveReportView(): RecomputeView {
  return deriveLiveRecomputeView();
}

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
    // Base rc('regchange', …) card copy verbatim incl. the closing sentence
    // (source 3715) — 'Updates logged in place.' was dropped pre-fix (RPT-08).
    description:
      'The standing view: what changed, what applies to this institution, what we are doing, what remains open. Updates logged in place.',
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

/** Per-report `repmeta` subtitle — base `head()`'s second argument, ported
 * verbatim per kind (RPT-11a; owner attributions and meeting framing were
 * lost to a generic audience line pre-fix). Sources: gapboard 1486, board
 * 1508, compliance 1534, plan 1546, roadmap 1553, regchange 1563, posture
 * 1578, mrm 1591, tprm 1622, infosec 1641, roi 1663. Computed per call —
 * the mrm/tprm/infosec owners read the live DOMAINS rows. */
export function reportSub(kind: ReportKind): string {
  switch (kind) {
    case 'gapboard':
      return `For the ${APPROVAL.committee} · Aug 2026 meeting`;
    case 'board':
      return 'Investment posture & recommendation';
    case 'compliance':
      return 'Control gaps blocking the portfolio';
    case 'plan':
      return 'Funded portfolio & backlog';
    case 'roadmap':
      return 'What to do, in what order';
    case 'regchange':
      return 'The standing view · what changed, what applies, what we are doing';
    case 'posture':
      return 'Every domain against the bar the institution set';
    case 'mrm':
      return `Register status · ${domByKey('mrm')?.owner ?? ''} · Interagency Guidance 2026-13`;
    case 'tprm':
      return `Register status · ${domByKey('tprm')?.owner ?? ''} · 2023 Interagency Guidance`;
    case 'infosec':
      return `GLBA safeguards & security posture · ${domByKey('infosec')?.owner ?? ''}`;
    case 'roi':
      return 'Why the investment pays for itself';
  }
}

/* ============================================================
 * Shared layout + small local composites.
 * ============================================================ */

const sectionStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };
const statRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.75rem' };
const tableScrollStyle: CSSProperties = { overflowX: 'auto', flexShrink: 0 };
// FIX WAVE (Class C, C1): ReportView is rendered only as a child of the
// shared reporting Drawer (screens/Reporting.tsx), whose root background
// is var(--panel), always — a single, unambiguous render context — so
// --ink2 fails AA here in light theme; --chart-axis is the prescribed
// panel-seated substitute.
const bodyTextStyle: CSSProperties = { font: 'inherit', fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--chart-axis)', margin: 0 };
const warnTextStyle: CSSProperties = { ...bodyTextStyle, color: 'var(--sem-alert)' };
const listStyle: CSSProperties = { margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const listItemStyle: CSSProperties = { font: 'inherit', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--chart-axis)' };
const cellColumnStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.15rem' };
const cellPrimaryStyle: CSSProperties = { color: 'var(--ink)', fontWeight: 600, fontSize: '0.875rem' };
const cellSecondaryStyle: CSSProperties = { color: 'var(--ink3)', fontSize: '0.75rem' };

/** Link-styled real `<button>` for an in-cell cross-navigation link — the
 * base `.doclink` affordance, same accessible pattern
 * `RegulatoryFeedInforce.tsx`'s `INSTRUMENT_LINK_STYLE` already established
 * (B-06: control → domain, gated play → play, obligation register row →
 * obligation). */
const docLinkStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  font: 'inherit',
  fontWeight: 700,
  color: 'var(--accent)',
  textDecoration: 'underline',
  cursor: 'pointer',
  textAlign: 'left',
};

function DocLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <button type="button" style={docLinkStyle} onClick={onPress}>
      {label}
    </button>
  );
}

function TableSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div style={sectionStyle}>
      <Label text={heading} variant="eyebrow" />
      <div style={tableScrollStyle}>{children}</div>
    </div>
  );
}

const statCaptionStyle: CSSProperties = { font: 'inherit', fontSize: '0.6875rem', color: 'var(--ink3)', margin: 0 };

/** StatCard plus the base `tile()` third-argument sub-caption (RPT-11b —
 * the qualifier line under every base report tile: 'est. 10% of NIE',
 * 'conservative 12%', 'of 87 in inventory', …). StatCard (C1) has no
 * caption slot and is outside the fix dispatch's allowlist, so the caption
 * renders as a footnote line under the card — every base qualifier restored,
 * none invented. */
function CaptionedStat({ label, value, unit, caption }: { label: string; value: string | number; unit?: string; caption?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
      <StatCard label={label} value={value} {...(unit !== undefined ? { unit } : {})} />
      {caption ? <p style={statCaptionStyle}>{caption}</p> : null}
    </div>
  );
}

/** Shared "Play/Category/Build/Annual value/Payback/Risk" columns — `plan` and
 * `roi` kinds both render a funded-portfolio table with this exact shape
 * (source 1549 vs 1672-1674). Built per render from the LIVE adoption lever
 * (RPT-04) — value cells are `val*L.eff` (base 1549/1673), never raw `val`. */
function fundedColumns(eff: number): DataTableColumn<PlanOpportunity>[] {
  return [
    { id: 'play', header: 'Play', render: (o) => o.n, sortable: true, sortValue: (o) => o.n },
    { id: 'category', header: 'Category', render: (o) => o.c },
    { id: 'build', header: 'Build', render: (o) => fmt(o.cost), align: 'end' },
    { id: 'annual', header: 'Annual value', render: (o) => fmt(o.val * eff), align: 'end' },
    {
      id: 'payback',
      header: 'Payback',
      render: (o) => `${Math.round((o.cost / (o.val * eff)) * 12)} mo`,
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
}

function benchColumns(eff: number): DataTableColumn<PlanOpportunity>[] {
  return [
    { id: 'play', header: 'Play', render: (o) => o.n, sortable: true, sortValue: (o) => o.n },
    { id: 'add-cost', header: 'To add', render: (o) => `+${fmt(o.cost)}`, align: 'end' },
    { id: 'annual', header: 'Annual value', render: (o) => fmt(o.val * eff), align: 'end' },
  ];
}

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
        {/* Base tile subs, source 1489-1491 (RPT-11b). */}
        <CaptionedStat label="For a vote" value={pending.length} caption="conditionally approved, awaiting this meeting" />
        <CaptionedStat label="Adopted since last" value={adopted.length} caption="voted and in force" />
        <CaptionedStat label="Obligations closed" value={closedCount} caption="registers updated on adoption" />
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
      {/* RPT-07: per-case language blocks — base source 1493-1502 renders,
        * for every board case: the Why/Owner/Detected/Prepared-by line, the
        * Before block (current in-force language, `rl-old`), the After block
        * (the drafted language `c.lang`, 'for the committee's approval'), and
        * the minutes line. This is the content the card copy promises ('with
        * the language, why it is needed, and space for the minutes') and the
        * intro's 'adopt the language exactly as it reads here' depends on. */}
      {cases.map((c) => {
        const doc = DOCLIB[c.doc];
        const meta = caseStageMeta(c.stage);
        return (
          <div key={c.id} style={sectionStyle} data-lf-report-case={c.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ ...cellPrimaryStyle, fontSize: '1rem' }}>{`${c.id} · ${c.title}`}</span>
              <Tag text={meta.label} variant={meta.variant} />
            </div>
            <p style={{ ...bodyTextStyle, fontSize: '0.8125rem' }}>
              <strong>Why:</strong> {c.trigger}
              <br />
              <strong>Owner:</strong> {c.owner} · <strong>Detected:</strong> {c.detected} ·{' '}
              <strong>Prepared by:</strong> P. Raman, Risk Analyst
              {c.edited ? ' (language edited from the OnSide draft)' : ''}
            </p>
            <Label text="Before · in force until this is adopted" variant="eyebrow" />
            <p style={{ ...bodyTextStyle, borderLeft: '2px solid var(--sem-alert)', paddingLeft: '0.75rem' }}>
              {doc?.redline?.old ?? ''}
            </p>
            <Label text={'After · for the committee’s approval'} variant="eyebrow" />
            <p style={{ ...bodyTextStyle, borderLeft: '2px solid var(--sem-positive)', paddingLeft: '0.75rem' }}>
              {c.lang}
            </p>
            <p style={{ ...bodyTextStyle, fontSize: '0.8125rem' }}>
              {c.minutes ? (
                <strong>{c.minutes}</strong>
              ) : (
                'Minutes to be attached to the case after the vote. The case carries the full history from detection to adoption.'
              )}
            </p>
          </div>
        );
      })}
      <TableSection heading="Recommended motion">
        <p style={bodyTextStyle}>
          {`That the ${APPROVAL.committee} approve the ${pending.length} policy change${pending.length === 1 ? '' : 's'} set out above as drafted, and authorise the Chief Risk Officer to adopt them in the policy record.`}
        </p>
      </TableSection>
    </div>
  );
}

/** RPT-09 (fix wave): the base `board` report (source 1507-1532) renders the
 * REAL board presentation — `DECK=boardDeck(P,L)` (source 2393-2447), with
 * deck nav — followed by a separately headed, simultaneously visible
 * appendix ('The appendix · the one-page read behind the deck': the rrec
 * recommendation paragraph, 5 tiles, first-moves/governance/gated lists).
 * The pre-fix version synthesized a third deck out of the appendix content
 * and embedded no presentation at all. Now: `boardDeckSlides()` ports the
 * base `boardDeck(P,L)` slide sequence (12 slides, risk then opportunity —
 * per-slide anchors inline; the gauge/segBar/loop visualizations inside
 * slides reduce to their own textual content per OQ-B), and the appendix
 * renders flat below the deck, all sections visible at once, exactly the
 * base structure. */
function boardDeckSlides(view: RecomputeView): DeckViewSlide[] {
  const { plan, L } = view;
  const below = DOMAINS.filter((d) => statusOf(d) === 'below');
  const gapsT = DOMAINS.reduce((sum, d) => sum + oblToClose(d), 0);
  const meets = plan.roi >= L.roiTgt;
  const docsTotal = DOMAINS.reduce((sum, d) => sum + d.docs, 0);
  const openDomains = DOMAINS.filter((d) => oblToClose(d) > 0).sort((a, b) => oblToClose(b) - oblToClose(a));
  const topFunded = [...plan.funded].sort((a, b) => b.val - a.val).slice(0, 5);
  // Base OPPORTUNITY·3 ordering (source 2430): foundation play first, then
  // by cost/value ratio; quartered across Q1-Q4.
  const year1 = [...plan.funded].sort((a, b) => {
    const f = (b.found ? 1 : 0) - (a.found ? 1 : 0);
    if (f) return f;
    return a.cost / (a.val || 1) - b.cost / (b.val || 1);
  });
  const perQuarter = Math.ceil(year1.length / 4) || 1;
  const quarterLines = [0, 1, 2, 3].map((q) => {
    const plays = year1.slice(q * perQuarter, (q + 1) * perQuarter);
    return `Q${q + 1}: ${plays.length ? plays.map((o) => o.n).join(' · ') : 'Scoping capacity'}`;
  });
  const spine = plan.gated.filter((o) => (DETAIL[o.n]?.deps ?? []).includes('Unified data foundation'));
  const waiting = plan.gated.concat(plan.bench).reduce((sum, o) => sum + o.val * L.eff, 0);
  const moneyNet = Math.max(0, Math.round(4500000 * 0.12) + plan.annual - 180000);

  return [
    // Title slide — source 2400.
    {
      id: 'board-deck-title',
      kind: 'generic',
      eyebrow: 'LEAPFI PLATFORM · BOARD REVIEW · AUG 2026',
      heading: 'NorthWinds Credit Union · AI Program · Risk & Opportunity',
      body: ['Prepared for the Board Risk Committee · presented by the CEO · every figure generated live from the governance record'],
    },
    // THE ONE-SLIDE STORY — source 2401-2403.
    {
      id: 'board-deck-story',
      kind: 'economics',
      eyebrow: 'THE ONE-SLIDE STORY',
      heading: 'Governed on our own terms, funded on the numbers',
      stats: [
        { value: `${DOMAINS.length - below.length} / ${DOMAINS.length}`, label: 'domains at or above the targets this board set' },
        { value: gapsT, label: 'obligations still to close · owners assigned, the priority set drafted' },
        { value: plan.funded.length, label: `plays funded · ${fmt(plan.spent)} committed` },
        { value: `${plan.roi.toFixed(1)}×`, label: `expected 3-year return · ${meets ? 'clears' : 'below'} our ${L.roiTgt.toFixed(1)}× bar` },
      ],
      body: ['Risk and opportunity run on one data model. The next five slides are the risk story, the four after are the investment story.'],
    },
    // RISK · 1 OF 4 — source 2404-2406 (gauge row reduces to its scores, OQ-B).
    {
      id: 'board-deck-risk-1',
      kind: 'generic',
      eyebrow: 'RISK · 1 OF 4',
      heading: 'Posture by domain · judged against our own bar',
      body: [
        DOMAINS.map((d) => `${d.name.split(' · ')[0] ?? d.name} ${curOf(d).toFixed(1)} of ${d.target}`).join(' · '),
        'Targets come from our risk appetite and the use cases we chose. A 3.7 against a chosen 4 is a governed position, never a failing grade.',
      ],
    },
    // RISK · 2 OF 4 — source 2407-2410.
    {
      id: 'board-deck-risk-2',
      kind: 'generic',
      eyebrow: 'RISK · 2 OF 4',
      heading: 'Where the gaps sit · all routed, none orphaned',
      body: [
        openDomains.map((d) => `${d.name.split(' · ')[0] ?? d.name}: ${oblToClose(d)} to close`).join(' · ') || 'Nothing open',
        'One high-priority item: the Incident Response Plan escalation path for member-facing automation. Redline drafted, owner assigned, closure targeted before quarter end.',
      ],
    },
    // RISK · 3 OF 4 — source 2411-2414.
    {
      id: 'board-deck-risk-3',
      kind: 'generic',
      eyebrow: 'RISK · 3 OF 4',
      heading: 'The regulatory environment moved. We saw it the day it did.',
      body: [
        'Open · work in progress: 2 · Tracking: 4 · Closed · evidenced: 1',
        'Fed & FDIC joint NPRM · Regulation O · proposed Jul 31 · comment window open, our position in drafting',
        'Interagency 2026-13 · Model Risk · policy updated · validation clauses rolling through 9 legacy contracts, target Q1 2027',
        'New Mexico AI Act · vendor disclosure clause pre-drafted, monitoring the House vote',
      ],
    },
    // RISK · 4 OF 4 — source 2415-2417 (the governance loop, rendered textually).
    {
      id: 'board-deck-risk-4',
      kind: 'generic',
      eyebrow: 'RISK · 4 OF 4',
      heading: 'How every change is governed',
      body: [
        `Monitor (${SRC_ROWS.length} sources · 3 layers · ${docsTotal} documents) → Detect (same-day, with pin-cite & hash) → Propose (language drafted, routed to the owner) → Approve (a named human, every time) → Report (this pack, from the same record)`,
        'Nothing becomes authoritative without a qualified person approving it. The exam answer writes itself as the work happens.',
      ],
    },
    // OPPORTUNITY · 1 OF 4 — source 2418-2424.
    {
      id: 'board-deck-opp-1',
      kind: 'generic',
      eyebrow: 'OPPORTUNITY · 1 OF 4',
      heading: 'The funded portfolio · where the value comes from',
      body: [
        topFunded.map((o) => `${o.n}: ${fmt(o.val * L.eff)}/yr`).join(' · ') +
          (plan.funded.length > 5 ? ` · ${plan.funded.length - 5} more plays` : ''),
        `Budget committed: ${fmt(plan.spent)} of ${fmt(L.budget)}`,
        `${plan.funded.length} plays funded at a ${toleranceWord(L.tol)} risk appetite · ${plan.gated.length} higher-value plays wait on the controls above.`,
      ],
    },
    // OPPORTUNITY · 2 OF 4 — source 2425-2427.
    {
      id: 'board-deck-opp-2',
      kind: 'economics',
      eyebrow: 'OPPORTUNITY · 2 OF 4',
      heading: 'The economics',
      stats: [
        { value: `${plan.roi.toFixed(1)}×`, label: 'expected 3-year return on build' },
        { value: `${plan.payM} mo`, label: 'blended payback across the portfolio' },
        { value: fmt(plan.annual), label: `annual value at our ${Math.round(L.eff * 100)}% adoption setting` },
        { value: fmt(plan.spent), label: 'one-time build, inside the approved envelope' },
      ],
      body: [
        `${meets ? 'The plan clears the ' : 'The plan is below the '}${L.roiTgt.toFixed(1)}× hurdle this board set. Every figure recomputes if we change the levers.`,
      ],
    },
    // OPPORTUNITY · 3 OF 4 — source 2428-2433.
    {
      id: 'board-deck-opp-3',
      kind: 'generic',
      eyebrow: 'OPPORTUNITY · 3 OF 4',
      heading: 'Year 1 · what lands each quarter',
      body: [...quarterLines, 'Foundational work leads, quick paybacks follow. The full sequencing lives in Studio and moves with the levers.'],
    },
    // OPPORTUNITY · 4 OF 4 — source 2434-2437.
    {
      id: 'board-deck-opp-4',
      kind: 'economics',
      eyebrow: 'OPPORTUNITY · 4 OF 4',
      heading: 'Years 2 and 3 · what this year unlocks',
      stats: [
        { value: plan.bench.length + spine.length, label: 'plays queued for Year 2 · led by the data foundation' },
        { value: plan.gated.filter((o) => !spine.includes(o)).length, label: 'plays gated on controls · release as domains reach target' },
        { value: fmt(waiting), label: 'annual value waiting behind the gates' },
        { value: `${((plan.annual + waiting) / Math.max(1, plan.annual)).toFixed(1)}×`, label: `the portfolio if we close the ${plan.toClose.length} open control families` },
      ],
      body: ['The gates are ours to open. Closing the control gaps on slide 4 is what releases the second wave.'],
    },
    // THE MONEY PICTURE — source 2438-2442.
    {
      id: 'board-deck-money',
      kind: 'economics',
      eyebrow: 'THE MONEY PICTURE',
      heading: 'It pays for itself before the portfolio counts',
      stats: [
        { value: fmt(4500000), unit: '/yr', label: 'Compliance spend today' },
        { value: fmt(180000), unit: '/yr', label: 'Platform subscription' },
        { value: fmt(moneyNet), unit: '/yr', label: 'Net annual impact' },
      ],
      body: ['A conservative 12% of compliance capacity freed covers the platform on its own. The portfolio return is upside on top, net of the subscription.'],
    },
    // THE ASK — source 2443-2446.
    {
      id: 'board-deck-ask',
      kind: 'generic',
      eyebrow: 'THE ASK',
      heading: 'Three approvals tonight',
      body: [
        'Ratify the domain targets as the institution’s stated risk appetite, as presented on slide 3.',
        `Approve the ${fmt(L.budget)} annual envelope funding the ${plan.funded.length}-play portfolio on slide 7.`,
        'Note the Incident Response Plan escalation as the one high-priority item, with closure before quarter end.',
        'Everything in this pack is drill-downable live, and the same record answers the examiner.',
      ],
    },
  ];
}

function BoardReport() {
  const view = liveReportView();
  const topThree = [...view.plan.funded].sort((a, b) => b.val * view.L.eff - a.val * view.L.eff).slice(0, 3);
  const slides = boardDeckSlides(view);

  return (
    <div style={sectionStyle}>
      {/* Base source 1521: 'The board presentation · N slides · risk then opportunity'. */}
      <TableSection heading={`The board presentation · ${slides.length} slides · risk then opportunity`}>
        <div style={{ height: '32rem' }}>
          <DeckView slides={slides} />
        </div>
      </TableSection>
      {/* Base source 1523-1531: the appendix — all sections simultaneously
        * visible below the deck, never behind slide navigation (RPT-09). */}
      <Label text="The appendix · the one-page read behind the deck" variant="eyebrow" />
      <p style={bodyTextStyle}>
        {`At a ${toleranceWord(view.L.tol)} risk tolerance and a ${view.levers.budgetLabel} annual budget, the plan funds ${view.plan.funded.length} of ${view.economics.totalOpportunities} plays for a one-time build of ${view.economics.buildCostText}, returning an expected ${view.economics.roiText} over three years (${view.economics.annualValueText}/yr at ${view.levers.adoptionLabel} adoption, ~${view.economics.paybackText} payback). Ambition is set to ${view.levers.ambitionLabel} against a current ${BANDS[CUR] ?? ''} posture; closing ${view.economics.controlsToCloseCount} control families releases the remaining ${view.plan.gated.length} higher-value plays.`}
      </p>
      <div style={statRowStyle}>
        {/* Base tile subs, source 1524 (RPT-11b). */}
        <CaptionedStat label="Plays funded" value={`${view.plan.funded.length} / ${view.economics.totalOpportunities}`} caption="of the library" />
        <CaptionedStat label="Build cost" value={view.economics.buildCostText} caption="one-time" />
        <CaptionedStat label="Annual value" value={view.economics.annualValueText} caption="at adoption" />
        <CaptionedStat label="3-yr ROI" value={view.economics.roiText} caption="on build" />
        <CaptionedStat label="Payback" value={view.economics.paybackText} caption="blended" />
      </div>
      <TableSection heading="Recommended first moves">
        <ul style={listStyle}>
          {topThree.map((o) => (
            <li key={o.n} style={listItemStyle}>
              <strong>{o.n}</strong>: {fmt(o.val * view.L.eff)}/yr at {fmt(o.cost)} build,{' '}
              {Math.round((o.cost / (o.val * view.L.eff)) * 12)}-mo payback.
            </li>
          ))}
        </ul>
      </TableSection>
      <TableSection heading={`Governance to close (${view.plan.toClose.length})`}>
        <ul style={listStyle}>
          {view.plan.toClose.map((k) => (
            <li key={k} style={listItemStyle}>
              <strong>{k}</strong>: {CTRL[k] ?? 0}% today, {GREEN - (CTRL[k] ?? 0)} points to green. {GOV[k] ?? ''}
            </li>
          ))}
        </ul>
      </TableSection>
      {view.plan.gated.length > 0 ? (
        <TableSection heading={`Gated until controls close (${view.plan.gated.length})`}>
          <ul style={listStyle}>
            {view.plan.gated.slice(0, 6).map((o) => (
              <li key={o.n} style={listItemStyle}>
                <strong>{o.n}</strong>: waits on {o.weakGate} ({CTRL[o.weakGate] ?? 0}%).
              </li>
            ))}
          </ul>
        </TableSection>
      ) : null}
    </div>
  );
}

function ComplianceReport({ onOpenDomain, onOpenPlay }: { onOpenDomain?: (domainKey: string) => void; onOpenPlay?: (playName: string) => void }) {
  const view = liveReportView();
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
      render: (r) => {
        const domainKey = CTRLDOM[r.key];
        return (
          <span style={cellColumnStyle}>
            {onOpenDomain && domainKey ? (
              <DocLink label={r.key} onPress={() => onOpenDomain(domainKey)} />
            ) : (
              <span style={cellPrimaryStyle}>{r.key}</span>
            )}
            <span style={cellSecondaryStyle}>{REGMAP[r.key] ?? ''}</span>
          </span>
        );
      },
    },
    { id: 'status', header: 'Status', render: (r) => <Tag text={r.open ? 'Open' : 'Green'} variant={r.open ? 'status-caution' : 'status-positive'} /> },
    { id: 'score', header: 'Now', render: (r) => `${r.score}%`, align: 'end', sortable: true, sortValue: (r) => r.score },
    { id: 'gap', header: 'Gap to 80', render: (r) => (r.open ? `${GREEN - r.score} pts` : '—'), align: 'end' },
    {
      id: 'plays',
      header: 'Plays it blocks',
      render: (r) => {
        const plays = playsGatedBy(r.key, view.plan.ready.concat(view.plan.gated));
        if (plays.length === 0) return '—';
        if (!onOpenPlay) return plays.join(', ');
        return (
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.5rem' }}>
            {plays.map((name, index) => (
              <span key={name}>
                <DocLink label={name} onPress={() => onOpenPlay(name)} />
                {index < plays.length - 1 ? ',' : ''}
              </span>
            ))}
          </span>
        );
      },
    },
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
  const view = liveReportView();
  return (
    <div style={sectionStyle}>
      <div style={statRowStyle}>
        <StatCard label="Funded now" value={`${view.plan.funded.length} / ${view.economics.totalOpportunities}`} />
        <StatCard label="Build cost" value={view.economics.buildCostText} />
        <StatCard label="Annual value" value={view.economics.annualValueText} />
        <StatCard label="Payback" value={view.economics.paybackText} />
      </div>
      <TableSection heading={`Funded now (${view.plan.funded.length})`}>
        <DataTable caption="Funded plays" columns={fundedColumns(view.L.eff)} rows={view.plan.funded} getRowId={(o) => o.n} />
      </TableSection>
      <TableSection heading={`Ready, not yet funded (${view.plan.bench.length})`}>
        {view.plan.bench.length ? (
          <DataTable caption="Ready, not yet funded plays" columns={benchColumns(view.L.eff)} rows={view.plan.bench} getRowId={(o) => o.n} />
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
  const view = liveReportView();
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

/** Rows + row ids now come from `data/boardLog.ts` — see file header "STANDING_ROWS SUPERSEDED." */
const STANDING_STATUS_META: Record<BoardStandingStatus, { label: string; variant: NonRaciTagVariant }> = {
  open: { label: 'Open', variant: 'status-caution' },
  tracking: { label: 'Tracking', variant: 'count' },
  closed: { label: 'Closed', variant: 'status-positive' },
};

/** RPT-08: the base rows literal hand-writes row 1's status text —
 * `<span class="tag warn">2 workstreams open</span>` (source 3596) — which
 * the status→label map above flattened to a generic 'Open'.
 * `data/boardLog.ts` is outside the reporting fix batch's allowlist, so the
 * per-row base literal is restored here as a display override keyed on the
 * row id (same tag variant; label byte-identical to source). */
const STANDING_STATUS_LABEL_OVERRIDES: Record<string, string> = {
  '2026-13': '2 workstreams open',
};

function RegchangeReport({ onLogUpdate }: { onLogUpdate?: (id: string) => void }) {
  const openCount = BOARD_STANDING_ROWS.filter((r) => r.status === 'open').length;
  const trackingCount = BOARD_STANDING_ROWS.filter((r) => r.status === 'tracking').length;
  const closedCount = BOARD_STANDING_ROWS.filter((r) => r.status === 'closed').length;

  const columns: DataTableColumn<BoardStandingRow>[] = [
    { id: 'what', header: 'What changed', render: (r) => r.title },
    { id: 'layer', header: 'Layer', render: (r) => r.layer },
    { id: 'applies', header: 'Applies to us?', render: (r) => r.applies },
    {
      id: 'doing',
      header: 'What we are doing',
      render: (r) => {
        // Session-logged updates for this row (`BOARD_LOG[r.id]`, newest
        // first) — see file header "STANDING_ROWS SUPERSEDED" for why these
        // render here. Affordance gating on `status === 'open'` reproduces
        // the base's hand-written per-row cite markup exactly (source
        // 3596-3597; data/boardLog.ts file-header guidance).
        const logged = BOARD_LOG[r.id] ?? [];
        const showLogAffordance = onLogUpdate !== undefined && r.status === 'open';
        if (logged.length === 0 && !showLogAffordance) return r.doing;
        return (
          <span style={cellColumnStyle}>
            <span>{r.doing}</span>
            {logged.map((entry, index) => (
              // eslint-disable-next-line react/no-array-index-key -- entries are prepend-only per save (boardSave unshifts); same justification as BoardLogForm.tsx's history rows
              <span key={index} style={cellSecondaryStyle}>
                {`${entry.txt} — logged ${entry.when} · ${entry.who}${entry.date ? ` · target ${entry.date}` : ''}`}
              </span>
            ))}
            {showLogAffordance ? (
              <span>
                <Button variant="ghost" label="Log an update →" onPress={() => onLogUpdate(r.id)} />
              </span>
            ) : null}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      render: (r) => (
        <Tag
          text={STANDING_STATUS_LABEL_OVERRIDES[r.id] ?? STANDING_STATUS_META[r.status].label}
          variant={STANDING_STATUS_META[r.status].variant}
        />
      ),
    },
  ];

  return (
    <div style={sectionStyle}>
      {/* Base boardStandingHTML intro csub verbatim incl. the closing 'No deck
        * assembled…' sentence (source 3604-3605) — dropped pre-fix (RPT-08). */}
      <p style={bodyTextStyle}>
        Boards carry the obligation to govern a regulatory environment that changes faster than any quarterly pack
        can track. This is the standing, sourced view: what changed, which changes apply to this institution given
        its charter, size, and business lines, what the institution is doing about each one, and what remains open.
        No deck assembled the week before the meeting.
      </p>
      <div style={statRowStyle}>
        <StatCard label="Open" value={openCount} />
        <StatCard label="Tracking" value={trackingCount} />
        <StatCard label="Closed" value={closedCount} />
      </div>
      <TableSection heading={`The standing view · ${BOARD_STANDING_ROWS.length} instruments`}>
        <DataTable caption="Regulatory change standing view" columns={columns} rows={BOARD_STANDING_ROWS} getRowId={(r) => r.id} />
      </TableSection>
      <p style={bodyTextStyle}>
        <strong>Tracking</strong> = watching an item that has not become relevant yet · <strong>Open</strong> = it
        applies, work is in progress with a target compliance date · <strong>Closed</strong> = done and evidenced.
      </p>
      {/* Base source 3608: the examiner pill + '⎙ Export board pack' button —
        * content cards outside the OQ-B chart exemption, dropped pre-fix
        * (RPT-08). Export = the base's own window.print() call. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--ink)',
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: '999px',
            padding: '0.25rem 0.75rem',
          }}
        >
          The same record answers the examiner asking how the board stayed informed
        </span>
        <Button variant="ghost" label="⎙ Export board pack" onPress={() => window.print()} />
      </div>
      {/* Base source 3609: the 'Determination provenance' card (RPT-08). */}
      <TableSection heading="Determination provenance">
        <p style={bodyTextStyle}>
          Each &ldquo;applies / does not apply&rdquo; call above records the charter, footprint, or business-line
          fact that drove it, at determination time. Directors get the reasoning along with the conclusion it led
          to.
        </p>
      </TableSection>
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
        {/* Base tile subs, source 1583 (RPT-11b). */}
        <CaptionedStat label="At / above target" value={`${DOMAINS.length - belowTarget.length} / ${DOMAINS.length}`} caption="judged against your own bar" />
        <CaptionedStat label="Gaps to targets" value={gapsTotal} caption="obligations to close" />
        <CaptionedStat label="Largest gap" value={worstLabel} {...(worst ? { caption: `${oblToClose(worst)} obligations` } : {})} />
        <CaptionedStat label="High priority" value={1} caption="IRP escalation" />
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

function MrmReport({ onOpenObligation }: { onOpenObligation?: (domainKey: string, obligationId: string) => void }) {
  const domain = domByKey('mrm');
  if (!domain) return <p style={bodyTextStyle}>Model Risk domain data is unavailable.</p>;
  const openItems = (OBL.mrm ?? []).filter((o) => o.st !== 'met');
  const rowAction: DataTableRowAction<ObligationRow> | undefined = onOpenObligation
    ? { label: () => 'Open →', onPress: (o) => onOpenObligation('mrm', o.id) }
    : undefined;

  return (
    <div style={sectionStyle}>
      <div style={statRowStyle}>
        {/* Base tile subs, source 1608 (RPT-11b): the base renders 4 tiles —
          * the pre-fix fifth 'Internal / vendor split' card carried the
          * fourth tile's own sub-caption '14 internal · 9 vendor'. */}
        <CaptionedStat label="Score" value={`${curOf(domain).toFixed(1)} / ${domain.target}`} caption={`${BANDS[domain.target - 1] ?? ''} target`} />
        <CaptionedStat label="Obligations met" value={`${domain.met} / ${domain.appl}`} caption="met at required maturity" />
        <CaptionedStat label="To close" value={oblToClose(domain)} caption="for the target" />
        <CaptionedStat label="Models in inventory" value={23} caption="14 internal · 9 vendor" />
      </div>
      <TableSection heading={`Open register items (${openItems.length})`}>
        <DataTable
          caption="Model risk register — open items"
          columns={OBLIGATION_COLUMNS}
          rows={openItems}
          getRowId={(o) => o.id}
          {...(rowAction ? { rowAction } : {})}
        />
      </TableSection>
      <TableSection heading="Validation calendar">
        {/* RPT-11c: the base writes its own link text here (docLink's second
          * argument, source 1611-1613) — the pre-fix DOCLIB-title substitution
          * produced '…Pre-staged Language pre-staged pending…' on screen. */}
        <ul style={listStyle}>
          <li style={listItemStyle}>
            <strong>Fraud model refresh</strong>: independent validation slot booked Q4 with the current validation
            report as baseline.
          </li>
          <li style={listItemStyle}>
            <strong>AI-assisted transaction monitoring</strong>: independent validation scheduled · evidence lands
            against MRM-08.
          </li>
          <li style={listItemStyle}>
            <strong>Generative &amp; agentic models</strong>: interim governance language pre-staged pending RFI
            2026-04 final scope.
          </li>
        </ul>
      </TableSection>
    </div>
  );
}

function TprmReport({ onOpenObligation }: { onOpenObligation?: (domainKey: string, obligationId: string) => void }) {
  const domain = domByKey('tprm');
  if (!domain) return <p style={bodyTextStyle}>Third-Party Risk domain data is unavailable.</p>;
  const openItems = (OBL.tprm ?? []).filter((o) => o.st !== 'met');
  const rowAction: DataTableRowAction<ObligationRow> | undefined = onOpenObligation
    ? { label: () => 'Open →', onPress: (o) => onOpenObligation('tprm', o.id) }
    : undefined;

  return (
    <div style={sectionStyle}>
      <div style={statRowStyle}>
        {/* Base tile subs, source 1637 (RPT-11b). */}
        <CaptionedStat label="Score" value={`${curOf(domain).toFixed(1)} / ${domain.target}`} caption={`${BANDS[domain.target - 1] ?? ''} target`} />
        <CaptionedStat label="Obligations met" value={`${domain.met} / ${domain.appl}`} caption="met at required maturity" />
        <CaptionedStat label="Critical vendors" value={12} caption="of 87 in inventory" />
        <CaptionedStat label="SOC 2 on file" value="11 / 12" caption="core processor reviewed" />
      </div>
      <TableSection heading={`Open register items (${openItems.length})`}>
        <DataTable
          caption="Third-party risk register — open items"
          columns={OBLIGATION_COLUMNS}
          rows={openItems}
          getRowId={(o) => o.id}
          {...(rowAction ? { rowAction } : {})}
        />
      </TableSection>
      <TableSection heading="Program notes">
        {/* RPT-11c: base hand-written docLink text (source 1631-1633), not
          * DOCLIB-title substitution. */}
        <ul style={listStyle}>
          <li style={listItemStyle}>
            <strong>Exit planning</strong>: draft exit-plan standard in HITL review · closes TPRM-08 for the four
            critical vendors without one.
          </li>
          <li style={listItemStyle}>
            <strong>Contract riders</strong>: model-risk clauses rolling into 9 legacy contracts · 4 executed.
          </li>
          <li style={listItemStyle}>
            <strong>Core processor</strong>: SOC 2 Type II reviewed · two CUECs mapped to internal controls.
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
        {/* Base tile subs, source 1650 (RPT-11b). */}
        <CaptionedStat label="Score" value={`${curOf(domain).toFixed(1)} / ${domain.target}`} caption="above the bar" />
        <CaptionedStat label="Obligations met" value={`${domain.met} / ${domain.appl}`} caption="met · 9 excluded with rationale" />
        <CaptionedStat label="High priority" value={1} caption="IRP escalation gap" />
        <CaptionedStat label="Connector health" value="4 live" caption="eCFR · FinCEN · Fed Register · WH EO" />
      </div>
      <p style={warnTextStyle}>
        Incident Response Plan: escalation path for member-facing automation is not yet defined. Redline drafted,
        awaiting {domain.owner.split(' · ')[0] ?? domain.owner}.
      </p>
      <TableSection heading={`Open items (${openItems.length})`}>
        <DataTable caption="InfoSec open items" columns={itemColumns} rows={openItems} getRowId={(r) => r.id} />
      </TableSection>
      <TableSection heading="Program status">
        {/* RPT-11c: base hand-written docLink text (source 1653-1656), not
          * DOCLIB-title substitution. */}
        <ul style={listStyle}>
          <li style={listItemStyle}>
            <strong>GLBA Safeguards</strong>: program document current · access reviews and MFA evidence on file for
            the quarter.
          </li>
          <li style={listItemStyle}>
            <strong>FFIEC CAT sunset</strong>: mapping to successor frameworks in progress · tracked in the
            regulatory feed lifecycle.
          </li>
          <li style={listItemStyle}>
            <strong>Vendor security</strong>: core processor SOC 2 reviewed · no open complementary-control
            exceptions.
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
  const view = liveReportView();
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
        {/* Base tile subs, source 1672 (RPT-11b): the qualifiers that scope
          * each number — dropped pre-fix. */}
        <CaptionedStat label="Compliance spend" value={fmt(comp)} unit="/yr" caption="est. 10% of NIE" />
        <CaptionedStat label="Platform subscription" value={fmt(platformCost)} unit="/yr" caption="planning figure" />
        <CaptionedStat label="Compliance capacity freed" value={fmt(save)} unit="/yr" caption="conservative 12%" />
        <CaptionedStat label="Portfolio value" value={view.economics.annualValueText} unit="/yr" caption="at adoption" />
        <CaptionedStat label="Net annual impact" value={fmt(net)} unit="/yr" caption="year one run rate" />
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
        <DataTable caption="Funded portfolio" columns={fundedColumns(view.L.eff)} rows={view.plan.funded} getRowId={(o) => o.n} />
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

function renderReportBody(
  kind: ReportKind,
  onOpenCases: (() => void) | undefined,
  onLogUpdate: ((id: string) => void) | undefined,
  onOpenDomain: ((domainKey: string) => void) | undefined,
  onOpenPlay: ((playName: string) => void) | undefined,
  onOpenObligation: ((domainKey: string, obligationId: string) => void) | undefined,
): ReactNode {
  switch (kind) {
    case 'gapboard':
      return <GapboardReport {...(onOpenCases !== undefined ? { onOpenCases } : {})} />;
    case 'board':
      return <BoardReport />;
    case 'compliance':
      return (
        <ComplianceReport
          {...(onOpenDomain !== undefined ? { onOpenDomain } : {})}
          {...(onOpenPlay !== undefined ? { onOpenPlay } : {})}
        />
      );
    case 'plan':
      return <PlanReport />;
    case 'roadmap':
      return <RoadmapReport />;
    case 'regchange':
      return <RegchangeReport {...(onLogUpdate !== undefined ? { onLogUpdate } : {})} />;
    case 'posture':
      return <PostureReport />;
    case 'mrm':
      return <MrmReport {...(onOpenObligation !== undefined ? { onOpenObligation } : {})} />;
    case 'tprm':
      return <TprmReport {...(onOpenObligation !== undefined ? { onOpenObligation } : {})} />;
    case 'infosec':
      return <InfosecReport />;
    case 'roi':
      return <RoiReport />;
  }
}

const chromeRowStyle: CSSProperties = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' };
const chromeLabelsStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 };

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
  /**
   * Opens the "Log an update · {id}" board-log form for a standing row —
   * the composing screen (`Reporting.tsx`) swaps the SAME shared Drawer's
   * content to `BoardLogForm` (sequential content swap, never a second
   * Drawer — base `boardUpdate`, source 3577). Consumed only by the
   * `regchange` kind; omit to render the standing table without the
   * affordance (same defensive pattern as `onOpenCases` above).
   */
  onLogUpdate?: (id: string) => void;
  /** B-06: base `head()`'s "Open full governance detail · OnSide →" link
   * (source 1481-1482), rendered on every report kind. Plain navigation
   * (no item payload) — omit to hide, same defensive pattern as above. */
  onOpenGovernance?: () => void;
  /** B-06: `compliance` kind's control-family doclink → the domain register
   * (base `goOnside('dom-KEY')`, source ~1542). */
  onOpenDomain?: (domainKey: string) => void;
  /** B-06: `compliance` kind's "Plays it blocks" cell → a gated play's
   * detail (base `openPlay(n)`, source ~1542). */
  onOpenPlay?: (playName: string) => void;
  /** B-06: `mrm`/`tprm` kinds' "Open register items" row → the obligation
   * detail (base `openObl(domKey, oid)`, source 1590/1612). */
  onOpenObligation?: (domainKey: string, obligationId: string) => void;
}

export function ReportView({ kind, onOpenCases, onLogUpdate, onOpenGovernance, onOpenDomain, onOpenPlay, onOpenObligation }: ReportViewProps) {
  // RPT-04: re-render the open report on every demo-store write (lever moves,
  // case advances, Discovery accepts) — the React equivalent of the base's
  // recompute-on-open (`var P=computePlan()`, source 1477).
  useDemoStore();
  return (
    <div data-lf-view="report" data-kind={kind} style={sectionStyle}>
      {/* Base head() chrome (source 1479-1481): the category line + the
        * per-report repmeta subtitle (RPT-11a — owner attributions and
        * meeting framing restored; the generic audience line is gone) — plus
        * (B-06) the "Open full governance detail" utility link every base
        * report head carried alongside them. */}
      <div style={chromeRowStyle}>
        <div style={chromeLabelsStyle}>
          <Label text="LEAPFI · Reporting · generated from the live record" variant="eyebrow" />
          <Label
            text={`${reportSub(kind)} · NorthWinds Credit Union · illustrative model on sample data`}
            variant="body-secondary"
          />
        </div>
        {onOpenGovernance ? <Button variant="ghost" label="Open full governance detail · OnSide →" onPress={onOpenGovernance} /> : null}
      </div>
      {renderReportBody(kind, onOpenCases, onLogUpdate, onOpenDomain, onOpenPlay, onOpenObligation)}
    </div>
  );
}
