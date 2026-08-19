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
 */
import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
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
}

const srOnlyStyle: CSSProperties = {
  position: 'absolute',
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

  const columnCount = columns.length + (rowAction ? 1 : 0);
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
            return (
              <tr
                key={rowId}
                data-row-state={isUpdating ? 'updating' : 'default'}
                style={isUpdating ? { ...trStyle, ...trUpdatingStyle } : trStyle}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    style={{ ...tdStyle, textAlign: column.align === 'end' ? 'right' : 'left' }}
                  >
                    {column.render(row)}
                  </td>
                ))}
                {rowAction ? (
                  <td style={tdStyle}>
                    <Button
                      variant="row"
                      label={rowAction.label(row)}
                      onPress={() => rowAction.onPress(row)}
                      disabled={isRowActionDisabled}
                    />
                  </td>
                ) : null}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
