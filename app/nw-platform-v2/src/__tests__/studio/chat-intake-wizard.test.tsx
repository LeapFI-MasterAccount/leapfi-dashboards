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
 *    exported computeScopedOpportunity)
 *  - acceptProposed / discardProposed as intents: base 4401-4413
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ChatIntakeWizard, computeScopedOpportunity } from '../../views/ChatIntakeWizard';
import { INTAKE } from '../../data/misc';

function renderWizard(overrides?: Partial<Parameters<typeof ChatIntakeWizard>[0]>) {
  const onComplete = vi.fn();
  const onDiscard = vi.fn();
  const onCancel = vi.fn();
  render(
    <ChatIntakeWizard
      useCaseName="Collections outreach drafting"
      onComplete={onComplete}
      onDiscard={onDiscard}
      onCancel={onCancel}
      {...overrides}
    />,
  );
  return { onComplete, onDiscard, onCancel };
}

beforeEach(() => {
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

    // Opening line visible immediately (base botSay 4365).
    expect(screen.getByText(/I don't have a comparable for "Collections outreach drafting" in the library yet/)).toBeInTheDocument();
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
   * D17 FINDING / STOP-item (kept correct-to-base, marked `.fails`):
   * base 4363-4368 sequences the opening line's own botSay delays
   * (600ms + 650ms + 500ms) BEFORE the first question ever renders —
   * the question text is never on screen during the opening transition.
   * CURRENT CODE deviates: `buildMessages` (ChatIntakeWizard.tsx)
   * includes `INTAKE[0].q` from the very first render (`if (index >
   * answers.length) return;` — index 0 is not > 0 with zero answers),
   * so the first question bubble is visible at mount, alongside the
   * "Thinking…" transition, contradicting both the base sequencing and
   * the component's own header note ("after OPENING_DELAY_MS the first
   * question appears"). The same off-by-one shows each NEXT question
   * during the 'advancing' Thinking transition. The assertion below is
   * what the base pins; it fails against current code.
   */
  it.fails('does not show the first question text during the opening transition (base 4363-4368 sequencing) — KNOWN DEVIATION, see STOP-item', () => {
    renderWizard();
    expect(screen.queryByText(INTAKE[0]!.q)).not.toBeInTheDocument();
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
    // cost 165000 → $165k, val 280000 → $280k, high risk, Lending.
    const review = screen.getByLabelText('Scoping result');
    expect(review).toHaveTextContent('≈ $165k one-time · High risk profile (Lending)');
    expect(review).toHaveTextContent('≈ $280k/yr');

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
      }),
    );
    // Double-press guard: the intent must not fire twice.
    fireEvent.click(addButton);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onDiscard).not.toHaveBeenCalled();
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
    });
  });
});
