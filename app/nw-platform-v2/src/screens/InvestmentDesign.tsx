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
 * AMBIGUITY RESOLVED — play-drawer "controls-to-close" content:
 * `PlanTableRow` (engine/plan.ts) does not carry the play's raw control
 * list (`g`) — only pre-derived summary fields. This screen looks the
 * play back up by name in `data/studio.ts`'s `OPPS`/`DETAIL` (the same
 * play-name foreign-key relationship `engine/plan.ts` itself relies on
 * everywhere, per survey_map.md §d-1) to get `g` (the play's gating
 * control families) and `DETAIL[name].sum` (play summary). "Controls to
 * close" is filtered to `g` entries still below the `GREEN` maturity
 * threshold (`data/studio.ts`) — the exact same criterion `computePlan`'s
 * own `toClose` list already uses, just scoped to one play's control set
 * instead of every control in the catalog. Reuses an existing engine
 * concept; invents no new business logic (D14 framing).
 *
 * AMBIGUITY RESOLVED — Drawer instance ownership: Drawer (C7) is
 * documented as a "single shared instance app-wide... never a second
 * drawer" (survey_map.md §d-5). No shared Drawer context/provider exists
 * yet in this worktree — App.tsx is still the D13 theme-token placeholder
 * scaffold, outside this dispatch's allowlist — so this screen mounts its
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
 * STOP-item — no executable test run: this worktree's `package.json`
 * (out of this dispatch's ALLOWLIST) has no test runner or
 * component-testing library installed (`npm run` scripts are `dev` /
 * `build` / `preview` only) — matching every sibling screen already
 * landed here (`Home.tsx`, `BoardDeck.tsx`, `OnSideFeed.tsx` each carry
 * the identical STOP-item). TDD-with-executed-output (SOP Directive
 * 2/Principle 3) is therefore not achievable within this dispatch's file
 * boundary. Verified instead via `npx tsc --noEmit` against the whole
 * `src/` tree (strict mode, `exactOptionalPropertyTypes`) to confirm this
 * file type-checks against the real `Topbar`/`Sidebar`/`SliderControlRow`/
 * `PlanTable`/`Drawer`/`DrawerContent` prop shapes, not a guessed one.
 * Recommending the same test-tooling follow-up dispatch (vitest +
 * @testing-library/react, via its own `package.json` ALLOWLIST) the
 * sibling screens already recommend.
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
import { deriveRecomputeView } from '../engine/plan';
import type { SliderState, PlanOpportunity, PlanTableRow, GatedRow, BenchRow } from '../engine/plan';
import { OPPS, DETAIL, CTRL, GREEN } from '../data/studio';
import type { StudioOpportunity } from '../data/studio';

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
 * Builds this play's DrawerContent field rows + tags. See file header
 * "AMBIGUITY RESOLVED — play-drawer 'controls-to-close' content."
 */
function buildPlayDrawerContent(row: PlanTableRow): { fields: DrawerContentField[]; tags: DrawerContentTag[] } {
  const opportunity: StudioOpportunity | undefined = OPPS.find((o) => o.n === row.name);
  const detail = DETAIL[row.name];
  const controlsToClose = opportunity ? opportunity.g.filter((control) => (CTRL[control] ?? 0) < GREEN) : [];

  const fields: DrawerContentField[] = [
    { label: 'Category', value: row.category },
    { label: 'Build cost', value: row.buildCostText },
    { label: 'Annual value at adoption', value: row.annualValueText },
    { label: 'Payback', value: `${row.paybackMonths} mo` },
  ];
  if (detail) {
    fields.push({ label: 'Summary', value: detail.sum });
  }
  if (controlsToClose.length === 0) {
    fields.push({ label: 'Controls to close', value: `None — every control gating this play is already at or above the ${GREEN}% green band.` });
  } else {
    controlsToClose.forEach((control) => {
      fields.push({ label: `Controls to close · ${control}`, value: `${CTRL[control] ?? 0}% maturity today — needs ${GREEN}%+` });
    });
  }

  const tags: DrawerContentTag[] = [{ text: row.riskLabel, variant: row.riskVariant }];
  if (row.isFoundational) tags.push({ text: 'Foundational', variant: 'count' });
  if (row.isFromDiscovery) tags.push({ text: 'From Discovery', variant: 'count' });

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

  const view = deriveRecomputeView(sliders, opportunities);

  const handleOpenPlay = (row: PlanTableRow) => {
    setActivePlay(row);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const drawerContent = activePlay ? buildPlayDrawerContent(activePlay) : null;

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

          <SliderControlRow sliders={sliders} onSlidersChange={setSliders} {...(opportunities !== undefined ? { opportunities } : {})} />

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
