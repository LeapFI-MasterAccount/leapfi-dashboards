/**
 * Studio · Ask regression tests (D17): every test pins PORTED V1 BEHAVIOR,
 * citing its base-page line anchor (leapfi-platform.html @ 1c230fe) or
 * survey_map.md section. Tests observe the app — they never adapt it.
 *
 * Base anchors pinned here:
 *  - COPILOT_QA seeded Q&A: base 3613-3623 (ported verbatim in
 *    data/misc.ts, its own header cites the same lines)
 *  - auto-loan seeded answer + register add: base 4415-4429
 *    (autoLoanAnswer / addAutoLoan; AUTO_LOAN_OPPORTUNITY /
 *    AUTO_LOAN_DETAIL ported at data/misc.ts:4415-4429 note)
 *  - route() no-match fallback + 'Scope "<Query>" as a new use case'
 *    entry chip with capitalized query: base 4467-4470 (capitalization
 *    `q.charAt(0).toUpperCase()+q.slice(1)`, 4470)
 *  - intake terminal actions acted on by the screen:
 *    acceptProposed 4401-4412 (obligation arithmetic 3 + gates×2, line
 *    4410; domainsFor/DOMMAP 4299-4300), discardProposed 4413,
 *    route() intake-cancel branch 4435-4439
 *
 * Timing constants (ASK_SUBMIT_DELAY_MS=350 / ASK_RENDER_DELAY_MS=450,
 * wizard OPENING_DELAY_MS=700 / ADVANCE_DELAY_MS=550 / CHIP_LOCK_MS=700)
 * are driven with fake timers; the 700ms chip lock is itself pinned in
 * chat-intake-wizard.test.tsx (base 4332-4337).
 *
 * D18: nothing here touches Home or any demo-entry affordance.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { StudioAsk } from '../../screens/StudioAsk';
import type { TopbarProps } from '../../components/Topbar';
import { AUTO_LOAN_DETAIL } from '../../data/misc';
import { INTAKE } from '../../data/misc';

const topbar: TopbarProps = {
  breadcrumb: 'Studio · Ask',
  onOpenBoardDeck: () => {},
  date: 'Aug 19, 2026',
  profile: { name: 'Rachel Fischer', initials: 'RF' },
  profileMenuItems: [],
};

function renderStudioAsk() {
  return render(<StudioAsk topbar={topbar} onNavigate={() => {}} />);
}

/** Types `question` into the Ask Input and presses the Ask primary Button,
 * then advances through both ported Ask-flow delays (submitting →
 * answer-rendering → final). Queries are scoped to `main` because the
 * Sidebar's Studio nav also exposes an "Ask" button. */
function ask(question: string) {
  const main = within(screen.getByRole('main'));
  const input = main.getByRole('textbox', { name: 'Ask a policy question' });
  fireEvent.change(input, { target: { value: question } });
  fireEvent.click(main.getByRole('button', { name: 'Ask' }));
  act(() => {
    vi.advanceTimersByTime(350); // ASK_SUBMIT_DELAY_MS
  });
  act(() => {
    vi.advanceTimersByTime(450); // ASK_RENDER_DELAY_MS
  });
}

/** Drives the mounted ChatIntakeWizard through all four INTAKE questions
 * (base order 4357-4362) with the given answer chips. 700ms advances cover
 * both ADVANCE_DELAY_MS (550) and the CHIP_LOCK_MS (700) debounce window. */
function answerIntake(answers: [string, string, string, string]) {
  act(() => {
    vi.advanceTimersByTime(700); // OPENING_DELAY_MS → first question
  });
  for (const answer of answers) {
    fireEvent.click(screen.getByRole('button', { name: answer }));
    act(() => {
      vi.advanceTimersByTime(700);
    });
  }
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('StudioAsk match path — seeded Q&A (base 3613-3623 COPILOT_QA, 4415-4429 auto-loan)', () => {
  it('answers the seeded indirect-auto-lending question from AUTO_LOAN_DETAIL/AUTO_LOAN_OPPORTUNITY (base 4415-4429)', () => {
    renderStudioAsk();
    ask('What are our rules on indirect auto lending?');

    // Answer composed from the verbatim-ported records: DETAIL.sum + gates
    // + cost/value envelope (base addAutoLoan record: cost 350000 / val
    // 520000 / g Fair Lending, Adverse Action, Model Risk — line 4427).
    // Scoped to ChatHero's conversation list: the register's own sr-only
    // live region is a second role="status" on this screen.
    const answer = within(screen.getByRole('list', { name: 'Conversation' })).getByRole('status');
    expect(answer).toHaveTextContent(AUTO_LOAN_DETAIL.sum);
    expect(answer).toHaveTextContent('Governance gates before this ships: Fair Lending, Adverse Action, Model Risk.');
    expect(answer).toHaveTextContent('Estimated build cost $350k, estimated annual value $520k.');
  });

  it('renders citations back to approved policy documents for the auto-loan answer (demo_script Step 4 "See" line; docs from data/doclib.ts corpus)', () => {
    renderStudioAsk();
    ask('What are our rules on indirect auto lending?');

    const sources = screen.getByLabelText('Answer sources');
    expect(within(sources).getByText('Model Validation Report · Indirect Auto Pricing')).toBeInTheDocument();
    expect(within(sources).getByText('Conceptual Soundness Documentation · Indirect Auto Pricing')).toBeInTheDocument();
    expect(within(sources).getByText('Adverse-Action Procedure')).toBeInTheDocument();
    expect(within(sources).getByText('Quarterly Fair Lending Review')).toBeInTheDocument();
  });

  it('registers the auto-loan opportunity in the register, badged "From Ask" (base addAutoLoan → acceptProposed mechanic, 4415-4429 / 4401-4412)', () => {
    renderStudioAsk();
    // Register starts at the 15-play catalog (base OPPS, 1177-1195) without
    // the auto-loan play.
    const table = screen.getByRole('table');
    expect(within(table).queryByText(/Auto loan origination platform/)).not.toBeInTheDocument();

    ask('What are our rules on indirect auto lending?');

    expect(within(table).getByText(/Auto loan origination platform/)).toBeInTheDocument();
    expect(within(table).getByText('From Ask')).toBeInTheDocument();
    // Screen-owned live-region announcement for the register addition
    // (a11y port of the base's visible register re-render, renderRegister
    // 4315-4327).
    expect(
      screen.getByText(
        'New opportunity registered: Auto loan origination platform — $520k annual value, gated on Fair Lending, Adverse Action, Model Risk.',
      ),
    ).toBeInTheDocument();
  });

  it('answers a seeded COPILOT_QA question with inline <b> tags stripped and its sources listed (base 3613-3623; base rendered via innerHTML, port is plain text)', () => {
    renderStudioAsk();
    ask('What is our wire transfer limit for members?');

    const answer = within(screen.getByRole('list', { name: 'Conversation' })).getByRole('status');
    expect(answer).toHaveTextContent('Member-initiated wires are limited to $25,000 per business day');
    expect(answer).toHaveTextContent('$250,000 in-branch with dual authorization');
    // Literal "<b>" must never reach the screen (StudioAsk stripInlineTags).
    expect(answer.textContent).not.toContain('<b>');

    const sources = screen.getByLabelText('Answer sources');
    expect(within(sources).getByText('Funds Transfer Policy §3.1 · Limits & authorizations')).toBeInTheDocument();
    expect(within(sources).getByText('BSA/AML Program Policy §7 · monitoring thresholds')).toBeInTheDocument();
  });
});

describe('StudioAsk no-match path — route() fallback + scope entry chip (base 4467-4470)', () => {
  it('shows the no-match fallback and offers Scope "<Query>" with the query capitalized (base 4470 charAt(0).toUpperCase())', () => {
    renderStudioAsk();
    ask('unicorn parade please');

    // ChatHero's no-match fallback (§5.4 fallback state; base 4467-4468
    // "I don't have a confident match…" is the same terminal state).
    expect(screen.getByText('No matching policy answer for that question yet.')).toBeInTheDocument();
    // Entry chip: base route()'s no-match chips (4469-4470), query
    // capitalized: 'unicorn…' → 'Unicorn…'.
    expect(screen.getByRole('button', { name: 'Scope "Unicorn parade please" as a new use case' })).toBeInTheDocument();
  });

  it('does not offer the scope chip after a matched answer (a match retires the pending no-match offer, mirroring base chips being replaced on the next route() call)', () => {
    renderStudioAsk();
    ask('unicorn parade please');
    expect(screen.getByRole('button', { name: 'Scope "Unicorn parade please" as a new use case' })).toBeInTheDocument();

    ask('What is our wire transfer limit for members?');
    expect(screen.queryByRole('button', { name: 'Scope "Unicorn parade please" as a new use case' })).not.toBeInTheDocument();
  });
});

describe('StudioAsk intake wizard terminal intents (base acceptProposed 4401-4412, discardProposed 4413, cancel 4435-4439)', () => {
  function reachWizard() {
    renderStudioAsk();
    ask('unicorn parade please');
    fireEvent.click(screen.getByRole('button', { name: 'Scope "Unicorn parade please" as a new use case' }));
  }

  it('pressing the scope chip mounts the wizard with the startIntake opening line for the capitalized name (base 4363-4368)', () => {
    reachWizard();
    expect(
      screen.getByText(
        'I don\'t have a comparable for "Unicorn parade please" in the library yet, so let me scope it properly. Four quick questions and I\'ll come back with a build estimate, the controls and regulations it touches, and where it slots on the roadmap.',
      ),
    ).toBeInTheDocument();
    // The chip is consumed — it does not linger once intake starts.
    expect(screen.queryByRole('button', { name: 'Scope "Unicorn parade please" as a new use case' })).not.toBeInTheDocument();
  });

  it('Add intent registers the scoped opportunity and says the acceptProposed confirmation with 3 + gates×2 obligations and domainsFor names (base 4401-4412, arithmetic 4410, DOMMAP/domainsFor 4299-4300)', () => {
    reachWizard();
    // Lending + PII path: g = Fair Lending, Adverse Action, Model Risk,
    // + Privacy (pii) → 4 gates (base finishIntake 4369-4400).
    answerIntake(['A whole department', '5,000+ / mo', 'Touches lending decisions', 'Sensitive financial + PII']);
    fireEvent.click(screen.getByRole('button', { name: 'Add to the opportunity register' }));

    // Wizard unmounts; the terminal line lands in the main chat log.
    expect(screen.queryByLabelText('Scoping conversation')).not.toBeInTheDocument();
    // 3 + 4×2 = 11 obligations (base 4410); domainsFor([FL, AA, MR,
    // Privacy]) = Fair Lending, Model Risk, InfoSec / GLBA (base
    // DOMMAP 4299: FL & AA → Fair Lending; Privacy → InfoSec / GLBA);
    // library 15 → 16 (base 'The library is at '+OPPS.length).
    expect(
      screen.getByText(
        'Added. Unicorn parade please is in the register. It pulls 11 obligations into scope across Fair Lending, Model Risk, InfoSec / GLBA; OnSide has re-evaluated those domain targets. The library is at 16.',
      ),
    ).toBeInTheDocument();

    const table = screen.getByRole('table');
    expect(within(table).getByText(/Unicorn parade please/)).toBeInTheDocument();
    expect(within(table).getByText('From Ask')).toBeInTheDocument();
  });

  it('Discard intent unmounts the wizard, says the discardProposed line (base 4413), and adds nothing to the register', () => {
    reachWizard();
    answerIntake(['2 people · ~15 hrs/wk', 'Under 500 items / mo', 'Internal · simple workflow', 'Public / internal only']);
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }));

    expect(screen.queryByLabelText('Scoping conversation')).not.toBeInTheDocument();
    expect(screen.getByText('Discarded. Nothing was added to the register. What else is on your mind?')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).queryByText(/Unicorn parade please/)).not.toBeInTheDocument();
  });

  it('Cancel unmounts the wizard mid-flow and says the route() cancel-branch line (base 4435-4439); nothing is added', () => {
    reachWizard();
    act(() => {
      vi.advanceTimersByTime(700); // first question visible
    });
    expect(screen.getByText(INTAKE[0]!.q)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '✕ Cancel scoping' }));

    expect(screen.queryByLabelText('Scoping conversation')).not.toBeInTheDocument();
    expect(screen.queryByText(INTAKE[0]!.q)).not.toBeInTheDocument();
    expect(
      screen.getByText('Scoping cancelled. Nothing was added. Ask me anything, or describe another idea when you’re ready.'),
    ).toBeInTheDocument();
    expect(within(screen.getByRole('table')).queryByText(/Unicorn parade please/)).not.toBeInTheDocument();
  });
});
