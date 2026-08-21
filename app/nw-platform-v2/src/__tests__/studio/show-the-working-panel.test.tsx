/**
 * r03 "Show the working" — panel-local Slider in the wide Drawer
 * (`planning/r03_show_the_working.md` AC-r03-1..8;
 * `implementation/01-architecture.md` §3, r03's third, panel-local lever
 * mode). Exercises `views/ShowTheWorkingPanel.tsx` against every
 * checkbox AC whose own stated mechanism is "test".
 *
 * `ShowTheWorkingPanel` is not wired into any live screen by this
 * dispatch (see the component's own file header "SCOPE NOTE" — no named
 * host screen in either source document, and the one concrete narrative
 * example, Story B's Board Pack, is not directly wireable: that report
 * already renders inside `screens/Reporting.tsx`'s own shared Drawer
 * instance, and AC-r03-1 forbids a second concurrently-openable Drawer
 * on the same screen). Every AC below is phrased generically ("the
 * opening control", "the underlying screen") rather than against a named
 * real screen, so this file's self-built `TestHost` stands in for
 * "whatever the user is reading" and is the AC's own verification
 * surface, not a shortcut around it.
 *
 * AC-r03-3 and AC-r03-9 are not exercised here: AC-r03-3's mechanism is
 * "grep" (no file under `components/`, no new `Slider.tsx` prop/variant —
 * checked directly against the diff, reported in the dispatch evidence,
 * not re-encoded as a DOM assertion); AC-r03-9 is a deliberate referral
 * (PI2-D36), not a checkable behavior.
 */
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShowTheWorkingPanel } from '../../views/ShowTheWorkingPanel';
import { deriveRecomputeView } from '../../engine/plan';
import { DEFAULT_SLIDERS, getDemoSliders, setDemoSliders } from '../../state/demoStore';

function resetGlobalSliders(): void {
  act(() => {
    setDemoSliders({ ...DEFAULT_SLIDERS });
  });
}

beforeEach(resetGlobalSliders);
afterEach(resetGlobalSliders);

/**
 * Self-contained host standing in for "whatever screen the user is
 * reading" (AC-r03-1's own generic phrasing). Carries:
 *  - its own content (`host-content`), read from the REAL global
 *    `demoStore` singleton, so a test can prove the panel's local drag
 *    never moves it (AC-r03-4, and the file header's core state-isolation
 *    claim);
 *  - a controlled field (`Note`) whose value proves the host never
 *    remounts across an open/close cycle (AC-r03-7);
 *  - the one opening control (AC-r03-1, AC-r03-6's restore target).
 */
function TestHost() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const globalView = deriveRecomputeView(getDemoSliders());

  return (
    <div>
      <p data-testid="host-content">Reading: {globalView.economics.annualValueText} annual value</p>
      <label htmlFor="host-note">Note</label>
      <input id="host-note" value={note} onChange={(event) => setNote(event.target.value)} />
      <button type="button" onClick={() => setOpen(true)}>
        Show the working
      </button>
      <ShowTheWorkingPanel open={open} onClose={() => setOpen(false)} baseline={DEFAULT_SLIDERS} />
    </div>
  );
}

function openPanel(): HTMLElement {
  fireEvent.click(screen.getByRole('button', { name: 'Show the working' }));
  return screen.getByRole('dialog');
}

describe('r03 AC-r03-1 — shared wide Drawer, underlying screen stays mounted, no navigation', () => {
  it('opens exactly one dialog over the still-mounted host content', () => {
    render(<TestHost />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const dialog = openPanel();

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(dialog).toHaveAttribute('data-size', 'wide');
    expect(screen.getByTestId('host-content')).toBeInTheDocument();
  });
});

describe('r03 AC-r03-2 — exactly one Slider, no primary footer action', () => {
  it('renders one range Slider and no footer at all (zero primary actions by construction)', () => {
    render(<TestHost />);
    const dialog = openPanel();

    expect(within(dialog).getAllByRole('slider')).toHaveLength(1);
    expect(dialog.querySelector('[data-lf-drawer-footer]')).not.toBeInTheDocument();
  });
});

describe('r03 AC-r03-4 — dragging recomputes only the figures inside the panel', () => {
  it('changes the panel figures on drag; the host figure and the global singleton stay put', () => {
    render(<TestHost />);
    const dialog = openPanel();

    const before = deriveRecomputeView(DEFAULT_SLIDERS);
    expect(dialog.textContent).toContain(before.economics.annualValueText);

    const slider = within(dialog).getByRole('slider');
    fireEvent.change(slider, { target: { value: '20' } });

    const after = deriveRecomputeView({ ...DEFAULT_SLIDERS, eff: 20 });
    expect(after.economics.annualValueText).not.toBe(before.economics.annualValueText);
    expect(dialog.textContent).toContain(after.economics.annualValueText);
    expect(dialog.textContent).not.toContain(before.economics.annualValueText);

    // The host's own figure (sourced from the real global singleton) is
    // unchanged in this same render — and the singleton itself never moved.
    expect(screen.getByTestId('host-content').textContent).toContain(before.economics.annualValueText);
    expect(getDemoSliders()).toEqual(DEFAULT_SLIDERS);
  });
});

describe('r03 AC-r03-5 — current assumption value always shown as text beside the Slider', () => {
  it('the rendered value text matches the Slider after a drag', () => {
    render(<TestHost />);
    const dialog = openPanel();

    expect(within(dialog).getByText('70%')).toBeInTheDocument();

    const slider = within(dialog).getByRole('slider') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '55' } });

    expect(slider.value).toBe('55');
    expect(within(dialog).getByText('55%')).toBeInTheDocument();
  });
});

describe('r03 AC-r03-6 — focus plan at this panel\'s call site', () => {
  it('initial focus lands on the Drawer heading; on close, focus restores to the opening control', async () => {
    const user = userEvent.setup();
    render(<TestHost />);
    // userEvent (unlike fireEvent) focuses the pressed button first, the
    // same real-interaction fidelity Drawer's own captureRet port relies on
    // (Drawer captures `document.activeElement` at open time).
    const opener = screen.getByRole('button', { name: 'Show the working' });
    await user.click(opener);

    const dialog = screen.getByRole('dialog');
    const heading = within(dialog).getByRole('heading', { name: 'Adoption / efficacy' });
    await waitFor(() => expect(heading).toHaveFocus());

    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => expect(opener).toHaveFocus());
  });
});

describe('r03 AC-r03-7 — closing returns to the underlying screen intact, no remount', () => {
  it('host field value and content survive an open/close cycle', async () => {
    const user = userEvent.setup();
    render(<TestHost />);
    fireEvent.change(screen.getByLabelText('Note'), { target: { value: 'kept across open/close' } });

    const opener = screen.getByRole('button', { name: 'Show the working' });
    await user.click(opener);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    expect(screen.getByLabelText('Note')).toHaveValue('kept across open/close');
    expect(screen.getByTestId('host-content')).toBeInTheDocument();
  });
});

describe('r03 AC-r03-8 (D26 by construction) — no prose narration, data values and labels only', () => {
  it('renders only the Slider\'s own label, its value, and the recomputed figure labels — no narrating sentence', () => {
    render(<TestHost />);
    const dialog = openPanel();

    // A narrating sentence always carries sentence-ending punctuation
    // followed by whitespace (e.g. "This models what happens if..."); a
    // decimal figure like "2.9×" does not, so this is a safe D26 sweep.
    expect(dialog.textContent ?? '').not.toMatch(/[.!?]\s/);

    // "Adoption / efficacy" legitimately appears twice — the Drawer
    // heading (C7) and the Slider's own label (P7) — both data-bearing
    // labels, not narration.
    expect(within(dialog).getAllByText('Adoption / efficacy')).toHaveLength(2);
    expect(within(dialog).getByText('Expected 3-year ROI')).toBeInTheDocument();
    expect(within(dialog).getByText('Annual value')).toBeInTheDocument();
  });
});

describe('r03 — state-isolation contract (the requirement\'s own stated point)', () => {
  it('never imports state/demoStore — a purely component-local lever, not a global-singleton write', async () => {
    const path = await import('node:path');
    const fs = await import('node:fs/promises');
    const filePath = path.resolve(process.cwd(), 'src/views/ShowTheWorkingPanel.tsx');
    const source = await fs.readFile(filePath, 'utf-8');
    // Checks the actual import statement, not prose in the file's own
    // header comment (which names state/demoStore.ts descriptively).
    expect(source).not.toMatch(/from ['"].*state\/demoStore['"]/);
    expect(source).not.toMatch(/setDemoSliders\(/);
  });
});
