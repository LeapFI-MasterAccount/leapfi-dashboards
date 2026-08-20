/**
 * PlanTable — Composite C13 (design_system_spec.md §2.2)
 *
 * "DataTable (row kind: play-row) bound to recompute output." Renders
 * the funded-portfolio table (source's `.ptbl` / `#ptbody`, lines
 * 978-983, populated by `recompute()` lines 1285-1292) from
 * `RecomputeView.planRows` (src/engine/plan.ts) — this component renders
 * only, it computes nothing (payback months, formatted currency, and the
 * risk/gate labels all arrive pre-derived on each row).
 *
 * AMBIGUITY RESOLVED (§2.2 C13 "Built from: DataTable"): DataTable (C6)
 * is a sibling composite with no file in this worktree and no prop
 * contract anywhere in design_system_spec.md — §2.2 lists composites'
 * *composition* ("header Row + body Row + optional row-action Button"),
 * never their props, unlike §2.1's primitives which get a full Key-props
 * column. Importing an unbuilt component under a guessed prop signature
 * risks a wrong integration that only surfaces once DataTable actually
 * lands. Instead this component implements C6's stated a11y baseline
 * directly — "table semantics with real header cells (`<th scope="col">`
 * equivalent)" — as a real `<table>`, satisfying C13's "inherits
 * DataTable states" (empty/loading/loaded) without a blind cross-file
 * dependency. This is a mechanical drop-in replacement for the real
 * DataTable once that dispatch lands: swap the `<table>`/`<thead>`/
 * `<tbody>` markup below for `<DataTable rows=… kind="play-row" />` with
 * no change to this component's own props or to `RecomputeView`.
 *
 * Row-activation adaptation (spec §5.5 "Row-level action: 'Open' (Button,
 * `row`, low/tertiary visual weight)…"): the source makes the entire
 * `<tr class="prow" data-play="…">` clickable via a delegated click
 * handler with no button semantics — not independently keyboard-operable
 * per Core Principle 4. design_system_spec.md §5.5 explicitly upgrades
 * this to a real row-level Button (P2, `row` variant), which is what
 * `onOpenPlay` wires below (an 8th "Action" column, since the source's
 * 7-column table had no equivalent — every other column is a byte-exact
 * port of the source's `<thead>`, line 981).
 *
 * The "sequence-gated" / "cleared governance, outside budget" side lists
 * (source `#gatedlist`/`#benchlist`, lines 985-994) are NOT part of this
 * component: §2.2's composite inventory names no "GatedList"/"BenchList"
 * composite, and §9's survey-map mapping ties only `.ptbl` to PlanTable
 * (C13) — the gated/bench derivations are still ported as
 * `RecomputeView.gatedRows`/`benchRows` (src/engine/plan.ts) per this
 * dispatch's engine-port scope, but rendering them is left to whichever
 * screen-assembly dispatch composes design_system_spec.md §5.5 in full.
 */
import type { CSSProperties } from 'react';
import { Button } from './primitives/Button';
import { Tag } from './primitives/Tag';
import { Label } from './primitives/Label';
import type { PlanTableRow } from '../engine/plan';

/** Mirrors DataTable's (C6) states — derived, not a prop: `loading` comes from the `loading` prop below, `empty` from `rows.length === 0`, `loaded` otherwise. */
export type PlanTableState = 'empty' | 'loading' | 'loaded';

export interface PlanTableProps {
  rows: PlanTableRow[];
  /** Row activation opens Drawer (`kind: play`) per §7 — Drawer (C7) is out of this dispatch's scope, so this bubbles the chosen row up for whoever owns the drawer. */
  onOpenPlay?: (row: PlanTableRow) => void;
  /** Caller-driven loading state (e.g. while an upstream async step resolves before the first plan is available). `rows.length === 0` alone renders the empty state, not loading. */
  loading?: boolean;
}

const COLUMN_COUNT = 8;

const tableWrapStyle: CSSProperties = {
  width: '100%',
  overflowX: 'auto',
  flexShrink: 0,
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: '0 0.4375rem',
};

// Layout only — the eyebrow treatment itself (uppercase/tracking/weight/
// color) lives in Label (P3) `eyebrow`, §8 R-1.
const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '0 0.8125rem 0.25rem',
};

const tdStyle: CSSProperties = {
  background: 'var(--panel)',
  borderTop: '1px solid var(--border)',
  borderBottom: '1px solid var(--border)',
  padding: '0.75rem 0.8125rem',
  fontSize: '0.78125rem',
  verticalAlign: 'middle',
  color: 'var(--ink)',
};

const nameStyle: CSSProperties = { fontWeight: 700 };
const categoryStyle: CSSProperties = { fontSize: '0.71875rem', color: 'var(--ink2)', marginTop: '0.125rem' };

const skeletonRowCells = Array.from({ length: COLUMN_COUNT });

export function PlanTable({ rows, onOpenPlay, loading = false }: PlanTableProps) {
  return (
    <div style={tableWrapStyle}>
      <table style={tableStyle} aria-label="Your funded portfolio" data-lf-composite="plan-table" data-state={loading ? 'loading' : rows.length === 0 ? 'empty' : 'loaded'}>
        <thead>
          <tr>
            <th scope="col" style={{ ...thStyle, width: '28%' }}>
              <Label text="Play" variant="eyebrow" />
            </th>
            <th scope="col" style={thStyle}>
              <Label text="Category" variant="eyebrow" />
            </th>
            <th scope="col" style={thStyle}>
              <Label text="Build" variant="eyebrow" />
            </th>
            <th scope="col" style={thStyle}>
              <Label text="Annual value" variant="eyebrow" />
            </th>
            <th scope="col" style={thStyle}>
              <Label text="Payback" variant="eyebrow" />
            </th>
            <th scope="col" style={thStyle}>
              <Label text="Risk" variant="eyebrow" />
            </th>
            <th scope="col" style={thStyle}>
              <Label text="Gate" variant="eyebrow" />
            </th>
            <th scope="col" style={thStyle}>
              {/* top/left pinned to 0 is load-bearing — see the invariant note on DataTable.tsx's `srOnlyStyle` */}
              <span className="sr-only" style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                Actions
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? skeletonRowCells.map((_, rowIndex) => (
                // eslint-disable-next-line react/no-array-index-key -- static skeleton placeholder rows, no identity to key on
                <tr key={rowIndex}>
                  {skeletonRowCells.map((__, cellIndex) => (
                    // eslint-disable-next-line react/no-array-index-key -- static skeleton placeholder cells
                    <td key={cellIndex} style={tdStyle}>
                      <span aria-hidden="true" style={{ display: 'inline-block', width: '4.5em', height: '0.9em', borderRadius: 4, background: 'var(--border)', opacity: 0.5 }} />
                    </td>
                  ))}
                </tr>
              ))
            : rows.length === 0
              ? (
                <tr>
                  <td colSpan={COLUMN_COUNT} style={{ ...tdStyle, color: 'var(--ink2)', textAlign: 'center' }}>
                    No plays fit at this budget and tolerance. Raise the budget or loosen tolerance.
                  </td>
                </tr>
              )
              : rows.map((row) => (
                <tr key={row.name} data-play={row.name}>
                  <td style={{ ...tdStyle, borderLeft: '1px solid var(--border)', borderRadius: '0.6875rem 0 0 0.6875rem' }}>
                    <div style={nameStyle}>
                      {row.name}
                      {row.isFoundational ? (
                        <>
                          {' '}
                          <Tag text="Foundational" variant="count" />
                        </>
                      ) : null}
                      {row.isFromDiscovery ? (
                        <>
                          {' '}
                          <Tag text="From Discovery" variant="count" />
                        </>
                      ) : null}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={categoryStyle}>{row.category}</span>
                  </td>
                  <td style={tdStyle}>{row.buildCostText}</td>
                  <td style={tdStyle}>{row.annualValueText}</td>
                  <td style={tdStyle}>{row.paybackMonths} mo</td>
                  <td style={tdStyle}>
                    <Tag text={row.riskLabel} variant={row.riskVariant} />
                  </td>
                  <td style={tdStyle}>
                    <Tag text="Clear" variant="status-positive" icon="check" />
                  </td>
                  <td style={{ ...tdStyle, borderRight: '1px solid var(--border)', borderRadius: '0 0.6875rem 0.6875rem 0', textAlign: 'right' }}>
                    {onOpenPlay ? <Button label="Open" variant="row" onPress={() => onOpenPlay(row)} /> : null}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
