/**
 * Studio · Ask regression tests (D17): every test pins PORTED V1 BEHAVIOR,
 * citing its base-page line anchor (leapfi-platform.html @ 1c230fe) or
 * survey_map.md section. Tests observe the app — they never adapt it.
 *
 * Fix-wave "studio" batch (TEST MAINTENANCE per the dispatch rule): the
 * earlier suite pinned pre-fix deviations (auto-register without the
 * explicit Add press, the two-sentence gutted answer, raw catalog values,
 * the opening line without "Good one. "); expectations are updated here
 * to the base-correct behavior (STU-01/06/07/08/15). Lever state comes
 * from state/demoStore.ts (DEFAULT_SLIDERS: eff 70 → L.eff 0.70, tol 52 →
 * threshold 65); resetDemo() in beforeEach restores the shared OPPS pool
 * between tests.
 *
 * Base anchors pinned here:
 *  - COPILOT_QA seeded Q&A: base 3613-3623 (ported verbatim in
 *    data/misc.ts, its own header cites the same lines)
 *  - auto-loan seeded answer (four grounding rows, lever-scaled envelope):
 *    base 4417-4424 (autoLoanAnswer; STU-07/STU-08); the explicit "Add to
 *    the opportunity register" press: base 4426-4429 (addAutoLoan →
 *    acceptProposed; STU-06)
 *  - route() no-match fallback + 'Scope "<Query>" as a new use case'
 *    entry chip with capitalized query: base 4467-4470 (capitalization
 *    `q.charAt(0).toUpperCase()+q.slice(1)`, 4470)
 *  - intake terminal actions acted on by the screen:
 *    acceptProposed 4401-4412 (obligation arithmetic 3 + gates×2, line
 *    4410; tolerance clause 4410; domainsFor/DOMMAP 4299-4300; the real
 *    shared-register write — STU-01), discardProposed 4413,
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
import type { StudioAskProps } from '../../screens/StudioAsk';
import type { TopbarProps } from '../../components/Topbar';
import { INTAKE } from '../../data/misc';
import { resetDemo } from '../../state/demoStore';

const topbar: TopbarProps = {
  breadcrumb: 'Studio · Ask',
  onOpenBoardDeck: () => {},
  date: 'Aug 19, 2026',
  profile: { name: 'Rachel Fischer', initials: 'RF' },
  profileMenuItems: [],
};

function renderStudioAsk(overrides?: Partial<StudioAskProps>) {
  return render(<StudioAsk topbar={topbar} onNavigate={() => {}} {...overrides} />);
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
  resetDemo(); // restore the shared OPPS pool / levers between tests (demoStore)
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('StudioAsk match path — seeded Q&A (base 3613-3623 COPILOT_QA, 4415-4429 auto-loan)', () => {
  it('answers the seeded indirect-auto-lending question with the base four-row grounding card and the lever-scaled envelope (base autoLoanAnswer 4417-4424; STU-07/STU-08)', () => {
    renderStudioAsk();
    ask('What are our rules on indirect auto lending?');

    // Base autoLoanAnswer content (4417-4424): You have / Missing / OnSide
    // flags (with live control scores) / Envelope — the "grounded in
    // NorthWinds' own state, never a generic checklist" beat. Envelope
    // value is adoption-scaled: 520000 × 0.70 = $364k (base 4423; STU-07).
    // Scoped to ChatHero's conversation list: the register's own sr-only
    // live region is a second role="status" on this screen.
    const answer = within(screen.getByRole('list', { name: 'Conversation' })).getByRole('status');
    expect(answer).toHaveTextContent('Grounded in NorthWinds’ own state, never a generic checklist');
    expect(answer).toHaveTextContent('You have: Core + LOS integration patterns');
    expect(answer).toHaveTextContent('Missing: Real-time decisioning infrastructure');
    expect(answer).toHaveTextContent('OnSide flags: Fair Lending 68% · open · Adverse Action 55% · open · Model Risk 70% · open.');
    expect(answer).toHaveTextContent('Envelope: ≈ $350k build · ≈ $364k/yr at your adoption setting');
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

  it('gates the register write behind the explicit "Add to the opportunity register" press, then registers badged "From Ask" (base addAutoLoan 4426-4429 → acceptProposed 4401-4412; STU-06)', () => {
    renderStudioAsk();
    // Register starts at the 15-play catalog (base OPPS, 1177-1195) without
    // the auto-loan play.
    const table = screen.getByRole('table');
    expect(within(table).queryByText(/Auto loan origination platform/)).not.toBeInTheDocument();

    ask('What are our rules on indirect auto lending?');

    // STU-06: the answer only OFFERS the add (base 4426) — the register
    // must NOT have mutated yet.
    expect(within(table).queryByText(/Auto loan origination platform/)).not.toBeInTheDocument();
    const addButton = screen.getByRole('button', { name: 'Add to the opportunity register' });
    // One-primary rule (spec §5.4/§6): "Ask" is the screen's only primary.
    expect(addButton).toHaveAttribute('data-variant', 'secondary');

    fireEvent.click(addButton);

    expect(within(table).getByText(/Auto loan origination platform/)).toBeInTheDocument();
    expect(within(table).getByText('From Ask')).toBeInTheDocument();
    // Screen-owned live-region announcement for the ACTUAL addition, value
    // adoption-scaled (base renderRegister 4325: fmt(o.val*L.eff); STU-07).
    expect(
      screen.getByText(
        'New opportunity registered: Auto loan origination platform — $364k/yr at adoption, gated on Fair Lending, Adverse Action, Model Risk.',
      ),
    ).toBeInTheDocument();
    // acceptProposed confirmation (4408-4411): tolerance clause (minGate 55
    // < threshold 65 → sequence-gated), 3 + 3×2 = 9 obligations, DOMMAP
    // display domains, live library count 15 → 16 (STU-01).
    expect(
      screen.getByText(
        'Added. Auto loan origination platform is in the register, currently sequence-gated. Studio shows it with the control that unlocks it. It pulls 9 obligations into scope across Fair Lending, Model Risk; OnSide has re-evaluated those domain targets. The library is at 16.',
      ),
    ).toBeInTheDocument();
    // The offer is consumed — a second Add affordance is not left dangling.
    expect(screen.queryByRole('button', { name: 'Add to the opportunity register' })).not.toBeInTheDocument();
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

describe('StudioAsk matcher guard (base cpMatch 1799-1808; route() greeting/short-query guard 4471-4476; STU-03)', () => {
  it('a greeting ("thanks") gets the base help line — never a policy answer and never a scope chip', () => {
    renderStudioAsk();
    ask('thanks');
    expect(screen.getByText(/I can do three things from this box/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /as a new use case/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Answer sources')).not.toBeInTheDocument();
  });

  it('a short fragment ("in") can no longer substring-match a seeded policy answer (base cpMatch requires ≥2 overlapping words >4 chars)', () => {
    renderStudioAsk();
    ask('in');
    // Pre-fix, `phrase.includes('in')` matched the data-sharing chip and
    // rendered a confidently wrong cited policy answer. Base-correct: the
    // <3-word guard answers with the help line, cites nothing.
    expect(screen.getByText(/I can do three things from this box/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Answer sources')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /as a new use case/ })).not.toBeInTheDocument();
  });
});

describe('StudioAsk intake mode consumes the main Ask input (base route() 4434-4444; STU-14)', () => {
  function reachOpenWizard() {
    renderStudioAsk();
    ask('unicorn parade please');
    fireEvent.click(screen.getByRole('button', { name: 'Scope "Unicorn parade please" as a new use case' }));
    act(() => {
      vi.advanceTimersByTime(700); // OPENING_DELAY_MS → first question
    });
  }

  it('a mid-wizard Ask is captured as the current intake answer — no second conversation, no stale scope chip', () => {
    reachOpenWizard();
    expect(screen.getByText(INTAKE[0]!.q)).toBeInTheDocument();

    // Free-typed text submitted through the MAIN Ask box (base 4440-4443:
    // the typed text IS the answer). ask()'s 800ms of timer advances cover
    // ADVANCE_DELAY_MS, so Q2 is up afterwards.
    ask('It takes about a team and a half');
    expect(screen.getByText(INTAKE[1]!.q)).toBeInTheDocument();
    // The typed text landed as the intake answer bubble…
    expect(screen.getByText('It takes about a team and a half')).toBeInTheDocument();
    // …and never spawned a parallel no-match flow or scope offer.
    expect(screen.queryByRole('button', { name: /as a new use case/ })).not.toBeInTheDocument();
  });

  it("a mid-wizard Ask containing 'cancel' cancels the intake (base cancel branch 4435-4439)", () => {
    reachOpenWizard();
    ask('cancel');
    expect(screen.queryByLabelText('Scoping conversation')).not.toBeInTheDocument();
    expect(
      screen.getByText('Scoping cancelled. Nothing was added. Ask me anything, or describe another idea when you’re ready.'),
    ).toBeInTheDocument();
  });
});

describe('StudioAsk intake wizard terminal intents (base acceptProposed 4401-4412, discardProposed 4413, cancel 4435-4439)', () => {
  function reachWizard() {
    renderStudioAsk();
    ask('unicorn parade please');
    fireEvent.click(screen.getByRole('button', { name: 'Scope "Unicorn parade please" as a new use case' }));
  }

  it('pressing the scope chip mounts the wizard with the startIntake opening line for the capitalized name (base 4363-4368, VERBATIM incl. "Good one. " — STU-15)', () => {
    reachWizard();
    expect(
      screen.getByText(
        'Good one. I don\'t have a comparable for "Unicorn parade please" in the library yet, so let me scope it properly. Four quick questions and I\'ll come back with a build estimate, the controls and regulations it touches, and where it slots on the roadmap.',
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
    // Base acceptProposed line (4408-4411) with the tolerance clause
    // (minGate 55 < threshold 65 → sequence-gated, base 4410); 3 + 4×2 =
    // 11 obligations (4410); domainsFor([FL, AA, MR, Privacy]) = Fair
    // Lending, Model Risk, InfoSec / GLBA (base DOMMAP 4299: FL & AA →
    // Fair Lending; Privacy → InfoSec / GLBA); library 15 → 16 — TRUE now
    // that acceptOpportunity really pushed the play (STU-01).
    expect(
      screen.getByText(
        'Added. Unicorn parade please is in the register, currently sequence-gated. Studio shows it with the control that unlocks it. It pulls 11 obligations into scope across Fair Lending, Model Risk, InfoSec / GLBA; OnSide has re-evaluated those domain targets. The library is at 16.',
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

  it('Cancel unmounts the wizard mid-flow, keeps the answered-so-far transcript in the ONE chat log (fix C-unbounded-growth-01 — base single chat-log, 435), and says the route() cancel-branch line (base 4435-4439); nothing is added', () => {
    reachWizard();
    act(() => {
      vi.advanceTimersByTime(700); // first question visible
    });
    expect(screen.getByText(INTAKE[0]!.q)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '✕ Cancel scoping' }));

    // The wizard's own controls (answer chips, cancel button, its
    // now-removed dedicated transcript list) are gone with it…
    expect(screen.queryByLabelText('Scoping conversation')).not.toBeInTheDocument();
    // …but the question the presenter was mid-answering stays in the ONE
    // continuous chat log (fix C-unbounded-growth-01: the base ran the
    // whole conversation through a single `chat-log`, never erasing prior
    // turns on cancel — leapfi-platform.html:435) — folded up permanently
    // via `onTranscriptChange` before the cancel confirmation line.
    expect(screen.getByText(INTAKE[0]!.q)).toBeInTheDocument();
    expect(
      screen.getByText('Scoping cancelled. Nothing was added. Ask me anything, or describe another idea when you’re ready.'),
    ).toBeInTheDocument();
    expect(within(screen.getByRole('table')).queryByText(/Unicorn parade please/)).not.toBeInTheDocument();
  });
});

describe('intake transcript renders inside ChatHero\'s ONE bounded log, never a second list (fix C-unbounded-growth-01 — base single `chat-log`, 435, with scroll-to-latest on every botSay, 4343/4348)', () => {
  it('the wizard\'s opening line and questions/answers render inside the SAME "Conversation" list ChatHero owns — no separate "Scoping conversation" list exists at all', () => {
    renderStudioAsk();
    ask('unicorn parade please');
    fireEvent.click(screen.getByRole('button', { name: 'Scope "Unicorn parade please" as a new use case' }));
    act(() => {
      vi.advanceTimersByTime(700); // OPENING_DELAY_MS → first question
    });

    // The wizard no longer owns a second, unbounded transcript list.
    expect(screen.queryByLabelText('Scoping conversation')).not.toBeInTheDocument();

    // Its opening line + first question render INSIDE ChatHero's single
    // bounded, auto-scrolling "Conversation" list (ChatHero.tsx's
    // `messageListStyle`: maxHeight 35rem + overflowY auto).
    const conversation = screen.getByRole('list', { name: 'Conversation' });
    expect(
      within(conversation).getByText(/Good one\. I don't have a comparable for "Unicorn parade please" in the library yet/),
    ).toBeInTheDocument();
    expect(within(conversation).getByText(INTAKE[0]!.q)).toBeInTheDocument();

    // Answering the first question appends BOTH the answer bubble and the
    // next question into the same list, in order.
    fireEvent.click(screen.getByRole('button', { name: '2 people · ~15 hrs/wk' }));
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(within(conversation).getByText('2 people · ~15 hrs/wk')).toBeInTheDocument();
    expect(within(conversation).getByText(INTAKE[1]!.q)).toBeInTheDocument();
  });
});

describe('opportunity register rows open the play detail drawer (fix B-dead-interactions-03 — base per-row "Detail →", 4325)', () => {
  it('a "Detail →" row action deep-links to Investment Design\'s play drawer for that exact row', () => {
    const onDeepLink = vi.fn();
    renderStudioAsk({ onDeepLink });
    const table = screen.getByRole('table');
    const row = within(table).getByRole('row', { name: /Loan-document summarization/ });
    fireEvent.click(within(row).getByRole('button', { name: 'Detail →' }));
    expect(onDeepLink).toHaveBeenCalledWith({
      screen: 'studio.investment-design',
      kind: 'play',
      id: 'Loan-document summarization',
    });
  });

  it('a newly-registered (from-Ask) row is just as clickable as a seeded catalog row', () => {
    const onDeepLink = vi.fn();
    renderStudioAsk({ onDeepLink });
    ask('What are our rules on indirect auto lending?');
    fireEvent.click(screen.getByRole('button', { name: 'Add to the opportunity register' }));

    const table = screen.getByRole('table');
    const row = within(table).getByRole('row', { name: /Auto loan origination platform/ });
    fireEvent.click(within(row).getByRole('button', { name: 'Detail →' }));
    expect(onDeepLink).toHaveBeenCalledWith({
      screen: 'studio.investment-design',
      kind: 'play',
      id: 'Auto loan origination platform',
    });
  });
});

describe('answer sources and cross-nav offers are clickable (fix B-dead-interactions-10)', () => {
  it('a cited source is a real button that navigates to OnSide · Documents (base doclink onclick="onsideShow(\'docs\')", 3636/1813)', () => {
    const onNavigate = vi.fn();
    renderStudioAsk({ onNavigate });
    ask('What is our wire transfer limit for members?');

    const sources = screen.getByLabelText('Answer sources');
    fireEvent.click(within(sources).getByRole('button', { name: 'Funds Transfer Policy §3.1 · Limits & authorizations' }));
    expect(onNavigate).toHaveBeenCalledWith('onside.documents');
  });

  it('the seeded auto-loan answer offers "See the governance work in OnSide" before it\'s added (base 4424, goOnside(\'dom-mrm\'))', () => {
    const onDeepLink = vi.fn();
    renderStudioAsk({ onDeepLink });
    ask('What are our rules on indirect auto lending?');

    fireEvent.click(screen.getByRole('button', { name: 'See the governance work in OnSide' }));
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'domain', id: 'mrm' });
  });

  it('once any play is registered, "See it in the register" and "See the scope change in OnSide" offers appear and work', () => {
    const onDeepLink = vi.fn();
    renderStudioAsk({ onDeepLink });
    ask('What are our rules on indirect auto lending?');
    fireEvent.click(screen.getByRole('button', { name: 'Add to the opportunity register' }));

    // "See it in the register": the row is already on this screen — no
    // cross-nav, just a scroll + re-highlight (jsdom-stubbed scrollIntoView).
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'See it in the register' }))).not.toThrow();

    // "See the scope change in OnSide": the play's weakest gate (Adverse
    // Action, g: Fair Lending/Adverse Action/Model Risk) → its CTRLDOM slug.
    fireEvent.click(screen.getByRole('button', { name: 'See the scope change in OnSide' }));
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'domain', id: 'fairlend' });
  });

  it('a fresh Ask retires the post-accept offer (it does not linger once the conversation moves on)', () => {
    renderStudioAsk();
    ask('What are our rules on indirect auto lending?');
    fireEvent.click(screen.getByRole('button', { name: 'Add to the opportunity register' }));
    expect(screen.getByRole('button', { name: 'See it in the register' })).toBeInTheDocument();

    ask('What is our wire transfer limit for members?');
    expect(screen.queryByRole('button', { name: 'See it in the register' })).not.toBeInTheDocument();
  });
});
