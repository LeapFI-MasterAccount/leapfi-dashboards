/**
 * Studio · Ask — agent-chat rebuild (design_system_spec.md §2.9.8-2.9.13,
 * amendment A20, PI2-D47). Falsifiable acceptance criteria AC-A20-1
 * through AC-A20-9 (this screen's share — AC-A20-10/12 are covered by
 * `entry-affordance-weight-a20.test.tsx`/grep, AC-A20-11 likewise, AC-A20-9's
 * InvestmentDesign half by `investment-design.test.tsx`), plus the
 * pre-A20 engine-content assertions this suite supersedes (git history:
 * `studio-ask.test.tsx`), adapted to the new chat-bar/response-canvas
 * anatomy — content unchanged, presentation updated.
 *
 * Discrimination note (evidence return): every test below was run against
 * a scratch revert of the A20 rebuild (StudioAsk.tsx restored to its
 * pre-A20 ChatHero-hosted shape) and observed to fail — either because the
 * queried DOM (`data-lf-region="response-canvas"`, the chat-bar-first DOM
 * order, the fixture `entries` override, the `DrawerContentAction` actions
 * slot) does not exist pre-A20, or because the pre-A20 screen mounts
 * ChatHero/a local Drawer that these tests assert must be absent.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StudioAsk } from '../../screens/StudioAsk';
import type { StudioAskProps } from '../../screens/StudioAsk';
import type { ChatEntry } from '../../data/chatTypes';
import { INTAKE } from '../../data/misc';
import { OPPS } from '../../data/studio';
import { DOMAINS } from '../../data/onside';
import { resetDemo } from '../../state/demoStore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = path.resolve(__dirname, '../../screens/StudioAsk.tsx');
const SOURCE_TEXT = fs.readFileSync(SOURCE_PATH, 'utf8');

function renderStudioAsk(overrides?: Partial<StudioAskProps>) {
  return render(<StudioAsk onNavigate={() => {}} {...overrides} />);
}

/** Types `question` into the Ask Input and presses the Ask primary Button,
 * then advances through both real Ask-flow delays (submitting →
 * answer-rendering → final). */
function ask(question: string) {
  const main = within(screen.getByRole('main'));
  const input = main.getByRole('textbox', { name: /Ask (Studio a question|about an opportunity)/ });
  fireEvent.change(input, { target: { value: question } });
  fireEvent.click(main.getByRole('button', { name: 'Ask' }));
  act(() => {
    vi.advanceTimersByTime(350); // ASK_SUBMIT_DELAY_MS
  });
  act(() => {
    vi.advanceTimersByTime(450); // ASK_RENDER_DELAY_MS
  });
}

function answerIntake(answers: [string, string, string, string]) {
  act(() => {
    vi.advanceTimersByTime(700);
  });
  for (const answer of answers) {
    fireEvent.click(screen.getByRole('button', { name: answer }));
    act(() => {
      vi.advanceTimersByTime(700);
    });
  }
}

beforeEach(() => {
  resetDemo();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  resetDemo();
});

describe('AC-A20-1 — no ChatHero call site on StudioAsk.tsx', () => {
  it('grep: zero matches for <ChatHero or the ChatHero import', () => {
    expect(SOURCE_TEXT).not.toMatch(/<ChatHero/);
    expect(SOURCE_TEXT).not.toMatch(/from '\.\.\/components\/ChatHero'/);
  });
});

describe('AC-A20-2 — no local Drawer/AskChatPanel on StudioAsk.tsx', () => {
  it('grep: zero matches for either in source', () => {
    expect(SOURCE_TEXT).not.toMatch(/<Drawer[\s>]/);
    expect(SOURCE_TEXT).not.toMatch(/<AskChatPanel/);
  });

  it('renders zero [data-lf-composite="drawer"] nodes under idle, typing, submitting, answer-rendering, and answer-complete', () => {
    renderStudioAsk();
    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(0); // idle
    const main = within(screen.getByRole('main'));
    fireEvent.change(main.getByRole('textbox', { name: 'Ask Studio a question' }), { target: { value: 'hi' } }); // typing
    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(0);
    fireEvent.click(main.getByRole('button', { name: 'Ask' })); // submitting
    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(0);
    act(() => vi.advanceTimersByTime(350)); // answer-rendering
    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(0);
    act(() => vi.advanceTimersByTime(450)); // answer-complete
    expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(0);
  });
});

describe('AC-A20-3 — chat-bar-above-canvas anatomy', () => {
  it('the suggestion-Chip row and Input+"Ask" Button row both precede the response-canvas region in document order, on every render state', () => {
    const { container } = renderStudioAsk();
    const chatBar = container.querySelector('[data-lf-region="chat-bar"]');
    const canvas = container.querySelector('[data-lf-region="response-canvas"]');
    expect(chatBar).toBeTruthy();
    expect(canvas).toBeTruthy();
    // DOCUMENT_POSITION_FOLLOWING (4) on canvas relative to chatBar means chatBar precedes canvas.
    expect(chatBar!.compareDocumentPosition(canvas!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    ask('unicorn parade please'); // reaches no-match, still chat-bar-then-canvas
    const chatBar2 = container.querySelector('[data-lf-region="chat-bar"]');
    const canvas2 = container.querySelector('[data-lf-region="response-canvas"]');
    expect(chatBar2!.compareDocumentPosition(canvas2!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

const FIXTURE_ENTRIES: ChatEntry[] = [
  {
    id: 'fixture-document',
    question: 'Fixture document question',
    responseText: 'Fixture document prose.',
    deepLinks: [{ label: 'See the fixture document', request: { screen: 'onside.documents', kind: 'document', id: 'irp' } }],
    response: { responseType: 'document' },
  },
  {
    id: 'fixture-instructional',
    question: 'Fixture instructional question',
    responseText: 'Fixture instructional prose.',
    response: { responseType: 'instructional' },
  },
  {
    id: 'fixture-opportunity',
    question: 'Fixture opportunity question',
    responseText: 'Fixture opportunity prose.',
    response: { responseType: 'opportunity-status', opportunityId: 'Fraud model refresh' },
  },
  {
    id: 'fixture-compliance',
    question: 'Fixture compliance question',
    responseText: 'Fixture compliance prose.',
    response: { responseType: 'compliance-attainment', domainKey: 'bsa' },
  },
];

describe('AC-A20-4 — single-turn canvas', () => {
  it('after two sequential Ask submissions, the canvas contains exactly one turn\'s rendered content at a time', () => {
    renderStudioAsk({ entries: FIXTURE_ENTRIES });
    ask('Fixture document question');
    expect(screen.getByText('Fixture document prose.')).toBeInTheDocument();

    ask('Fixture instructional question');
    expect(screen.queryByText('Fixture document prose.')).not.toBeInTheDocument();
    expect(screen.getByText('Fixture instructional prose.')).toBeInTheDocument();
  });
});

describe('AC-A20-5 — layout-per-type (four fixture entries, one per responseType)', () => {
  it('document renders a non-empty Artifacts list', () => {
    renderStudioAsk({ entries: FIXTURE_ENTRIES });
    ask('Fixture document question');
    expect(screen.getByText('Fixture document prose.')).toBeInTheDocument();
    expect(screen.getByText('Artifacts')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /See the fixture document/ })).toBeInTheDocument();
  });

  it('instructional renders with deepLinks omitted and shows no Artifacts list', () => {
    renderStudioAsk({ entries: FIXTURE_ENTRIES });
    ask('Fixture instructional question');
    expect(screen.getByText('Fixture instructional prose.')).toBeInTheDocument();
    expect(screen.queryByText('Artifacts')).not.toBeInTheDocument();
  });

  it('opportunity-status renders a StatCard + DrawerContent(kind: play) whose field values match the live OPPS/DETAIL record for the fixture opportunityId', () => {
    renderStudioAsk({ entries: FIXTURE_ENTRIES });
    ask('Fixture opportunity question');
    const opp = OPPS.find((o) => o.n === 'Fraud model refresh')!;
    // StatCard: label repeats visibly (eyebrow Label) and as StatValue's
    // own aria-hidden caption — getAllByText, not getByText, is correct here.
    expect(screen.getAllByText('Annual value').length).toBeGreaterThan(0);
    const drawerContent = document.querySelector('[data-lf-composite="drawer-content"][data-kind="play"]');
    expect(drawerContent).toBeTruthy();
    expect(within(drawerContent as HTMLElement).getByText(opp.c)).toBeInTheDocument(); // Category field value, live
    expect(within(drawerContent as HTMLElement).getByText(`${opp.weakGate} · ${opp.minGate}`)).toBeInTheDocument(); // Weakest control gate, live
  });

  it('compliance-attainment renders a StatCard + DrawerContent(kind: domain) whose field values match the live DOMAINS record for the fixture domainKey', () => {
    renderStudioAsk({ entries: FIXTURE_ENTRIES });
    ask('Fixture compliance question');
    const domain = DOMAINS.find((d) => d.key === 'bsa')!;
    expect(screen.getAllByText(domain.name).length).toBeGreaterThan(0);
    const drawerContent = document.querySelector('[data-lf-composite="drawer-content"][data-kind="domain"]');
    expect(drawerContent).toBeTruthy();
    expect(within(drawerContent as HTMLElement).getByText(domain.bodies)).toBeInTheDocument(); // Regulatory bodies field, live
    expect(within(drawerContent as HTMLElement).getByText(domain.owner)).toBeInTheDocument(); // Owner field, live
  });
});

describe('AC-A20-6 — backward-compatible default', () => {
  it('a fixture ChatEntry with no `response` field renders the instructional layout', () => {
    const entries: ChatEntry[] = [{ id: 'no-response', question: 'No response field question', responseText: 'Rendered as instructional.' }];
    renderStudioAsk({ entries });
    ask('No response field question');
    expect(screen.getByText('How to')).toBeInTheDocument();
    expect(screen.getByText('Rendered as instructional.')).toBeInTheDocument();
  });
});

/** StatValue's own root (`data-lf-primitive="stat-value"`) carries a
 * combined `aria-label="${value}${unit}, ${label}"` (StatValue.tsx) — the
 * one unambiguous place to read the rendered figure, since the visible
 * value/unit render as separate DOM spans (no single text node holds the
 * full string) and the label text itself repeats (visible eyebrow Label +
 * StatValue's own aria-hidden caption). */
function statValueAriaLabel(): string | null {
  return document.querySelector('[data-lf-primitive="stat-value"]')?.getAttribute('aria-label') ?? null;
}

describe('AC-A20-7 — live lookup, never retyped (PI2-D28)', () => {
  it('changing a fixture opportunity\'s val in the underlying dataset (not the chat content) changes the canvas\'s rendered StatCard value on the next render of that same entry', () => {
    renderStudioAsk({ entries: FIXTURE_ENTRIES });
    ask('Fixture opportunity question');
    const before = statValueAriaLabel();
    expect(before).toBeTruthy();

    const opp = OPPS.find((o) => o.n === 'Fraud model refresh')!;
    opp.val = opp.val + 500000; // mutate the dataset directly, not the chat content

    ask('Fixture opportunity question'); // re-ask the SAME entry
    const after = statValueAriaLabel();
    expect(after).not.toBe(before);
  });

  it('changing a fixture domain\'s met in the underlying dataset changes the canvas\'s rendered StatCard value on the next render of that same entry', () => {
    renderStudioAsk({ entries: FIXTURE_ENTRIES });
    ask('Fixture compliance question');
    const before = statValueAriaLabel();
    expect(before).toBeTruthy();

    const domain = DOMAINS.find((d) => d.key === 'bsa')!;
    domain.met = domain.met + 1;

    ask('Fixture compliance question');
    expect(statValueAriaLabel()).not.toBe(before);
  });
});

describe('AC-A20-8 — no focus trap / no forced focus move', () => {
  it('after an Ask submission reaches AnswerComplete, focus is never moved into the canvas, and the canvas root carries aria-live="polite"', () => {
    const { container } = renderStudioAsk({ entries: FIXTURE_ENTRIES });
    ask('Fixture document question');
    const canvas = container.querySelector('[data-lf-region="response-canvas"]');
    expect(canvas).toBeTruthy();
    expect(canvas!.getAttribute('aria-live')).toBe('polite');
    expect(canvas!.contains(document.activeElement)).toBe(false);
  });
});

describe('AC-A20-9 (this screen\'s half) — register relocation', () => {
  it('StudioAsk.tsx renders zero <DataTable> instances', () => {
    const { container } = renderStudioAsk();
    expect(container.querySelectorAll('table')).toHaveLength(0);
    expect(SOURCE_TEXT).not.toMatch(/from '\.\.\/components\/DataTable'/);
  });
});

describe('StudioAsk match path — seeded Q&A, ported forward unchanged (base 3613-3623 COPILOT_QA, 4415-4429 auto-loan), now rendered via the response canvas', () => {
  it('answers the seeded indirect-auto-lending question with the base four-row grounding card and the lever-scaled envelope (base autoLoanAnswer 4417-4424; STU-07/STU-08), via the opportunity-status layout', () => {
    renderStudioAsk();
    ask('What are our rules on indirect auto lending?');
    expect(screen.getByText('Opportunity status')).toBeInTheDocument();
    const prose = screen.getByText(/Grounded in NorthWinds. own state, never a generic checklist/);
    expect(prose.textContent).toContain('You have: Core + LOS integration patterns');
    expect(prose.textContent).toContain('Missing: Real-time decisioning infrastructure');
    expect(prose.textContent).toContain('OnSide flags: Fair Lending 68% · open · Adverse Action 55% · open · Model Risk 70% · open.');
    expect(prose.textContent).toContain('Envelope: ≈ $350k build · ≈ $364k/yr at your adoption setting');
    expect(statValueAriaLabel()).toBe('$364k /yr at adoption, Annual value'); // StatCard, adoption-scaled
  });

  it('gates the register write behind the explicit "Add to the opportunity register" press, then re-resolves the SAME turn live once added (base addAutoLoan 4426-4429 → acceptProposed 4401-4412; STU-06)', () => {
    renderStudioAsk();
    expect(OPPS.some((o) => o.n === 'Auto loan origination platform')).toBe(false);

    ask('What are our rules on indirect auto lending?');
    // STU-06: the answer only OFFERS the add — the register must NOT have mutated yet.
    expect(OPPS.some((o) => o.n === 'Auto loan origination platform')).toBe(false);
    const addButton = screen.getByRole('button', { name: 'Add to the opportunity register' });
    expect(addButton).toHaveAttribute('data-variant', 'secondary');

    fireEvent.click(addButton);

    expect(OPPS.some((o) => o.n === 'Auto loan origination platform')).toBe(true);
    // acceptProposed confirmation (4408-4411) now replaces the SAME turn's prose.
    expect(
      screen.getByText(
        'Added. Auto loan origination platform is in the register, currently sequence-gated. Studio shows it with the control that unlocks it. It pulls 9 obligations into scope across Fair Lending, Model Risk; OnSide has re-evaluated those domain targets. The library is at 16.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add to the opportunity register' })).not.toBeInTheDocument();
    // Post-add actions slot now carries "Detail →" (verbatim nav-payload contract).
    expect(screen.getByRole('button', { name: 'Detail →' })).toBeInTheDocument();
  });

  it('the seeded auto-loan answer offers "See the governance work in OnSide" before it\'s added (base 4424, goOnside(\'dom-mrm\'))', () => {
    const onDeepLink = vi.fn();
    renderStudioAsk({ onDeepLink });
    ask('What are our rules on indirect auto lending?');
    fireEvent.click(screen.getByRole('button', { name: 'See the governance work in OnSide' }));
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'domain', id: 'mrm' });
  });

  it('once added, "Detail →" and "See the scope change in OnSide" fire the existing nav-payload contract', () => {
    const onDeepLink = vi.fn();
    renderStudioAsk({ onDeepLink });
    ask('What are our rules on indirect auto lending?');
    fireEvent.click(screen.getByRole('button', { name: 'Add to the opportunity register' }));

    fireEvent.click(screen.getByRole('button', { name: 'Detail →' }));
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'studio.investment-design', kind: 'play', id: 'Auto loan origination platform' });

    fireEvent.click(screen.getByRole('button', { name: 'See the scope change in OnSide' }));
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'domain', id: 'fairlend' });
  });

  it('answers a seeded COPILOT_QA question with inline <b> tags stripped, via the document layout, and cites Artifacts', () => {
    renderStudioAsk();
    ask('What is our wire transfer limit for members?');
    const answer = screen.getByText(/Member-initiated wires are limited to \$25,000 per business day/);
    expect(answer.textContent).toContain('$250,000 in-branch with dual authorization');
    expect(answer.textContent).not.toContain('<b>');

    expect(screen.getByText('Artifacts')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Funds Transfer Policy §3.1 · Limits & authorizations' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'BSA/AML Program Policy §7 · monitoring thresholds' })).toBeInTheDocument();
  });

  it('a cited Artifact is a real button that navigates to OnSide · Documents (base doclink onclick="onsideShow(\'docs\')", 3636/1813)', () => {
    const onNavigate = vi.fn();
    renderStudioAsk({ onNavigate });
    ask('What is our wire transfer limit for members?');
    fireEvent.click(screen.getByRole('button', { name: 'Funds Transfer Policy §3.1 · Limits & authorizations' }));
    expect(onNavigate).toHaveBeenCalledWith('onside.documents');
  });
});

describe('StudioAsk no-match path — route() fallback + scope entry chip (base 4467-4470), rendered via the NoMatch layout', () => {
  it('shows the no-match fallback and offers Scope "<Query>" with the query capitalized', () => {
    renderStudioAsk();
    ask('unicorn parade please');
    expect(screen.getByText('No matching Studio answer for that yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Scope "Unicorn parade please" as a new use case' })).toBeInTheDocument();
  });

  it('does not offer the scope chip after a matched answer', () => {
    renderStudioAsk();
    ask('unicorn parade please');
    expect(screen.getByRole('button', { name: 'Scope "Unicorn parade please" as a new use case' })).toBeInTheDocument();
    ask('What is our wire transfer limit for members?');
    expect(screen.queryByRole('button', { name: 'Scope "Unicorn parade please" as a new use case' })).not.toBeInTheDocument();
  });
});

describe('StudioAsk matcher guard (base cpMatch 1799-1808; route() greeting/short-query guard 4471-4476; STU-03), rendered via the instructional layout', () => {
  it('a greeting ("thanks") gets the base help line — never a policy answer and never a scope chip', () => {
    renderStudioAsk();
    ask('thanks');
    expect(screen.getByText(/I can do three things from this box/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /as a new use case/ })).not.toBeInTheDocument();
  });

  it('a short fragment ("in") can no longer substring-match a seeded policy answer', () => {
    renderStudioAsk();
    ask('in');
    expect(screen.getByText(/I can do three things from this box/)).toBeInTheDocument();
    expect(screen.queryByText('Artifacts')).not.toBeInTheDocument();
  });
});

describe('StudioAsk intake wizard terminal intents (base acceptProposed 4401-4412, discardProposed 4413, cancel 4435-4439) — mounted beneath the response canvas', () => {
  function reachWizard() {
    renderStudioAsk();
    ask('unicorn parade please');
    fireEvent.click(screen.getByRole('button', { name: 'Scope "Unicorn parade please" as a new use case' }));
  }

  it('pressing the scope chip mounts the wizard with the startIntake opening line for the capitalized name', () => {
    reachWizard();
    expect(
      screen.getByText(
        'Good one. I don\'t have a comparable for "Unicorn parade please" in the library yet, so let me scope it properly. Four quick questions and I\'ll come back with a build estimate, the controls and regulations it touches, and where it slots on the roadmap.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Scope "Unicorn parade please" as a new use case' })).not.toBeInTheDocument();
  });

  it('Add intent registers the scoped opportunity and shows the acceptProposed confirmation on the response canvas', () => {
    reachWizard();
    answerIntake(['A whole department', '5,000+ / mo', 'Touches lending decisions', 'Sensitive financial + PII']);
    fireEvent.click(screen.getByRole('button', { name: 'Add to the opportunity register' }));

    expect(screen.queryByLabelText('Scoping conversation')).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'Added. Unicorn parade please is in the register, currently sequence-gated. Studio shows it with the control that unlocks it. It pulls 11 obligations into scope across Fair Lending, Model Risk, InfoSec / GLBA; OnSide has re-evaluated those domain targets. The library is at 16.',
      ),
    ).toBeInTheDocument();
    expect(OPPS.some((o) => o.n === 'Unicorn parade please')).toBe(true);
  });

  it('Discard intent unmounts the wizard, shows the discardProposed line, and adds nothing to the register', () => {
    reachWizard();
    answerIntake(['2 people · ~15 hrs/wk', 'Under 500 items / mo', 'Internal · simple workflow', 'Public / internal only']);
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }));

    expect(screen.queryByLabelText('Scoping conversation')).not.toBeInTheDocument();
    expect(screen.getByText('Discarded. Nothing was added to the register. What else is on your mind?')).toBeInTheDocument();
    expect(OPPS.some((o) => o.n === 'Unicorn parade please')).toBe(false);
  });

  it('Cancel unmounts the wizard mid-flow and shows the route() cancel-branch line; nothing is added', () => {
    reachWizard();
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getByText(INTAKE[0]!.q)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '✕ Cancel scoping' }));

    expect(screen.queryByLabelText('Scoping conversation')).not.toBeInTheDocument();
    expect(
      screen.getByText('Scoping cancelled. Nothing was added. Ask me anything, or describe another idea when you’re ready.'),
    ).toBeInTheDocument();
    expect(OPPS.some((o) => o.n === 'Unicorn parade please')).toBe(false);
  });
});

describe('StudioAsk intake mode consumes the main Ask input (base route() 4434-4444; STU-14)', () => {
  function reachOpenWizard() {
    renderStudioAsk();
    ask('unicorn parade please');
    fireEvent.click(screen.getByRole('button', { name: 'Scope "Unicorn parade please" as a new use case' }));
    act(() => {
      vi.advanceTimersByTime(700);
    });
  }

  it('a mid-wizard Ask is captured as the current intake answer — no stale scope chip', () => {
    reachOpenWizard();
    expect(screen.getByText(INTAKE[0]!.q)).toBeInTheDocument();
    ask('It takes about a team and a half');
    expect(screen.getByText(INTAKE[1]!.q)).toBeInTheDocument();
    expect(screen.getByText('It takes about a team and a half')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /as a new use case/ })).not.toBeInTheDocument();
  });

  it("a mid-wizard Ask containing 'cancel' cancels the intake", () => {
    reachOpenWizard();
    ask('cancel');
    expect(screen.queryByLabelText('Scoping conversation')).not.toBeInTheDocument();
    expect(
      screen.getByText('Scoping cancelled. Nothing was added. Ask me anything, or describe another idea when you’re ready.'),
    ).toBeInTheDocument();
  });
});
