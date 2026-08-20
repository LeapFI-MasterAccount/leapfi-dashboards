/**
 * CaseDetail — view composed into `screens/Cases.tsx`'s detail state
 * (parity_ia_addendum.md §1.1 `case:ID` row / Batch 4).
 *
 * Base engine anchor: `osCasePage` (leapfi-platform.html 2854-2903) for the
 * region layout; case action handlers `caseAccept`/`caseCondPick`/
 * `caseConditional`/`caseRouteLegal`/`caseOpinion`/`caseMinutes`/
 * `caseCondMet`/`caseApprove`/`caseReject`/`caseReopen`/`caseEdit`/
 * `caseSaveLang`/`caseCancelEdit`/`caseRevert` (2668-2767); `caseWaitingOn`/
 * `canAct` (2617-2624); `caseStagePill`/`caseStageOwner` (2607-2621).
 *
 * NOT the shared Drawer (dispatch brief, restated from the addendum): the
 * base engine never routes `case:` pages through `#drawer` — `showDrawer`
 * is never called for a case page, only `onsideShow('case:'+cid)` (a plain
 * view swap). This file is that swap's content, rendered in-page by
 * `Cases.tsx`, not inside `Drawer`/`DrawerContent`. DrawerContent's field-
 * row shape is deliberately not reused here — this is a multi-step
 * approve/route/reject + free-text-edit flow DrawerContent (§2.2 C8,
 * `kind: signal/play/doc` only) was never built to carry; the field rows,
 * Tags, and Buttons below are composed directly, matching the addendum's
 * own reasoning for this row (§1.1 `case:ID`).
 *
 * Back affordance: ghost Button, "← All cases," matching the base engine's
 * `src-back` pattern (`.src-back{...cursor:pointer...}`, line 557-558;
 * `<div class="src-back" onclick="onsideShow('cases')">← All cases</div>`,
 * line 2881) — implemented as a real `Button` (`ghost` variant, `chevron-
 * left` icon) rather than a styled `<div onclick>`, since a real button is
 * the accessible/keyboard-operable equivalent of that clickable div.
 *
 * RedlineDiffView (C9) for proposed-language before/after: `before` is the
 * document's in-force text (`doc.redline.old`), `after` is the case's
 * current proposed language (`caseItem.lang`, which starts equal to
 * `doc.redline.nw` and diverges only if the analyst edits it — base engine
 * 2769-2903's own `rl-old`/`rl-new`/`rl-base` structure). This intentionally
 * does NOT use RedlineDiffView's `adoptSlot`/`rejectSlot` — this screen's
 * action set is the full per-stage role-gated set (Accept/Conditional/
 * Route to counsel/Reject/Clear/Return/Attach minutes/Record met/Reopen),
 * not a single generic adopt-or-reject pair, so the action row is composed
 * directly below the diff (RedlineDiffView's own file header already
 * anticipates this: "the composing screen... typically the same elements
 * it also places in the Drawer's footer, **or a self-contained pair if a
 * screen wants them inline instead**" — this screen is the "self-contained"
 * case, just with a bigger action set than a plain pair).
 *
 * Role-gated primary action (Core Principle 2 — never two competing
 * approve-shaped primary buttons, task's own explicit callback to this
 * persona's formative failure): per stage, at most one Button renders with
 * `variant="primary"`. At the `cro` stage specifically, a committee-tier
 * case (`tierOf(tier).committee`) renders ONLY "Conditional approval…" as
 * primary (final approval cannot happen without the committee vote, so no
 * separate "Final approval & adopt" primary competes with it); a non-
 * committee-tier case renders "Final approval & adopt" as primary and
 * demotes "Approve with a condition…" to `ghost` — this is a literal port
 * of the base engine's own `T.committee ? condPick-primary :
 * (approve-primary + condPick-ghost)` branch (2837-2839), which already
 * enforces the same one-primary rule the task calls out explicitly.
 * While the language editor is open (`editing`), the stage action row is
 * NOT rendered at all — "Save the language" is the only primary on screen
 * (CS-06: the base renders both concurrently, but the twin's own
 * one-primary doctrine binds regardless; this also removes the mid-edit
 * "Accept" hazard where the case would route with the pre-edit text while
 * the typed draft was silently discarded).
 *
 * FIX-WAVE NOTES (cases batch — each anchored to leapfi-platform.html at
 * pin 1c230fe):
 *  - CS-02: the stage-progress strip uses the base's explicit `IDX` stage
 *    index map (source 2821) instead of `stageSet.findIndex` — 'legal',
 *    'final' and 'rejected' are not keys of CASE_STAGES/CASE_STAGES_B, so
 *    findIndex returned -1 and every step went neutral grey.
 *  - CS-05: the non-actor wait notes are the base's five stage-specific
 *    notes (source 2835/2849/2855/2861/2868), not one generic sentence —
 *    only the `cro` stage's note claims "notified in the app and by
 *    email" (that is the only stage the base notifies by email).
 *  - CS-08: restored dropped affordances whose twin targets exist —
 *    Document meta row + closed-state "Open the document →" (base
 *    openDocView; twin target `onside.documents` via `onNavigate`),
 *    "matrix →" (base `go('settings')`; twin `settings.toggles`),
 *    committee-stage "Open the board report" (base
 *    `openReport('gapboard')`; twin `reporting` — the report deep-link
 *    itself lives in Reporting, outside this batch), and the in-context
 *    "Sign in as X …" switch-user links (base switchUser; twin via
 *    `onSwitchUser`, rendered only when the composing screen supplies the
 *    callback). `onNavigate`/`onSwitchUser` are optional so the view
 *    degrades honestly when a composer has no routing to offer.
 *  - CS-01 (email beat): "View the email you were sent" (base 2846) +
 *    the email-preview drawer (base openEmail, 2650-2664) restored in the
 *    cro action row, rendered via the shared `Drawer` (C7).
 *  - CS-10: the closed-state diff carries the base's captions ("prior
 *    text, archived on adoption" / "adopted and in force", base 2872-2875)
 *    plus a visible "Adopted" Tag; the previously-dead
 *    `hitlText='Adopted'` branch (unreachable because `hitl` was false
 *    exactly when it applied) is removed.
 *  - CS-13: pressing a condition keeps the picker mounted so the pressed
 *    option's own Button shows `loading` for the commit window
 *    (`committingCondition`); the picker closes when the stage actually
 *    flips — restoring the pessimistic-render guarantee this header
 *    claims for every action.
 *
 * Free-text edit control — AMBIGUITY RESOLVED / STOP-item: the base engine
 * edits the proposed language in a `<textarea class="case-ta">` (multi-line
 * legal text). design_system_spec.md §2.1 P6 Input is explicitly scoped to
 * "single-line text" only ("no variant prop is exposed since there is
 * nothing to select between" — `Input.tsx`'s own file header) — there is no
 * multi-line text-entry primitive anywhere in §2's 12 primitives / 22
 * composites. Forcing this into a single-line Input would silently break
 * the interaction (a legal-language paragraph does not fit one line);
 * inventing a new named primitive for one screen would violate §8's reuse
 * discipline ("extend the vocabulary in §2 before proposing anything new,"
 * with a 4-point justification bar this dispatch's allowlist has no
 * standing to clear). Resolved the same way `RedlineDiffView`/`DataTable`
 * already resolve their own out-of-vocabulary needs (raw `<ins>/<del>`,
 * raw `<table>` semantics): a plain, token-styled semantic `<textarea>`
 * with a real, associated `<label>` — not a new named component, just an
 * HTML primitive the vocabulary has no composite for. Flagged here for
 * design-authority confirmation, not silently built as if §2.1 covered it.
 *
 * Irreversibility gate (persona directive 6): every case-stage transition
 * in this file goes through `Cases.tsx`'s single `performAction` commit
 * pipeline (see that file's header) — this component never mutates case
 * data itself, only calls `onAction(kind, payload)`. Buttons are disabled
 * whenever `pendingAction` is non-null (only one case action in flight at a
 * time, matching `OnSideDocuments.tsx`'s `adoptingDocId` precedent), and
 * the in-flight action's own Button shows `loading` (spinner, `aria-busy`)
 * rather than a silently-still-clickable control — the pessimistic-render
 * guarantee itself (the request-key dedup that makes a slipped-through
 * double-press a no-op) lives in `Cases.tsx`, not here.
 *
 * Accessibility gate (persona directive 7): back Button and every action
 * Button are real `<button>` elements (keyboard-operable, real focus ring
 * via `Button`'s own `--focus-ring` handling); the free-text `<textarea>`
 * carries a real associated `<label>`; stage/status meaning is always
 * paired with text via `Tag` (never color-only, per Tag's own a11y
 * baseline); the history list's timestamp/action/actor fields render via
 * `Label` (P3) per the dispatch brief's own "CaseHistoryEntry rows via
 * Label" instruction — Label's two variants (`eyebrow`/`body-secondary`)
 * are the only weights available, so the timestamp uses `eyebrow` and the
 * action/actor/note text uses `body-secondary`; this is a flatter visual
 * hierarchy than the base engine's bolded `.ch-t`, a known, accepted
 * consequence of the brief's own component choice, not an oversight.
 */
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Drawer } from '../components/Drawer';
import { RedlineDiffView } from '../components/RedlineDiffView';
import { Button } from '../components/primitives/Button';
import type { ButtonVariant } from '../components/primitives/Button';
import { Tag } from '../components/primitives/Tag';
import type { NonRaciTagVariant } from '../components/primitives/Tag';
import { Label } from '../components/primitives/Label';
import { APPROVAL, CASE_STAGES, CASE_STAGES_B, tierOf } from '../data/cases';
import type { Case } from '../data/cases';
import type { DocEntry } from '../data/doclib';
import type { StudioUser } from '../data/studio';
import { DOMAINS } from '../data/onside';

export type CaseActionKind =
  | 'accept'
  | 'reject'
  | 'route-legal'
  | 'approve'
  | 'opinion-clear'
  | 'opinion-return'
  | 'conditional'
  | 'attach-minutes'
  | 'condition-met'
  | 'reopen'
  | 'save-language'
  | 'revert-language';

export interface CaseDetailProps {
  caseItem: Case;
  /** DOCLIB entry this case's redline belongs to — undefined only if the
   * case's `doc` id has no DOCLIB match, a data-integrity condition this
   * view renders honestly (see `missingDocNote` below) rather than
   * crashing or fabricating text. */
  doc: DocEntry | undefined;
  currentUser: StudioUser;
  onBack: () => void;
  /** All case-data mutations flow up through this single dispatcher — see
   * file header "Irreversibility gate." `payload` carries the picked
   * condition text (`conditional`) or the saved draft text
   * (`save-language`). */
  onAction: (kind: CaseActionKind, payload?: string) => void;
  /** The one case action currently mid-commit for this case, or null. */
  pendingAction: CaseActionKind | null;
  /** Cross-screen deep links (base doclinks: openDocView / go('settings') /
   * openReport('gapboard') — see file header CS-08). Omit and the link
   * affordances simply do not render. */
  onNavigate?: (screenId: string) => void;
  /** In-context persona switch (base `switchUser(...)` doclinks, source
   * 2835/2849/2855). Omit (e.g. no persona rows available) and the
   * "Sign in as X …" links do not render. */
  onSwitchUser?: (userId: string) => void;
}

const DOMAIN_LABEL: Record<string, string> = Object.fromEntries(DOMAINS.map((d) => [d.key, d.name]));

const ENTITY_MAP: Record<string, string> = {
  '&amp;': '&',
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&rdquo;': '”',
  '&ldquo;': '“',
  '&ndash;': '–',
  '&mdash;': '—',
  '&quot;': '"',
  '&#39;': '’',
  '&nbsp;': ' ',
};

/** See `OnSideDocuments.tsx`'s identical-purpose `decodeDocText` — this
 * file duplicates the small, dataset-scoped decode rather than importing
 * from a sibling screen file outside this dispatch's allowlist. */
function decodeText(input: string): string {
  return input
    .replace(/<\/?(b|strong|em|br)\s*\/?>/gi, '')
    .replace(/&[a-z#0-9]+;/gi, (match) => ENTITY_MAP[match] ?? match);
}

function isUntouched(c: Case): boolean {
  return c.stage === 'analyst' && !c.edited && c.history.length <= 1;
}

function stagePill(c: Case): { text: string; variant: NonRaciTagVariant } {
  if (c.stage === 'closed') return { text: 'Adopted', variant: 'status-positive' };
  if (c.stage === 'rejected') return { text: 'Returned', variant: 'status-alert' };
  if (c.stage === 'cro') return { text: 'With the CRO', variant: 'status-caution' };
  if (c.stage === 'legal') return { text: 'With counsel', variant: 'status-caution' };
  if (c.stage === 'committee') return { text: `At ${APPROVAL.committee}`, variant: 'status-caution' };
  if (c.stage === 'final') return { text: 'Conditional · final approval open', variant: 'status-caution' };
  if (isUntouched(c)) return { text: 'Not decided yet', variant: 'count' };
  return { text: 'Back with the analyst', variant: 'status-caution' };
}

/** Ported verbatim, `caseWaitingOn` (leapfi-platform.html 2617-2622). */
function waitingOnRoleKey(stage: string): string | null {
  if (stage === 'analyst') return 'analyst';
  if (stage === 'cro' || stage === 'final' || stage === 'committee') return 'cro';
  if (stage === 'legal') return 'legal';
  return null;
}

/** Ported verbatim, `caseStageOwner` (leapfi-platform.html 2607-2616). */
function stageOwnerLabel(c: Case): string {
  if (c.stage === 'analyst') return 'P. Raman · Risk Analyst';
  if (c.stage === 'cro') return 'R. Fischer · CRO';
  if (c.stage === 'legal') return 'D. Reyes · General Counsel';
  if (c.stage === 'committee') return APPROVAL.committee;
  if (c.stage === 'final') return 'R. Fischer · CRO · final approval';
  if (c.stage === 'closed') return 'Closed';
  if (c.stage === 'rejected') return 'Returned to OnSide';
  return '—';
}

const SCREEN_TEXT: CSSProperties = { color: 'var(--ink)' };
const SECTION_GAP: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5rem' };
const CARD_STYLE: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm, 6px)',
  background: 'var(--panel)',
  padding: '1.25rem 1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};
const HEADER_ROW_STYLE: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' };
const TITLE_STYLE: CSSProperties = { margin: '0.25rem 0 0', font: 'inherit', fontSize: '1.25rem', fontWeight: 700, ...SCREEN_TEXT };
const SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.0625rem', fontWeight: 700, ...SCREEN_TEXT };
const CITE_STYLE: CSSProperties = { margin: '0.35rem 0 0', fontSize: '0.875rem', color: 'var(--ink2)' };
const META_GRID_STYLE: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' };
const META_LABEL_WRAP: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.2rem' };
const META_VALUE_STYLE: CSSProperties = { fontSize: '0.875rem', fontWeight: 600, ...SCREEN_TEXT };
const STEPS_ROW_STYLE: CSSProperties = { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' };
const ACTIONS_ROW_STYLE: CSSProperties = { display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' };
const WAIT_NOTE_STYLE: CSSProperties = { margin: 0, fontSize: '0.875rem', color: 'var(--ink2)' };
const INFO_NOTE_STYLE: CSSProperties = { margin: 0, fontSize: '0.875rem', ...SCREEN_TEXT };
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
  minHeight: '9rem',
  resize: 'vertical',
  outline: 'none',
};
const CONDITION_LIST_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.25rem' };
const HISTORY_LIST_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };
const HISTORY_ROW_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.15rem', borderLeft: '2px solid var(--border)', paddingLeft: '0.75rem' };

export function CaseDetail({ caseItem, doc, currentUser, onBack, onAction, pendingAction, onNavigate, onSwitchUser }: CaseDetailProps) {
  const [editing, setEditing] = useState(false);
  const [draftLang, setDraftLang] = useState(caseItem.lang);
  const [pickingCondition, setPickingCondition] = useState(false);
  /** The condition option currently mid-commit (CS-13) — keeps the picker
   * mounted so exactly that option's Button shows `loading`. */
  const [committingCondition, setCommittingCondition] = useState<string | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);

  // A different case swapped in — every transient UI toggle belongs to the
  // case that opened it, never carried forward onto the next one.
  useEffect(() => {
    setEditing(false);
    setDraftLang(caseItem.lang);
    setPickingCondition(false);
    setCommittingCondition(null);
    setEmailOpen(false);
  }, [caseItem.id]);

  // The stage flipped (a commit resolved): the condition picker belongs to
  // the stage that opened it (CS-13 — the picker stays mounted while the
  // conditional commit is in flight, then closes here).
  useEffect(() => {
    setPickingCondition(false);
    setCommittingCondition(null);
  }, [caseItem.stage]);

  const tier = tierOf(caseItem.tier);
  const canAct = waitingOnRoleKey(caseItem.stage) === currentUser.roleKey;
  const pill = stagePill(caseItem);
  const isPending = pendingAction !== null;
  const stageSet = tier.committee ? CASE_STAGES_B : CASE_STAGES;
  // Base `IDX` stage index map, ported verbatim (leapfi-platform.html 2821;
  // CS-02): 'legal'/'final'/'rejected' are stages, not steps, so they map
  // onto the step they sit at — `findIndex` over the step set returned -1
  // for them and blanked the whole strip.
  const STAGE_INDEX: Record<string, number> = tier.committee
    ? { analyst: 1, legal: 2, cro: 2, committee: 3, final: 4, closed: 4, rejected: 1 }
    : { analyst: 1, legal: 2, cro: 2, final: 2, closed: 3, rejected: 1 };
  const stageIndex = STAGE_INDEX[caseItem.stage] ?? 1;

  function isBusy(kind: CaseActionKind): boolean {
    return pendingAction === kind;
  }
  function isBlocked(kind: CaseActionKind): boolean {
    return isPending && pendingAction !== kind;
  }

  function handleSave() {
    const trimmed = draftLang.trim();
    if (!trimmed) return;
    onAction('save-language', trimmed);
    setEditing(false);
  }

  /** Base per-stage non-actor wait notes (leapfi-platform.html 2835 /
   * 2849 / 2855 / 2861 / 2868 — CS-05): only the `cro` stage's base note
   * asserts "notified in the app and by email"; the switch-user doclinks
   * (CS-08) render only when the composer supplies `onSwitchUser`. */
  function renderWaitNote() {
    if (caseItem.stage === 'analyst') {
      return (
        <div style={ACTIONS_ROW_STYLE}>
          <p style={WAIT_NOTE_STYLE}>This case is with <strong style={SCREEN_TEXT}>P. Raman, Risk Analyst</strong>.</p>
          {onSwitchUser ? <Button variant="ghost" label="Sign in as Priya to action it →" onPress={() => onSwitchUser('priya')} /> : null}
        </div>
      );
    }
    if (caseItem.stage === 'cro') {
      return (
        <div style={ACTIONS_ROW_STYLE}>
          <p style={WAIT_NOTE_STYLE}>This case is with <strong style={SCREEN_TEXT}>R. Fischer, Chief Risk Officer</strong>, notified in the app and by email.</p>
          {onSwitchUser ? <Button variant="ghost" label="Sign in as Rachel to action it →" onPress={() => onSwitchUser('rachel')} /> : null}
        </div>
      );
    }
    if (caseItem.stage === 'legal') {
      return (
        <div style={ACTIONS_ROW_STYLE}>
          <p style={WAIT_NOTE_STYLE}>Out with <strong style={SCREEN_TEXT}>D. Reyes, General Counsel</strong> for validation.</p>
          {onSwitchUser ? <Button variant="ghost" label="Sign in as Dana to record the opinion →" onPress={() => onSwitchUser('reyes')} /> : null}
        </div>
      );
    }
    if (caseItem.stage === 'committee') {
      return (
        <div style={ACTIONS_ROW_STYLE}>
          <p style={WAIT_NOTE_STYLE}>Waiting on <strong style={SCREEN_TEXT}>{APPROVAL.committee}</strong>. It sits in the Gap Closure Board Approval Report.</p>
          {onNavigate ? <Button variant="ghost" label="Open the board report →" onPress={() => onNavigate('reporting')} /> : null}
        </div>
      );
    }
    if (caseItem.stage === 'final') {
      return <p style={WAIT_NOTE_STYLE}>Conditionally approved, waiting on <strong style={SCREEN_TEXT}>{caseItem.cond}</strong> and the CRO&rsquo;s final approval.</p>;
    }
    return null;
  }

  function renderActions() {
    if (!canAct) {
      if (caseItem.stage === 'closed' || caseItem.stage === 'rejected') return null;
      return renderWaitNote();
    }

    if (caseItem.stage === 'analyst') {
      return (
        <div style={ACTIONS_ROW_STYLE}>
          <Button variant="primary" label="Accept & route for approval" loading={isBusy('accept')} disabled={isBlocked('accept')} onPress={() => onAction('accept')} />
          {/* Re-sync the draft buffer on every open (CS-07): `caseItem.lang`
              may have changed since the last edit session (save, revert). */}
          <Button variant="ghost" label="Edit the language" disabled={isPending || editing} onPress={() => { setDraftLang(caseItem.lang); setEditing(true); }} />
          {caseItem.edited ? (
            <Button variant="ghost" label="Revert to the OnSide draft" loading={isBusy('revert-language')} disabled={isBlocked('revert-language')} onPress={() => onAction('revert-language')} />
          ) : null}
          <Button variant="secondary" label="Reject" loading={isBusy('reject')} disabled={isBlocked('reject')} onPress={() => onAction('reject')} />
        </div>
      );
    }

    if (caseItem.stage === 'cro') {
      const primaryLabel = tier.committee ? 'Conditional approval…' : 'Final approval & adopt';
      const primaryVariant: ButtonVariant = 'primary';
      return (
        <div style={SECTION_GAP}>
          <div style={ACTIONS_ROW_STYLE}>
            {tier.committee ? (
              <Button variant={primaryVariant} label={primaryLabel} disabled={isPending} onPress={() => setPickingCondition(true)} />
            ) : (
              <>
                <Button variant={primaryVariant} label={primaryLabel} loading={isBusy('approve')} disabled={isBlocked('approve')} onPress={() => onAction('approve')} />
                <Button variant="ghost" label="Approve with a condition…" disabled={isPending} onPress={() => setPickingCondition(true)} />
              </>
            )}
            <Button variant="ghost" label="Route to legal counsel" loading={isBusy('route-legal')} disabled={isBlocked('route-legal')} onPress={() => onAction('route-legal')} />
            {/* Base 2846 + openEmail 2650-2664 (CS-01 email beat) — read-only
                preview, so it stays pressable mid-commit like the base. */}
            <Button variant="ghost" label="View the email you were sent" onPress={() => setEmailOpen(true)} />
            <Button variant="secondary" label="Reject" loading={isBusy('reject')} disabled={isBlocked('reject')} onPress={() => onAction('reject')} />
          </div>
          {pickingCondition ? (
            <div>
              <Label text="Approve subject to" variant="eyebrow" />
              <div style={CONDITION_LIST_STYLE}>
                {APPROVAL.conditions.map((cond) => (
                  <Button
                    key={cond}
                    variant="secondary"
                    label={cond}
                    loading={isBusy('conditional') && committingCondition === cond}
                    disabled={isPending && !(isBusy('conditional') && committingCondition === cond)}
                    onPress={() => {
                      // CS-13: the picker stays mounted so this Button shows
                      // `loading` for the commit window; the stage-change
                      // effect above closes it when the commit resolves.
                      setCommittingCondition(cond);
                      onAction('conditional', cond);
                    }}
                  />
                ))}
                <Button variant="ghost" label="Cancel" disabled={isPending} onPress={() => setPickingCondition(false)} />
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    if (caseItem.stage === 'legal') {
      return (
        <div style={SECTION_GAP}>
          <p style={WAIT_NOTE_STYLE}>Counsel review requested by the CRO. Record your opinion and the case returns to the approval path with the opinion on file.</p>
          <div style={ACTIONS_ROW_STYLE}>
            <Button variant="primary" label="Clear as drafted" loading={isBusy('opinion-clear')} disabled={isBlocked('opinion-clear')} onPress={() => onAction('opinion-clear')} />
            <Button variant="ghost" label="Return with drafting notes" loading={isBusy('opinion-return')} disabled={isBlocked('opinion-return')} onPress={() => onAction('opinion-return')} />
          </div>
        </div>
      );
    }

    if (caseItem.stage === 'committee') {
      // Base copy verbatim (2858-2860 — CS-03: the "(Reporting — see file
      // header entry-points note)" parenthetical was build-coordination
      // prose, never user copy) + the base's "Open the board report" ghost
      // (CS-08; twin target is the Reporting screen via `onNavigate`).
      return (
        <div style={SECTION_GAP}>
          <p style={WAIT_NOTE_STYLE}>
            Conditional approval given, subject to <strong style={SCREEN_TEXT}>{APPROVAL.committee}</strong> approval. This change is in the Gap Closure Board Approval Report for the next meeting. Attach the minutes once it carries.
          </p>
          <div style={ACTIONS_ROW_STYLE}>
            <Button variant="primary" label="Attach committee minutes" loading={isBusy('attach-minutes')} disabled={isBlocked('attach-minutes')} onPress={() => onAction('attach-minutes')} />
            {onNavigate ? <Button variant="ghost" label="Open the board report" onPress={() => onNavigate('reporting')} /> : null}
          </div>
        </div>
      );
    }

    if (caseItem.stage === 'final') {
      return (
        <div style={SECTION_GAP}>
          <p style={WAIT_NOTE_STYLE}>
            Conditional approval given, subject to <strong style={SCREEN_TEXT}>{caseItem.cond}</strong>.{' '}
            {caseItem.condMet ? (
              <>
                <strong style={{ color: 'var(--accent)' }}>Condition satisfied</strong>
                {caseItem.minutes ? ` · ${caseItem.minutes}` : ''}.
              </>
            ) : (
              'The condition is not yet evidenced.'
            )}
          </p>
          <div style={ACTIONS_ROW_STYLE}>
            {!caseItem.condMet ? (
              <Button variant="ghost" label="Record the condition as met" loading={isBusy('condition-met')} disabled={isBlocked('condition-met')} onPress={() => onAction('condition-met')} />
            ) : null}
            <Button variant="primary" label="Final approval & adopt" loading={isBusy('approve')} disabled={!caseItem.condMet || isBlocked('approve')} onPress={() => onAction('approve')} />
            <Button variant="secondary" label="Reject" loading={isBusy('reject')} disabled={isBlocked('reject')} onPress={() => onAction('reject')} />
          </div>
        </div>
      );
    }

    return null;
  }

  const missingDocNote = !doc ? (
    <p style={WAIT_NOTE_STYLE}>No document library entry matches this case&rsquo;s document id (&ldquo;{caseItem.doc}&rdquo;) — the before/after language below cannot be shown.</p>
  ) : null;

  return (
    <div style={SECTION_GAP} data-lf-view="case-detail">
      <div>
        <Button variant="ghost" label="← All cases" icon="chevron-left" onPress={onBack} />
      </div>

      <section aria-labelledby="case-detail-title" style={CARD_STYLE}>
        <div style={HEADER_ROW_STYLE}>
          <div>
            <Label text="Case · opened by OnSide on detection" variant="eyebrow" />
            <h2 id="case-detail-title" style={TITLE_STYLE}>
              {caseItem.id} · {decodeText(caseItem.title)}
            </h2>
            <p style={CITE_STYLE}>{decodeText(caseItem.trigger)}</p>
          </div>
          <Tag text={pill.text} variant={pill.variant} />
        </div>

        <div style={STEPS_ROW_STYLE} aria-label="Case stage progress">
          {stageSet.map(([key, label], index) => {
            let variant: NonRaciTagVariant = 'count';
            if (caseItem.stage === 'rejected' && index === stageSet.length - 1) variant = 'status-alert';
            else if (caseItem.stage === 'closed' || index < stageIndex) variant = 'status-positive';
            else if (index === stageIndex) variant = 'status-caution';
            const text = caseItem.stage === 'rejected' && index === stageSet.length - 1 ? 'Returned' : label;
            return <Tag key={key} text={`${index + 1}. ${text}`} variant={variant} />;
          })}
        </div>

        <div style={META_GRID_STYLE}>
          <div style={META_LABEL_WRAP}>
            <Label text="Detected" variant="eyebrow" />
            <span style={META_VALUE_STYLE}>{caseItem.detected} · 6:12 AM ET sweep</span>
          </div>
          <div style={META_LABEL_WRAP}>
            <Label text="Domain" variant="eyebrow" />
            <span style={META_VALUE_STYLE}>{DOMAIN_LABEL[caseItem.dom] ?? caseItem.dom}</span>
          </div>
          <div style={META_LABEL_WRAP}>
            <Label text="Policy owner" variant="eyebrow" />
            <span style={META_VALUE_STYLE}>{decodeText(caseItem.owner)}</span>
          </div>
          <div style={META_LABEL_WRAP}>
            <Label text="Currently with" variant="eyebrow" />
            <span style={META_VALUE_STYLE}>{stageOwnerLabel(caseItem)}</span>
          </div>
          <div style={META_LABEL_WRAP}>
            <Label text="Approval tier" variant="eyebrow" />
            <span style={META_VALUE_STYLE}>{tier.n} · {tier.committee ? `${APPROVAL.committee} votes before adoption` : 'CRO adopts'}</span>
            {/* Base "matrix →" doclink, `go('settings')` (2891 — CS-08). */}
            {onNavigate ? (
              <span>
                <Button variant="ghost" label="matrix →" onPress={() => onNavigate('settings.toggles')} />
              </span>
            ) : null}
          </div>
          {caseItem.cond ? (
            <div style={META_LABEL_WRAP}>
              <Label text="Condition" variant="eyebrow" />
              <span style={META_VALUE_STYLE}>{caseItem.cond} · {caseItem.condMet ? 'satisfied' : 'outstanding'}</span>
            </div>
          ) : null}
          {caseItem.opinion ? (
            <div style={META_LABEL_WRAP}>
              <Label text="Counsel" variant="eyebrow" />
              <span style={META_VALUE_STYLE}>D. Reyes · {caseItem.opinion}</span>
            </div>
          ) : null}
          {/* Base Document meta row + openDocView doclink (2892-area meta —
              CS-08). Twin target: the OnSide · Documents screen; the
              per-document deep link lives in that screen, outside this
              batch. */}
          {doc && onNavigate ? (
            <div style={META_LABEL_WRAP}>
              <Label text="Document" variant="eyebrow" />
              <span>
                <Button variant="ghost" label={`${decodeText(caseItem.title)} →`} onPress={() => onNavigate('onside.documents')} />
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="case-language-heading" style={CARD_STYLE}>
        <h3 id="case-language-heading" style={SUBHEADING_STYLE}>Proposed language</h3>

        {missingDocNote}

        {!editing ? (
          doc?.redline ? (
            <>
              {/* CS-10: the old `hitlText='Adopted'` branch was dead code —
                  RedlineDiffView renders its Tag only when `hitl` is true,
                  which was exactly when the text said 'HITL review'. The
                  adopted diff now carries its own visible marker plus the
                  base's closed-state captions (2872-2875). */}
              {caseItem.stage === 'closed' ? (
                <div>
                  <Tag text="Adopted" variant="status-positive" />
                </div>
              ) : null}
              <RedlineDiffView
                before={decodeText(doc.redline.old)}
                after={decodeText(caseItem.lang)}
                beforeLabel={caseItem.stage === 'closed' ? 'Before · prior text, archived on adoption' : 'Before · in force until this is adopted'}
                afterLabel={caseItem.stage === 'closed' ? 'After · adopted and in force' : 'After · proposed, not yet in force'}
                hitl={caseItem.stage !== 'closed'}
                hitlText="HITL review"
              />
            </>
          ) : null
        ) : (
          <div>
            <label htmlFor="case-detail-textarea" style={TEXTAREA_LABEL_STYLE}>
              Proposed language
            </label>
            <textarea
              id="case-detail-textarea"
              style={TEXTAREA_STYLE}
              value={draftLang}
              onChange={(event) => setDraftLang(event.target.value)}
              disabled={isPending}
            />
            <div style={{ ...ACTIONS_ROW_STYLE, marginTop: '0.75rem' }}>
              <Button variant="primary" label="Save the language" loading={isBusy('save-language')} disabled={isBlocked('save-language') || !draftLang.trim()} onPress={handleSave} />
              <Button variant="ghost" label="Cancel" disabled={isPending} onPress={() => { setDraftLang(caseItem.lang); setEditing(false); }} />
            </div>
          </div>
        )}

        {caseItem.edited && !editing ? (
          <p style={INFO_NOTE_STYLE}>
            <strong>Edited by the analyst.</strong> OnSide&rsquo;s original draft is kept below and in the history.
            <br />
            <span style={{ color: 'var(--ink2)' }}>{decodeText(caseItem.base)}</span>
          </p>
        ) : null}

        {caseItem.stage === 'closed' ? (
          <div style={ACTIONS_ROW_STYLE}>
            <p style={INFO_NOTE_STYLE}>
              Adopted{doc ? ` as ${doc.v}` : ''}. The prior text is archived, the fingerprint re-sealed, connected systems notified, and the obligation behind it marked met.
            </p>
            {/* Base closed-state "Open the document →" doclink (2870 — CS-08). */}
            {doc && onNavigate ? <Button variant="ghost" label="Open the document →" onPress={() => onNavigate('onside.documents')} /> : null}
          </div>
        ) : null}
        {caseItem.stage === 'rejected' ? (
          <div style={SECTION_GAP}>
            <p style={INFO_NOTE_STYLE}>Returned to OnSide to redraft. Nothing changed in the in-force document.</p>
            <div style={ACTIONS_ROW_STYLE}>
              <Button variant="secondary" label="Reopen for redraft" loading={isBusy('reopen')} disabled={isBlocked('reopen')} onPress={() => onAction('reopen')} />
            </div>
          </div>
        ) : null}

        {/* CS-06: while the editor is open, "Save the language" is the only
            primary on screen — the stage action row (whose analyst branch
            carries its own primary) is not rendered, which also removes the
            mid-edit "Accept" hazard. See file header. */}
        {!editing ? renderActions() : null}
      </section>

      {/* Base openEmail drawer (leapfi-platform.html 2650-2664 — the
          v1.059 "an email you can open and read" beat, CS-01): the email
          the routing notification actually sent, rendered read-only in the
          shared Drawer (C7). The "Open the case in OnSide" block is the
          email's own (non-interactive) button graphic, as in the base. */}
      <Drawer open={emailOpen} title={`${caseItem.id} is waiting on you`} onClose={() => setEmailOpen(false)}>
        <div style={SECTION_GAP}>
          <Label text="Notification · email preview" variant="eyebrow" />
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm, 6px)', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', fontSize: '0.8125rem', color: 'var(--ink2)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div><strong style={SCREEN_TEXT}>From</strong> OnSide &lt;onside@leapfi.ai&gt;</div>
              <div><strong style={SCREEN_TEXT}>To</strong> {caseItem.stage === 'cro' ? 'Rachel Fischer <rachel.fischer@northwindscu.org>' : 'Priya Raman <priya.raman@northwindscu.org>'}</div>
              <div><strong style={SCREEN_TEXT}>Subject</strong> [{caseItem.id}] Approval needed · {decodeText(caseItem.title)}</div>
            </div>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', ...SCREEN_TEXT }}>
              <p style={{ margin: 0 }}>A policy change is waiting on your approval.</p>
              <p style={{ margin: 0 }}>
                <strong>{decodeText(caseItem.title)}</strong>
                <br />
                Detected {caseItem.detected} · {caseItem.dom.toUpperCase()} · owner {decodeText(caseItem.owner)}
              </p>
              <p style={{ margin: 0 }}>{decodeText(caseItem.trigger)}</p>
              <p style={{ margin: 0 }}>{caseItem.edited ? 'The risk analyst edited the proposed language before routing it.' : 'The risk analyst accepted the proposed language as drafted.'}</p>
              <div aria-hidden="true" style={{ alignSelf: 'flex-start', padding: '0.5rem 0.875rem', borderRadius: 'var(--radius-sm, 6px)', background: 'var(--accent)', color: 'var(--bg)', fontWeight: 600, fontSize: '0.8125rem' }}>
                Open the case in OnSide
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ink2)' }}>Sent because you are the approver for this policy tier. Manage your digest and alert settings in OnSide.</p>
            </div>
          </div>
        </div>
      </Drawer>

      <section aria-labelledby="case-history-heading" style={CARD_STYLE}>
        <h3 id="case-history-heading" style={SUBHEADING_STYLE}>Case history</h3>
        <div style={HISTORY_LIST_STYLE}>
          {caseItem.history.map((entry, index) => (
            // eslint-disable-next-line react/no-array-index-key -- history is prepended (unshift) per action; entries never reorder independently of that append, so index is a stable enough key for this session-local list
            <div key={index} style={HISTORY_ROW_STYLE}>
              <Label text={entry.when} variant="eyebrow" />
              <Label text={entry.what} variant="body-secondary" />
              <Label text={`${entry.who}${entry.role ? ` · ${entry.role}` : ''}${entry.note ? ` · ${entry.note}` : ''}`} variant="body-secondary" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
