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
 */
import { useMemo, useState } from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { Label } from './primitives/Label';
import { Icon } from './primitives/Icon';
import { Button } from './primitives/Button';

export type DataTableState = 'empty' | 'loading' | 'loaded';
export type DataTableSortDirection = 'ascending' | 'descending';

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

interface SortHeaderButtonProps {
  label: string;
  active: boolean;
  direction: DataTableSortDirection | null;
  onPress: () => void;
}

/** Local subcomponent (not exported) purely so its own focus-visible state
 * can live in a real hook instance per header cell — inline styles can't
 * express a `:focus-visible` pseudo-class, so the focus ring is driven by
 * React state instead, same technique Button/Chip already use. */
function SortHeaderButton({ label, active, direction, onPress }: SortHeaderButtonProps) {
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
      <Label text={label} variant="body-secondary" />
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
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ columnId: string; direction: DataTableSortDirection } | null>(() =>
    defaultSortColumnId
      ? { columnId: defaultSortColumnId, direction: defaultSortDirection ?? 'ascending' }
      : null,
  );

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((candidate) => candidate.id === sort.columnId);
    if (!column || !column.sortValue) return rows;
    const sortValue = column.sortValue;
    const direction = sort.direction;
    return [...rows].sort((a, b) => {
      const av = sortValue(a);
      const bv = sortValue(b);
      let cmp = 0;
      if (av < bv) cmp = -1;
      else if (av > bv) cmp = 1;
      return direction === 'ascending' ? cmp : -cmp;
    });
  }, [rows, sort, columns]);

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
                  />
                ) : (
                  <Label text={column.header} variant="body-secondary" />
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
      <tbody>
        {showMessageRow ? (
          <tr>
            <td colSpan={columnCount} style={messageCellStyle}>
              <span role="status">
                {state === 'loading' ? loadingMessage ?? 'Loading…' : emptyMessage ?? 'No data to show.'}
              </span>
            </td>
          </tr>
        ) : (
          sortedRows.map((row) => {
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
          })
        )}
      </tbody>
    </table>
  );
}
