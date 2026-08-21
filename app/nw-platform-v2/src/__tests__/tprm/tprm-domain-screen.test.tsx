/**
 * TprmDomain — L9 (PI-3 sprint plan, call-14; `implementation/DECISIONS.md`
 * D3) new 8th top-level module screen.
 *
 * Pins D3's content-shape ruling directly against the LIVE, already-ported
 * data (`data/onside.ts` DOMAINS['tprm'], `data/onside.ts` OBL['tprm'],
 * `data/doclib.ts` DOCLIB) rather than a hand-copied literal count, so this
 * suite never drifts from the data module it exercises (same discipline
 * `src/__tests__/onside/documents-universe.test.tsx` already uses).
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TprmDomain } from '../../screens/TprmDomain';
import { DOMAINS, OBL } from '../../data/onside';
import { DOCLIB } from '../../data/doclib';

const TPRM = DOMAINS.find((d) => d.key === 'tprm');
if (!TPRM) throw new Error('expected data/onside.ts DOMAINS to carry a tprm entry');

const TPRM_OBLIGATIONS = OBL['tprm'] ?? [];
const TPRM_OPEN_OBLIGATIONS = TPRM_OBLIGATIONS.filter((row) => row.st !== 'met');
const TPRM_DOCS = Object.entries(DOCLIB).filter(([, doc]) => doc.dom === 'tprm');

function renderScreen(onDeepLink?: ReturnType<typeof vi.fn>) {
  const onNavigate = vi.fn();
  const props = onDeepLink ? { onNavigate, onDeepLink } : { onNavigate };
  const utils = render(<TprmDomain {...props} />);
  return { onNavigate, ...utils };
}

describe('TprmDomain · posture summary (D3: "DomainPostureCard, PosturePillBar" composites, tprm domain)', () => {
  it('renders the tprm domain name, status, and met/target meta line from live DOMAINS data', () => {
    renderScreen();
    expect(screen.getByRole('heading', { level: 1, name: /Third-Party Risk Management/ })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TPRM.bodies}`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${TPRM.met} at required maturity`))).toBeInTheDocument();
  });

  it('renders a real PosturePillBar (C12) list scoped to the tprm domain', () => {
    const { container } = renderScreen();
    const bar = container.querySelector('[data-lf-composite="posture-pill-bar"]');
    expect(bar).not.toBeNull();
    expect(within(bar as HTMLElement).getAllByRole('listitem').length).toBeGreaterThan(0);
  });

  it('the "See Third-Party Risk in OnSide · Overview" cross-link fires a domain deep link', async () => {
    const user = userEvent.setup();
    const onDeepLink = vi.fn();
    renderScreen(onDeepLink);
    await user.click(screen.getByRole('button', { name: /See Third-Party Risk in OnSide/ }));
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'domain', id: 'tprm' });
  });
});

describe('TprmDomain · obligations DataTable (D3: "DataTable(obligations, tprm-filtered)")', () => {
  it('renders exactly the tprm open gaps/partials — never the full register, never another domain\'s rows', () => {
    renderScreen();
    const table = screen.getByRole('table', { name: 'Third-Party Risk Management gaps and partials' });
    expect(within(table).getAllByRole('row')).toHaveLength(TPRM_OPEN_OBLIGATIONS.length + 1); // + header row
    for (const row of TPRM_OPEN_OBLIGATIONS) {
      expect(within(table).getByText(row.id)).toBeInTheDocument();
    }
  });

  it('a row\'s "Open" action fires the EXISTING obligation deep-link kind, id `tprm:<obligationId>`', async () => {
    const openRow = TPRM_OPEN_OBLIGATIONS[0];
    if (!openRow) throw new Error('expected at least one open tprm obligation to exercise the row action');
    const user = userEvent.setup();
    const onDeepLink = vi.fn();
    renderScreen(onDeepLink);
    const cell = screen.getByText(openRow.id);
    const row = cell.closest('tr');
    if (!row) throw new Error('expected a table row for the obligation');
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }));
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'obligation', id: `tprm:${openRow.id}` });
  });

  it('falls back to plain onNavigate when onDeepLink is not wired (same contract as views/HomePanels.tsx fireOrDeepLink)', async () => {
    const openRow = TPRM_OPEN_OBLIGATIONS[0];
    if (!openRow) throw new Error('expected at least one open tprm obligation to exercise the row action');
    const user = userEvent.setup();
    const { onNavigate } = renderScreen();
    const cell = screen.getByText(openRow.id);
    const row = cell.closest('tr');
    if (!row) throw new Error('expected a table row for the obligation');
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }));
    expect(onNavigate).toHaveBeenCalledWith('onside.overview');
  });

  // HR-SHELL-01: the posture row above states the FULL register
  // (domain.appl/tot/met — 33/33/24), but this table only ever renders the
  // 12-row representative subset (`OBL['tprm']`). Left undisclosed, "Gaps &
  // partials · 6 of 12 obligations" directly under "33 obligations in
  // scope" states two different denominators for the same noun
  // ("obligations") with nothing telling the reader which is the real
  // register size — exactly the discrepancy `views/DomainsAccordion.tsx`'s
  // own identical pattern already discloses via a "shown obligations"
  // heading qualifier and a footer reconciliation pill.
  it('HR-SHELL-01: discloses that the obligations table shows a subset, and reconciles it against the domain\'s real register size', () => {
    renderScreen();
    // The posture row's own denominator (the thing a reader could
    // mistakenly compare the table heading's "12" against).
    expect(screen.getByText(new RegExp(`${TPRM.appl} obligations in scope`))).toBeInTheDocument();
    // The table heading now says "shown obligations", not a bare
    // "obligations" that invites a false apples-to-apples comparison
    // against the posture row's 33.
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: `Gaps & partials · ${TPRM_OPEN_OBLIGATIONS.length} of ${TPRM_OBLIGATIONS.length} shown obligations`,
      }),
    ).toBeInTheDocument();
    // A reconciliation statement names the real, full-register count (the
    // posture row's own `domain.appl`) so the 12-vs-33 gap is explained,
    // not silent.
    const metShown = TPRM_OBLIGATIONS.filter((row) => row.st === 'met').length;
    expect(
      screen.getByText(`${metShown} met obligations shown here and the full register with provenance: all ${TPRM.appl} enumerated`),
    ).toBeInTheDocument();
  });
});

describe('TprmDomain · documents DataTable (D3: "DataTable(documents) with the Domain filter" -> Domain-filtered to tprm)', () => {
  it('renders exactly the DOCLIB entries whose domain is tprm — never a cross-domain document', () => {
    renderScreen();
    const table = screen.getByRole('table', { name: 'Third-Party Risk Management document library' });
    expect(within(table).getAllByRole('row')).toHaveLength(TPRM_DOCS.length + 1); // + header row
    // Spot-check a handful of ids resolve to their decoded titles in the table.
    for (const [, doc] of TPRM_DOCS.slice(0, 3)) {
      const plainTitle = doc.t.replace(/&amp;/g, '&').replace(/&rsquo;/g, '’');
      expect(within(table).getAllByText(new RegExp(plainTitle.split(' ')[0] ?? plainTitle)).length).toBeGreaterThan(0);
    }
  });

  it('a row\'s "View" action fires the EXISTING document deep-link kind, id = the DOCLIB id', async () => {
    const [docId, doc] = TPRM_DOCS[0] ?? [];
    if (!docId || !doc) throw new Error('expected at least one tprm document to exercise the row action');
    const user = userEvent.setup();
    const onDeepLink = vi.fn();
    renderScreen(onDeepLink);
    const plainTitle = doc.t.replace(/&amp;/g, '&').replace(/&rsquo;/g, '’');
    const cell = screen.getAllByText(plainTitle)[0];
    if (!cell) throw new Error('expected a rendered cell for the document title');
    const row = cell.closest('tr');
    if (!row) throw new Error('expected a table row for the document');
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'View' }));
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.documents', kind: 'document', id: docId });
  });

  it('no cross-domain document (e.g. an mrm-only id) leaks into the tprm-filtered table', () => {
    renderScreen();
    const table = screen.getByRole('table', { name: 'Third-Party Risk Management document library' });
    const [mrmOnlyId, mrmDoc] = Object.entries(DOCLIB).find(([, d]) => d.dom === 'mrm') ?? [];
    if (!mrmOnlyId || !mrmDoc) throw new Error('expected at least one mrm-domain document in DOCLIB');
    const plainTitle = mrmDoc.t.replace(/&amp;/g, '&').replace(/&rsquo;/g, '’');
    expect(within(table).queryByText(plainTitle)).not.toBeInTheDocument();
  });
});

describe('TprmDomain · case link (D3: "a link to CASE-2026-002 via the existing case deep-link kind")', () => {
  it('renders an interactive SetupCard naming CASE-2026-002', () => {
    renderScreen();
    expect(screen.getByRole('button', { name: /TPRM review case · CASE-2026-002/ })).toBeInTheDocument();
  });

  it('pressing it fires the EXISTING case deep-link kind with id CASE-2026-002', async () => {
    const user = userEvent.setup();
    const onDeepLink = vi.fn();
    renderScreen(onDeepLink);
    await user.click(screen.getByRole('button', { name: /TPRM review case · CASE-2026-002/ }));
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'cases', kind: 'case', id: 'CASE-2026-002' });
  });

  it('falls back to plain onNavigate("cases") when onDeepLink is not wired', async () => {
    const user = userEvent.setup();
    const { onNavigate } = renderScreen();
    await user.click(screen.getByRole('button', { name: /TPRM review case · CASE-2026-002/ }));
    expect(onNavigate).toHaveBeenCalledWith('cases');
  });
});

describe('TprmDomain · accessibility gate (persona directive 7)', () => {
  it('main carries aria-labelledby pointing at the real page h1', () => {
    const { container } = renderScreen();
    const main = container.querySelector('main');
    expect(main).not.toBeNull();
    const labelledBy = main?.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)?.tagName).toBe('H1');
  });

  it('the domain status is never color-only: the status Tag carries visible text alongside the posture bar', () => {
    renderScreen();
    const statusLabels = ['Below target', 'At target', 'Above target'];
    expect(statusLabels.some((label) => screen.queryByText(label) !== null)).toBe(true);
  });
});
