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
import { rowgroupHeaderTextsFor } from '../a11y/tableRowgroupAccessibleName';

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

const THREE_GROUP_ROWS: Row[] = [
  { id: 'a1', group: 'Alpha', label: 'Alpha one' },
  { id: 'a2', group: 'Alpha', label: 'Alpha two' },
  { id: 'b1', group: 'Beta', label: 'Beta one' },
  { id: 'b2', group: 'Beta', label: 'Beta two' },
  { id: 'g1', group: 'Gamma', label: 'Gamma one' },
  { id: 'g2', group: 'Gamma', label: 'Gamma two' },
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

describe('DataTable group rows — §2.4 G8 / amendment A10 (tbody-per-group, scope="rowgroup" does not bleed)', () => {
  it('renders one <tbody> per group — never one <tbody> shared by the whole table', () => {
    const { container } = render(
      <DataTable
        caption="Three-group table"
        columns={COLUMNS}
        rows={THREE_GROUP_ROWS}
        getRowId={(row) => row.id}
        grouping={{ key: (row) => row.group, renderHeader: (groupKey) => groupKey }}
      />,
    );
    const tbodies = container.querySelectorAll('table > tbody');
    // 3 groups -> 3 <tbody> elements, never 1 shared across the whole table.
    expect(tbodies).toHaveLength(3);
    tbodies.forEach((tbody) => {
      expect(tbody.querySelectorAll('th[scope="rowgroup"]')).toHaveLength(1);
    });
  });

  it("a cell in the LAST group's accessible name derives ONLY from its own group's header — not from every prior group's header stacking in (the S1 bleed)", () => {
    render(
      <DataTable
        caption="Three-group table"
        columns={COLUMNS}
        rows={THREE_GROUP_ROWS}
        getRowId={(row) => row.id}
        grouping={{ key: (row) => row.group, renderHeader: (groupKey) => groupKey }}
      />,
    );
    const table = screen.getByRole('table', { name: 'Three-group table' });
    const lastGroupCell = within(table).getByText('Gamma two').closest('td');
    expect(lastGroupCell).not.toBeNull();

    // §2.4 G8 / A10: per the HTML header-and-scope algorithm, a
    // scope="rowgroup" header applies only within its own containing table
    // section. Bounded to Gamma's own <tbody> (post-fix), the cell's
    // applicable header set is exactly ["Gamma"] — never
    // ["Alpha", "Beta", "Gamma"], which is what one shared <tbody> across
    // all three groups would produce (each earlier group's header
    // qualifies as "in the same section, before this cell").
    const headers = rowgroupHeaderTextsFor(lastGroupCell as Element);
    expect(headers).toEqual(['Gamma']);
    expect(headers).not.toContain('Alpha');
    expect(headers).not.toContain('Beta');
  });

  it("a cell in the FIRST group's accessible name is unaffected (no headers precede it in its own section)", () => {
    render(
      <DataTable
        caption="Three-group table"
        columns={COLUMNS}
        rows={THREE_GROUP_ROWS}
        getRowId={(row) => row.id}
        grouping={{ key: (row) => row.group, renderHeader: (groupKey) => groupKey }}
      />,
    );
    const table = screen.getByRole('table', { name: 'Three-group table' });
    const firstGroupCell = within(table).getByText('Alpha two').closest('td');
    expect(rowgroupHeaderTextsFor(firstGroupCell as Element)).toEqual(['Alpha']);
  });

  it('the ungrouped case is unaffected — a single <tbody>, exactly as before this fix', () => {
    const { container } = render(
      <DataTable caption="Ungrouped table" columns={COLUMNS} rows={ROWS} getRowId={(row) => row.id} />,
    );
    expect(container.querySelectorAll('table > tbody')).toHaveLength(1);
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
