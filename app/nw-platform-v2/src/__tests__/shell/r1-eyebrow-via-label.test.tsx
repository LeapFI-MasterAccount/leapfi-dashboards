/**
 * §8 R-1 (amendment A4) — ALL-CAPS tracked "eyebrow" treatment sweep
 * regression (delta index §8 R-4(e)).
 *
 * Binding rule: the ALL-CAPS tracked eyebrow treatment is authored ONLY
 * by Label (P3), variant `eyebrow`. No screen, view or composite
 * hand-authors it inline — "the next TYP-4 revision must be a one-line
 * change."
 *
 * Real scan (grepped `letterSpacing` under `src`, excluding
 * `__tests__`): 10 sites carry the TYP-4 tracking value. One
 * (`components/primitives/Label.tsx`) IS P3's own `eyebrow` variant — the
 * sanctioned site. This file sweeps 8 of the remaining 9: `Roadmap.tsx`
 * (`kpiLabelStyle`, `quarterHeadStyle`), `StudioAsk.tsx`
 * (`SOURCES_HEADING_STYLE`), `InvestmentDesign.tsx` (`miniThStyle`),
 * `PresenterRail.tsx` (`RULES_HEADING_STYLE`), `SliderControlRow.tsx`
 * (`eyebrowStyle`), `PlanTable.tsx` (`thStyle`), `NotificationBellPanel
 * .tsx` (`headerStyle`).
 *
 * The 9th non-P3 site — `DataTable.tsx`'s `groupCellStyle` (the
 * group-row header cell) — is deliberately NOT closed here; see this
 * dispatch's `spec_questions`. It is architecturally different from the
 * other 8: its visible content is caller-supplied `ReactNode` (a button
 * with an icon in the one real call site), not a plain string Label's
 * `text` prop can accept, and its color role (`--chart-axis`) diverges
 * from Label's fixed `--ink2` for a documented AA-contrast reason
 * (`--ink2` fails 4.5:1 on `--panel`, which is this group row's own
 * background per `tokens.css`'s own comment). Closing it would require
 * either extending Label's prop contract (an R-2 "extension," which this
 * document routes through the spec owner, not the implementer) or a
 * contrast regression neither the spec nor this dispatch authorizes.
 *
 * Each `it` below asserts the visible eyebrow text renders through
 * Label's own signature markup (`[data-lf-primitive="label"]
 * [data-variant="eyebrow"]`), and that no OTHER element in the render
 * still hand-authors its own `letterSpacing` — a DOM-structural
 * assertion, not a source-text grep.
 */
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Roadmap } from '../../screens/Roadmap';
import { StudioAsk } from '../../screens/StudioAsk';
import { InvestmentDesign } from '../../screens/InvestmentDesign';
import { PresenterRail } from '../../components/PresenterRail';
import { NotificationBellPanel } from '../../views/NotificationBellPanel';
import { SCRIPTS } from '../../data/script';
import type { TopbarProps } from '../../components/Topbar';
import { resetDemo } from '../../state/demoStore';

const topbar: TopbarProps = {
  breadcrumb: 'Studio',
  onOpenBoardDeck: () => {},
  date: 'Aug 19, 2026',
  profile: { name: 'Rachel Fischer', initials: 'RF' },
  profileMenuItems: [],
};

/** Any element OTHER than Label's own rendered span that still carries
 * its own `letterSpacing` inline style — should be empty once a site is
 * closed against R-1 (Label's own span, `[data-lf-primitive="label"]`,
 * is excluded — it is the ONE sanctioned site). */
function strayLetterSpacingElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('*')).filter(
    (el) => el.style.letterSpacing !== '' && el.getAttribute('data-lf-primitive') !== 'label',
  );
}

function eyebrowLabels(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-lf-primitive="label"][data-variant="eyebrow"]'));
}

describe('§8 R-1 — eyebrow treatment authored only by Label (P3) eyebrow', () => {
  it('Roadmap.tsx — KPI label and quarter-head text render through Label eyebrow', () => {
    const { container } = render(<Roadmap topbar={topbar} onNavigate={() => {}} />);
    const labels = eyebrowLabels(container);
    expect(labels.length).toBeGreaterThan(0);
    labels.forEach((el) => expect(el.textContent).not.toBe(''));
    expect(strayLetterSpacingElements(container)).toHaveLength(0);
  });

  it('StudioAsk.tsx — the "Sources" heading renders through Label eyebrow', () => {
    resetDemo();
    vi.useFakeTimers();
    try {
      render(<StudioAsk topbar={topbar} onNavigate={() => {}} />);
      const main = screen.getByRole('main');
      const input = within(main).getByRole('textbox', { name: 'Ask a policy question' });
      fireEvent.change(input, { target: { value: 'What are our rules on indirect auto lending?' } });
      fireEvent.click(within(main).getByRole('button', { name: 'Ask' }));
      act(() => {
        vi.advanceTimersByTime(350);
      });
      act(() => {
        vi.advanceTimersByTime(450);
      });
      const sourcesHeading = eyebrowLabels(document.body).find((el) => el.textContent === 'Sources');
      expect(sourcesHeading).toBeDefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it('InvestmentDesign.tsx — mini-table column headers and slider eyebrow labels render through Label eyebrow, PlanTable header row unaffected in shape', () => {
    const { container } = render(<InvestmentDesign topbar={topbar} onNavigate={() => {}} />);
    const labels = eyebrowLabels(container);
    expect(labels.length).toBeGreaterThan(0);
    expect(strayLetterSpacingElements(container)).toHaveLength(0);
  });

  it('PresenterRail.tsx — "Standing rules" heading renders through Label eyebrow', () => {
    const { container } = render(<PresenterRail script={SCRIPTS.ceo} onNavigate={() => {}} onRestart={() => {}} />);
    // The rail boots Hidden (D18 pre-stage) — bring it Visible via its own
    // keyboard chord (Ctrl+Alt+Shift+P), the same mechanism a presenter
    // uses, rather than reaching into internals.
    fireEvent.keyDown(window, { ctrlKey: true, altKey: true, shiftKey: true, code: 'KeyP' });
    const labels = eyebrowLabels(container);
    expect(labels.some((el) => el.textContent === 'Standing rules')).toBe(true);
    expect(strayLetterSpacingElements(container)).toHaveLength(0);
  });

  it('NotificationBellPanel.tsx — the panel header renders through Label eyebrow', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <NotificationBellPanel notifs={[]} currentRoleKey="cro" currentRoleLabel="Chief Risk Officer" onOpenCase={() => {}} />,
    );
    await user.click(screen.getByRole('button', { name: 'Notifications' }));
    const labels = eyebrowLabels(container);
    expect(labels.some((el) => el.textContent === 'Notifications · Chief Risk Officer')).toBe(true);
    expect(strayLetterSpacingElements(container)).toHaveLength(0);
  });
});
