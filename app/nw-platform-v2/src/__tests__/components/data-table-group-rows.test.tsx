/**
 * DataTable (C6) — group-row contract regression (design_system_spec.md
 * §2.4 G1, G4; amendment A6; delta index §8 R-4(a)/(b)).
 *
 * G4 — the spanning group-row cell is a header cell (`<th
 * scope="rowgroup">`) scoped to the rows it introduces, never a data
 * cell (`<td>`). A `<td>` announces to assistive tech as an orphan value
 * in a one-cell row instead of labelling the rows beneath it.
 *
 * G1 / A6 — `groupKey`/`renderGroupHeader` are a mutually required pair:
 * one without the other must be a COMPILE-TIME error, never a runtime
 * no-op. This file's implementer-chosen mechanism is a single required
 * `grouping` config prop carrying both members as one object, so the
 * pair is unrepresentable-apart in `DataTableProps<T>`. The compile-time
 * half of the contract is pinned below via `@ts-expect-error`-guarded
 * fixtures in exported (never-invoked) functions — `tsconfig.json`'s
 * `include: ["src"]` picks up this file, so `npx tsc --noEmit`
 * type-checks it exactly like production code. Each `@ts-expect-error`
 * itself becomes a real tsc error ("Unused '@ts-expect-error' directive")
 * if the line below it stops being a type error — i.e. this file fails
 * to compile both when the contract is honored correctly (nothing to
 * suppress would be wrong) and when the contract regresses back to two
 * independent optionals (the suppressed line stops erroring).
 */
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { DataTable } from '../../components/DataTable';
import type { DataTableColumn, DataTableProps } from '../../components/DataTable';

interface Row {
  id: string;
  group: string;
  label: string;
}

const ROWS: Row[] = [
  { id: 'a', group: 'Alpha', label: 'First' },
  { id: 'b', group: 'Alpha', label: 'Second' },
  { id: 'c', group: 'Beta', label: 'Third' },
];

const COLUMNS: DataTableColumn<Row>[] = [{ id: 'label', header: 'Label', render: (row) => row.label }];

function renderGrouped() {
  return render(
    <DataTable
      caption="Grouped table"
      columns={COLUMNS}
      rows={ROWS}
      getRowId={(row) => row.id}
      grouping={{
        key: (row) => row.group,
        renderHeader: (groupKey) => groupKey,
      }}
    />,
  );
}

describe('DataTable group rows — §2.4 G4 (header cell, not data cell)', () => {
  it('renders each group divider as a <th scope="rowgroup"> spanning every column, never a <td>', () => {
    const { container } = renderGrouped();
    const groupRows = container.querySelectorAll('tr[data-lf-group-row="true"]');
    expect(groupRows).toHaveLength(2);
    groupRows.forEach((groupRow) => {
      const th = groupRow.querySelector('th');
      expect(th).not.toBeNull();
      expect(th?.getAttribute('scope')).toBe('rowgroup');
      expect(th?.getAttribute('colspan')).toBe('1');
      expect(groupRow.querySelector('td')).toBeNull();
    });
  });

  it('exposes each group row as an accessible rowheader — labelling the rows beneath it, not an orphan cell value', () => {
    renderGrouped();
    const table = screen.getByRole('table', { name: 'Grouped table' });
    const rowheaders = within(table).getAllByRole('rowheader');
    expect(rowheaders.map((el) => el.textContent)).toEqual(['Alpha', 'Beta']);
  });
});

describe('DataTable group rows — §2.4 G1 / amendment A6 (grouping config, paired)', () => {
  it('a table with both grouping members supplied together (the only representable shape) renders its group rows normally', () => {
    renderGrouped();
    const table = screen.getByRole('table', { name: 'Grouped table' });
    expect(within(table).getAllByRole('rowheader')).toHaveLength(2);
  });
});

/**
 * Compile-time-only fixtures — never rendered, never invoked at runtime.
 * Exported so `noUnusedLocals` does not flag them.
 */
export function __typeContract_keyWithoutRenderHeader(): DataTableProps<Row> {
  // @ts-expect-error — `grouping.renderHeader` is missing; a partial grouping config must not type-check (§2.4 G1 / A6).
  return { caption: 'invalid', columns: COLUMNS, rows: ROWS, getRowId: (row: Row) => row.id, grouping: { key: (row: Row) => row.group } };
}

export function __typeContract_renderHeaderWithoutKey(): DataTableProps<Row> {
  // @ts-expect-error — `grouping.key` is missing; a partial grouping config must not type-check (§2.4 G1 / A6).
  return { caption: 'invalid', columns: COLUMNS, rows: ROWS, getRowId: (row: Row) => row.id, grouping: { renderHeader: (groupKey: string) => groupKey } };
}
