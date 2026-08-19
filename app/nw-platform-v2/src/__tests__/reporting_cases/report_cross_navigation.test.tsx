/**
 * B-06 regression — report-drawer cross-navigation restored via App.tsx's
 * NAV-PAYLOAD contract.
 *
 * Base anchors (leapfi-platform.html @ 1c230fe, READ-ONLY):
 *  - head() (source 1479-1482): every report drawer carried an "Open full
 *    governance detail · OnSide →" utility link (`closeDrawer();
 *    goOnside('overview')`) alongside the category/subtitle chrome.
 *  - compliance report's control-family table (~1542): control name is a
 *    `.doclink` -> `goOnside('dom-KEY')`; the "Plays it blocks" cell lists
 *    each gated play as a `playLink` -> `openPlay(n)`.
 *  - mrm/tprm reports' "Open register items" tables (1590/1612): every row
 *    is `<tr class="prow" onclick="openObl(domKey,id)">`.
 *
 * The port expresses all four as `views/ReportView.tsx`'s new
 * `onOpenGovernance`/`onOpenDomain`/`onOpenPlay`/`onOpenObligation` props,
 * wired by `Reporting.tsx` through App.tsx's `onDeepLink` (plain nav for
 * the governance link, real deep-link payloads for the other three) — and
 * `Reporting.tsx` now also CONSUMES an inbound `deepLink` of kind
 * `'report'`, opening straight to the named report.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Reporting } from '../../screens/Reporting';
import { topbarFixture } from './fixtures';
import { CTRLDOM, OPPS } from '../../data/studio';
import { OBL } from '../../data/onside';

describe('Report head-bar "Open full governance detail · OnSide →" link (base head() 1481-1482)', () => {
  it('renders on a report and issues a plain nav to onside.overview', () => {
    const onNavigate = vi.fn();
    render(<Reporting topbar={topbarFixture()} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /Risk Posture & Targets/ }));
    const dialog = screen.getByRole('dialog');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Open full governance detail · OnSide →' }));
    expect(onNavigate).toHaveBeenCalledWith('onside.overview');
  });
});

describe('Compliance report control doclink (base ~1542 doclink -> goOnside(dom-KEY))', () => {
  it('a control with a resolvable domain routing key opens that domain via a nav-payload deep link', () => {
    const onNavigate = vi.fn();
    const onDeepLink = vi.fn();
    render(<Reporting topbar={topbarFixture()} onNavigate={onNavigate} onDeepLink={onDeepLink} />);

    fireEvent.click(screen.getByRole('button', { name: /Compliance · Open Items/ }));
    const dialog = screen.getByRole('dialog');

    // 'Model Risk' -> CTRLDOM 'mrm' (data/studio.ts) — a real, resolvable row.
    expect(CTRLDOM['Model Risk']).toBe('mrm');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Model Risk' }));

    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'domain', id: 'mrm' });
  });
});

describe('Compliance report "Plays it blocks" cell (base ~1542 playLink -> openPlay(n))', () => {
  it('a gated play listed in the cell opens the play detail via a nav-payload deep link', () => {
    const onDeepLink = vi.fn();
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} onDeepLink={onDeepLink} />);

    fireEvent.click(screen.getByRole('button', { name: /Compliance · Open Items/ }));
    const dialog = screen.getByRole('dialog');

    const playNames = new Set(OPPS.map((o) => o.n));
    const candidate = within(dialog)
      .getAllByRole('button')
      .find((button) => playNames.has(button.textContent ?? ''));
    expect(candidate).toBeDefined();

    fireEvent.click(candidate as HTMLElement);
    expect(onDeepLink).toHaveBeenCalledWith({
      screen: 'studio.investment-design',
      kind: 'play',
      id: candidate?.textContent,
    });
  });
});

describe('mrm/tprm "Open register items" row -> obligation (base 1590/1612 openObl(domKey,id))', () => {
  it('the Model Risk register row action opens the obligation via a nav-payload deep link', () => {
    const onDeepLink = vi.fn();
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} onDeepLink={onDeepLink} />);

    fireEvent.click(screen.getByRole('button', { name: /Model Risk Report/ }));
    screen.getByRole('dialog');

    const openItem = (OBL.mrm ?? []).find((o) => o.st !== 'met');
    expect(openItem).toBeDefined();
    const row = screen.getByText(openItem!.id).closest('tr');
    expect(row).not.toBeNull();

    fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Open →' }));
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'obligation', id: `mrm:${openItem!.id}` });
  });

  it('the Third-Party Risk register row action opens the obligation via a nav-payload deep link', () => {
    const onDeepLink = vi.fn();
    render(<Reporting topbar={topbarFixture()} onNavigate={() => {}} onDeepLink={onDeepLink} />);

    fireEvent.click(screen.getByRole('button', { name: /Third-Party & Vendor Risk/ }));
    const dialog = screen.getByRole('dialog');

    const openItem = (OBL.tprm ?? []).find((o) => o.st !== 'met');
    expect(openItem).toBeDefined();
    const row = screen.getByText(openItem!.id).closest('tr');
    expect(row).not.toBeNull();

    fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Open →' }));
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'obligation', id: `tprm:${openItem!.id}` });
    expect(within(dialog).getByRole('heading', { name: 'Third-Party & Vendor Risk' })).toBeInTheDocument();
  });
});

describe('Reporting consumes an inbound "report" deep link (App.tsx NAV-PAYLOAD contract)', () => {
  it('opens the named report directly and marks the payload consumed', () => {
    const onDeepLinkConsumed = vi.fn();
    render(
      <Reporting
        topbar={topbarFixture()}
        onNavigate={() => {}}
        deepLink={{ screen: 'reporting', kind: 'report', id: 'roi', nonce: 7 }}
        onDeepLinkConsumed={onDeepLinkConsumed}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Platform ROI' })).toBeInTheDocument();
    expect(onDeepLinkConsumed).toHaveBeenCalledWith(7);
  });

  it('a malformed report id never crashes the screen and still marks the payload consumed', () => {
    const onDeepLinkConsumed = vi.fn();
    render(
      <Reporting
        topbar={topbarFixture()}
        onNavigate={() => {}}
        deepLink={{ screen: 'reporting', kind: 'report', id: 'not-a-real-kind', nonce: 3 }}
        onDeepLinkConsumed={onDeepLinkConsumed}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onDeepLinkConsumed).toHaveBeenCalledWith(3);
  });
});
