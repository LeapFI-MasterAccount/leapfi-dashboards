/**
 * DataTable — Composite C6 (design_system_spec.md §2.2)
 *
 * Built from a header Row (Label ×N, P3) + body Row (generic) + an
 * optional per-row action Button (`row` variant, P2). Spec variants: "row
 * kinds: generic, signal-row, redline-row/doc-row, obligation-row,
 * play-row (§7 governs which rows open a Drawer vs update in place)".
 * Composite states: empty, loading, loaded, row-updating (obligation-row
 * status flip). A11y baseline: "`table` semantics with real header cells
 * (`<th scope="col">` equivalent); row-updating status changes are
 * announced via a live region owned by the screen (§5.3), not by
 * DataTable itself, to avoid redundant announcements when many rows
 * update in one cascade."
 *
 * AMBIGUITY RESOLVED — row "kind" is data/columns the consumer supplies,
 * not a hardcoded prop this file branches on. §2.2's own C13 PlanTable row
 * describes itself as "DataTable (`row kind: play-row`) bound to recompute
 * output" — i.e. play-row-specific presentation is a *separate* composite
 * that wraps this generic DataTable, not a case DataTable itself switches
 * on. Domain semantics for signal/redline/doc/obligation/play rows belong
 * to each screen (§5.2–§5.5) and to row-kind-specific composites like
 * PlanTable (C13) that are outside this dispatch's allowlist — this file
 * stays a generic, typed, column-driven table so every row kind in the
 * spec's list can be built on top of it via `columns[].render` without
 * DataTable acquiring domain knowledge it has no other reason to hold.
 * `getRowId` and `updatingRowIds` are deliberately generic (not scoped to
 * "obligation rows" specifically) since "row-updating" is a composite
 * state, not a fact about one particular row kind — obligation-row status
 * flips (§5.3 cascade) are simply this dispatch's cited use case for it.
 *
 * "sortable" (this dispatch's TASK line): design_system_spec.md's own C6
 * row does not list sorting as a named variant/state — the closest
 * anchor is the general table-semantics a11y baseline, which sorting does
 * not conflict with. Implemented as the standard accessible pattern: a
 * real `<button>` inside each sortable `<th>`, `aria-sort` on the `<th>`
 * itself (`ascending`/`descending`/`none`; omitted entirely for
 * non-sortable columns, per the ARIA spec's own guidance that `aria-sort`
 * only belongs on sortable columns), and a shape (chevron rotation) +
 * `aria-sort` pairing so direction is never color-only.
 *
 * Row-updating a11y: per the baseline above, this component intentionally
 * renders NO `aria-live` for row-updating status changes — only a
 * `data-row-state="updating"` attribute + a visual treatment — because the
 * owning screen (§5.3: "A live region owned by the domain screen... not by
 * DataTable itself") is responsible for the single, summarized cascade
 * announcement ("3 of 7 gaps closed"). A `role="status"` is used only for
 * the loading/empty message cell text, which is a different state
 * transition than the row-updating cascade the spec explicitly reserves
 * for the screen, so it does not conflict with that reservation.
 *
 * Single row-action slot: the spec's Built-from column names exactly one
 * "optional row-action Button (`row` variant)" — kept singular here
 * (`rowAction` prop) to match. A screen that needs more than one
 * per-row control can still render additional Buttons/Chips/Tags from
 * inside a column's own `render(row)` function — the generic column model
 * is already the escape hatch, so no second dedicated action slot was
 * added.
 *
 * CLICK-AFFORDANCE STANDARD (D19b, `affordance_standard.md` §1, §5 items
 * 1–3): `onRowClick`/`isRowClickable` add a whole-row click affordance —
 * trailing `rowAffordance` chevron (accent, at rest per §0), `--bg2` hover,
 * `--focus-ring` on keyboard focus, `tabIndex={0}` + Enter/Space on the
 * `<tr>` itself (native `<table>` semantics preserved — no `role="button"`
 * on the row). Non-clickable rows in a mixed table get an empty spacer
 * cell, never a dimmed chevron (§1.3 "honest mixed table" rule). Per
 * stop-item 3 (§7.3), `rowAction` and `onRowClick` are NOT combined on the
 * same table: when `rowAction` is present it owns the trailing column and
 * the whole-row click affordance is not rendered — that co-presence is
 * explicitly out of this standard's scope, not an assumption baked in
 * here. Omitting `onRowClick` renders exactly as before this change
 * (backward compatible, zero visual change until a screen wires it).
 *
 * GROUP-ROW CAPABILITY (`grouping: { key, renderHeader }`): DataTable now
 * has a spanning group-row primitive — v1's `<tr class="dgroup">` divider
 * (leapfi-platform.html osRaci, source 3552: one domain-label row,
 * `colspan` across every column, before that domain's document rows).
 * This was previously a documented gap (a consumer's file header once
 * read "DataTable (C6) has no spanning group-row primitive" and worked
 * around it by rendering one table per group instead of one table with
 * group rows — that workaround, and the claim behind it, are retired by
 * this addition; see OnSideOwnership.tsx for the call site this closes).
 * `grouping.key(row)` partitions `rows` into groups by first-seen key
 * order (rows need not be pre-sorted/contiguous by group — the partition
 * is built from a `Map`, so any interleaving of the input still groups
 * correctly); `grouping.renderHeader(key, groupRows)` renders that
 * group's one spanning `<tr><th scope="rowgroup" colSpan={columnCount}>`
 * — a header cell scoped to the rows it introduces (design_system_spec.md
 * §2.4 G4: a group row labels the rows beneath it; as a data cell it
 * would announce to assistive tech as an orphan value in a one-cell row)
 * — general-purpose (any screen, any grouping), not RACI- or
 * Ownership-specific. Column sorting, when active, sorts WITHIN each
 * group only — group membership and group order never change under sort,
 * only the row order inside each group — otherwise a flat sort would
 * interleave every group's rows together and defeat the reason to group
 * at all. `grouping` is optional and independent of `rowAction`/
 * `onRowClick`; omitting it renders exactly as before this capability was
 * added — zero behavior change for every existing call site. `key` and
 * `renderHeader` are carried as one required-together config object
 * (design_system_spec.md §2.4 G1, amendment A6) rather than two
 * independent optional props specifically so the pair is unrepresentable
 * apart: a `grouping` object missing either member is a compile-time
 * error, never a runtime default (the old shape let `groupKey` alone
 * render blank spanning rows, and let `renderGroupHeader` alone go
 * silently unread).
 */
import { useMemo, useState } from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { Label } from './primitives/Label';
import { Icon } from './primitives/Icon';
import { Button } from './primitives/Button';

export type DataTableState = 'empty' | 'loading' | 'loaded';
export type DataTableSortDirection = 'ascending' | 'descending';
export type DataTableSurface = 'page' | 'panel';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  /** Required for a column to actually sort — `sortable` without this is
   * a header that reports itself sortable but has nothing to compare. */
  sortValue?: (row: T) => string | number;
  align?: 'start' | 'end';
}

export interface DataTableRowAction<T> {
  label: (row: T) => string;
  onPress: (row: T) => void;
  disabled?: (row: T) => boolean;
}

export interface DataTableProps<T> {
  /** Table's accessible name (rendered as a visually-hidden `<caption>` —
   * screens already show a visible page title above the table per every
   * §5 region map, so a second visible title here would duplicate it). */
  caption: string;
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  getRowId: (row: T) => string;
  state?: DataTableState;
  emptyMessage?: string;
  loadingMessage?: string;
  /** Row ids currently in the "row-updating" composite state (e.g. an
   * obligation row whose status Tag is mid-flip during the §5.3 cascade). */
  updatingRowIds?: ReadonlySet<string>;
  rowAction?: DataTableRowAction<T>;
  defaultSortColumnId?: string;
  defaultSortDirection?: DataTableSortDirection;
  /** Whole-row click affordance (§1, §5 items 1–3). Ignored when
   * `rowAction` is also supplied — see the file header note above. */
  onRowClick?: (row: T) => void;
  /** Per-row predicate; defaults to "every row" when `onRowClick` is
   * supplied, mirroring `rowAction.disabled`'s existing shape. Only
   * consulted when `onRowClick` is present. */
  isRowClickable?: (row: T) => boolean;
  /** Spanning group-row capability — see file header "GROUP-ROW
   * CAPABILITY". `key`/`renderHeader` are carried as one grouping-config
   * object (not two independent optional props) precisely so the pair is
   * unrepresentable apart: supplying a `grouping` object with only one
   * member is a compile-time error (missing required property), never a
   * runtime no-op (design_system_spec.md §2.4 G1, amendment A6). A table
   * with no `grouping` at all renders exactly as it did before this
   * capability existed. */
  grouping?: {
    /** Derives which group a row belongs to; rows sharing a key are
     * grouped together (first-seen key order) regardless of their
     * position in `rows`. */
    key: (row: T) => string;
    /** Renders one group's spanning divider row, given its key and the
     * (authored-order) rows in that group — e.g. to build a deep-link
     * label. */
    renderHeader: (groupKey: string, groupRows: readonly T[]) => ReactNode;
  };
  /** A14-residual wave (design_system_spec.md §2.7 pattern, mirrored — not
   * a spec amendment of its own): the header-cell Label(s) (sortable via
   * `SortHeaderButton`, non-sortable directly) hardcoded `--ink2`
   * unconditionally, which fails the 4.5:1 AA floor in light theme
   * wherever this DataTable's immediate rendering context is a `--panel`
   * surface. Unlike StatCard/SliderControlRow (always-panel-seated by
   * construction), DataTable's own header row carries no background of
   * its own (`theadRowStyle`/`tableStyle` — no `background`) — seating is
   * entirely inherited from whichever ancestor a consuming screen nests it
   * in, and that population is NOT uniform: page-seated at most traced
   * consumers (OnSideDocuments/OnSideFeed/OnSideOwnership/Cases/StudioAsk/
   * HomePanels/RegulatoryFeed*), panel-seated at exactly two
   * (DomainsAccordion.tsx's cardStyle; every DataTable inside
   * ReportView.tsx's shared reporting Drawer). `surface="page"` (default)
   * is therefore byte-identical to pre-fix behavior — required, since
   * hardcoding `"panel"` unconditionally would regress the page-seated
   * majority; `surface="panel"` resolves both header-cell Label forms to
   * `--chart-axis`. */
  surface?: DataTableSurface;
}

/** Visually-hidden (sr-only) recipe — INVARIANT: `top`/`left` MUST be
 * pinned to 0. Without them, an absolutely-positioned box with no
 * positioned ancestor falls back to its in-flow "static position" —
 * wherever it would have rendered as a normal-flow box — which can sit
 * far down a scrolled container (e.g. deep inside a scrolling `<main>`)
 * while still being sized by the *initial containing block* (the root),
 * extending `html.scrollHeight` well past the visible app shell even
 * though the box itself is a clipped 1px square nobody sees. Pinning
 * `top:0; left:0` anchors the box at its containing block's origin
 * instead — screen readers do not care where the box sits, and a 1px
 * box at the origin can never itself extend page scroll. See also each
 * screen's `MAIN_STYLE`, which now also carries `position: 'relative'`
 * so any absolute descendant (this pattern or a future third-party one)
 * resolves inside the scrolling region rather than against the root. */
const srOnlyStyle: CSSProperties = {
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

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  color: 'var(--ink)',
  fontSize: '0.875rem',
};

const theadRowStyle: CSSProperties = {
  borderBottom: '1px solid var(--border)',
};

const thStyle: CSSProperties = {
  padding: '0.6rem 0.75rem',
  whiteSpace: 'nowrap',
};

const sortButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  background: 'transparent',
  border: 'none',
  padding: '0.2rem',
  margin: '-0.2rem',
  font: 'inherit',
  cursor: 'pointer',
  color: 'inherit',
  outline: 'none',
};

const trStyle: CSSProperties = {
  borderBottom: '1px solid var(--border)',
};

const trUpdatingStyle: CSSProperties = {
  background: 'var(--panel)',
  transition: 'background-color 200ms ease',
};

const tdStyle: CSSProperties = {
  padding: '0.65rem 0.75rem',
  verticalAlign: 'middle',
};

const messageCellStyle: CSSProperties = {
  padding: '1.5rem 0.75rem',
  textAlign: 'center',
  color: 'var(--ink2)',
};

// Group-row divider (v1 `tr.dgroup`, leapfi-platform.html osRaci 3552/3562:
// a spanning label row, distinct background, small/uppercase/tracked
// text). Text color is `--chart-axis`, NOT `--ink2` — tokens.css's own
// `--ink2` comment bans it on `--panel` ("never on --panel" / light-theme
// note: "FAILS AA (4.34:1) on --panel... use --chart-axis (panel-seated
// variant) instead for panel-seated labels"), and this divider paints
// `--panel` as its own background, so `--chart-axis` is the token file's
// own prescribed substitute — verified 4.97:1 (light) / 5.33:1 (dark) on
// `--panel`, both clearing the 4.5:1 AA floor.
const groupRowStyle: CSSProperties = {
  background: 'var(--panel)',
};
const groupCellStyle: CSSProperties = {
  padding: '0.45rem 0.75rem',
  fontSize: '0.6875rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em' /* T7 F11: was 0.06em (verbatim v1 tr.dgroup), doctrine TYP-4 is 0.05em */,
  color: 'var(--chart-axis)',
};

interface SortHeaderButtonProps {
  label: string;
  active: boolean;
  direction: DataTableSortDirection | null;
  onPress: () => void;
  surface: DataTableSurface;
}

/** Local subcomponent (not exported) purely so its own focus-visible state
 * can live in a real hook instance per header cell — inline styles can't
 * express a `:focus-visible` pseudo-class, so the focus ring is driven by
 * React state instead, same technique Button/Chip already use. */
function SortHeaderButton({ label, active, direction, onPress, surface }: SortHeaderButtonProps) {
  const [focused, setFocused] = useState(false);

  return (
    <button
      type="button"
      onClick={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...sortButtonStyle,
        borderRadius: 'var(--radius-xs, 4px)',
        boxShadow: focused ? 'var(--focus-ring)' : 'none',
      }}
    >
      <Label text={label} variant="body-secondary" surface={surface} />
      <Icon
        name="chevron-down"
        size={16}
        tone={active ? 'interactive' : 'default'}
        style={{
          opacity: active ? 1 : 0.45,
          transform: active && direction === 'ascending' ? 'rotate(180deg)' : 'none',
          transition: 'transform 120ms ease, opacity 120ms ease',
        }}
      />
    </button>
  );
}

interface DataTableRowProps<T> {
  row: T;
  columns: readonly DataTableColumn<T>[];
  isUpdating: boolean;
  /** Whole-row click affordance state (§1.2) — false renders identically
   * to today's plain `<tr>` (§1.3 "honest mixed table" rule: absence of
   * hover/focus/cursor is the inert signal, not a dimmed treatment). */
  clickable: boolean;
  onRowClick?: (row: T) => void;
  /** Trailing cell content: the `rowAction` Button, the `rowAffordance`
   * chevron/spacer, or `null` when the table has neither (today's shape). */
  trailingCell: ReactNode;
}

/** Local subcomponent (not exported), same reasoning as `SortHeaderButton`
 * above: hover/focus need a real per-row hook instance, which a plain
 * `.map()` callback inside the parent's render body cannot provide without
 * violating the rules of hooks. */
function DataTableRow<T>({ row, columns, isUpdating, clickable, onRowClick, trailingCell }: DataTableRowProps<T>) {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleClick = () => {
    if (clickable && onRowClick) onRowClick(row);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (!clickable || !onRowClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick(row);
    }
  };

  const baseStyle = isUpdating ? { ...trStyle, ...trUpdatingStyle } : trStyle;
  const style: CSSProperties = clickable
    ? {
        ...baseStyle,
        cursor: 'pointer',
        background: hover ? 'var(--bg2)' : baseStyle.background,
        boxShadow: focused ? 'var(--focus-ring)' : 'none',
      }
    : baseStyle;

  return (
    <tr
      data-row-state={isUpdating ? 'updating' : 'default'}
      style={style}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      onMouseEnter={clickable ? () => setHover(true) : undefined}
      onMouseLeave={clickable ? () => setHover(false) : undefined}
      onFocus={clickable ? () => setFocused(true) : undefined}
      onBlur={clickable ? () => setFocused(false) : undefined}
    >
      {columns.map((column) => (
        <td key={column.id} style={{ ...tdStyle, textAlign: column.align === 'end' ? 'right' : 'left' }}>
          {column.render(row)}
        </td>
      ))}
      {trailingCell}
    </tr>
  );
}

interface ActiveSort {
  columnId: string;
  direction: DataTableSortDirection;
}

/** Module-scope (not a hook) so both the flat and grouped-partition sort
 * paths call the identical comparator — see file header "GROUP-ROW
 * CAPABILITY" on why a grouped table sorts each group's row subset
 * independently rather than the whole `rows` array at once. */
function applySort<T>(subset: readonly T[], sort: ActiveSort | null, columns: readonly DataTableColumn<T>[]): readonly T[] {
  if (!sort) return subset;
  const column = columns.find((candidate) => candidate.id === sort.columnId);
  if (!column || !column.sortValue) return subset;
  const sortValue = column.sortValue;
  const direction = sort.direction;
  return [...subset].sort((a, b) => {
    const av = sortValue(a);
    const bv = sortValue(b);
    let cmp = 0;
    if (av < bv) cmp = -1;
    else if (av > bv) cmp = 1;
    return direction === 'ascending' ? cmp : -cmp;
  });
}

/** One rendered `<tbody>` section: either the single ungrouped section (no
 * `header`) or one per group (§2.4 G8, amendment A10 — see the file header
 * "GROUP-ROW CAPABILITY" note and the render below). Splitting sections is
 * what gives each group its OWN `<tbody>` — the fix for the Sprint 1
 * hostile-review S1 finding: a `<th scope="rowgroup">` header cell's
 * accessible-name association is bounded to its containing table SECTION
 * (`<tbody>`/`<thead>`/`<tfoot>`), never to the table as a whole, so one
 * shared `<tbody>` for every group let every earlier group's header stack
 * into every later group's accessible name (worst on the table's last
 * group). One `<tbody>` per section is the structural fix; `header: null`
 * marks the ungrouped section, which carries no `scope="rowgroup"` cell at
 * all and is therefore unaffected either way (§2.4 G8's own "ungrouped
 * case is unaffected" clause). */
type DataTableSection<T> = { key: string; header: ReactNode | null; rows: readonly T[] };

export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  state = 'loaded',
  emptyMessage,
  loadingMessage,
  updatingRowIds,
  rowAction,
  defaultSortColumnId,
  defaultSortDirection,
  onRowClick,
  isRowClickable: isRowClickablePredicate,
  grouping,
  surface = 'page',
}: DataTableProps<T>) {
  const [sort, setSort] = useState<ActiveSort | null>(() =>
    defaultSortColumnId
      ? { columnId: defaultSortColumnId, direction: defaultSortDirection ?? 'ascending' }
      : null,
  );

  // Ungrouped case (no `groupKey`): identical to the pre-grouping
  // behavior — the whole `rows` array sorted as one list.
  const sortedRows = useMemo(() => applySort(rows, sort, columns), [rows, sort, columns]);

  // Grouped case: partition `rows` into groups by first-seen `groupKey`
  // order (a `Map`, so the input need not already sit contiguously by
  // group), sort EACH group's own rows independently (never the whole
  // table at once — see file header "GROUP-ROW CAPABILITY"), and produce
  // one SECTION per group — each becomes its own `<tbody>` at render time
  // (§2.4 G8, amendment A10; see `DataTableSection`'s own doc comment).
  // Ungrouped case (no `grouping`): exactly one section, `header: null`,
  // identical to this component's single-`<tbody>` behavior before A10.
  const sections = useMemo<readonly DataTableSection<T>[]>(() => {
    if (!grouping) return [{ key: '__ungrouped__', header: null, rows: sortedRows }];
    const { key: groupKey, renderHeader } = grouping;
    const order: string[] = [];
    const buckets = new Map<string, T[]>();
    for (const row of rows) {
      const key = groupKey(row);
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = [];
        buckets.set(key, bucket);
        order.push(key);
      }
      bucket.push(row);
    }
    return order.map((key) => {
      const groupRows = buckets.get(key) ?? [];
      return { key, header: renderHeader(key, groupRows), rows: applySort(groupRows, sort, columns) };
    });
  }, [rows, sort, columns, grouping, sortedRows]);

  const handleSortClick = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;
    setSort((current) => {
      if (!current || current.columnId !== column.id) {
        return { columnId: column.id, direction: 'ascending' };
      }
      return {
        columnId: column.id,
        direction: current.direction === 'ascending' ? 'descending' : 'ascending',
      };
    });
  };

  // Per stop-item 3 (affordance_standard.md §7.3): `rowAction` and
  // `onRowClick` are not combined on the same table — a named row action
  // owns the trailing column and the whole-row click affordance is not
  // rendered when it is present, rather than inventing co-presence
  // behavior the standard leaves for a future design decision.
  const hasAffordanceColumn = Boolean(onRowClick) && !rowAction;
  const columnCount = columns.length + (rowAction ? 1 : 0) + (hasAffordanceColumn ? 1 : 0);
  const showMessageRow = state === 'loading' || state === 'empty' || sortedRows.length === 0;

  return (
    <table style={tableStyle} data-lf-composite="data-table" data-state={state}>
      <caption style={srOnlyStyle}>{caption}</caption>
      <thead>
        <tr style={theadRowStyle}>
          {columns.map((column) => {
            const activeSort = sort && sort.columnId === column.id ? sort : null;
            return (
              <th
                key={column.id}
                scope="col"
                style={{ ...thStyle, textAlign: column.align === 'end' ? 'right' : 'left' }}
                aria-sort={column.sortable ? (activeSort ? activeSort.direction : 'none') : undefined}
              >
                {column.sortable ? (
                  <SortHeaderButton
                    label={column.header}
                    active={activeSort !== null}
                    direction={activeSort ? activeSort.direction : null}
                    onPress={() => handleSortClick(column)}
                    surface={surface}
                  />
                ) : (
                  <Label text={column.header} variant="body-secondary" surface={surface} />
                )}
              </th>
            );
          })}
          {rowAction ? (
            <th scope="col" style={thStyle}>
              <span style={srOnlyStyle}>Actions</span>
            </th>
          ) : null}
          {hasAffordanceColumn ? (
            <th scope="col" style={thStyle}>
              <span style={srOnlyStyle}>Actions</span>
            </th>
          ) : null}
        </tr>
      </thead>
      {showMessageRow ? (
        // G7: group rows never participate in `empty`/`loading` — the
        // message row renders alone, in the table's own single `<tbody>`,
        // regardless of whether `grouping` is configured.
        <tbody>
          <tr>
            <td colSpan={columnCount} style={messageCellStyle}>
              <span role="status">
                {state === 'loading' ? loadingMessage ?? 'Loading…' : emptyMessage ?? 'No data to show.'}
              </span>
            </td>
          </tr>
        </tbody>
      ) : (
        // §2.4 G8 (amendment A10) — one `<tbody>` PER SECTION, never one
        // shared across the whole table. This is the structural fix for
        // the Sprint 1 hostile-review S1 finding: bounding each group's
        // `<th scope="rowgroup">` to its own table section is what stops
        // its accessible-name association from bleeding into every later
        // group's rows. The ungrouped case is exactly one section
        // (`header: null`, ends this array immediately below), so it
        // still renders as a single `<tbody>` — unaffected, per §2.4 G8's
        // own "ungrouped case is unaffected" clause.
        sections.map((section, sectionIndex) => (
          // eslint-disable-next-line react/no-array-index-key -- combined with the stable section key below, not the sole key input (a group's own key can repeat, unusually)
          <tbody key={`section:${section.key}:${sectionIndex}`}>
            {section.header !== null ? (
              <tr data-lf-group-row="true" style={groupRowStyle}>
                <th scope="rowgroup" colSpan={columnCount} style={groupCellStyle}>
                  {section.header}
                </th>
              </tr>
            ) : null}
            {section.rows.map((row) => {
              const rowId = getRowId(row);
              const isUpdating = updatingRowIds?.has(rowId) ?? false;
              const isRowActionDisabled = rowAction?.disabled ? rowAction.disabled(row) : false;
              const isRowClickable = hasAffordanceColumn && (!isRowClickablePredicate || isRowClickablePredicate(row));

              let trailingCell: ReactNode = null;
              if (rowAction) {
                trailingCell = (
                  <td style={tdStyle}>
                    <Button
                      variant="row"
                      label={rowAction.label(row)}
                      onPress={() => rowAction.onPress(row)}
                      disabled={isRowActionDisabled}
                    />
                  </td>
                );
              } else if (hasAffordanceColumn) {
                trailingCell = (
                  <td style={tdStyle}>
                    {isRowClickable ? <Icon name="chevron-right" size={16} tone="interactive" /> : null}
                  </td>
                );
              }

              return (
                <DataTableRow
                  key={rowId}
                  row={row}
                  columns={columns}
                  isUpdating={isUpdating}
                  clickable={isRowClickable}
                  {...(onRowClick ? { onRowClick } : {})}
                  trailingCell={trailingCell}
                />
              );
            })}
          </tbody>
        ))
      )}
    </table>
  );
}
