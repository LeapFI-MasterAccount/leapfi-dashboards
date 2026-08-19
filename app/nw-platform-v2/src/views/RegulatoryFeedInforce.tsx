/**
 * RegulatoryFeedInforce — view composed into `OnSideFeed.tsx` (Step 2
 * script screen), below its existing, unchanged FilterBar+DataTable signal
 * feed (and below `RegulatoryFeedSources`/`RegulatoryFeedLifecycle`, per
 * this dispatch's section order 1→2→3). Dispatch: parity_ia_addendum.md
 * Batch 2, §1.1 row `feed-inforce`.
 *
 * Base engine anchor: `osInforce()`, leapfi-platform.html 3484-3497.
 *
 * Region: "In force" section — one DataTable (C6) of `INFORCE_RULES`,
 * matching the base engine's own single-card, single-table layout
 * (3495-3496).
 *
 * Instrument deep-linking (`openInstr`, every row's second tuple element
 * is an instrument key) is NOT wired here — same disposition as
 * `RegulatoryFeedLifecycle.tsx`'s identical note: no instrument detail
 * screen/Drawer content exists in this dispatch's ALLOWLIST or anywhere
 * yet built in this worktree. Rows render as plain text; the instrument
 * key is carried on each row's derived data model for a future dispatch to
 * wire, matching `OnSideFeed.tsx`'s own precedent for an out-of-scope raw
 * action token (never rendered, kept on the model).
 *
 * Entity decoding: `&amp;` is the only entity present in `INFORCE_RULES`
 * (verified via `grep` against `data/onside.ts`) — `decodeEntities` is
 * scoped to exactly that one, matching this codebase's established
 * per-file decoding precedent.
 *
 * Accessibility: the table is real `<table>` semantics via DataTable (C6);
 * jurisdiction is rendered as a real Tag (never color-only — Tag's own
 * baseline, unmodified here).
 *
 * STOP-item — no executable test run: this worktree's `package.json` (out
 * of ALLOWLIST) has no test runner installed, matching every sibling
 * screen/view already landed here. Verified via `npx tsc --noEmit`
 * against the whole `src/` tree instead.
 */
import type { CSSProperties } from 'react';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn } from '../components/DataTable';
import { Tag } from '../components/primitives/Tag';
import { INFORCE_RULES } from '../data/onside';
import type { InforceRuleRow } from '../data/onside';

const ENTITY_MAP: Record<string, string> = { '&amp;': '&' };

/** See file header "Entity decoding." */
function decodeEntities(text: string): string {
  return text.replace(/&amp;/g, () => ENTITY_MAP['&amp;'] ?? '&');
}

const SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };
const SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
const HINT_STYLE: CSSProperties = { margin: '0 0 0.5rem', fontSize: '0.8125rem', color: 'var(--ink2)', maxWidth: '54rem' };
const SCROLL_WRAP_STYLE: CSSProperties = { overflowX: 'auto' };

interface InforceTableRow {
  id: string;
  jurisdiction: string;
  instrumentKey: string;
  title: string;
  effective: string;
  domain: string;
}

const INFORCE_ROWS: InforceTableRow[] = INFORCE_RULES.map((row: InforceRuleRow, index) => {
  const [jurisdiction, instrumentKey, title, effective, domain] = row;
  return {
    id: `${jurisdiction}::${instrumentKey}::${index}`,
    jurisdiction,
    instrumentKey,
    title: decodeEntities(title),
    effective,
    domain,
  };
});

const columns: DataTableColumn<InforceTableRow>[] = [
  { id: 'jurisdiction', header: 'Jur.', render: (row) => <Tag text={row.jurisdiction} variant="count" /> },
  { id: 'instrument', header: 'Instrument', render: (row) => <strong style={{ color: 'var(--ink)' }}>{row.title}</strong> },
  { id: 'effective', header: 'Effective', render: (row) => <span style={{ color: 'var(--ink2)' }}>{row.effective}</span> },
  { id: 'domain', header: 'Domains', render: (row) => <span style={{ color: 'var(--ink2)' }}>{row.domain}</span> },
];

export function RegulatoryFeedInforce() {
  return (
    <section aria-labelledby="regulatory-feed-inforce-heading" style={SECTION_STYLE}>
      <h2 id="regulatory-feed-inforce-heading" style={SUBHEADING_STYLE}>
        In force
      </h2>
      <p style={HINT_STYLE}>
        Detection is same-day. Each change links to the mapped obligations and documents in the register.
      </p>
      <div style={SCROLL_WRAP_STYLE}>
        <DataTable
          caption="Enacted and in-force instruments"
          columns={columns}
          rows={INFORCE_ROWS}
          getRowId={(row) => row.id}
          emptyMessage="Nothing currently in force."
        />
      </div>
    </section>
  );
}
