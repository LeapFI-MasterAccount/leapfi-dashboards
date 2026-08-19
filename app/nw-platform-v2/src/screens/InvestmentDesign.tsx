/**
 * InvestmentDesign — Studio · Investment Design screen
 * (design_system_spec.md §5.5; demo_script_draft.md Step 5 "Out of Pilot
 * Purgatory™"; survey_map.md §a line 59 for lever defaults)
 *
 * Screen-assembly dispatch: every composite named in §5.5's region map is
 * already built by sibling dispatches (SliderControlRow C11, PlanTable
 * C13, Drawer C7, DrawerContent C8). This file is the wiring that turns
 * them into the actual screen —
 *
 *   page title → SliderControlRow (live economics tiles + PosturePillBar)
 *   → PlanTable (funded) → sequence-gated / cleared-governance side lists
 *   → play-detail Drawer (DrawerContent, kind: play).
 *
 * One `sliders` state (SliderState, engine/plan.ts) is the single source
 * of truth for every derived view on this screen: SliderControlRow gets
 * it directly (and derives its own live tiles internally); this screen
 * also calls `deriveRecomputeView(sliders, opportunities)` itself to get
 * `planRows`/`gatedRows`/`benchRows` for PlanTable and the two side
 * lists — so every number on the page, the slider tiles AND the tables,
 * recomputes from the exact same lever state on every render, live
 * during drag (SliderControlRow's own "Dragging: value updates visually
 * in real time" state, §5.5), never gated on commit. No second copy of
 * the truth — matches SliderControlRow's own file-header design intent.
 *
 * DISPATCH-BRIEF CORRECTION APPLIED (G7, survey_map.md known defects /
 * §a line 59): the source ships the Adoption/`#eff` slider at value=70
 * against a "55%" label — a value/label MISMATCH, not two candidate
 * defaults to choose between. design_system_spec.md §5.5's own "#eff
 * note" resolves it by citing revision_plan.md TW-11: "label aligned to
 * the shipped value." `engine/plan.ts`'s `LeverDisplay.adoptionLabel`
 * already derives the label FROM the value
 * (`Math.round(L.eff*100)+'%'`), so the only fix this screen has to make
 * is seeding the initial slider state at the shipped value — 70, never
 * 55 — after which the label reads "70%" automatically, agreeing with
 * the value with no special-case code anywhere (exactly the "already the
 * primitive's baseline contract" framing SliderControlRow's own
 * ambiguity note uses for this identical defect). `INITIAL_SLIDERS`
 * below is seeded 70.
 *
 * CTA SCOPE (spec §5.5 / §6, and the spec's own precedence note in its
 * preamble): this screen renders NO screen-level primary CTA.
 * revision_plan.md's TW2-12 item proposes a new "Fund this Portfolio"
 * primary CTA, but design_system_spec.md — the authoring document named
 * for THIS dispatch — is explicit that Investment Design carries "none
 * at screen level" (stated reason: no discrete apply step exists
 * anywhere in the ported `recompute()` engine) and carries that exact
 * tension forward as an open question (§10 OQ-2) rather than resolving
 * it in favor of a CTA. The spec's preamble states it is upstream of
 * revision_plan.md specifically on CTA placement. This dispatch's own
 * brief also names no CTA for this screen. Built to the spec: no CTA.
 * STOP-item / flagged for design-authority confirmation if OQ-2 is later
 * ratified "yes."
 *
 * AMBIGUITY RESOLVED — gated/bench side lists: PlanTable's own file
 * header states the "sequence-gated" / "cleared governance, outside
 * budget" lists (source `#gatedlist`/`#benchlist`) are deliberately NOT
 * part of PlanTable and are "left to whichever screen-assembly dispatch
 * composes design_system_spec.md §5.5 in full" — that dispatch is this
 * one. `engine/plan.ts` already ports the derivations
 * (`RecomputeView.gatedRows`/`benchRows`); no composite in §2.2 names a
 * dedicated component for rendering them, and inventing one would need
 * §8's justification bar (checked: no existing composite fits — DataTable
 * has no file in this worktree either, and PlanTable is explicitly scoped
 * to the funded/`play-row` list only). This screen renders them as two
 * small real `<table>`s built directly from existing primitives (Tag),
 * mechanically the same "drop-in real table, no DataTable dependency"
 * approach PlanTable itself already took for the funded list — not a new
 * named composite, just this screen's own markup.
 *
 * Play drawer content (fix-wave STU-13): `buildPlayDrawerContent` renders
 * the FULL base openPlay drawer (leapfi-platform.html:1391-1432) —
 * summary, economics with the 3-yr return, the ready/sequence-gated
 * verdict, scope of work, technical dependencies, per-gate governance
 * detail (GOV + REGMAP with live scores), the Financial block (run-cost
 * estimate + build-number explanation), controls-to-close, and the
 * Depends-on / Unlocks connections — looked up by play name in
 * `data/studio.ts`'s `OPPS`/`DETAIL` (the survey_map.md §d-1 foreign-key
 * relationship), with the base's own default-DETAIL fallback (1394) for
 * plays without an entry.
 *
 * Shared lever state (fix-wave SH-6/RPT-04/STU-07 backbone contract):
 * every slider change is published to `state/demoStore.ts` via
 * `setDemoSliders`, and App seeds this screen with `getDemoSliders()` on
 * mount — so Home panels, reports, and Studio Ask value lines all track
 * the position this screen last set, the base's recompute() fan-out.
 *
 * AMBIGUITY RESOLVED — Drawer instance ownership: Drawer (C7) is
 * documented as a "single shared instance app-wide... never a second
 * drawer" (survey_map.md §d-5). No shared Drawer context/provider exists
 * in this worktree (App.tsx, outside this dispatch's allowlist, mounts
 * screens but hoists no drawer), so this screen mounts its
 * own local `<Drawer>`. Because the app's nav model shows exactly one
 * screen at a time, this is functionally identical to a single shared
 * instance today (never two Drawers mounted simultaneously); it is an
 * interim shape a future shell-integration dispatch should hoist into one
 * real app-level instance (lifting this screen's `activePlay`/
 * `drawerOpen` state up to props, no change to this screen's own render
 * output). Flagged per §d-5's explicit binding language rather than
 * silently treating a same-file `<Drawer>` as the final architecture.
 *
 * AMBIGUITY RESOLVED — Topbar/Sidebar data ownership: `Topbar`/`Sidebar`
 * (C4/C3) require persona/profile/notification/date/nav-callback state
 * this screen does not own (see `Topbar.tsx`'s `TopbarProps` and
 * `Sidebar.tsx`'s `SidebarProps`). This file follows the EXACT passthrough
 * pattern already landed by three sibling screens in this worktree
 * (`Home.tsx`, `BoardDeck.tsx`, `OnSideFeed.tsx`): a full `topbar:
 * TopbarProps` bundle prop, and for Sidebar only `onNavigate` + optional
 * `sidebarVersionLabel` — `activeId` is intrinsic to which screen is
 * rendering, so it is hardcoded here to `'studio.investment-design'`
 * (`Sidebar.tsx`'s own `NAV` entry id for this screen) rather than
 * accepted as a prop the integrator could get wrong. Matching this
 * pattern (rather than my own initially-drafted "content only, no shell"
 * shape) keeps all 5 screens landed in this worktree so far integrable
 * the same way by whatever dispatch assembles the app shell/router.
 *
 * Layout constants (240px sidebar column, 2rem content padding, 1.625rem
 * title size): design_system_spec.md §1.4 states this document carries no
 * px/spacing values by design (colors only); these are implementer
 * judgment calls, same category as `Drawer.tsx`'s documented 480px width
 * / 200ms transition constants and `Home.tsx`'s identical note — not
 * sourced from any doctrine file.
 *
 * Tests: src/__tests__/studio/investment-design.test.tsx executes this
 * screen against the base anchors above (vitest + @testing-library) —
 * stance/recompute liveness, the shared-store lever publish, and the full
 * openPlay drawer content (STU-13). (The former "no test runner
 * installed" STOP-item is stale and removed — the T6.5 regression-suite
 * dispatch installed vitest + @testing-library for the whole worktree.)
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { SliderControlRow } from '../components/SliderControlRow';
import { PlanTable } from '../components/PlanTable';
import { Drawer } from '../components/Drawer';
import { DrawerContent } from '../components/DrawerContent';
import type { DrawerContentField, DrawerContentTag } from '../components/DrawerContent';
import { Tag } from '../components/primitives/Tag';
import { deriveRecomputeView, fmt } from '../engine/plan';
import type { SliderState, PlanOpportunity, PlanTableRow, GatedRow, BenchRow, Levers } from '../engine/plan';
import { OPPS, DETAIL, CTRL, GREEN, GOV, REGMAP } from '../data/studio';
import type { StudioPlayDetail } from '../data/studio';
import { setDemoSliders, useDemoStore } from '../state/demoStore';

/**
 * Corrected initial lever state — survey_map.md §a line 59: "defaults
 * Ambition 3/Risk 52/Horizon 50/$450k/ROI 2.5x/adoption input 70 vs label
 * '55%' — BUG." `eff: 70` is the shipped VALUE, not the mislabeled 55% —
 * see file header "DISPATCH-BRIEF CORRECTION APPLIED."
 */
const INITIAL_SLIDERS: SliderState = {
  amb: 3,
  tol: 52,
  speed: 50,
  budget: 450000,
  roi: 2.5,
  eff: 70,
};

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
  gap: '1.75rem',
  maxWidth: 1120,
};
const headerStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };
const h1Style: CSSProperties = { font: 'inherit', fontSize: '1.625rem', fontWeight: 700, color: 'var(--ink)', margin: 0 };
const ledeStyle: CSSProperties = { font: 'inherit', fontSize: '0.9375rem', color: 'var(--ink2)', margin: 0, maxWidth: 640 };
const sectionStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const sectionHeadingStyle: CSSProperties = { font: 'inherit', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', margin: 0 };
const sideListsGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1.25rem' };
const miniTableWrapStyle: CSSProperties = { width: '100%', overflowX: 'auto' };
const miniTableStyle: CSSProperties = { width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.375rem' };
const miniThStyle: CSSProperties = { fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink2)', textAlign: 'left', fontWeight: 700, padding: '0 0.625rem 0.25rem' };
const miniTdStyle: CSSProperties = { background: 'var(--panel)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '0.5625rem 0.625rem', fontSize: '0.75rem', color: 'var(--ink)', verticalAlign: 'middle' };
const miniTdNameStyle: CSSProperties = { ...miniTdStyle, borderLeft: '1px solid var(--border)', borderRadius: '0.625rem 0 0 0.625rem', fontWeight: 700 };
const miniTdLastStyle: CSSProperties = { ...miniTdStyle, borderRight: '1px solid var(--border)', borderRadius: '0 0.625rem 0.625rem 0' };
const emptyNoteStyle: CSSProperties = { font: 'inherit', fontSize: '0.8125rem', color: 'var(--ink2)', margin: 0 };

export interface InvestmentDesignProps {
  /** Full Topbar prop bundle — this screen does not own persona/profile/notification/date data (same passthrough pattern as `Home.tsx`/`BoardDeck.tsx`/`OnSideFeed.tsx`). */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to this screen ('studio.investment-design') and is not accepted as a prop. */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
  /** Testing/override hook. Defaults to `INITIAL_SLIDERS` (the corrected survey_map.md §a defaults, G7 fix applied). */
  initialSliders?: SliderState;
  /** Testing/override hook, mirrors SliderControlRow/PlanTable's own optional `opportunities` prop. Defaults to the full 15-play catalog (data/studio.ts `OPPS`) inside the engine. */
  opportunities?: PlanOpportunity[];
}

/**
 * Base openPlay's default DETAIL fallback (leapfi-platform.html:1394),
 * verbatim, for plays with no DETAIL entry.
 */
function defaultPlayDetail(opportunity: PlanOpportunity): StudioPlayDetail {
  return {
    sum: `${opportunity.c} play from the Studio catalog. The envelope below prices from comparable implementations; full scope drafts during the deep-dive.`,
    work: [
      'Confirm the current-state workflow with the owning team',
      'Data access + integration assessment',
      'Pilot build with human-in-the-loop review',
      'Controls evidence + OnSide mapping',
      'Production hardening + adoption plan',
    ],
    tech: ['Source-system access to be confirmed', 'Historical volume data for evaluation'],
    deps: [],
    unlocks: [],
  };
}

/**
 * Builds this play's DrawerContent field rows + tags — the full base
 * openPlay drawer content (leapfi-platform.html:1391-1432; fix-wave
 * STU-13): summary, economics (incl. the 3-yr return tile), the
 * ready/sequence-gated verdict (`seqNote`), scope of work, technical
 * dependencies, per-gate governance detail (GOV + REGMAP with live
 * scores), the Financial block (run-cost estimate + build-number
 * explanation), controls-to-close, and the Depends-on / Unlocks
 * connections — rendered as DrawerContent (C8) field rows, plain text.
 */
function buildPlayDrawerContent(row: PlanTableRow, L: Levers): { fields: DrawerContentField[]; tags: DrawerContentTag[] } {
  const opportunity: PlanOpportunity | undefined = OPPS.find((o) => o.n === row.name);
  const fields: DrawerContentField[] = [{ label: 'Category', value: row.category }];
  const tags: DrawerContentTag[] = [{ text: row.riskLabel, variant: row.riskVariant }];
  if (row.isFoundational) tags.push({ text: 'Foundational', variant: 'count' });
  if (row.isFromDiscovery) tags.push({ text: 'From Discovery', variant: 'count' });
  if (!opportunity) return { fields, tags };

  const detail = DETAIL[row.name] ?? defaultPlayDetail(opportunity);
  const ready = opportunity.minGate >= L.threshold; // base 1399
  const annual = opportunity.val * L.eff;
  const roiC = (annual * 3) / opportunity.cost; // base 1398
  const ongoing = Math.round((opportunity.cost * 0.15) / 1000) * 1000; // base 1401
  const controlsToClose = opportunity.g.filter((control) => (CTRL[control] ?? 0) < GREEN); // base openG, 1400

  fields.push(
    { label: 'Summary', value: detail.sum },
    { label: 'Build cost', value: `${row.buildCostText} one-time` },
    { label: 'Annual value', value: `${row.annualValueText} at ${Math.round(L.eff * 100)}% adoption` },
    { label: 'Payback', value: `${row.paybackMonths} mo` },
    { label: '3-yr return', value: `${roiC.toFixed(1)}× on build cost` },
    {
      // Base seqNote (1405-1407): the ready / sequence-gated verdict line.
      label: 'Status',
      value: ready
        ? '✓ Ready now at your current risk tolerance; cleared to enter the funded portfolio.'
        : `Sequence-gated: blocked until ${opportunity.weakGate} reaches ${GREEN}% (now ${CTRL[opportunity.weakGate] ?? 0}%). Close it first, then this unlocks.`,
    },
    { label: 'Scope of work', value: detail.work.join(' · ') },
    { label: 'Technical dependencies', value: detail.tech.join(' · ') },
  );

  // Per-gate governance detail (base gov rows, 1402): live score/status +
  // GOV description + REGMAP citation.
  opportunity.g.forEach((gate) => {
    const score = CTRL[gate] ?? 0;
    const ok = score >= GREEN;
    fields.push({
      label: `Governance · ${gate}`,
      value: `${score}%${ok ? ' ✓' : ' · open'} — ${GOV[gate] ?? ''} · ${REGMAP[gate] ?? ''}`,
    });
  });

  // Base Financial block (1424): run cost, sequencing note, and the
  // build-number explanation.
  fields.push({
    label: 'Financial',
    value:
      `Build ${fmt(opportunity.cost)} one-time${ready ? ', in the ready set at your tolerance' : `; sequence-gated (+${fmt(opportunity.cost)} once unlocked)`} · ` +
      `Run cost ≈ ${fmt(ongoing)}/yr (est. · model consumption + hosting at scoped volume) · ` +
      `Payback ≈ ${row.paybackMonths} mo · 3-yr return ${roiC.toFixed(1)}×. ` +
      'The build number includes control build-out for the gating families, OnSide evidence mapping, and first-year model consumption. Not licence-only.',
  });

  if (controlsToClose.length === 0) {
    fields.push({ label: 'Controls to close first', value: 'All gating controls are green.' });
  } else {
    controlsToClose.forEach((control) => {
      fields.push({
        label: `Controls to close first · ${control}`,
        value: `${CTRL[control] ?? 0}% · open — ${GOV[control] ?? ''}`,
      });
    });
  }

  // Base "How it connects" (1426-1428): Depends-on / Unlocks chips.
  fields.push(
    {
      label: 'Depends on',
      value: detail.deps.length ? detail.deps.join(' · ') : 'No prerequisites; can start immediately.',
    },
    {
      label: 'Unlocks / shares data with',
      value: detail.unlocks.length ? detail.unlocks.join(' · ') : 'Standalone; nothing downstream depends on it.',
    },
  );

  return { fields, tags };
}

function GatedTable({ rows }: { rows: GatedRow[] }) {
  if (rows.length === 0) {
    return <p style={emptyNoteStyle}>Nothing is sequence-gated at this tolerance — every risk-eligible play clears today&rsquo;s control gate.</p>;
  }
  return (
    <div style={miniTableWrapStyle}>
      <table style={miniTableStyle} aria-label="Plays waiting on control maturity">
        <thead>
          <tr>
            <th scope="col" style={miniThStyle}>
              Play
            </th>
            <th scope="col" style={miniThStyle}>
              Annual value
            </th>
            <th scope="col" style={miniThStyle}>
              Unlocks after
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td style={miniTdNameStyle}>{row.name}</td>
              <td style={miniTdStyle}>{row.annualValueText}</td>
              <td style={miniTdLastStyle}>
                {row.unlocksAfterControl} <Tag text={`${row.unlocksAfterControlScore}%`} variant="status-caution" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BenchTable({ rows }: { rows: BenchRow[] }) {
  if (rows.length === 0) {
    return <p style={emptyNoteStyle}>Nothing cleared governance is waiting on budget right now.</p>;
  }
  return (
    <div style={miniTableWrapStyle}>
      <table style={miniTableStyle} aria-label="Plays cleared for governance, waiting on budget">
        <thead>
          <tr>
            <th scope="col" style={miniThStyle}>
              Play
            </th>
            <th scope="col" style={miniThStyle}>
              Annual value
            </th>
            <th scope="col" style={miniThStyle}>
              Build cost
            </th>
            <th scope="col" style={miniThStyle}>
              To add
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td style={miniTdNameStyle}>{row.name}</td>
              <td style={miniTdStyle}>{row.annualValueText}</td>
              <td style={miniTdStyle}>{row.buildCostText}</td>
              <td style={miniTdLastStyle}>{row.addCostText}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InvestmentDesign({
  topbar,
  onNavigate,
  sidebarVersionLabel,
  initialSliders = INITIAL_SLIDERS,
  opportunities,
}: InvestmentDesignProps) {
  const [sliders, setSliders] = useState<SliderState>(initialSliders);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePlay, setActivePlay] = useState<PlanTableRow | null>(null);

  // Subscribes to the shared demo store so the live opportunity pool
  // (Discovery-accepted plays pushed by demoStore.acceptOpportunity) is
  // reflected on every store write.
  useDemoStore();

  const view = deriveRecomputeView(sliders, opportunities);

  /** Every lever change is published to the shared demo store
   * (`setDemoSliders`) so Home panels, reports, and the Studio Ask value
   * lines recompute from the SAME live position — the base's
   * recompute()-on-input fan-out (source 1256-1303; fix-wave SH-6/RPT-04/
   * STU-07 backbone contract). App seeds this screen from
   * `getDemoSliders()` on mount, closing the loop. */
  const handleSlidersChange = (next: SliderState) => {
    setSliders(next);
    setDemoSliders(next);
  };

  const handleOpenPlay = (row: PlanTableRow) => {
    setActivePlay(row);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const drawerContent = activePlay ? buildPlayDrawerContent(activePlay, view.L) : null;

  // Built conditionally (rather than `versionLabel={sidebarVersionLabel}`
  // directly) — this project's `exactOptionalPropertyTypes` setting treats
  // Sidebar's optional `versionLabel` as exactly `string`, not `string |
  // undefined` — same pattern `Home.tsx`/`OnSideFeed.tsx` document.
  const sidebarProps: SidebarProps = {
    activeId: 'studio.investment-design',
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  return (
    <div data-lf-screen="investment-design" style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="investment-design-main" style={MAIN_STYLE} aria-labelledby="investment-design-title">
          <div style={headerStyle}>
            <h1 id="investment-design-title" style={h1Style}>
              Investment Design
            </h1>
            <p style={ledeStyle}>
              Raise ambition and the funded portfolio recomputes live against your budget envelope and ROI hurdle — no committee cycle, no consultant re-run.
            </p>
          </div>

          <SliderControlRow sliders={sliders} onSlidersChange={handleSlidersChange} {...(opportunities !== undefined ? { opportunities } : {})} />

          <div style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>Your funded portfolio</h2>
            <PlanTable rows={view.planRows} onOpenPlay={handleOpenPlay} />
          </div>

          <div style={sideListsGridStyle}>
            <div style={sectionStyle}>
              <h2 style={sectionHeadingStyle}>Sequence-gated</h2>
              <GatedTable rows={view.gatedRows} />
            </div>
            <div style={sectionStyle}>
              <h2 style={sectionHeadingStyle}>Cleared governance, outside budget</h2>
              <BenchTable rows={view.benchRows} />
            </div>
          </div>
        </main>
      </div>

      <Drawer open={drawerOpen} title={activePlay?.name ?? 'Play detail'} onClose={handleCloseDrawer}>
        {drawerContent ? <DrawerContent kind="play" fields={drawerContent.fields} tags={drawerContent.tags} /> : null}
      </Drawer>
    </div>
  );
}
