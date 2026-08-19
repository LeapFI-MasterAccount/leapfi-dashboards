/**
 * RegulatoryFeedLifecycle — view composed into `OnSideFeed.tsx` (Step 2
 * script screen), below its existing, unchanged FilterBar+DataTable signal
 * feed (and below `RegulatoryFeedSources`, per this dispatch's section
 * order 1→2→3). Dispatch: parity_ia_addendum.md Batch 2, §1.1 row
 * `feed-lifecycle`.
 *
 * Base engine anchor: `osLifecycle()`, leapfi-platform.html 3450-3483.
 *
 * Region: "Rulemaking lifecycle" section — two DataTables (C6): "Newly
 * proposed" (`NEW_RULES`) and "Pending & tracked" (`TRACKED_RULES`),
 * matching the base engine's own two-card split (3479-3482).
 *
 * FIX WAVE (ONSIDE-05) — the base engine's `lcBar()` "Area" scope filter
 * IS ported (base 3452-3477: `LC_SCOPE`/`setLcScope`/`lcMatch`, a 9-option
 * single-select strip that narrows BOTH tables to one officer's domain,
 * with the note 'Filtered to what each officer oversees'). The prior
 * shipped omission (recorded here as a SCOPE NOTE STOP-item pending
 * addendum ratification) was confirmed as a D16 functional-parity hole in
 * the fix-wave review — the addendum's own cited anchor range for this
 * view (3450-3483) contains lcBar, and the retained base empty-state copy
 * ('No new proposals in this area.' / 'Nothing tracked in this area.')
 * only makes sense downstream of it. `lcMatch` ports the base's substring
 * match over each row's domains text verbatim. Rendered as single-select
 * Chips (P5 `filter`), the same pre-authorized pattern
 * `RegulatoryFeedSources`' digest-frequency picker already uses.
 *
 * AMBIGUITY RESOLVED — the "New" status tag on every `NEW_RULES` row is
 * unconditional in source, not data-driven: `osLifecycle()`'s own render
 * function (3466) always prepends `<span class="tag info">New</span>` to
 * every proposal's status cell regardless of row content — it is a literal
 * part of the *rendering*, not a field any `NewRuleRow` tuple carries. This
 * file ports that same unconditional prepend via a real `Tag`
 * (`variant="count"`, matching this codebase's existing precedent for a
 * ported inline "New" badge — `OnSideFeed.tsx`'s `parseNoteBadge`) rather
 * than inventing a new "isNew" data flag that doesn't exist in `onside.ts`.
 *
 * AMBIGUITY RESOLVED — one `TRACKED_RULES` status string
 * (`'<span style="color:var(--sem2);font-weight:700">Effective now</span>'`,
 * the CFPB/2026-C1 row) carries inline, verbatim source markup, same shape
 * as the "status tags on signal rows" case `OnSideFeed.tsx` already
 * resolved. `parseInlineStatus` below extracts that text and renders it
 * through the real `Tag` primitive (`status-positive` — `--sem2` in the
 * read-only source maps to a positive/in-force signal, and `tokens.css`'s
 * closest named role for that meaning is `--sem-positive`) instead of
 * `dangerouslySetInnerHTML`. Every other `TRACKED_RULES` row's status is
 * plain text and renders as plain text — never a fabricated Tag for rows
 * that don't carry one in source.
 *
 * FIX WAVE (ONSIDE-08) — instrument deep-linking (`openInstr`, the
 * `TRACKED_RULES` rows whose second tuple element is an instrument key) is
 * now wired: rows carrying a key that resolves in `INSTR` render their
 * Item as a link-styled button firing `onOpenInstrument` (base 3477
 * `r[1]?instrLink(r[1],r[2]):r[2]`); `OnSideFeed` renders the instrument
 * detail in its shared Drawer (its `openInstr` port).
 *
 * Entity decoding: `&amp;` and `&ndash;` are the only entities present in
 * `NEW_RULES`/`TRACKED_RULES` (verified via `grep` against `data/onside.ts`)
 * — `decodeEntities` is scoped to exactly those two, matching this
 * codebase's established per-file decoding precedent.
 *
 * Accessibility: both tables are real `<table>` semantics via DataTable
 * (C6); every status Tag pairs color with a text status word (Tag's own
 * baseline, unmodified here).
 *
 * Tests: this worktree now carries Vitest + Testing Library — regression
 * coverage lives in `src/__tests__/onside/` (the earlier "no test runner
 * installed" STOP-item recorded here is resolved and removed).
 */
import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn } from '../components/DataTable';
import { Chip } from '../components/primitives/Chip';
import { Tag } from '../components/primitives/Tag';
import { INSTR, NEW_RULES, TRACKED_RULES } from '../data/onside';
import type { NewRuleRow, TrackedRuleRow } from '../data/onside';

const ENTITY_MAP: Record<string, string> = { '&amp;': '&', '&ndash;': '–' };

/** See file header "Entity decoding." */
function decodeEntities(text: string): string {
  return text.replace(/&(amp|ndash);/g, (match) => ENTITY_MAP[match] ?? match);
}

const INLINE_STATUS_PATTERN = /^<span[^>]*>([^<]*)<\/span>$/i;

/** See file header "one TRACKED_RULES status string carries inline markup." */
function parseInlineStatus(raw: string): { text: string; emphasized: boolean } {
  const decoded = decodeEntities(raw);
  const match = INLINE_STATUS_PATTERN.exec(decoded);
  if (!match) return { text: decoded, emphasized: false };
  return { text: match[1] ?? '', emphasized: true };
}

const SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };
const SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
const CARD_HEADING_STYLE: CSSProperties = { margin: '0 0 0.25rem', font: 'inherit', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--ink)' };
const CARD_HINT_STYLE: CSSProperties = { margin: '0 0 0.5rem', fontSize: '0.8125rem', color: 'var(--ink2)', maxWidth: '54rem' };
const SCROLL_WRAP_STYLE: CSSProperties = { overflowX: 'auto' };
const CARD_BLOCK_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };
const PROPOSAL_CELL_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '28rem' };
const PROPOSAL_TITLE_STYLE: CSSProperties = { color: 'var(--ink)', fontSize: '0.9375rem', fontWeight: 600 };
const PROPOSAL_NOTE_STYLE: CSSProperties = { color: 'var(--ink2)', fontSize: '0.8125rem' };
const STATUS_CELL_STYLE: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' };

interface NewRuleTableRow {
  id: string;
  source: string;
  title: string;
  rationale: string;
  status: string;
  domains: string;
}

const NEW_RULE_ROWS: NewRuleTableRow[] = NEW_RULES.map((row: NewRuleRow, index) => {
  const [source, title, status, domains, rationale] = row;
  return { id: `${source}::${index}`, source, title: decodeEntities(title), rationale: decodeEntities(rationale), status: decodeEntities(status), domains: decodeEntities(domains) };
});

interface TrackedRuleTableRow {
  id: string;
  source: string;
  instrumentKey: string | null;
  title: string;
  statusText: string;
  statusEmphasized: boolean;
  domains: string;
}

const TRACKED_RULE_ROWS: TrackedRuleTableRow[] = TRACKED_RULES.map((row: TrackedRuleRow, index) => {
  const [source, instrumentKey, title, status, domains] = row;
  const parsedStatus = parseInlineStatus(status);
  return {
    id: `${source}::${index}`,
    source,
    instrumentKey,
    title: decodeEntities(title),
    statusText: parsedStatus.text,
    statusEmphasized: parsedStatus.emphasized,
    domains: decodeEntities(domains),
  };
});

const newRuleColumns: DataTableColumn<NewRuleTableRow>[] = [
  { id: 'source', header: 'Source', render: (row) => <Tag text={row.source} variant="count" /> },
  {
    id: 'proposal',
    header: 'Proposal',
    render: (row): ReactNode => (
      <span style={PROPOSAL_CELL_STYLE}>
        <span style={PROPOSAL_TITLE_STYLE}>{row.title}</span>
        <span style={PROPOSAL_NOTE_STYLE}>{row.rationale}</span>
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    render: (row): ReactNode => (
      <span style={STATUS_CELL_STYLE}>
        <Tag text="New" variant="count" />
        <span>{row.status}</span>
      </span>
    ),
  },
  { id: 'domains', header: 'Would touch', render: (row) => <span style={{ color: 'var(--ink2)' }}>{row.domains}</span> },
];

/** Link-styled real `<button>` for an in-cell instrument link — the base
 * `.doclink` affordance (source 3477) rendered accessibly. */
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

/** Columns as a function of the instrument seam — the Item cell needs
 * `onOpenInstrument` (base 3477 instrLink; see file header ONSIDE-08 note). */
function trackedRuleColumns(onOpenInstrument: (instrumentKey: string) => void): DataTableColumn<TrackedRuleTableRow>[] {
  return [
    { id: 'source', header: 'Source', render: (row) => <Tag text={row.source} variant="count" /> },
    {
      id: 'item',
      header: 'Item',
      render: (row): ReactNode =>
        row.instrumentKey !== null && INSTR[row.instrumentKey] ? (
          <button type="button" style={INSTRUMENT_LINK_STYLE} onClick={() => onOpenInstrument(row.instrumentKey as string)}>
            {row.title}
          </button>
        ) : (
          <strong style={{ color: 'var(--ink)' }}>{row.title}</strong>
        ),
    },
    {
      id: 'status',
      header: 'Status',
      render: (row): ReactNode =>
        row.statusEmphasized ? <Tag text={row.statusText} variant="status-positive" /> : <span style={{ color: 'var(--ink2)' }}>{row.statusText}</span>,
    },
    { id: 'domains', header: 'Domains touched', render: (row) => <span style={{ color: 'var(--ink2)' }}>{row.domains}</span> },
  ];
}

/** Base lcBar area list, verbatim (source 3455). Keys are substring-matched
 * against each row's domains text (base lcMatch, source 3460). */
const LC_AREAS: [string, string][] = [
  ['all', 'All areas'],
  ['Model Risk', 'Model Risk'],
  ['Third-Party', 'Third-Party Risk'],
  ['BSA', 'BSA / AML'],
  ['Fair Lending', 'Fair Lending'],
  ['Consumer', 'Consumer / UDAAP'],
  ['InfoSec', 'InfoSec'],
  ['AI Governance', 'AI Governance'],
  ['Capital', 'Capital'],
];

const SCOPE_BAR_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '0.5rem',
};
const SCOPE_LABEL_STYLE: CSSProperties = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)' };
const SCOPE_NOTE_STYLE: CSSProperties = { fontSize: '0.75rem', color: 'var(--ink2)' };

export interface RegulatoryFeedLifecycleProps {
  /** Fired when a tracked row carrying an instrument key is pressed (base
   * instrLink → openInstr; see file header ONSIDE-08 note). The owning
   * screen renders the instrument detail in the shared Drawer. */
  onOpenInstrument: (instrumentKey: string) => void;
}

export function RegulatoryFeedLifecycle({ onOpenInstrument }: RegulatoryFeedLifecycleProps) {
  // Base LC_SCOPE (source 3452) — single-select officer scoping of BOTH
  // tables; see file header ONSIDE-05 note.
  const [scope, setScope] = useState('all');
  const lcMatch = (domains: string) => scope === 'all' || domains.includes(scope);

  const scopedNewRules = NEW_RULE_ROWS.filter((row) => lcMatch(row.domains));
  const scopedTrackedRules = TRACKED_RULE_ROWS.filter((row) => lcMatch(row.domains));

  return (
    <section aria-labelledby="regulatory-feed-lifecycle-heading" style={SECTION_STYLE}>
      <h2 id="regulatory-feed-lifecycle-heading" style={SUBHEADING_STYLE}>
        Rulemaking lifecycle
      </h2>

      <div style={SCOPE_BAR_STYLE} role="group" aria-label="Area">
        <span style={SCOPE_LABEL_STYLE}>Area</span>
        {LC_AREAS.map(([key, label]) => (
          <Chip key={key} text={label} variant="filter" selected={scope === key} onPress={() => setScope(key)} />
        ))}
        <span style={SCOPE_NOTE_STYLE}>Filtered to what each officer oversees</span>
      </div>

      <div style={CARD_BLOCK_STYLE}>
        <h3 style={CARD_HEADING_STYLE}>Newly proposed · the strategy signal</h3>
        <p style={CARD_HINT_STYLE}>
          New proposed rulemakings are the biggest impact to strategy, so they surface here the day they
          post — captured while the comment window is open and positions can still be shaped, before they
          harden into obligations.
        </p>
        <div style={SCROLL_WRAP_STYLE}>
          <DataTable
            caption="Newly proposed rulemakings"
            columns={newRuleColumns}
            rows={scopedNewRules}
            getRowId={(row) => row.id}
            emptyMessage="No new proposals in this area."
          />
        </div>
      </div>

      <div style={CARD_BLOCK_STYLE}>
        <h3 style={CARD_HEADING_STYLE}>Pending &amp; tracked</h3>
        <p style={CARD_HINT_STYLE}>
          Proposal through effect, tracked to the domains each item would touch, including
          held-up-in-court and back-for-comment states — lifecycle status, never a hard-coded assumption.
        </p>
        <div style={SCROLL_WRAP_STYLE}>
          <DataTable
            caption="Pending and tracked rulemakings"
            columns={trackedRuleColumns(onOpenInstrument)}
            rows={scopedTrackedRules}
            getRowId={(row) => row.id}
            emptyMessage="Nothing tracked in this area."
          />
        </div>
      </div>
    </section>
  );
}
