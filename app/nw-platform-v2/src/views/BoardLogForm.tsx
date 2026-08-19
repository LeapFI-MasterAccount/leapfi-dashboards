/**
 * BoardLogForm — the "Log an update →" board-log form
 * (parity_ia_addendum.md §1.8 "Board log", line 178 / task W4, batch-8's
 * undelivered half).
 *
 * Base engine anchors (leapfi-dashboards/src/leapfi-platform.html, read-only
 * reference, pin 1c230fe): `boardUpdate` (drawer form + prior-updates list,
 * lines 3577-3587) and `boardSave` (empty-text guard + saved confirmation
 * pill, lines 3588-3593).
 *
 * DRAWER NOT OWNED HERE (dispatch + §1.8): the base engine renders this form
 * inside the one shared drawer via `showDrawer(...)` and, on save, runs the
 * sequential content swap `closeDrawer();openReport('regchange')` (source
 * line 3592) — never a second drawer instance. All of that is the composing
 * screen's job (the gate dispatch wires `Reporting.tsx`/`ReportView.tsx`):
 * the parent owns `Drawer` (its `title` carries the base `dtitle`
 * "Log an update · {id}"), the open/close state, the post-save
 * close-and-reopen sequencing, and the `BOARD_LOG` mutation itself. This
 * component is a fully controlled body slot that only emits intents.
 *
 * CONTROLLED / INTENT-ONLY (dispatch): `date` and `text` field state lives
 * in the parent (base `#bu-date`/`#bu-txt` DOM state); `onSave` is the only
 * commit intent and this file never touches `BOARD_LOG` (same
 * "component never mutates case data itself, only calls onAction" discipline
 * `CaseDetail.tsx`'s Irreversibility-gate note already established). The
 * `who`/`when` stamping (`CURRENT.first+' '+(CURRENT.role||'')`,
 * `'Aug 15, 2026'` — source line 3589) is commit-time controller behavior
 * and belongs to the parent, not to a form that only collects text.
 *
 * Empty-text guard ported verbatim (boardSave line 3588:
 * `if(!txt){$('bu-txt').focus();return;}`): the Save Button stays enabled;
 * pressing it with only-whitespace text focuses the textarea and emits no
 * intent — NOT disabled-on-empty, matching the base interaction exactly.
 *
 * AMBIGUITY RESOLVED — "Input (P6, textarea use)" (§1.8 Components column)
 * vs a single-line-only primitive: `Input.tsx`'s own header scopes P6 to
 * single-line text with no variants. The base form has BOTH fields — a
 * single-line `<input id="bu-date">` (ported as a real Input, P6) and a
 * multi-line `<textarea id="bu-txt">`, for which §2 still has no multi-line
 * primitive. Resolved exactly as `CaseDetail.tsx`'s already-landed
 * out-of-vocabulary note resolves the identical need (`case-ta`): a plain,
 * token-styled semantic `<textarea>` with a real associated `<label>` — an
 * HTML primitive the vocabulary has no composite for, not a new named
 * component. Same standing design-authority flag as CaseDetail's, restated
 * not re-opened.
 *
 * Labeling: base fields are placeholder-only labeled (an a11y violation
 * Input's P6 baseline exists to prevent). The base date placeholder
 * "Expected compliance date · e.g. Q1 2027" is split into visible label
 * "Expected compliance date" + placeholder "e.g. Q1 2027"; the textarea gets
 * visible label "Update" and keeps the base placeholder verbatim. No copy
 * invented, none dropped.
 *
 * Update history (dispatch: "update-history Label list (Label rows)"):
 * base `.list-row` prior-updates markup (line 3578) renders `u.txt` (`.n`)
 * over `'Logged '+u.when+' · '+u.who+(u.date?' · target '+u.date:'')`
 * (`.s`). Ported as `CaseDetail.tsx`'s exact history-row precedent (eyebrow
 * Label for the timestamp, body-secondary Labels for the text lines):
 * eyebrow "Logged {when}", body-secondary {txt}, body-secondary
 * "{who}[ · target {date}]" — every base token preserved, redistributed
 * across Label's only two variants. Section renders only when entries exist
 * (base `prior?...:''`, line 3585) under a real heading (Label's own
 * "eyebrow never the only accessible name" baseline).
 *
 * Saved confirmation: base `#bu-ok` pill-soft "Saved to the standing view"
 * (line 3583, revealed by boardSave). Here a `saved` prop the parent flips
 * after committing; rendered inside an always-mounted `role="status"` region
 * so the reveal is announced, styled as a token pill (per-file style
 * duplication per convention).
 */
import { useId, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Input } from '../components/primitives/Input';
import { Button } from '../components/primitives/Button';
import { Label } from '../components/primitives/Label';
import type { BoardLogEntry } from '../data/boardLog';

export interface BoardLogFormProps {
  /** Prior updates for this standing row (`BOARD_LOG[id]`), newest first
   * (the commit unshifts, matching base `boardSave`). */
  entries: BoardLogEntry[];
  /** Controlled "Expected compliance date" field (base `#bu-date`). */
  date: string;
  onDateChange: (value: string) => void;
  /** Controlled update textarea (base `#bu-txt`). */
  text: string;
  onTextChange: (value: string) => void;
  /** Save intent — emitted only when `text` trims non-empty (base
   * boardSave's own guard; see file header). The parent owns the actual
   * `BOARD_LOG` mutation, who/when stamping, and the
   * close-drawer-then-reopen-report sequence. */
  onSave: () => void;
  /** True while the parent is committing the update — disables both fields
   * and puts the Save Button in its loading state. */
  saving?: boolean;
  /** True once the parent has committed — reveals the base engine's
   * "Saved to the standing view" confirmation pill (`#bu-ok`). */
  saved?: boolean;
}

const WRAP_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const FORM_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const SAVE_ROW_STYLE: CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' };
/** Same token-styled semantic textarea CaseDetail.tsx already ships (see
 * file header) — duplicated per the codebase's per-file style convention. */
const TEXTAREA_LABEL_STYLE: CSSProperties = { display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', color: 'var(--ink2)' };
const TEXTAREA_STYLE: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  font: 'inherit',
  fontSize: '0.9375rem',
  lineHeight: 1.6,
  color: 'var(--ink)',
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm, 6px)',
  padding: '0.75rem',
  minHeight: '7rem',
  resize: 'vertical',
  outline: 'none',
};
/** Base `.pill-soft` equivalent, token-only. */
const SAVED_PILL_STYLE: CSSProperties = {
  display: 'inline-block',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'var(--ink)',
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: '999px',
  padding: '0.25rem 0.75rem',
};
const SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--ink)' };
const HISTORY_LIST_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };
const HISTORY_ROW_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.15rem', borderLeft: '2px solid var(--border)', paddingLeft: '0.75rem' };

export function BoardLogForm({
  entries,
  date,
  onDateChange,
  text,
  onTextChange,
  onSave,
  saving = false,
  saved = false,
}: BoardLogFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = useId();
  const historyHeadingId = useId();

  /** Verbatim port of boardSave's guard (source line 3588) — empty text
   * focuses the textarea instead of emitting the intent. */
  const handleSavePress = () => {
    if (!text.trim()) {
      textareaRef.current?.focus();
      return;
    }
    onSave();
  };

  return (
    <div data-lf-view="board-log-form" style={WRAP_STYLE}>
      {/* Base `dcat`, line 3581. Paired with the parent Drawer's own heading
        * (its `title` carries the base `dtitle`), so this eyebrow is never
        * the only accessible name — Label's a11y baseline. */}
      <Label text="Board reporting · open item" variant="eyebrow" />

      <div style={FORM_STYLE}>
        <Input
          label="Expected compliance date"
          placeholder="e.g. Q1 2027"
          value={date}
          onChange={onDateChange}
          disabled={saving}
        />
        <div>
          <label htmlFor={textareaId} style={TEXTAREA_LABEL_STYLE}>
            Update
          </label>
          <textarea
            ref={textareaRef}
            id={textareaId}
            style={TEXTAREA_STYLE}
            placeholder="What has been done, what is in progress, what is blocked…"
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            disabled={saving}
          />
        </div>
        <div style={SAVE_ROW_STYLE}>
          <Button variant="primary" label="Save update" loading={saving} disabled={saving} onPress={handleSavePress} />
          <span role="status">
            {saved ? <span style={SAVED_PILL_STYLE}>Saved to the standing view</span> : null}
          </span>
        </div>
      </div>

      {entries.length > 0 ? (
        <section aria-labelledby={historyHeadingId} style={HISTORY_LIST_STYLE}>
          {/* Base `.dsec > .dh` "Update history", line 3585. */}
          <h3 id={historyHeadingId} style={SUBHEADING_STYLE}>Update history</h3>
          <div style={HISTORY_LIST_STYLE}>
            {entries.map((entry, index) => (
              // eslint-disable-next-line react/no-array-index-key -- entries are prepended (unshift) per save; rows never reorder independently of that prepend, so index is a stable enough key for this session-local list (same justification as CaseDetail.tsx's history rows)
              <div key={index} style={HISTORY_ROW_STYLE}>
                <Label text={`Logged ${entry.when}`} variant="eyebrow" />
                <Label text={entry.txt} variant="body-secondary" />
                <Label text={`${entry.who}${entry.date ? ` · target ${entry.date}` : ''}`} variant="body-secondary" />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
