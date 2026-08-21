/**
 * PI2-D44 dispatch, task 2b — design_system_spec.md §2.11 (amendment A18),
 * "View full document" in-drawer content swap, wired into the case
 * side-car (`Cases.tsx`'s Drawer + `views/CaseDetail.tsx`).
 *
 * A third instance of this document's own in-drawer content-swap pattern
 * (after PI2-D31's Signal-row link and A16's chat swap) — never a second
 * Drawer, reusing lane 3's `components/DocumentBody.tsx` export verbatim
 * from a new, third call site (after OnSideDocuments.tsx/OnSideOwnership.tsx).
 *
 * `Cases.tsx` keeps `CaseDetail` MOUNTED (CSS-hidden, not unmounted) while
 * the full-document view is showing, mirroring the app's own established
 * "hidden composite state, not conditional unmount" precedent (amendment
 * A13, `App.tsx`'s persistent-Sidebar `hidden` toggle) — this is what lets
 * §2.11's own "the case's action-region state (e.g. a mid-edit textarea)
 * is preserved underneath" hold: a naive `children` ternary between
 * `<CaseDetail>` and the full-document view would unmount `CaseDetail` and
 * discard that state, defeating the swap's own binding text.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Cases } from '../../screens/Cases';
import { seedCases } from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { USERS } from '../../data/studio';
import type { StudioUser } from '../../data/studio';
import { topbarFixture } from './fixtures';

const ANALYST = USERS[1] as StudioUser; // Priya Raman, roleKey 'analyst' — owns every freshly seeded case

function openRow(caseId: string): void {
  const idCell = screen.getByText(caseId);
  const row = idCell.closest('tr');
  expect(row).not.toBeNull();
  fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }));
}

beforeEach(() => {
  seedCases(DOCLIB);
});

describe('A18 — "View full document" in-drawer swap', () => {
  it('AC-A18-1: pressing "View full document" swaps the Drawer content to include the full document body (DOCLIB[id].secs), not a snippet', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    openRow('CASE-2026-001');

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'View full document' }));

    // Every section heading from the document's own `secs` array renders
    // as a field label inside the swapped DrawerContent (kind: doc).
    const openedDoc = DOCLIB['irp']!;
    for (const [heading] of openedDoc.secs) {
      expect(within(dialog).getByText(heading)).toBeInTheDocument();
    }
  });

  it('AC-A18-2: exactly one role="dialog" node exists before and after the swap', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    openRow('CASE-2026-001');
    expect(screen.getAllByRole('dialog')).toHaveLength(1);

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'View full document' }));
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('AC-A18-3: focus lands on the swapped (full-document) heading, and on the case heading again after "Back to case"', async () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    openRow('CASE-2026-001');

    // Drawer's own opening->open transition moves initial focus to the
    // heading on the next animation frame (Drawer.tsx) — wait for it
    // rather than asserting synchronously, same pattern this suite's own
    // fix-wave.test.tsx already uses for Drawer-open focus assertions.
    const caseHeading = await screen.findByRole('heading', { name: /CASE-2026-001/ });
    await waitFor(() => expect(document.activeElement).toBe(caseHeading));

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'View full document' }));

    // Same persistent Drawer <h2> node (RPT-05 changes its text content,
    // never remounts it) — the accessible name itself is what changed;
    // confirmed by `getByRole` matching the new pattern at all.
    const docHeading = screen.getByRole('heading', { name: /— full document$/ });
    await waitFor(() => expect(document.activeElement).toBe(docHeading));

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '← Back to case' }));

    const caseHeadingAgain = screen.getByRole('heading', { name: /CASE-2026-001/ });
    await waitFor(() => expect(document.activeElement).toBe(caseHeadingAgain));
  });

  it('AC-A18-4: the redline renders inline within the full document body via RedlineDiffView, no second diff-rendering path', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    openRow('CASE-2026-001');
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'View full document' }));

    // Exactly one VISIBLE redline-diff-view — CaseDetail itself stays
    // mounted (CSS-hidden, not unmounted) underneath the swap to preserve
    // its own action-region state (see this file's own header), so its
    // pre-existing, unrelated RedlineDiffView instance is still in the
    // DOM tree, just hidden; that is not a second diff-RENDERING path
    // (same RedlineDiffView component, no new logic), it is the same
    // instance A18 has always shipped, now simply off-screen.
    const allRedlines = Array.from(document.querySelectorAll('[data-lf-composite="redline-diff-view"]'));
    const visibleRedlines = allRedlines.filter((el) => !el.closest('[style*="display: none"]'));
    expect(visibleRedlines).toHaveLength(1);
  });

  it('AC-A18-5: sizeState is unchanged by either direction of the swap', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    openRow('CASE-2026-001');

    let dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-size', 'default');
    // Expand to 'wide' first, then exercise the swap in both directions.
    fireEvent.click(within(dialog).getByRole('button', { name: 'Expand' }));
    expect(screen.getByRole('dialog')).toHaveAttribute('data-size', 'wide');

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'View full document' }));
    expect(screen.getByRole('dialog')).toHaveAttribute('data-size', 'wide');

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '← Back to case' }));
    expect(screen.getByRole('dialog')).toHaveAttribute('data-size', 'wide');
  });

  it('AC-A18-6: "View full document" never renders a trailing arrow glyph and is never variant="primary"', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    openRow('CASE-2026-001');

    const button = within(screen.getByRole('dialog')).getByRole('button', { name: 'View full document' });
    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button.textContent).toBe('View full document');
    expect(button.querySelector('svg')).toBeNull();
  });

  it('available at every reachable stage whenever `doc` resolves (not gated on redline/editing state)', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    openRow('CASE-2026-001');
    const dialog = screen.getByRole('dialog');

    // Enter edit mode — the redline/action row is hidden while editing
    // (CS-06), but "View full document" must still be present ("at every
    // stage").
    fireEvent.click(within(dialog).getByRole('button', { name: 'Edit the language' }));
    expect(within(dialog).getByRole('button', { name: 'View full document' })).toBeInTheDocument();
  });

  it('preserves the case action-region state (a mid-edit textarea) underneath the swap, never unmounting CaseDetail', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    openRow('CASE-2026-001');
    let dialog = screen.getByRole('dialog');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Edit the language' }));
    // getByLabelText also matches the section's own aria-labelledby
    // heading ("Proposed language" names both the <h3> and the textarea's
    // <label>) — scope to the textbox role to disambiguate.
    const textarea = within(dialog).getByRole('textbox', { name: 'Proposed language' }) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'A draft in progress, not yet saved.' } });
    expect(textarea.value).toBe('A draft in progress, not yet saved.');

    fireEvent.click(within(dialog).getByRole('button', { name: 'View full document' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '← Back to case' }));

    dialog = screen.getByRole('dialog');
    const textareaAgain = within(dialog).getByRole('textbox', { name: 'Proposed language' }) as HTMLTextAreaElement;
    expect(textareaAgain.value).toBe('A draft in progress, not yet saved.');
  });

  it('the Drawer\'s open state is never toggled by either direction of the swap', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    openRow('CASE-2026-001');

    // "Open state" is the `open` prop Cases.tsx passes to Drawer
    // (`selectedCaseId !== null`), never touched by either swap direction
    // — the falsifiable form is that the swap never starts a CLOSE
    // transition (phase never becomes 'closing'); the dialog role node
    // itself staying present (asserted in AC-A18-2 above) is the other
    // half of this guarantee.
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'View full document' }));
    expect(screen.getByRole('dialog')).not.toHaveAttribute('data-phase', 'closing');

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '← Back to case' }));
    expect(screen.getByRole('dialog')).not.toHaveAttribute('data-phase', 'closing');
  });
});
