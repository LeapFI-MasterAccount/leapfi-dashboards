/**
 * ChatIntakeWizard regression tests (D17): every test pins PORTED V1
 * BEHAVIOR, citing its base-page line anchor (leapfi-platform.html @
 * 1c230fe) or survey_map.md section. Tests observe the app — they never
 * adapt it.
 *
 * Base anchors pinned here:
 *  - INTAKE question set + order: base 4357-4362 (ported verbatim in
 *    data/misc.ts, its header cites 4358-4362)
 *  - startIntake opening line + first question: base 4363-4368
 *  - route() intake mode per-step advance: base 4434-4444 (per-step
 *    botSay(..., 550) pace, 4442)
 *  - chip debounce 700ms + visible Cancel at every step: base 4332-4337
 *    (__chipLock) and the v1.045 changelog entry (base line 1085:
 *    "The wizard carries a visible Cancel at every step... Chips
 *    debounce, so a double-click cannot answer two questions.")
 *  - finishIntake envelope arithmetic: base 4369-4400 (ported as the
 *    exported computeScopedOpportunity, INCLUDING disc:true — base 4385)
 *  - review panel rows: lever-scaled Value (4390), Regulations incl. the
 *    conditional SOX-404/ICFR + GLBA clauses (4392), display-name domains
 *    via domainsFor/DOMMAP (4299-4300, never CTRLDOM slugs), Placement
 *    (4394) — fix-wave STU-02/07/09
 *  - acceptProposed / discardProposed as intents: base 4401-4413
 *  - single bounded chat-log, never a second list: base
 *    `#st-ask .chat-log{max-height:420px;overflow-y:auto}` (435) — fix
 *    C-unbounded-growth-01. `ChatIntakeWizard` no longer renders its own
 *    transcript `<ul>`; it hands `buildMessages`'s output up via
 *    `onTranscriptChange` for the composing screen to merge into its own
 *    bounded log (`StudioAsk.tsx`). `renderWizard` below supplies a small
 *    harness that mirrors that contract — the same merge shape
 *    `StudioAsk.tsx` uses — so these tests keep observing the real
 *    question-progression text via the real prop contract, not the
 *    component's old (now-removed) self-rendered list.
 *
 * Lever state comes from state/demoStore.ts (DEFAULT_SLIDERS: eff 70 →
 * L.eff 0.70, tol 52 → threshold 65); resetDemo() in beforeEach restores
 * the store between tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ChatIntakeWizard, computeScopedOpportunity } from '../../views/ChatIntakeWizard';
import type { ChatMessage } from '../../components/ChatHero';
import { INTAKE } from '../../data/misc';
import { resetDemo } from '../../state/demoStore';

/** Fix C-unbounded-growth-01 test harness: mirrors `StudioAsk.tsx`'s own
 * `onTranscriptChange` → merged-list contract, so these tests observe the
 * transcript exactly as a real composing screen renders it (in ONE list
 * outside the wizard), not the wizard's old self-rendered `<ul>`. */
function TranscriptHarness({ children }: { children: (onTranscriptChange: (messages: ChatMessage[]) => void) => ReactNode }) {
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  return (
    <>
      <ul aria-label="Conversation">
        {transcript.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
      {children(setTranscript)}
    </>
  );
}

function renderWizard(overrides?: Partial<Parameters<typeof ChatIntakeWizard>[0]>) {
  const onComplete = vi.fn();
  const onDiscard = vi.fn();
  const onCancel = vi.fn();
  render(
    <TranscriptHarness>
      {(onTranscriptChange) => (
        <ChatIntakeWizard
          useCaseName="Collections outreach drafting"
          onComplete={onComplete}
          onDiscard={onDiscard}
          onCancel={onCancel}
          onTranscriptChange={onTranscriptChange}
          {...overrides}
        />
      )}
    </TranscriptHarness>,
  );
  return { onComplete, onDiscard, onCancel };
}

beforeEach(() => {
  resetDemo(); // restore the shared demo store (levers at DEFAULT_SLIDERS)
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('INTAKE question set (base 4357-4362, ported verbatim)', () => {
  it('carries the 4 base questions verbatim, in base order (4358-4362)', () => {
    expect(INTAKE.map((question) => question.q)).toEqual([
      'Roughly how much effort does this consume today?',
      'What volume does it run at?',
      'What is the exposure? This decides which controls and regulations gate it. Internal work that feeds financial reporting carries a different risk profile than a simple workflow.',
      'Last one: what data does it touch?',
    ]);
  });

  it('carries each question’s closed chip set verbatim (4358-4362)', () => {
    expect(INTAKE.map((question) => question.chips)).toEqual([
      ['2 people · ~15 hrs/wk', 'A team · 30+ hrs/wk', 'A whole department'],
      ['Under 500 items / mo', '500–5,000 / mo', '5,000+ / mo'],
      ['Internal · simple workflow', 'Internal · feeds financial reporting (GL / SOX)', 'Member-facing', 'Touches lending decisions'],
      ['Public / internal only', 'Member PII', 'Sensitive financial · no PII', 'Sensitive financial + PII'],
    ]);
  });
});

describe('wizard full flow — 4 questions in base INTAKE order (base 4357-4368, 4434-4444)', () => {
  it('opens with the startIntake line for the use-case name (base 4365), then asks the questions strictly in order', () => {
    renderWizard();

    // Opening line visible immediately, VERBATIM including the leading
    // "Good one. " sentence (base botSay 4365; fix-wave STU-15).
    expect(screen.getByText(/^Good one\. I don't have a comparable for "Collections outreach drafting" in the library yet/)).toBeInTheDocument();
    // No answer chips during the opening transition — answering only
    // becomes possible once the first question step is reached.
    expect(screen.queryByRole('button', { name: '2 people · ~15 hrs/wk' })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(700); // opening → first question
    });
    expect(screen.getByText(INTAKE[0]!.q)).toBeInTheDocument();
    expect(screen.queryByText(INTAKE[1]!.q)).not.toBeInTheDocument();

    // Answer Q1 → Q2 appears (base per-step advance 4434-4444), never Q3.
    fireEvent.click(screen.getByRole('button', { name: '2 people · ~15 hrs/wk' }));
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getByText(INTAKE[1]!.q)).toBeInTheDocument();
    expect(screen.queryByText(INTAKE[2]!.q)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Under 500 items / mo' }));
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getByText(INTAKE[2]!.q)).toBeInTheDocument();
    expect(screen.queryByText(INTAKE[3]!.q)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Internal · simple workflow' }));
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getByText(INTAKE[3]!.q)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Public / internal only' }));
    act(() => {
      vi.advanceTimersByTime(700);
    });
    // All four answered → review panel (base finishIntake 4369-4400).
    expect(screen.getByLabelText('Scoping result')).toBeInTheDocument();
  });

  /**
   * Base 4363-4368 sequences the opening line's own botSay delays BEFORE
   * the first question ever renders — the question text is never on
   * screen during a "Thinking…" transition. Fix-wave STU-04 restored
   * this: `buildMessages` reveals the next unanswered question only while
   * `phase === 'asking'` (the former off-by-one `.fails` pin, now a
   * normal passing assertion — dispatch TEST MAINTENANCE rule).
   */
  it('does not show the first question text during the opening transition (base 4363-4368 sequencing; STU-04)', () => {
    renderWizard();
    expect(screen.queryByText(INTAKE[0]!.q)).not.toBeInTheDocument();
  });

  it('does not show the NEXT question during the advancing "Thinking…" transition (base per-step botSay 4442; STU-04)', () => {
    renderWizard();
    act(() => {
      vi.advanceTimersByTime(700);
    });
    fireEvent.click(screen.getByRole('button', { name: '2 people · ~15 hrs/wk' }));
    // Mid-advance (ADVANCE_DELAY_MS = 550): the spinner is up and Q2 is
    // NOT yet in the DOM.
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText('Thinking…')).toBeInTheDocument();
    expect(screen.queryByText(INTAKE[1]!.q)).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByText(INTAKE[1]!.q)).toBeInTheDocument();
  });

  it('review panel Add fires onComplete exactly once with the finishIntake envelope; Discard fires onDiscard (base 4401-4413)', () => {
    const { onComplete, onDiscard } = renderWizard();
    act(() => {
      vi.advanceTimersByTime(700);
    });
    for (const answer of ['A whole department', '5,000+ / mo', 'Touches lending decisions', 'Sensitive financial + PII']) {
      fireEvent.click(screen.getByRole('button', { name: answer }));
      act(() => {
        vi.advanceTimersByTime(700);
      });
    }

    // Envelope figures rendered from the base arithmetic (4369-4400):
    // cost 165000 → $165k, high risk, Lending; Value is LEVER-SCALED
    // (base 4390: fmt(val*L.eff) at Math.round(L.eff*100)% — 280000×0.70
    // = $196k at the DEFAULT_SLIDERS 70% adoption; fix-wave STU-07).
    const review = screen.getByLabelText('Scoping result');
    expect(review).toHaveTextContent('≈ $165k one-time · High risk profile (Lending)');
    expect(review).toHaveTextContent('≈ $196k/yr at your 70% adoption setting');

    const addButton = screen.getByRole('button', { name: 'Add to the opportunity register' });
    fireEvent.click(addButton);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        n: 'Collections outreach drafting',
        c: 'Lending',
        cost: 165000,
        val: 280000,
        h: 'strategic',
        r: 'high',
        g: ['Fair Lending', 'Adverse Action', 'Model Risk', 'Privacy'],
        minGate: 55,
        weakGate: 'Adverse Action',
        disc: true, // base 4385 — the "from Discovery" provenance flag
      }),
    );
    // Double-press guard: the intent must not fire twice.
    fireEvent.click(addButton);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onDiscard).not.toHaveBeenCalled();
  });

  it('review panel: Placement row (base 4394), display-name domains (base DOMMAP/domainsFor 4299-4300, never CTRLDOM slugs) — STU-02/STU-07', () => {
    renderWizard();
    act(() => {
      vi.advanceTimersByTime(700);
    });
    for (const answer of ['A whole department', '5,000+ / mo', 'Touches lending decisions', 'Sensitive financial + PII']) {
      fireEvent.click(screen.getByRole('button', { name: answer }));
      act(() => {
        vi.advanceTimersByTime(700);
      });
    }
    const review = screen.getByLabelText('Scoping result');
    // Placement (base 4394): minGate 55 < threshold 65 (tol 52) →
    // sequence-gated, unlocking after the weakest gate.
    expect(review).toHaveTextContent('Would start sequence-gated. Unlocks after Adverse Action closes (55% → 80%).');
    // Domains: DISPLAY names (FL & AA → Fair Lending; Privacy → InfoSec /
    // GLBA), never 'fairlend · mrm' routing slugs (STU-02).
    expect(review).toHaveTextContent('Fair Lending · Model Risk · InfoSec / GLBA');
    expect(review.textContent).not.toContain('fairlend');
    expect(review.textContent).not.toContain('mrm');
    // One-primary rule (spec §5.4/§6; STU-10): the Add button is not a
    // second primary on the Studio · Ask screen.
    expect(screen.getByRole('button', { name: 'Add to the opportunity register' })).toHaveAttribute('data-variant', 'secondary');
  });

  it('review panel Regulations row carries the conditional SOX 404/ICFR and GLBA-safeguards clauses (base 4392; STU-09)', () => {
    renderWizard();
    act(() => {
      vi.advanceTimersByTime(700);
    });
    for (const answer of [
      'A team · 30+ hrs/wk',
      '500–5,000 / mo',
      'Internal · feeds financial reporting (GL / SOX)', // finrep branch (4375, 4380)
      'Sensitive financial · no PII', // sensfin && !pii (4376-4377)
    ]) {
      fireEvent.click(screen.getByRole('button', { name: answer }));
      act(() => {
        vi.advanceTimersByTime(700);
      });
    }
    const review = screen.getByLabelText('Scoping result');
    expect(review).toHaveTextContent('SOX 404 / ICFR: controls over financial reporting must be evidenced through the tool');
    expect(review).toHaveTextContent('sensitive financial, no PII: GLBA safeguards without privacy-notice triggers');
  });
});

describe('chip lock — 700ms debounce (base __chipLock 4332-4337; v1.045 changelog, base 1085)', () => {
  it('keeps the next question’s chips locked until 700ms after a pick, then unlocks', () => {
    renderWizard();
    act(() => {
      vi.advanceTimersByTime(700);
    });
    fireEvent.click(screen.getByRole('button', { name: '2 people · ~15 hrs/wk' }));

    // At +550ms (ADVANCE_DELAY, base botSay(...,550) 4442) the next
    // question is up, but the 700ms chip lock window is still open.
    act(() => {
      vi.advanceTimersByTime(550);
    });
    expect(screen.getByText(INTAKE[1]!.q)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Under 500 items / mo' })).toBeDisabled();

    // At +700ms the lock releases (base setTimeout(...,700), 4334).
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByRole('button', { name: 'Under 500 items / mo' })).toBeEnabled();
  });

  it('a double-click cannot answer two questions (base 1085 changelog; 4332-4337)', () => {
    renderWizard();
    act(() => {
      vi.advanceTimersByTime(700);
    });
    const chip = screen.getByRole('button', { name: '2 people · ~15 hrs/wk' });
    fireEvent.click(chip);
    fireEvent.click(chip); // immediate second click, inside the lock window

    act(() => {
      vi.advanceTimersByTime(700);
    });
    // Exactly one step advanced: Q2 current, Q3 never reached, and the
    // answer bubble appears once.
    expect(screen.getByText(INTAKE[1]!.q)).toBeInTheDocument();
    expect(screen.queryByText(INTAKE[2]!.q)).not.toBeInTheDocument();
    expect(screen.getAllByText('2 people · ~15 hrs/wk')).toHaveLength(1);
  });
});

describe('visible Cancel at every step (base 1085 changelog; route() cancel branch 4435-4439)', () => {
  it('shows "✕ Cancel scoping" at every question step, and fires onCancel when pressed', () => {
    const { onCancel } = renderWizard();

    // Base parity note: during the opening botSay delays the base showed
    // no cancel affordance either — the '✕ Cancel scoping' chip arrives
    // with the first question's chip row (4366-4367), so this test
    // asserts from the first question step onward.
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getByRole('button', { name: '✕ Cancel scoping' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '2 people · ~15 hrs/wk' }));
    // Mid-advance (base kept the chip row until the next question
    // replaced it): the wizard keeps Cancel rendered while 'advancing'.
    expect(screen.getByRole('button', { name: '✕ Cancel scoping' })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(700);
    });
    // Still visible on step 2; pressing it fires the cancel intent
    // (base route() 'cancel' branch 4435-4439).
    fireEvent.click(screen.getByRole('button', { name: '✕ Cancel scoping' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('computeScopedOpportunity — finishIntake envelope arithmetic (base 4369-4400)', () => {
  it('lending + PII: gates FL/AA/MR + Privacy, high risk, cost/val per base formulas', () => {
    const o = computeScopedOpportunity('X', ['A whole department', '5,000+ / mo', 'Touches lending decisions', 'Sensitive financial + PII']);
    // effT=2, volT=2, lending, pii, sensfin:
    // cost = 40000 + 2*20000 + 60000 + 15000 + 10000 = 165000
    // val  = 80000 + 2*60000 + 2*40000 = 280000; h strategic (volT>1)
    expect(o).toEqual({
      n: 'X',
      c: 'Lending',
      cost: 165000,
      val: 280000,
      h: 'strategic',
      r: 'high',
      g: ['Fair Lending', 'Adverse Action', 'Model Risk', 'Privacy'],
      minGate: 55,
      weakGate: 'Adverse Action',
      disc: true, // base 4385 — the "from Discovery" provenance flag
    });
  });

  it('member-facing + PII: gates UDAAP/MR + Privacy, med risk (base else-if chain)', () => {
    const o = computeScopedOpportunity('X', ['A team · 30+ hrs/wk', '500–5,000 / mo', 'Member-facing', 'Member PII']);
    // effT=1, volT=1, memberFacing, pii:
    // cost = 40000 + 20000 + 15000 = 75000; val = 80000+60000+40000 = 180000
    expect(o).toEqual({
      n: 'X',
      c: 'Member service',
      cost: 75000,
      val: 180000,
      h: 'quick',
      r: 'med',
      g: ['UDAAP', 'Model Risk', 'Privacy'],
      minGate: 62,
      weakGate: 'UDAAP',
      disc: true, // base 4385
    });
  });

  it('internal simple + public data: Privacy-only, low risk, base-rate cost/val; "no PII" does not trigger the PII adders (base pii guard)', () => {
    const o = computeScopedOpportunity('X', ['2 people · ~15 hrs/wk', 'Under 500 items / mo', 'Internal · simple workflow', 'Sensitive financial · no PII']);
    // effT=0, volT=0, sensfin only (pii=false via the 'no pii' guard):
    // cost = 40000 + 10000 = 50000; val = 80000
    expect(o).toEqual({
      n: 'X',
      c: 'Operations',
      cost: 50000,
      val: 80000,
      h: 'quick',
      r: 'low',
      g: ['Privacy'],
      minGate: 80,
      weakGate: 'Privacy',
      disc: true, // base 4385
    });
  });
});
