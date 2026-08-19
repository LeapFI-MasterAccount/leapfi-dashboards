/**
 * D17 regression — gapboard report's "Open cases" navigation intent.
 *
 * Base anchors (leapfi-platform.html @ 1c230fe):
 *  - Gap Closure Board Approval Report empty state, source 1503-1504: when
 *    no case has reached the committee ("Nothing is waiting on the
 *    committee…"), the report renders
 *      `<button class="btn ghost" onclick="closeDrawer();goOnside('cases')">Open cases →</button>`
 *    — pressing it routes to the Cases list.
 *
 * The port expresses that route as the screen-level `onNavigate('cases')`
 * intent (Reporting.tsx `handleOpenCases`); this test pins the intent, not
 * App.tsx's routing table.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Reporting } from '../../screens/Reporting';
import { topbarFixture } from './fixtures';

describe("gapboard report 'Open cases' (base 1503-1504)", () => {
  it("empty committee queue shows the fallback and 'Open cases →' emits the cases navigation intent", () => {
    const onNavigate = vi.fn();
    render(<Reporting topbar={topbarFixture()} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /Gap Closure Board Approval Report/ }));
    const dialog = screen.getByRole('dialog');

    // Precondition — the base's genuinely-empty pre-interaction state
    // (source 1503): nothing conditionally approved yet, so the fallback
    // copy and its link render.
    expect(within(dialog).getByText(/Nothing is waiting on the committee/)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Open cases →' }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith('cases');
  });
});
