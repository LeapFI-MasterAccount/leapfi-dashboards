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
 * DRAWER DEEP-LINKS (fix B-dead-interactions-07, scoped to this screen's
 * own play-drawer call site): the base drawer's governance rows, gated
 * status line, and Depends-on/Unlocks connections were all live clicks —
 * gov rows `<span class="doclink" onclick="closeDrawer();goOnside(...)">`
 * + `openInstr` (1401-1402), `seqNote`'s "See the gap queue →" (1406-1407),
 * and `depChips`/unlocks chips → `openPlay` (1390, 1424-1428, delegated on
 * `#drawer`, 4495). `DrawerContent` (C8, out of this allowlist) has no
 * per-field action slot — only a flat bottom `actions` row — so
 * `buildPlayDrawerContent` now also returns an `actions` array wired
 * through the nav-payload mechanism (App.tsx "NAVIGATION-WITH-PAYLOAD /
 * DEEP LINKS"): one "Open <gate> in OnSide" action per governance gate
 * (`kind: 'domain'`, id = `CTRLDOM[gate]`, the same routing-slug map the
 * 'domain' kind bridges onto `OnSideOverview.deepLinkDomainKey`), "See the
 * gap queue" when the play is sequence-gated (`kind: 'section'`, id
 * `'gaps'` on `onside.feed`), and one "Open <name>" action per
 * depends-on/unlocks play (`kind: 'play'`, id = that play's name) — which
 * this same screen now consumes (see "PLAY DEEP-LINK CONSUMPTION" below),
 * so clicking one swaps the drawer straight to that play's own detail.
 *
 * GATED/BENCH ROWS OPEN THE DRAWER TOO (fix B-dead-interactions-05): the
 * base styled these exact rows as clickable openPlay targets
 * (`.gated-row[data-play]{cursor:pointer}` + cyan hover, 309-310;
 * `gatedlist`/`benchlist` delegated clicks, 4493-4497) — only the funded
 * `PlanTable` got a real "Open" row action here. `GatedTable`/`BenchTable`
 * now render the identical `Button label="Open" variant="row"` affordance
 * `PlanTable.tsx` already uses in its own 8th column (matching, not
 * inventing, this codebase's row-activation pattern), resolving the play
 * back to a full `PlanTableRow` via `planTableRowForPlay` below (gated/
 * bench rows carry a smaller shape than the funded table's `PlanTableRow`,
 * so the fields the drawer needs — risk label/variant, foundational/
 * Discovery flags, payback — are recomputed from the underlying
 * `PlanOpportunity` exactly as `engine/plan.ts`'s own `planRows` mapping
 * does).
 *
 * PLAY DEEP-LINK CONSUMPTION (fix B-dead-interactions-03/04, the
 * cross-screen half of the nav-payload contract): `Studio · Ask`'s
 * register rows and `Roadmap`'s play chips own no Drawer of their own —
 * per this file's "Drawer instance ownership" note below, Drawer stays a
 * single screen-local instance, never duplicated — so both call
 * `onDeepLink({ screen: 'studio.investment-design', kind: 'play', id })`
 * instead, and this screen opens its real drawer on receipt (effect keyed
 * on `deepLink?.nonce`, App.tsx's documented CONSUME contract). The same
 * consumption path also serves the in-drawer deps/unlocks actions above
 * when they target a play already open on THIS screen (a same-screen deep
 * link still delivers its payload — App.tsx's TRIGGER note).
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
 * SUPERSEDED — Topbar/Sidebar data ownership (amendment A11,
 * design_system_spec.md §3.0): both composites now mount exactly once, in
 * App.tsx's persistent Shell — this screen no longer accepts a `topbar`
 * prop or builds a local `SidebarProps`. It also no longer accepts
 * `onNavigate` — its own content never called it directly (every internal
 * navigation here is a local Drawer open/close, not a screen change), so
 * that plumbing was dead the moment its only consumer (the local
 * `sidebarProps` construction) was removed.
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
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { SliderControlRow } from '../components/SliderControlRow';
import { PlanTable } from '../components/PlanTable';
import { Drawer } from '../components/Drawer';
import { DrawerContent } from '../components/DrawerContent';
import type { DrawerContentAction, DrawerContentField, DrawerContentTag } from '../components/DrawerContent';
import { Tag } from '../components/primitives/Tag';
import { Button } from '../components/primitives/Button';
import { Label } from '../components/primitives/Label';
import { deriveRecomputeView, fmt, riskLabel } from '../engine/plan';
import type { SliderState, PlanOpportunity, PlanTableRow, GatedRow, BenchRow, Levers } from '../engine/plan';
import { OPPS, DETAIL, CTRL, CTRLDOM, GREEN, GOV, REGMAP } from '../data/studio';
import type { StudioPlayDetail } from '../data/studio';
import { setDemoSliders, useDemoStore } from '../state/demoStore';
import type { DeepLinkRequest, DeepLinkScreenProps } from '../App';

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
  gap: '1.75rem',
  maxWidth: 1120,
};
const headerStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };
const h1Style: CSSProperties = { font: 'inherit', fontSize: '1.625rem', fontWeight: 700, color: 'var(--ink)', margin: 0 };
const sectionStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const sectionHeadingStyle: CSSProperties = { font: 'inherit', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', margin: 0 };
const sideListsGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1.25rem' };
const miniTableWrapStyle: CSSProperties = { width: '100%', overflowX: 'auto', flexShrink: 0 };
const miniTableStyle: CSSProperties = { width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.375rem' };
// Layout only — the eyebrow treatment itself (uppercase/tracking/weight/
// color) lives in Label (P3) `eyebrow`, §8 R-1.
const miniThStyle: CSSProperties = { textAlign: 'left', padding: '0 0.625rem 0.25rem' };
const miniTdStyle: CSSProperties = { background: 'var(--panel)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '0.5625rem 0.625rem', fontSize: '0.75rem', color: 'var(--ink)', verticalAlign: 'middle' };
const miniTdNameStyle: CSSProperties = { ...miniTdStyle, borderLeft: '1px solid var(--border)', borderRadius: '0.625rem 0 0 0.625rem', fontWeight: 700 };
const miniTdLastStyle: CSSProperties = { ...miniTdStyle, borderRight: '1px solid var(--border)', borderRadius: '0 0.625rem 0.625rem 0' };
const emptyNoteStyle: CSSProperties = { font: 'inherit', fontSize: '0.8125rem', color: 'var(--ink2)', margin: 0 };

export interface InvestmentDesignProps extends DeepLinkScreenProps {
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
 * Resolves any play name in the live catalog (`OPPS` — funded, gated,
 * bench, or Discovery-added) to a full `PlanTableRow`, exactly the shape
 * `engine/plan.ts`'s own `deriveRecomputeView` computes for `planRows`
 * (source lines 529-539). Needed because `GatedRow`/`BenchRow` (and a
 * cross-screen play deep-link's bare id) carry a smaller shape than the
 * funded table's row — this is the one place `buildPlayDrawerContent`
 * actually needs (row.category/riskLabel/riskVariant/isFoundational/
 * isFromDiscovery/buildCostText/annualValueText/paybackMonths), so gated,
 * bench, and deep-linked plays can open the identical drawer content the
 * funded `PlanTable` already gets (fix B-dead-interactions-03/04/05).
 */
function planTableRowForPlay(name: string, L: Levers): PlanTableRow | null {
  const o: PlanOpportunity | undefined = OPPS.find((op) => op.n === name);
  if (!o) return null;
  return {
    name: o.n,
    isFoundational: Boolean(o.found),
    isFromDiscovery: Boolean(o.disc),
    category: o.c,
    buildCostText: fmt(o.cost),
    annualValueText: fmt(o.val * L.eff),
    paybackMonths: Math.round((o.cost / (o.val * L.eff)) * 12),
    riskLabel: riskLabel(o.r),
    riskVariant: o.r === 'low' ? 'status-positive' : o.r === 'med' ? 'status-caution' : 'status-alert',
  };
}

/** Dedupe while preserving first-seen order — a dep and its unlock inverse
 * could otherwise both name the same play twice in the actions row.
 * Duplicated locally (matches `ChatIntakeWizard.tsx`'s own `dedupe` — this
 * codebase's established convention for small per-file duplication rather
 * than a shared util for a two-line function). */
function dedupe(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

/**
 * Builds this play's DrawerContent field rows + tags + actions — the full
 * base openPlay drawer content (leapfi-platform.html:1391-1432; fix-wave
 * STU-13, deep-links restored by B-dead-interactions-07): summary,
 * economics (incl. the 3-yr return tile), the ready/sequence-gated verdict
 * (`seqNote`), scope of work, technical dependencies, per-gate governance
 * detail (GOV + REGMAP with live scores), the Financial block (run-cost
 * estimate + build-number explanation), controls-to-close, and the
 * Depends-on / Unlocks connections — rendered as DrawerContent (C8) field
 * rows (plain text) plus a bottom `actions` row wired through the
 * nav-payload mechanism (see file header "DRAWER DEEP-LINKS"). `onDeepLink`
 * is optional purely so this function stays callable without it (e.g. a
 * future unit test constructing content directly); the live render call
 * below always has it via `DeepLinkScreenProps`.
 */
function buildPlayDrawerContent(
  row: PlanTableRow,
  L: Levers,
  onDeepLink: ((request: DeepLinkRequest) => void) | undefined,
): { fields: DrawerContentField[]; tags: DrawerContentTag[]; actions: DrawerContentAction[] } {
  const opportunity: PlanOpportunity | undefined = OPPS.find((o) => o.n === row.name);
  const fields: DrawerContentField[] = [{ label: 'Category', value: row.category }];
  const tags: DrawerContentTag[] = [{ text: row.riskLabel, variant: row.riskVariant }];
  if (row.isFoundational) tags.push({ text: 'Foundational', variant: 'count' });
  if (row.isFromDiscovery) tags.push({ text: 'From Discovery', variant: 'count' });
  if (!opportunity) return { fields, tags, actions: [] };

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

  // Fix B-dead-interactions-07 (play drawer call site): the base's
  // in-drawer clicks — gov rows → goOnside/openInstr (1401-1402), seqNote's
  // "See the gap queue →" (1406-1407), depChips/unlocks → openPlay
  // (1390/1424-1428) — restored as `DrawerContent` bottom-row actions
  // through the nav-payload mechanism (DrawerContent has no per-field
  // action slot; see file header "DRAWER DEEP-LINKS").
  const actions: DrawerContentAction[] = [];
  if (onDeepLink) {
    opportunity.g.forEach((gate) => {
      const domainKey = CTRLDOM[gate];
      if (domainKey) {
        actions.push({
          label: `Open ${gate} in OnSide`,
          variant: 'ghost',
          onPress: () => onDeepLink({ screen: 'onside.overview', kind: 'domain', id: domainKey }),
        });
      }
    });
    if (!ready) {
      actions.push({
        label: 'See the gap queue',
        variant: 'ghost',
        onPress: () => onDeepLink({ screen: 'onside.feed', kind: 'section', id: 'gaps' }),
      });
    }
    dedupe([...detail.deps, ...detail.unlocks]).forEach((name) => {
      actions.push({
        label: `Open ${name}`,
        variant: 'ghost',
        onPress: () => onDeepLink({ screen: 'studio.investment-design', kind: 'play', id: name }),
      });
    });
  }

  return { fields, tags, actions };
}

/** Fix B-dead-interactions-05: the base styled these exact rows as
 * clickable openPlay targets (`.gated-row[data-play]{cursor:pointer}` +
 * hover, leapfi-platform.html:309-310; delegated click, 4493-4497) — this
 * mirrors `PlanTable.tsx`'s own real "Open" row-action Button (its 8th
 * column) rather than a div/tr click hack, so the row stays independently
 * keyboard-operable. */
const miniThActionStyle: CSSProperties = { ...miniThStyle, width: '1%' };

function GatedTable({ rows, onOpenPlay }: { rows: GatedRow[]; onOpenPlay: (name: string) => void }) {
  if (rows.length === 0) {
    return <p style={emptyNoteStyle}>Nothing is sequence-gated at this tolerance — every risk-eligible play clears today&rsquo;s control gate.</p>;
  }
  return (
    <div style={miniTableWrapStyle}>
      <table style={miniTableStyle} aria-label="Plays waiting on control maturity">
        <thead>
          <tr>
            <th scope="col" style={miniThStyle}>
              <Label text="Play" variant="eyebrow" />
            </th>
            <th scope="col" style={miniThStyle}>
              <Label text="Annual value" variant="eyebrow" />
            </th>
            <th scope="col" style={miniThStyle}>
              <Label text="Unlocks after" variant="eyebrow" />
            </th>
            <th scope="col" style={miniThActionStyle}>
              {/* top/left pinned to 0 is load-bearing — see the invariant note on DataTable.tsx's `srOnlyStyle` */}
              <span className="sr-only" style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                Action
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td style={miniTdNameStyle}>{row.name}</td>
              <td style={miniTdStyle}>{row.annualValueText}</td>
              <td style={miniTdStyle}>
                {row.unlocksAfterControl} <Tag text={`${row.unlocksAfterControlScore}%`} variant="status-caution" />
              </td>
              <td style={{ ...miniTdLastStyle, textAlign: 'right' }}>
                <Button label="Open" variant="row" onPress={() => onOpenPlay(row.name)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BenchTable({ rows, onOpenPlay }: { rows: BenchRow[]; onOpenPlay: (name: string) => void }) {
  if (rows.length === 0) {
    return <p style={emptyNoteStyle}>Nothing cleared governance is waiting on budget right now.</p>;
  }
  return (
    <div style={miniTableWrapStyle}>
      <table style={miniTableStyle} aria-label="Plays cleared for governance, waiting on budget">
        <thead>
          <tr>
            <th scope="col" style={miniThStyle}>
              <Label text="Play" variant="eyebrow" />
            </th>
            <th scope="col" style={miniThStyle}>
              <Label text="Annual value" variant="eyebrow" />
            </th>
            <th scope="col" style={miniThStyle}>
              <Label text="Build cost" variant="eyebrow" />
            </th>
            <th scope="col" style={miniThStyle}>
              <Label text="To add" variant="eyebrow" />
            </th>
            <th scope="col" style={miniThActionStyle}>
              {/* top/left pinned to 0 is load-bearing — see the invariant note on DataTable.tsx's `srOnlyStyle` */}
              <span className="sr-only" style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                Action
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td style={miniTdNameStyle}>{row.name}</td>
              <td style={miniTdStyle}>{row.annualValueText}</td>
              <td style={miniTdStyle}>{row.buildCostText}</td>
              <td style={miniTdStyle}>{row.addCostText}</td>
              <td style={{ ...miniTdLastStyle, textAlign: 'right' }}>
                <Button label="Open" variant="row" onPress={() => onOpenPlay(row.name)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InvestmentDesign({
  initialSliders = INITIAL_SLIDERS,
  opportunities,
  deepLink,
  onDeepLink,
  onDeepLinkConsumed,
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

  /** Fix B-dead-interactions-03/04/05: resolves a bare play name (from a
   * gated/bench row, or a cross-screen/in-drawer deep link) to a full
   * `PlanTableRow` and opens the same drawer the funded table uses. */
  const handleOpenPlayByName = (name: string) => {
    const row = planTableRowForPlay(name, view.L);
    if (row) handleOpenPlay(row);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  // Fix B-dead-interactions-03/04 (nav-payload CONSUME half — App.tsx file
  // header "NAVIGATION-WITH-PAYLOAD / DEEP LINKS"): Studio · Ask's register
  // rows and Roadmap's play chips carry no Drawer of their own, so they
  // deep-link here instead. Keyed on `deepLink?.nonce` per the documented
  // contract — a same-screen deep link (e.g. an in-drawer "Open <dep>"
  // action, B-dead-interactions-07) still delivers a fresh nonce and still
  // fires this effect.
  useEffect(() => {
    if (!deepLink || deepLink.kind !== 'play') return;
    handleOpenPlayByName(deepLink.id);
    onDeepLinkConsumed?.(deepLink.nonce);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires only on a NEW nonce, per the documented CONSUME contract; view/handleOpenPlayByName/onDeepLinkConsumed are read fresh from closure, not tracked as re-trigger deps
  }, [deepLink?.nonce]);

  const drawerContent = activePlay ? buildPlayDrawerContent(activePlay, view.L, onDeepLink) : null;

  return (
    <>
      <main id="investment-design-main" style={MAIN_STYLE} aria-labelledby="investment-design-title">
        <div style={headerStyle}>
          <h1 id="investment-design-title" style={h1Style}>
            Investment Design
          </h1>
        </div>

        <SliderControlRow sliders={sliders} onSlidersChange={handleSlidersChange} {...(opportunities !== undefined ? { opportunities } : {})} />

        <div style={sectionStyle}>
          <h2 style={sectionHeadingStyle}>Your funded portfolio</h2>
          <PlanTable rows={view.planRows} onOpenPlay={handleOpenPlay} />
        </div>

        <div style={sideListsGridStyle}>
          <div style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>Sequence-gated</h2>
            <GatedTable rows={view.gatedRows} onOpenPlay={handleOpenPlayByName} />
          </div>
          <div style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>Cleared governance, outside budget</h2>
            <BenchTable rows={view.benchRows} onOpenPlay={handleOpenPlayByName} />
          </div>
        </div>
      </main>

      <Drawer open={drawerOpen} title={activePlay?.name ?? 'Play detail'} onClose={handleCloseDrawer}>
        {drawerContent ? (
          <DrawerContent kind="play" fields={drawerContent.fields} tags={drawerContent.tags} actions={drawerContent.actions} />
        ) : null}
      </Drawer>
    </>
  );
}
