/**
 * PI2-D14 host migration — the one-case-page side-car.
 *
 * `design_system_spec.md` §2.10 preamble (cited, not re-decided by this
 * test file): "R18's host surface = the ONE-CASE-PAGE side-car (this
 * file's own page): the widened case drawer hosts redline review,
 * adopt/reject actions, and the expand/collapse geometry controls...
 * Consequence: `CaseDetail.tsx`'s full-page exception DISSOLVES in PI-2...
 * its approval logic migrates into the case side-car Drawer."
 *
 * These tests pin the migration itself — `Cases.tsx` now mounts
 * `CaseDetail`'s content as the shared Drawer's (C7) `children` on
 * row-select, with the list staying mounted underneath (the same
 * master-list-plus-overlay shape every other Drawer-hosted detail screen
 * in this app already uses, e.g. `OnSideDocuments.tsx`) — never a
 * second Drawer instance, and close-restore to the triggering row is
 * C7's own existing baseline (`Drawer.tsx`'s `returnFocusRef`), not new
 * machinery built here.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Cases } from '../../screens/Cases';
import { seedCases } from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { USERS } from '../../data/studio';
import type { StudioUser } from '../../data/studio';
import { topbarFixture } from './fixtures';

const ANALYST = USERS[1] as StudioUser; // Priya Raman, roleKey 'analyst' — owns every freshly seeded case

/** Drawer.tsx's TRANSITION_MS (200) plus margin — the close animation
 * window that must elapse before `returnFocusRef`'s restore runs. */
const CLOSE_TRANSITION_MS = 260;

function openRow(caseId: string): HTMLElement {
  const idCell = screen.getByText(caseId);
  const row = idCell.closest('tr');
  expect(row).not.toBeNull();
  const openButton = within(row as HTMLElement).getByRole('button', { name: 'Open' });
  // Real focus before the click (not just `fireEvent.click`, which never
  // moves focus) — Drawer.tsx's close-restore captures
  // `document.activeElement` at open time, so the triggering control must
  // actually be focused for that capture to be meaningful, matching this
  // app's own established close-restore test technique
  // (`filter-bar-t5-tower-fix.test.tsx`'s `trigger`/Escape-restore test).
  act(() => {
    openButton.focus();
  });
  fireEvent.click(openButton);
  return openButton;
}

beforeEach(() => {
  seedCases(DOCLIB);
});

describe('PI2-D14 — case content mounts inside the shared Drawer (C7), not a full-page swap', () => {
  it('opening a case row renders its content inside role="dialog", with the list still mounted underneath', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);

    // Precondition: no case open yet — no dialog, list visible.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Open cases' })).toBeInTheDocument();

    openRow('CASE-2026-001');

    const dialog = screen.getByRole('dialog');
    const detail = within(dialog).getByText((_, el) => el?.getAttribute('data-lf-view') === 'case-detail');
    expect(detail).toBeInTheDocument();
    expect(dialog.textContent).toContain('CASE-2026-001');
    // The list is NOT a full-page swap replacement — it stays mounted
    // underneath the Drawer overlay (master-list-plus-overlay shape).
    expect(screen.getByRole('table', { name: 'Open cases' })).toBeInTheDocument();
  });

  it('exactly one role="dialog" node exists while a case is open — never a second Drawer instance', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    openRow('CASE-2026-001');
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it("the Drawer's own heading carries the case id + title as its accessible name", () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    openRow('CASE-2026-001');

    const dialog = screen.getByRole('dialog', { name: /CASE-2026-001/ });
    expect(dialog).toBeInTheDocument();
  });

  it("renders at the side-car's DEFAULT width (PI2-D31 legibility baseline) — no `size=\"wide\"` override", () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    openRow('CASE-2026-001');

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-size', 'default');
  });
});

describe('PI2-D14 — close-restore to the triggering row (C7 baseline, unchanged)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('pressing "← All cases" closes the Drawer and returns focus to the triggering "Open" button', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    const openButton = openRow('CASE-2026-001');

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '← All cases' }));

    // Mid-close (the ~200ms exit transition): the dialog is still mounted
    // (Drawer only unmounts once `phase` reaches 'closed').
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(CLOSE_TRANSITION_MS);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(openButton);
  });
});
