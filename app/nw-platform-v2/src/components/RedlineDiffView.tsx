/**
 * RedlineDiffView — Composite C9 (design_system_spec.md §2.2)
 *
 * "Built from: inserted/deleted text spans + Tag (`hitl`)." Renders the
 * legal-language before/after pair as a real word-level diff (not two
 * plain, undiffed paragraphs) so the specific inserted and deleted spans
 * are individually markable — this is what makes the composite's own
 * "built from ... text spans" phrase literal rather than aspirational. The
 * source read-only reference's `rlPair` (leapfi-platform.html 1754–59)
 * juxtaposes two whole paragraphs with no span-level diff; this component
 * upgrades that shape to match §2.2 C9's stated composition while keeping
 * the same Before/After framing the reference and the dispatch brief both
 * use.
 *
 * A11y baseline (spec): "Insertions/deletions are never color-only — each
 * carries a text-equivalent marker (e.g. a '+'/'–' glyph or `aria-label`
 * prefix) so the diff is legible without color." Implemented with both: a
 * visible `+`/`–` glyph character precedes each inserted/deleted span
 * (works with color perception off entirely, e.g. print or high-contrast
 * forced-colors), AND semantic `<ins>`/`<del>` elements carry the
 * insertion/deletion meaning structurally for assistive tech that surfaces
 * them, on top of the color treatment.
 *
 * AMBIGUITY RESOLVED — action slots vs. owned Buttons: the dispatch brief
 * calls for "adopt/reject action slots," but §2.2 C9's own "Built from"
 * list names only text spans + Tag — no Button. §5.3 confirms Adopt/Reject
 * actually live in the Drawer's *footer* (C7), not inside RedlineDiffView:
 * "row/drawer-level 'Adopt' (Button, primary, in the Drawer footer once a
 * redline is open), paired with 'Reject'". I reconciled this by exposing
 * `adoptSlot`/`rejectSlot` as `ReactNode` slots (not by having this
 * component construct its own Button primitives) — the composing screen
 * (§5.3, outside this dispatch) passes its own Button elements into these
 * slots, typically the same elements it also places in the Drawer's
 * footer, or a self-contained pair if a screen wants them inline instead.
 * This keeps C9's "built from" list accurate (no Button dependency baked
 * into this file) while still satisfying the brief's literal ask for
 * adopt/reject slots on this component.
 *
 * Word-level diff: a standard LCS-backed word diff, implemented locally
 * (no npm install permitted by the dispatch's hard rules, and this
 * dispatch's allowlist has no shared-utils file to host it in, so it lives
 * here rather than being extracted).
 */
import { useMemo } from 'react';
import { Tag } from './primitives/Tag';
import { Label } from './primitives/Label';
import type { ReactNode } from 'react';

interface DiffPart {
  type: 'equal' | 'insert' | 'delete';
  text: string;
}

/** Splits on whitespace boundaries while keeping the whitespace as its own tokens, so reassembled text preserves original spacing. */
function tokenize(text: string): string[] {
  return text.match(/\S+|\s+/g) ?? [];
}

function computeLcsTable(a: string[], b: string[]): number[][] {
  const n = a.length;
  const m = b.length;
  const table: number[][] = [];
  for (let i = 0; i <= n; i++) {
    table.push(new Array<number>(m + 1).fill(0));
  }
  for (let i = n - 1; i >= 0; i--) {
    const row = table[i]!;
    const nextRow = table[i + 1]!;
    for (let j = m - 1; j >= 0; j--) {
      row[j] = a[i] === b[j] ? nextRow[j + 1]! + 1 : Math.max(nextRow[j]!, row[j + 1]!);
    }
  }
  return table;
}

function mergeAdjacent(parts: DiffPart[]): DiffPart[] {
  const merged: DiffPart[] = [];
  for (const part of parts) {
    const last = merged[merged.length - 1];
    if (last && last.type === part.type) {
      last.text += part.text;
    } else {
      merged.push({ type: part.type, text: part.text });
    }
  }
  return merged;
}

function diffWords(before: string, after: string): DiffPart[] {
  const a = tokenize(before);
  const b = tokenize(after);
  const table = computeLcsTable(a, b);
  const parts: DiffPart[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const tokenA = a[i]!;
    const tokenB = b[j]!;
    if (tokenA === tokenB) {
      parts.push({ type: 'equal', text: tokenA });
      i++;
      j++;
      continue;
    }
    const skipA = table[i + 1]![j]!;
    const skipB = table[i]![j + 1]!;
    if (skipA >= skipB) {
      parts.push({ type: 'delete', text: tokenA });
      i++;
    } else {
      parts.push({ type: 'insert', text: tokenB });
      j++;
    }
  }
  while (i < a.length) {
    parts.push({ type: 'delete', text: a[i]! });
    i++;
  }
  while (j < b.length) {
    parts.push({ type: 'insert', text: b[j]! });
    j++;
  }
  return mergeAdjacent(parts);
}

function renderBefore(parts: DiffPart[]): ReactNode[] {
  return parts
    .filter((part) => part.type !== 'insert')
    .map((part, index) =>
      part.type === 'delete' ? (
        // eslint-disable-next-line react/no-array-index-key -- static per-render diff segment list, order never changes
        <del
          key={index}
          style={{
            color: 'var(--sem-alert)',
            background: 'color-mix(in srgb, var(--sem-alert) 16%, transparent)',
            borderRadius: '2px',
            padding: '0 0.15em',
          }}
        >
          <span aria-hidden="true">– </span>
          {part.text}
        </del>
      ) : (
        // eslint-disable-next-line react/no-array-index-key -- static per-render diff segment list, order never changes
        <span key={index}>{part.text}</span>
      ),
    );
}

function renderAfter(parts: DiffPart[]): ReactNode[] {
  return parts
    .filter((part) => part.type !== 'delete')
    .map((part, index) =>
      part.type === 'insert' ? (
        // eslint-disable-next-line react/no-array-index-key -- static per-render diff segment list, order never changes
        <ins
          key={index}
          style={{
            color: 'var(--sem-positive)',
            background: 'color-mix(in srgb, var(--sem-positive) 16%, transparent)',
            textDecoration: 'none',
            borderRadius: '2px',
            padding: '0 0.15em',
          }}
        >
          <span aria-hidden="true">+ </span>
          {part.text}
        </ins>
      ) : (
        // eslint-disable-next-line react/no-array-index-key -- static per-render diff segment list, order never changes
        <span key={index}>{part.text}</span>
      ),
    );
}

export interface RedlineDiffViewProps {
  /** Prior legal-language text. */
  before: string;
  /** Proposed legal-language text. */
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  /** Renders the HITL Tag (spec: "+ Tag (`hitl`)"). */
  hitl?: boolean;
  hitlText?: string;
  loading?: boolean;
  /** Slot for the composing screen's own Adopt Button — see the file-header ambiguity note. */
  adoptSlot?: ReactNode;
  /** Slot for the composing screen's own Reject Button. */
  rejectSlot?: ReactNode;
}

const DEFAULT_BEFORE_LABEL = 'Before';
const DEFAULT_AFTER_LABEL = 'After';
const DEFAULT_HITL_TEXT = 'HITL review';
const SKELETON_LINE_COUNT = 3;

export function RedlineDiffView({
  before,
  after,
  beforeLabel = DEFAULT_BEFORE_LABEL,
  afterLabel = DEFAULT_AFTER_LABEL,
  hitl = false,
  hitlText = DEFAULT_HITL_TEXT,
  loading = false,
  adoptSlot,
  rejectSlot,
}: RedlineDiffViewProps) {
  const parts = useMemo(() => diffWords(before, after), [before, after]);

  return (
    <div data-lf-composite="redline-diff-view" data-state={loading ? 'loading' : 'loaded'}>
      {hitl ? (
        <div style={{ marginBottom: '0.75rem' }}>
          <Tag text={hitlText} variant="hitl" />
        </div>
      ) : null}

      {loading ? (
        <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {Array.from({ length: SKELETON_LINE_COUNT }, (_, index) => (
            // eslint-disable-next-line react/no-array-index-key -- fixed-length skeleton placeholder list, order never changes
            <div
              key={index}
              style={{
                height: '0.9rem',
                width: index === SKELETON_LINE_COUNT - 1 ? '70%' : '100%',
                borderRadius: 'var(--radius-xs, 4px)',
                background: 'var(--border)',
                opacity: 0.5,
                animation: 'lf-redline-diff-skeleton-pulse 1.4s ease-in-out infinite',
                animationDelay: `${index * 120}ms`,
              }}
            />
          ))}
          <style>{`
            @keyframes lf-redline-diff-skeleton-pulse {
              0%, 100% { opacity: 0.35; }
              50% { opacity: 0.7; }
            }
          `}</style>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <Label text={beforeLabel} variant="eyebrow" />
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--ink2)' }}>
              {renderBefore(parts)}
            </p>
          </div>
          <div>
            <Label text={afterLabel} variant="eyebrow" />
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--ink)' }}>
              {renderAfter(parts)}
            </p>
          </div>
        </div>
      )}

      {adoptSlot || rejectSlot ? (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
          {adoptSlot}
          {rejectSlot}
        </div>
      ) : null}
    </div>
  );
}
