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
 * FIX WAVE (ONSIDE-08) — instrument deep-linking (`openInstr`, every
 * row's second tuple element is an instrument key) is now wired: rows
 * whose key resolves in `INSTR` render the instrument title as a
 * link-styled button firing `onOpenInstrument` (base 3494
 * `instrLink(r[1],r[2])`); `OnSideFeed` renders the instrument detail in
 * its shared Drawer (its `openInstr` port).
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
 * Tests: this worktree now carries Vitest + Testing Library — regression
 * coverage lives in `src/__tests__/onside/` (the earlier "no test runner
 * installed" STOP-item recorded here is resolved and removed).
 */
import type { CSSProperties, ReactNode } from 'react';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn } from '../components/DataTable';
import { Tag } from '../components/primitives/Tag';
import { INFORCE_RULES, INSTR } from '../data/onside';
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

/** Link-styled real `<button>` for an in-cell instrument link — the base
 * `.doclink` affordance (source 3494) rendered accessibly. */
const INSTRUMENT_LINK_STYLE: CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  font: 'inherit',
  fontWeight: 700,
  color: 'var(--accent)',
  textDecoration: 'underline',
  cursor: 'pointer',
  textAlign: 'left',
};

/** Columns as a function of the instrument seam (base 3494 instrLink; see
 * file header ONSIDE-08 note). */
function inforceColumns(onOpenInstrument: (instrumentKey: string) => void): DataTableColumn<InforceTableRow>[] {
  return [
    { id: 'jurisdiction', header: 'Jur.', render: (row) => <Tag text={row.jurisdiction} variant="count" /> },
    {
      id: 'instrument',
      header: 'Instrument',
      render: (row): ReactNode =>
        INSTR[row.instrumentKey] ? (
          <button type="button" style={INSTRUMENT_LINK_STYLE} onClick={() => onOpenInstrument(row.instrumentKey)}>
            {row.title}
          </button>
        ) : (
          <strong style={{ color: 'var(--ink)' }}>{row.title}</strong>
        ),
    },
    { id: 'effective', header: 'Effective', render: (row) => <span style={{ color: 'var(--ink2)' }}>{row.effective}</span> },
    { id: 'domain', header: 'Domains', render: (row) => <span style={{ color: 'var(--ink2)' }}>{row.domain}</span> },
  ];
}

export interface RegulatoryFeedInforceProps {
  /** Fired when a row's instrument title is pressed (base instrLink →
   * openInstr; see file header ONSIDE-08 note). The owning screen renders
   * the instrument detail in the shared Drawer. */
  onOpenInstrument: (instrumentKey: string) => void;
}

export function RegulatoryFeedInforce({ onOpenInstrument }: RegulatoryFeedInforceProps) {
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
          columns={inforceColumns(onOpenInstrument)}
          rows={INFORCE_ROWS}
          getRowId={(row) => row.id}
          emptyMessage="Nothing currently in force."
        />
      </div>
    </section>
  );
}
