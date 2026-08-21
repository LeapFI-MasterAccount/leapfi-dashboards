/**
 * PI2-D44 dispatch, task 5 — smoke check: Dan flow §2's five-step walk for
 * a drafted-redline case, exercised end to end through the now-integrated
 * pieces (docflow/lane-1 origin resolver + task 2a's origin field group,
 * docflow/lane-3's DocumentBody export + task 2b's A18 full-document
 * swap, docflow/lane-2's PI2-D14 host migration):
 *
 *   1. open case      — row "Open" press opens the case side-car (Drawer).
 *   2. full document   — "View full document" swaps to the full doc body.
 *   3. redline         — the redline renders inline within that full body.
 *   4. why             — "Back to case" restores case content; case
 *                        history + the origin field group (or its honest
 *                        empty state) explain what changed and why.
 *   5. approve from context — the stage-appropriate approval-track action
 *                        (here, "Accept & route for approval" at the
 *                        `analyst` stage) commits from the SAME Drawer,
 *                        never leaving to a different screen.
 *
 * Not an AC-pinning file for a single amendment — a single, deliberately
 * end-to-end regression proving the integrated whole holds together, per
 * this dispatch's own task 5.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Cases } from '../../screens/Cases';
import { seedCases, CASES } from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { USERS } from '../../data/studio';
import type { StudioUser } from '../../data/studio';
import { topbarFixture } from './fixtures';

const ANALYST = USERS[1] as StudioUser; // Priya Raman, roleKey 'analyst' — owns every freshly seeded case at its 'analyst' stage

beforeEach(() => {
  seedCases(DOCLIB);
});

function openRow(caseId: string): void {
  const idCell = screen.getByText(caseId);
  const row = idCell.closest('tr');
  expect(row).not.toBeNull();
  fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }));
}

describe('Dan flow §2 — five-step walk, drafted-redline case (smoke check)', () => {
  it('open case -> full document -> redline -> why -> approve from context, without ever leaving the Drawer', async () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);

    // PI2-D45 (USER OVERRIDE): CASE-2026-001 ('irp', exec tier) now boots
    // already routed to 'cro' — this smoke walk needs a still-`analyst`-
    // stage case (proc tier) so step 5's analyst-only accept action is
    // reachable. CASE-2026-003 ('aa-procedure') is also SIGNAL-untouched
    // (data/misc.ts), preserving step 4's honest-empty-origin assertion.
    const caseId = 'CASE-2026-003';
    const docId = CASES.find((c) => c.id === caseId)!.doc;
    expect(docId).toBe('aa-procedure');

    // Step 1 — open case.
    openRow(caseId);
    let dialog = screen.getByRole('dialog', { name: new RegExp(caseId) });
    expect(dialog).toBeInTheDocument();
    // Only one Drawer, ever (A9/A18's own discipline).
    expect(screen.getAllByRole('dialog')).toHaveLength(1);

    // Step 2 — full document.
    fireEvent.click(within(dialog).getByRole('button', { name: 'View full document' }));
    dialog = screen.getByRole('dialog', { name: /— full document$/ });
    const doc = DOCLIB[docId]!;
    for (const [heading] of doc.secs) {
      expect(within(dialog).getByText(heading)).toBeInTheDocument();
    }

    // Step 3 — redline, inline within that same full-document view. (Two
    // RedlineDiffView instances exist in the DOM at this point — the
    // visible one inside the swapped full-document body, and CaseDetail's
    // own pre-existing one, CSS-hidden underneath per task 2b's "hidden,
    // not unmounted" design — filter to the visible one, same technique
    // case_full_document_swap.test.tsx's own AC-A18-4 test uses.)
    const visibleRedlines = Array.from(document.querySelectorAll('[data-lf-composite="redline-diff-view"]')).filter(
      (el) => !el.closest('[style*="display: none"]'),
    );
    expect(visibleRedlines).toHaveLength(1);
    expect(within(visibleRedlines[0] as HTMLElement).getByText(/HITL review|Adopted/)).toBeInTheDocument();

    // Step 4 — why: back to case, case history + origin group (or its
    // honest empty state — 'irp' is not touched by any SIGNAL entry, so
    // AC-r02-2's empty-state branch is the correct, honest render here).
    fireEvent.click(within(dialog).getByRole('button', { name: '← Back to case' }));
    dialog = screen.getByRole('dialog', { name: new RegExp(caseId) });
    const historySection = within(dialog).getByRole('heading', { name: 'Case history' }).closest('section') as HTMLElement;
    expect(within(historySection).getByText('Change detected and language proposed')).toBeInTheDocument();
    expect(within(dialog).getByText(/no regulatory signal/i)).toBeInTheDocument();

    // Step 5 — approve from context: the `analyst`-stage approval-track
    // action ("Accept & route for approval"), pessimistically rendered
    // (Core Principle 1) — commits only once the simulated server delay
    // resolves, and never leaves this same Drawer/screen.
    const acceptButton = within(dialog).getByRole('button', { name: 'Accept & route for approval' });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/Routed to the CRO/);
    }, { timeout: 2000 });

    expect(CASES.find((c) => c.id === caseId)?.stage).toBe('cro');
    // Still the same single Drawer, same case, same screen — approval
    // happened "from that context" (Dan step 5), never a screen jump.
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('dialog', { name: new RegExp(caseId) })).toBeInTheDocument();
  });
});
