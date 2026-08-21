/**
 * SO3 badge-notify sweep — CASES-mutating actions that change decision-
 * relevant state without firing `state/demoStore.ts`'s notify/emit
 * mechanism, so persistent-shell surfaces (the OnSide · Cases Sidebar
 * badge — S1.1-04/PI2-D43 — and every other `useDemoStore()` subscriber)
 * go stale.
 *
 * Confirmed instance F1 (jsdom-reproduced at f728aa7): `save-language`
 * (`Cases.tsx` `performAction` mutate for the `'save-language'` kind) sets
 * `c.edited = true` — flipping `isUntouched` (`data/cases.ts`) — but the
 * mutate function called no `demoStore` write helper, so the store never
 * `emit()`s and the App shell's persistent Sidebar badge
 * (`CASES.filter(isUntouched).length`, `App.tsx` "USER RULING PI2-D43")
 * keeps rendering the pre-edit count even while `Cases.tsx`'s own header
 * (which re-derives from the same `CASES` array on its own local re-render)
 * shows the post-edit count in the very same viewport.
 *
 * Class disposition (recorded here, per the dispatch's own instruction to
 * record rather than blanket-add where a fix provably does nothing):
 *  - `save-language`        FIX — flips `c.edited` (when the value actually
 *    changes), directly flipping `isUntouched`.
 *  - `revert-language`      FIX — flips `c.edited` back and always appends
 *    a history entry. `CaseDetail.tsx` only ever offers this action once
 *    `c.edited` is already true (itself only ever set by a prior
 *    `save-language`, which always logs an entry first), so in the current
 *    UI wiring `isUntouched` is already permanently false by the time this
 *    action is reachable (history length can only grow) — but that
 *    "provably inert" argument leans on a SEPARATE file's gating logic
 *    (`CaseDetail.tsx`), not a structural invariant of the mutation itself,
 *    and the mutation still touches the exact field (`c.edited`) the
 *    predicate reads. Per the dispatch's explicit tie-break ("when in
 *    doubt, notify — staleness is the worse failure"), this one bumps the
 *    store too.
 *  - `attach-minutes`       FIX — moves `c.stage` from `'committee'` to
 *    `'final'`. Both stages resolve to the SAME `waitingOnRoleKey` ('cro'),
 *    so it never moves the Sidebar's `isUntouched` badge or any per-role
 *    "waiting on you" queue count — but it does move which report bucket
 *    the case sits in on `ReportView.tsx`'s Gap Closure Board Approval
 *    Report ("For the committee meeting" `pending` filters on
 *    `c.stage === 'committee'` specifically, `views/ReportView.tsx:522`),
 *    a screen that already subscribes via `useDemoStore()` for exactly
 *    this kind of live case-state update.
 *  - `condition-met`        NO FIX (documented, not blanket-added) —
 *    mutates only `c.condMet` (read nowhere outside `CaseDetail.tsx`,
 *    which is already re-rendered by `Cases.tsx`'s own local
 *    `renderTick` bump on every commit) and appends a history entry.
 *    `CaseDetail.tsx` only ever offers this action at `c.stage === 'final'`
 *    (`views/CaseDetail.tsx:530`, gated by the SAME file's own
 *    `caseItem.stage === 'final'` render branch, line 514) — a stage
 *    `isUntouched` and `waitingOnRoleKey`'s branches both already treat
 *    identically to `'committee'`/`'cro'`, and never `'analyst'` — so
 *    `isUntouched`'s `stage === 'analyst'` guard is unconditionally false
 *    both before and after this mutation runs. No shell-derived value this
 *    codebase computes reads `condMet` or is sensitive to this action's
 *    history-length delta while gated to `'final'`. Structurally inert,
 *    not merely believed inert — no store call added.
 *  - `reopen`                FIX — moves `c.stage` from `'rejected'` (which
 *    `waitingOnRoleKey`/`isUntouched` both treat as "nobody"/false) to
 *    `'analyst'`, which both predicates treat specially — this is exactly
 *    the class of stage transition the six pre-existing `notify*` call
 *    sites already guard against going stale for.
 *
 * All four fixed actions are asserted at the `state/demoStore.ts` version
 * level (`getDemoStoreVersion()`) — the primitive every `useDemoStore()`
 * subscriber (the Sidebar badge, `ReportView`, `HomePanels`) actually reads
 * to decide whether to re-render — plus F1's own exact repro at the
 * Sidebar-badge level (App-shell-mounted, matching AC-S1.1-04-4's already-
 * established pattern: perform the action, navigate away, read the badge
 * without Cases mounted).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../../App';
import { Cases } from '../../screens/Cases';
import { CASES, isUntouched, seedCases } from '../../data/cases';
import type { Case } from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { USERS } from '../../data/studio';
import type { StudioUser } from '../../data/studio';
import { getDemoStoreVersion } from '../../state/demoStore';
import { topbarFixture } from './fixtures';

const CRO = USERS[0] as StudioUser; // Rachel Fischer, roleKey 'cro'
const ANALYST = USERS[1] as StudioUser; // Priya Raman, roleKey 'analyst'

/** Cases.tsx ACTION_COMMIT_DELAY_MS (550) plus margin. */
const COMMIT_MS = 600;

function commit(ms: number = COMMIT_MS): void {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function caseById(id: string): Case {
  const c = CASES.find((x) => x.id === id);
  expect(c).toBeDefined();
  return c as Case;
}

function openCaseDetail(caseId: string): HTMLElement {
  const idCell = screen.getByText(caseId);
  const row = idCell.closest('tr');
  expect(row).not.toBeNull();
  fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }));
  const detail = document.querySelector('[data-lf-view="case-detail"]');
  expect(detail).not.toBeNull();
  return detail as HTMLElement;
}

beforeEach(() => {
  vi.useFakeTimers();
  seedCases(DOCLIB); // resets CASES to 8 fresh, untouched, analyst-stage cases
});

afterEach(() => {
  vi.useRealTimers();
});

describe('F1 exact repro — save-language stale Sidebar badge (S1.1-04)', () => {
  it('editing and saving a case\'s language shows the POST-edit undecided count on Cases\' own header AND on the persistent Sidebar badge, in the SAME viewport, on the SAME render pass — never one ahead of the other', () => {
    render(<App />);

    // Switch to the analyst (Priya Raman) — the only role that can act on
    // an `analyst`-stage case.
    fireEvent.click(within(screen.getByRole('banner')).getByRole('button', { name: 'Rachel Fischer' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Priya Raman/ }));

    const nav = () => screen.getByRole('navigation', { name: 'Primary' });
    const nested = () => within(nav()).getByRole('list', { name: 'OnSide sections' });
    const casesRow = () => within(nested()).getByRole('button', { name: /^Cases/ });

    const startCount = CASES.filter(isUntouched).length;
    expect(startCount).toBe(8);
    expect(casesRow().querySelector('[data-lf-primitive="tag"][data-variant="count"]')?.textContent).toBe('8');

    fireEvent.click(casesRow());
    const firstCase = CASES[0];
    if (!firstCase) throw new Error('expected a seeded case');
    const detail = openCaseDetail(firstCase.id);

    fireEvent.click(within(detail).getByRole('button', { name: 'Edit the language' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Proposed language' }), {
      target: { value: 'Narrower wording, drafted by the analyst.' },
    });
    fireEvent.click(within(detail).getByRole('button', { name: 'Save the language' }));
    commit();

    expect(firstCase.edited).toBe(true);
    const expectedCount = CASES.filter(isUntouched).length;
    expect(expectedCount).toBe(startCount - 1); // 7

    // Cases.tsx's OWN local `renderTick` state re-renders its own header —
    // this update is real and immediate, no cross-screen navigation
    // required (only back to Cases' own list sub-view, which stays
    // mounted the entire time — Cases itself never unmounts here).
    fireEvent.click(screen.getByRole('button', { name: '← All cases' }));
    expect(screen.getByText(new RegExp(`${expectedCount} of \\d+ have been decided yet`))).toBeInTheDocument();

    // The Sidebar badge lives in the App shell (a SIBLING component tree,
    // not re-rendered by Cases' own local state) — F1's own finding: with
    // no notify()/emit() from the mutate function, this stays on the
    // PRE-edit count (8) even though Cases' own header (read above) has
    // already moved to 7, in the exact same viewport.
    expect(casesRow().querySelector('[data-lf-primitive="tag"][data-variant="count"]')?.textContent).toBe(String(expectedCount));
  });
});

describe('per-action store-version sync (the primitive every useDemoStore() subscriber reads)', () => {
  it('save-language bumps the store version when the language actually changes', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    const firstCase = CASES[0];
    if (!firstCase) throw new Error('expected a seeded case');
    const detail = openCaseDetail(firstCase.id);

    fireEvent.click(within(detail).getByRole('button', { name: 'Edit the language' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Proposed language' }), {
      target: { value: 'Different language than the seeded draft.' },
    });
    const before = getDemoStoreVersion();
    fireEvent.click(within(detail).getByRole('button', { name: 'Save the language' }));
    commit();

    expect(firstCase.edited).toBe(true);
    expect(getDemoStoreVersion()).toBeGreaterThan(before);
  });

  it('revert-language bumps the store version', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    const firstCase = CASES[0];
    if (!firstCase) throw new Error('expected a seeded case');
    let detail = openCaseDetail(firstCase.id);

    // Edit + save first so `caseItem.edited` is true — CaseDetail.tsx only
    // ever renders "Revert to the OnSide draft" once it is.
    fireEvent.click(within(detail).getByRole('button', { name: 'Edit the language' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Proposed language' }), {
      target: { value: 'Custom analyst wording.' },
    });
    fireEvent.click(within(detail).getByRole('button', { name: 'Save the language' }));
    commit();
    expect(firstCase.edited).toBe(true);

    detail = document.querySelector('[data-lf-view="case-detail"]') as HTMLElement;
    const before = getDemoStoreVersion();
    fireEvent.click(within(detail).getByRole('button', { name: 'Revert to the OnSide draft' }));
    commit();

    expect(firstCase.edited).toBe(false);
    expect(getDemoStoreVersion()).toBeGreaterThan(before);
  });

  it('attach-minutes bumps the store version (moves the case out of ReportView\'s "For the committee meeting" bucket)', () => {
    const c = caseById('CASE-2026-007'); // board tier -> committee path (matches cases_fix_wave.test.tsx CS-13)
    c.stage = 'committee';
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    const detail = openCaseDetail('CASE-2026-007');

    const before = getDemoStoreVersion();
    fireEvent.click(within(detail).getByRole('button', { name: 'Attach committee minutes' }));
    commit();

    expect(caseById('CASE-2026-007').stage).toBe('final');
    expect(getDemoStoreVersion()).toBeGreaterThan(before);
  });

  it('reopen bumps the store version (moves a rejected case back to analyst, which isUntouched/waitingOnRoleKey both treat specially)', () => {
    const c = caseById('CASE-2026-002');
    c.stage = 'rejected';
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    const detail = openCaseDetail('CASE-2026-002');

    const before = getDemoStoreVersion();
    fireEvent.click(within(detail).getByRole('button', { name: 'Reopen for redraft' }));
    commit();

    expect(caseById('CASE-2026-002').stage).toBe('analyst');
    expect(getDemoStoreVersion()).toBeGreaterThan(before);
  });

  it('save-language does NOT bump the store version when the saved text is unchanged (no shell-derived value moved)', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    const firstCase = CASES[0];
    if (!firstCase) throw new Error('expected a seeded case');
    const detail = openCaseDetail(firstCase.id);
    const originalLang = firstCase.lang;

    fireEvent.click(within(detail).getByRole('button', { name: 'Edit the language' }));
    // No change to the textarea — save the identical text back.
    const before = getDemoStoreVersion();
    fireEvent.click(within(detail).getByRole('button', { name: 'Save the language' }));
    commit();

    expect(firstCase.lang).toBe(originalLang);
    expect(firstCase.edited).toBe(false);
    expect(getDemoStoreVersion()).toBe(before);
  });
});
