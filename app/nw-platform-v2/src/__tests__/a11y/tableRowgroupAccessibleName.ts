/**
 * Test oracle for `<th scope="rowgroup">` association — the portion of the
 * WHATWG HTML "header and scope" algorithm
 * (https://html.spec.whatwg.org/multipage/tables.html#header-and-scope)
 * that determines which header cells contribute to a data cell's
 * accessible name when the header is scoped to a row group.
 *
 * Per that algorithm, a `scope="rowgroup"` header applies to every cell
 * that (a) sits in the SAME table section (`<tbody>`/`<thead>`/`<tfoot>` —
 * the algorithm's row-group boundary) and (b) comes after it in document
 * order within that section. Applicable headers STACK: every qualifying
 * header contributes, not just the nearest one. This is exactly the
 * mechanism design_system_spec.md §2.4 G8 (amendment A10) identifies as
 * the Sprint 1 hostile-review S1 defect — a single shared `<tbody>` for
 * every group lets every earlier group's header stack into every later
 * group's accessible name, worst on the table's last group.
 *
 * Deliberately NOT a general accname/AT simulation. jsdom's
 * `dom-accessibility-api` (what `@testing-library/react`'s `getByRole`
 * name matching uses) does not implement the HTML-AAM table-header
 * mapping at all — confirmed by inspecting its bundled source, which has
 * no rowgroup/scope/header handling for cells. That gap is *why* the
 * original bleed shipped invisibly: `getByRole('rowheader')` and a plain
 * `<th>` existence check both pass whether or not the bleed is present.
 * This helper implements only the row-group-scope association rule
 * DataTable actually exercises, directly against rendered DOM structure,
 * so it is a minimal, faithful oracle for the real algorithm — not a mock
 * of one, and not a re-assertion of implementation details unrelated to
 * the accessible-name question the finding raises.
 */
export function rowgroupHeaderTextsFor(cell: Element): string[] {
  const section = cell.closest('tbody, thead, tfoot');
  if (!section) return [];
  const cellRow = cell.closest('tr');
  if (!cellRow) return [];
  const sectionRows = Array.from(section.querySelectorAll(':scope > tr'));
  const cellRowIndex = sectionRows.indexOf(cellRow as HTMLTableRowElement);
  if (cellRowIndex < 0) return [];

  const headers: string[] = [];
  for (let i = 0; i < cellRowIndex; i++) {
    const headerCell = sectionRows[i]?.querySelector('th[scope="rowgroup"]');
    if (headerCell) headers.push((headerCell.textContent ?? '').trim());
  }
  return headers;
}
