/**
 * Panel-seated contrast regression (hostile-review fix wave, Class C
 * findings C1/C2).
 *
 * Sprint 1's hostile review confirmed 18 findings; C1 ("`--ink2` on
 * `--panel` = 4.344:1 in light theme, under the 4.5:1 AA floor") and C2
 * (`Tag`'s status variants deriving text color from `var(--bg)`, the
 * page-background role, rather than a color chosen for legibility against
 * the fill) are two of them. The brand authority's ruling for C1 is an
 * exact substitution — `color: var(--ink2)` -> `color: var(--chart-axis)`
 * at every site where the element's background resolves to `--panel` —
 * and for C2, a new theme-invariant token (`--sem-ink`, fixed #000000 in
 * both theme blocks, tokens.css) replacing `var(--bg)`.
 *
 * This file pins that substitution at rendered-DOM level for three
 * representative, brand-authority-confirmed panel-seated sites so a
 * regression (someone reverting one of these call sites back to
 * `var(--ink2)` / `var(--bg)`) is caught by an executed test, not just a
 * static grep. jsdom does not resolve CSS custom properties (see
 * components/Topbar.tsx's own "TESTED VIA CSSOM, NOT COMPUTED STYLE" note)
 * so these assertions read the literal `var(--x)` string React puts on the
 * inline `style` attribute, not a resolved color.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PosturePillBar } from '../../components/PosturePillBar';
import { StatCard } from '../../components/StatCard';
import { SetupCard } from '../../components/SetupCard';
import { Drawer } from '../../components/Drawer';
import { Tag } from '../../components/primitives/Tag';
import { Label } from '../../components/primitives/Label';
import { StatValue } from '../../components/primitives/StatValue';
import type { PostureSegment } from '../../engine/plan';
import App from '../../App';
import { Roadmap } from '../../screens/Roadmap';
import { OnSideOverview } from '../../screens/OnSideOverview';
import { InvestmentDesign } from '../../screens/InvestmentDesign';
import { Reporting } from '../../screens/Reporting';
import { Cases } from '../../screens/Cases';
import { SettingsToggles } from '../../screens/SettingsToggles';
import { SettingsAbout } from '../../screens/SettingsAbout';
import { ShowTheWorkingPanel } from '../../views/ShowTheWorkingPanel';
import { CaseDetail } from '../../views/CaseDetail';
import { NotificationBellPanel } from '../../views/NotificationBellPanel';
import { ChatIntakeWizard } from '../../views/ChatIntakeWizard';
import { BoardLogForm } from '../../views/BoardLogForm';
import { HomeCustomizeBar, DEFAULT_VISIBLE_KEYS, HOME_PANEL_DEFS } from '../../views/HomeCustomizeBar';
import { resetDemo, DEFAULT_SLIDERS } from '../../state/demoStore';
import { CASES, seedCases } from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { CURRENT } from '../../data/studio';
import { DOMAINS } from '../../data/onside';

describe('PosturePillBar (C12) — segment text color on its own var(--panel) fill (C1)', () => {
  const segments: PostureSegment[] = [
    { index: 0, band: 'Ad hoc', isCurrent: false, isTarget: false, isBetween: false, label: '1 · Ad hoc' },
    { index: 1, band: 'Developing', isCurrent: true, isTarget: false, isBetween: false, label: '2 · Developing · now' },
    { index: 2, band: 'Defined', isCurrent: false, isTarget: false, isBetween: true, label: '3 · Defined' },
    { index: 3, band: 'Managed', isCurrent: false, isTarget: true, isBetween: false, label: '4 · Managed · goal' },
  ];

  it('the "between" segment (background: var(--panel)) never carries color: var(--ink2)', () => {
    render(<PosturePillBar segments={segments} />);
    const betweenSegment = screen.getByText('3 · Defined');
    expect(betweenSegment.style.background).toBe('var(--panel)');
    expect(betweenSegment.style.color).not.toBe('var(--ink2)');
    expect(betweenSegment.style.color).toBe('var(--chart-axis)');
  });

  it('the "neither" (default) segment (background: var(--panel)) never carries color: var(--ink2)', () => {
    render(<PosturePillBar segments={segments} />);
    const neitherSegment = screen.getByText('1 · Ad hoc');
    expect(neitherSegment.style.background).toBe('var(--panel)');
    expect(neitherSegment.style.color).not.toBe('var(--ink2)');
    expect(neitherSegment.style.color).toBe('var(--chart-axis)');
  });
});

describe('StatCard (C1) qualifier — rendered inside cardStyle (spreads PANEL_STYLE, C1)', () => {
  it('the qualifier caption never carries color: var(--ink2)', () => {
    render(<StatCard label="Expected 3-year ROI" value="4.2x" qualifier="blended" />);
    const qualifier = screen.getByText('blended');
    expect(qualifier.style.color).not.toBe('var(--ink2)');
    expect(qualifier.style.color).toBe('var(--chart-axis)');
  });
});

describe('Tag (P4) status variants — text color derived from a fill-legible token, not var(--bg) (C2)', () => {
  it.each(['status-positive', 'status-caution', 'status-alert'] as const)(
    '%s never carries color: var(--bg) (theme-swapping, accidentally-legible-only-in-dark-mode)',
    (variant) => {
      render(<Tag variant={variant} text="Status" />);
      const tag = screen.getByText('Status');
      expect(tag.style.color).not.toBe('var(--bg)');
      expect(tag.style.color).toBe('var(--sem-ink)');
    },
  );
});

/**
 * CLASS SWEEP — C1 as a class (remediation wave 2, amendment A14).
 *
 * The three describes above pin three individually-confirmed sites. This
 * section instead DERIVES the site inventory from rendered DOM: for every
 * element in a render whose inline `color` is the literal string
 * `var(--ink2)`, it walks `parentElement` (starting at the element itself)
 * to the nearest ancestor carrying an explicit `background`/`backgroundColor`
 * style and asserts that ancestor's value is never `var(--panel)` — the
 * exact class definition the hostile-review remediation-wave dispatch
 * states (any `--ink2` text whose nearest explicitly-backgrounded ancestor
 * resolves to `--panel`, 4.344:1 in light theme, below the 4.5:1 AA floor).
 * This is strictly broader than a same-object-literal grep (the existing
 * `theme/__tests__/contrast.test.ts` "C1 regression sweep" already covers
 * that, and states its own "does NOT... catch a background inherited from
 * an ANCESTOR" limitation) — it catches Label (P3) / StatValue (P11)
 * consumers whose panel background lives in a parent element, a parent
 * component, or (for every Drawer, C7, consumer) an ancestor the consuming
 * file never itself declares.
 */
function nearestExplicitBackground(start: HTMLElement): string | null {
  let cursor: HTMLElement | null = start;
  while (cursor) {
    const bg = cursor.style.background || cursor.style.backgroundColor;
    if (bg) return bg;
    cursor = cursor.parentElement;
  }
  return null;
}

interface PanelInk2Violation {
  tag: string;
  text: string;
  nearestBackground: string | null;
}

function findPanelSeatedInk2(root: HTMLElement): PanelInk2Violation[] {
  const candidates: HTMLElement[] = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
  const violations: PanelInk2Violation[] = [];
  for (const el of candidates) {
    if (el.style.color !== 'var(--ink2)') continue;
    const nearestBackground = nearestExplicitBackground(el);
    if (nearestBackground === 'var(--panel)') {
      violations.push({ tag: el.tagName, text: (el.textContent ?? '').trim().slice(0, 80), nearestBackground });
    }
  }
  return violations;
}

/** Asserts zero panel-seated `var(--ink2)` text nodes in `container`,
 * printing every violation (site + text) in the failure message so a
 * regression is diagnosable from the test output alone. */
function expectNoPanelSeatedInk2(container: HTMLElement, label: string): void {
  const violations = findPanelSeatedInk2(container);
  expect(violations, `${label}: ${JSON.stringify(violations)}`).toEqual([]);
}

describe('CLASS SWEEP — utility self-test (proves the derivation is not a no-op)', () => {
  it('flags a synthetic node whose nearest ancestor with an explicit background carries var(--panel), several levels up', () => {
    const { container } = render(
      <div style={{ background: 'var(--panel)' }}>
        <div>
          <div>
            <span style={{ color: 'var(--ink2)' }}>buried under three unbackgrounded ancestors</span>
          </div>
        </div>
      </div>,
    );
    expect(findPanelSeatedInk2(container)).toHaveLength(1);
  });

  it('does NOT flag var(--ink2) whose nearest explicit background is not var(--panel) (e.g. var(--bg), var(--bg2), transparent)', () => {
    const { container } = render(
      <div style={{ background: 'var(--panel)' }}>
        <div style={{ background: 'var(--bg2)' }}>
          <span style={{ color: 'var(--ink2)' }}>a closer, non-panel background shields the panel ancestor</span>
        </div>
      </div>,
    );
    expect(findPanelSeatedInk2(container)).toHaveLength(0);
  });

  it('does NOT flag var(--chart-axis) (the prescribed substitute) even directly on var(--panel)', () => {
    const { container } = render(
      <div style={{ background: 'var(--panel)' }}>
        <span style={{ color: 'var(--chart-axis)' }}>fixed</span>
      </div>,
    );
    expect(findPanelSeatedInk2(container)).toHaveLength(0);
  });
});

describe('CLASS SWEEP — Label (P3) / StatValue (P11) primitive, surface prop (amendment A14)', () => {
  it('Label surface="page" (default) is byte-identical to pre-A14 behavior: var(--ink2), regardless of ancestor', () => {
    const { container } = render(
      <div style={{ background: 'var(--panel)' }}>
        <Label text="default surface" variant="body-secondary" />
      </div>,
    );
    expect(screen.getByText('default surface').style.color).toBe('var(--ink2)');
    expect(findPanelSeatedInk2(container)).toHaveLength(1); // proves the primitive itself does NOT self-remediate
  });

  it('Label surface="panel" resolves to var(--chart-axis) for both variants', () => {
    render(
      <>
        <Label text="panel body-secondary" variant="body-secondary" surface="panel" />
        <Label text="panel eyebrow" variant="eyebrow" surface="panel" />
      </>,
    );
    expect(screen.getByText('panel body-secondary').style.color).toBe('var(--chart-axis)');
    expect(screen.getByText('panel eyebrow').style.color).toBe('var(--chart-axis)');
  });

  it('Label disabled dimming (var(--ink3)) is unaffected by surface', () => {
    render(<Label text="disabled panel" variant="body-secondary" surface="panel" disabled />);
    expect(screen.getByText('disabled panel').style.color).toBe('var(--ink3)');
  });

  it('StatValue surface="page" (default) is byte-identical to pre-A14 behavior: var(--ink2)', () => {
    render(<StatValue value="4.2x" unit="ROI" label="Expected 3-year ROI" />);
    // The unit/label spans are aria-hidden presentation children — query directly.
    const unitSpan = screen.getByText('ROI');
    const labelSpan = screen.getByText('Expected 3-year ROI');
    expect(unitSpan.style.color).toBe('var(--ink2)');
    expect(labelSpan.style.color).toBe('var(--ink2)');
  });

  it('StatValue surface="panel" resolves unit/label captions to var(--chart-axis)', () => {
    render(<StatValue value="4.2x" unit="ROI" label="Expected 3-year ROI" surface="panel" />);
    expect(screen.getByText('ROI').style.color).toBe('var(--chart-axis)');
    expect(screen.getByText('Expected 3-year ROI').style.color).toBe('var(--chart-axis)');
  });

  it('StatValue loading-state label caption also resolves via surface', () => {
    render(<StatValue value="—" label="Expected 3-year ROI" state="loading" surface="panel" />);
    expect(screen.getByText('Expected 3-year ROI').style.color).toBe('var(--chart-axis)');
  });
});

describe('CLASS SWEEP — StatCard (C1) unconditional panel wiring', () => {
  it('loaded, non-interactive: Label + StatValue never carry var(--ink2)', () => {
    const { container } = render(<StatCard label="Expected 3-year ROI" value="4.2x" />);
    expectNoPanelSeatedInk2(container, 'StatCard (loaded)');
  });

  it('interactive variant: Label + StatValue never carry var(--ink2)', () => {
    const { container } = render(<StatCard label="Open control families" value="6" onPress={() => {}} />);
    expectNoPanelSeatedInk2(container, 'StatCard (interactive)');
  });

  it('with a qualifier caption: never var(--ink2)', () => {
    const { container } = render(<StatCard label="Payback" value="8 mo" qualifier="blended" />);
    expectNoPanelSeatedInk2(container, 'StatCard (qualifier)');
  });

  it('loading state: StatValue label caption never var(--ink2)', () => {
    const { container } = render(<StatCard label="Annual value" value="—" state="loading" />);
    expectNoPanelSeatedInk2(container, 'StatCard (loading)');
  });
});

describe('CLASS SWEEP — SetupCard (C15) unconditional panel wiring', () => {
  it('interactive, with description: never var(--ink2)', () => {
    const { container } = render(<SetupCard title="Connect" description="The MCP and API layer" variant="interactive" onPress={() => {}} />);
    expectNoPanelSeatedInk2(container, 'SetupCard (interactive)');
  });

  it('locked, with description: never var(--ink2)', () => {
    const { container } = render(<SetupCard title="Vantage" description="Coming soon" variant="locked" />);
    expectNoPanelSeatedInk2(container, 'SetupCard (locked)');
  });
});

describe('CLASS SWEEP — Roadmap screen (kpiCardStyle / quarterColStyle, both PANEL_STYLE)', () => {
  beforeEach(resetDemo);

  it('KPI row + quarter columns + quarter marker: never var(--ink2)', () => {
    const { container } = render(<Roadmap onNavigate={() => {}} />);
    expectNoPanelSeatedInk2(container, 'Roadmap');
  });
});

describe('CLASS SWEEP — OnSideOverview screen (DomainPostureCard, CARD_STYLE) + DomainsAccordion (cardStyle)', () => {
  it('DomainPostureCard meta line: never var(--ink2)', () => {
    const { container } = render(<OnSideOverview onNavigate={() => {}} />);
    expectNoPanelSeatedInk2(container, 'OnSideOverview (posture grid)');
  });

  it('an expanded DomainsAccordion row: its own "Target · N · band" Label is fixed; the disclosed residual is DataTable\'s (C6) header-cell Label, which inherits page/panel seating from whatever ancestor a consuming screen nests it in — panel-seated here (the accordion row\'s own cardStyle), page-seated at every OTHER DataTable consumer traced for this dispatch (OnSideDocuments/OnSideFeed/OnSideOwnership/Cases/RegulatoryFeed*) — STOP item, no ratified fix (DataTable has no surface-aware prop, and unconditionally setting its header to surface="panel" would violate Camille\'s ruling for its page-seated majority)', async () => {
    const user = userEvent.setup();
    render(<OnSideOverview onNavigate={() => {}} />);
    const firstDomain = DOMAINS[0]!;
    // DomainPostureCard (posture grid, above) ALSO renders a same-named
    // button — scope to the accordion header specifically (it alone
    // carries aria-expanded; DomainPostureCard's title button does not).
    const candidates = screen.getAllByRole('button', { name: new RegExp(firstDomain.name) });
    const accordionHeader = candidates.find((el) => el.hasAttribute('aria-expanded'));
    expect(accordionHeader).toBeDefined();
    await user.click(accordionHeader as HTMLElement);
    // The fix: the accordion's own "Target · N · band" Label is no longer
    // var(--ink2) (it now resolves to var(--chart-axis)).
    expect(screen.getByText(/^Target ·/).style.color).toBe('var(--chart-axis)');
    // The disclosed residual: the nested obligations/top-open-items
    // DataTable's own header-cell Label(s) — pinned, not silently dropped.
    const openItemHeader = screen.getByText('Open item');
    expect(openItemHeader.style.color).toBe('var(--ink2)');
  });
});

describe('CLASS SWEEP — ShowTheWorkingPanel (Drawer/C7 root is var(--panel))', () => {
  it('both StatValue captions (ROI, Annual value) are fixed; the panel carries exactly the ONE disclosed residual (Slider/P7 labelRowStyle — STOP item, outside this dispatch\'s ratified Label/StatValue-only fix mechanism, see evidence return)', () => {
    render(<ShowTheWorkingPanel open onClose={() => {}} baseline={DEFAULT_SLIDERS} />);
    // The fix: neither StatValue caption ("Expected 3-year ROI"/"Annual
    // value" labels, or their unit text) carries var(--ink2) any more.
    expect(screen.getByText('Expected 3-year ROI').style.color).not.toBe('var(--ink2)');
    expect(screen.getByText('Annual value').style.color).not.toBe('var(--ink2)');
    // The disclosed residual: Slider.tsx's own labelRowStyle (P7, not
    // ratified for a `surface` prop by either persona ruling) — pinned
    // here, not silently dropped, so it cannot regress un-noticed and
    // cannot be mistaken for "closed." (Drawer's own <h2> title carries
    // the same text, "Adoption / efficacy" — disambiguate by tag: the
    // Slider's own <label> is the one whose parent row carries the color.)
    const sliderFieldLabel = screen.getAllByText('Adoption / efficacy').find((el) => el.tagName === 'LABEL');
    expect(sliderFieldLabel).toBeDefined();
    expect(sliderFieldLabel?.parentElement?.style.color).toBe('var(--ink2)');
  });
});

describe('CLASS SWEEP — CaseDetail view (CARD_STYLE sections) + RedlineDiffView (rendered inside it)', () => {
  beforeEach(() => {
    seedCases(DOCLIB);
  });

  it('a seeded case with a redline document: Case meta Labels + RedlineDiffView Before/After Labels never var(--ink2)', () => {
    const caseItem = CASES[0];
    expect(caseItem).toBeDefined();
    const doc = DOCLIB[caseItem!.doc];
    const { container } = render(
      <CaseDetail
        caseItem={caseItem!}
        doc={doc}
        currentUser={CURRENT}
        onBack={() => {}}
        onAction={() => {}}
        pendingAction={null}
      />,
    );
    expectNoPanelSeatedInk2(container, 'CaseDetail');
  });

  it('the email-preview Drawer ("Notification · email preview" Label): never var(--ink2)', async () => {
    const user = userEvent.setup();
    const seededCase = CASES[0];
    expect(seededCase).toBeDefined();
    // "View the email you were sent" renders only in the `stage === 'cro'`
    // actionable branch (renderActions) — every seeded case boots at
    // 'analyst' (data/cases.ts seedCases), so force the stage CURRENT (CRO)
    // can act on, to reach that branch.
    const caseItem = { ...seededCase!, stage: 'cro' };
    const doc = DOCLIB[caseItem.doc];
    const { container } = render(
      <CaseDetail
        caseItem={caseItem}
        doc={doc}
        currentUser={CURRENT}
        onBack={() => {}}
        onAction={() => {}}
        pendingAction={null}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'View the email you were sent' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expectNoPanelSeatedInk2(container, 'CaseDetail (email preview Drawer)');
  });
});

describe('CLASS SWEEP — Cases screen host (renders CaseDetail through the real screen)', () => {
  beforeEach(() => {
    seedCases(DOCLIB);
  });

  it('opening a case from the list: never var(--ink2)', () => {
    const { container } = render(
      <Cases
        topbar={{ breadcrumb: 'Northwinds Credit Union', onOpenBoardDeck: () => {}, date: 'Aug 15, 2026', profile: { name: CURRENT.name, initials: CURRENT.ini }, profileMenuItems: [] }}
        onNavigate={() => {}}
      />,
    );
    const idCell = screen.getByText(CASES[0]!.id);
    const row = idCell.closest('tr');
    expect(row).not.toBeNull();
    fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }));
    expectNoPanelSeatedInk2(container, 'Cases (detail open)');
  });
});

describe('CLASS SWEEP — NotificationBellPanel (panelStyle, PANEL_STYLE)', () => {
  it('open, with notifications: header + row caption Labels never var(--ink2)', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <NotificationBellPanel
        notifs={[{ to: 'cro', title: 'CASE-2026-001 is waiting on you', cid: 'CASE-2026-001', kind: 'app', when: 'Aug 15, 2026 · 9:14 AM ET', read: false }]}
        currentRoleKey="cro"
        currentRoleLabel="Chief Risk Officer"
        onOpenCase={() => {}}
      />,
    );
    await user.click(screen.getByRole('button', { name: /Notifications/ }));
    expectNoPanelSeatedInk2(container, 'NotificationBellPanel (open)');
  });
});

describe('CLASS SWEEP — ChatIntakeWizard (reviewPanelStyle, PANEL_STYLE)', () => {
  it('the review panel (Build/Value/Controls/Regulations/Domains/Placement eyebrows): never var(--ink2)', () => {
    const { container } = render(
      <ChatIntakeWizard useCaseName="Collections outreach drafting" onComplete={() => {}} onDiscard={() => {}} onCancel={() => {}} />,
    );
    expectNoPanelSeatedInk2(container, 'ChatIntakeWizard (review panel)');
  });
});

describe('CLASS SWEEP — BoardLogForm (rendered only inside the shared reporting Drawer, var(--panel) root)', () => {
  it('the eyebrow header + history-row Labels are fixed; the ONE disclosed residual is Input\'s (P6) own labelStyle ("Expected compliance date" — STOP item, outside this dispatch\'s ratified Label/StatValue-only fix mechanism)', () => {
    render(
      <Drawer open title="Log an update · 2026-13" onClose={() => {}}>
        <BoardLogForm
          entries={[{ txt: 'Draft circulated to counsel.', when: 'Aug 15, 2026', who: 'Rachel Fischer', date: 'Sep 1, 2026' }]}
          date=""
          onDateChange={() => {}}
          text=""
          onTextChange={() => {}}
          onSave={() => {}}
        />
      </Drawer>,
    );
    // The fix: the "Board reporting · open item" eyebrow and every
    // history-row Label no longer carry var(--ink2).
    expect(screen.getByText('Board reporting · open item').style.color).not.toBe('var(--ink2)');
    expect(screen.getByText('Logged Aug 15, 2026').style.color).not.toBe('var(--ink2)');
    expect(screen.getByText('Draft circulated to counsel.').style.color).not.toBe('var(--ink2)');
    // The disclosed residual: Input.tsx's own labelStyle (P6, not ratified
    // for a `surface` prop) — pinned, not silently dropped.
    expect(screen.getByText('Expected compliance date').style.color).toBe('var(--ink2)');
  });
});

describe('CLASS SWEEP — PresenterRail (RAIL_STYLE root is var(--panel) unconditionally)', () => {
  it('mid-script (expanded by default — Say/Do render with no press needed): STEP/Say/Do/Standing-rules Labels never var(--ink2)', () => {
    render(<App />);
    fireEvent.keyDown(window, { key: 'P', code: 'KeyP', ctrlKey: true, altKey: true, shiftKey: true });
    const rail = screen.getByRole('region', { name: 'Presenter rail' });
    expect(within(rail).getByRole('button', { name: 'Collapse' })).toBeInTheDocument(); // expanded by default (PresenterRail.tsx `useState(true)`)
    expectNoPanelSeatedInk2(rail, 'PresenterRail');
  });
});

describe('CLASS SWEEP — DrawerContent (always rendered inside a Drawer, C7)', () => {
  beforeEach(resetDemo);

  it('a play-detail Drawer opened from InvestmentDesign\'s funded table: field-label Labels never var(--ink2)', () => {
    const { container } = render(<InvestmentDesign />);
    const rows = screen.getAllByRole('row');
    const dataRow = rows.find((row) => within(row).queryByRole('button', { name: 'Open' }) !== null);
    expect(dataRow).toBeDefined();
    fireEvent.click(within(dataRow as HTMLElement).getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expectNoPanelSeatedInk2(container, 'DrawerContent (play detail)');
  });
});

describe('CLASS SWEEP — SliderControlRow ("Your stance" eyebrow, stanceBoxStyle spreads PANEL_STYLE), via InvestmentDesign', () => {
  beforeEach(resetDemo);

  it('never var(--ink2)', () => {
    const { container } = render(<InvestmentDesign />);
    expectNoPanelSeatedInk2(container, 'InvestmentDesign (SliderControlRow stance box)');
  });
});

describe('CLASS SWEEP — ReportView (rendered only inside Reporting\'s shared Drawer, var(--panel) root)', () => {
  it('the chrome eyebrows + TableSection heading + appendix eyebrow Labels are fixed; the ONE disclosed residual is DeckSlide\'s (composite, reused both page-seated on the real Board Deck screen and panel-seated here) own hardcoded body-paragraph color — STOP item, outside this dispatch\'s ratified Label/StatValue-only fix mechanism', () => {
    render(<Reporting onNavigate={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Board Pack/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // The fix: ReportView's own chrome + TableSection + appendix Labels no
    // longer carry var(--ink2).
    expect(screen.getByText('LEAPFI · Reporting · generated from the live record').style.color).not.toBe('var(--ink2)');
    expect(screen.getByText('The appendix · the one-page read behind the deck').style.color).not.toBe('var(--ink2)');
    // The disclosed residual: DeckSlide.tsx's own body-paragraph style
    // (hardcoded var(--ink2), never routed through Label) — pinned, not
    // silently dropped. DeckSlide's own `eyebrow` prop DOES route through
    // Label, and inherits the SAME seating ambiguity (page-seated on the
    // real Board Deck screen, panel-seated here) that Camille's ruling
    // flags for Label generally — also left as `surface="page"` (default)
    // pending design authority, so it is a SECOND residual on the same
    // composite, not double-counted here as a different site.
    const bodyParagraph = screen.getByText(/Prepared for the Board Risk Committee/);
    expect(bodyParagraph.style.color).toBe('var(--ink2)');
    const eyebrow = screen.getByText('LEAPFI PLATFORM · BOARD REVIEW · AUG 2026');
    expect(eyebrow.style.color).toBe('var(--ink2)');
  });
});

describe('CLASS SWEEP — HomeCustomizeBar (panelStyle, PANEL_STYLE)', () => {
  it('open panel, note caption Label: never var(--ink2)', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <HomeCustomizeBar roleKey="cro" roleFirstName="Rachel" visibleKeys={DEFAULT_VISIBLE_KEYS} onChange={() => {}} />,
    );
    await user.click(screen.getByRole('button', { name: `Customize (${DEFAULT_VISIBLE_KEYS.length} of ${HOME_PANEL_DEFS.length} shown)` }));
    expectNoPanelSeatedInk2(container, 'HomeCustomizeBar (open)');
  });
});

describe('CLASS SWEEP — SettingsToggles / SettingsAbout screens (CARD_STYLE)', () => {
  it('SettingsToggles: approval-matrix + identity/notification card Labels never var(--ink2)', () => {
    const { container } = render(<SettingsToggles />);
    expectNoPanelSeatedInk2(container, 'SettingsToggles');
  });

  it('SettingsAbout: About card row Labels never var(--ink2)', () => {
    const { container } = render(<SettingsAbout />);
    expectNoPanelSeatedInk2(container, 'SettingsAbout');
  });
});

describe('CLASS SWEEP — app-wide residual: every screen reachable without deep interaction, in one pass', () => {
  it('Home (default boot screen, via the real Shell): never var(--ink2)', () => {
    const { container } = render(<App />);
    expectNoPanelSeatedInk2(container, 'App (Home boot)');
  });
});
