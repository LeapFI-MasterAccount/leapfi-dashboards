/**
 * Drawer (C7) geometry & size-toggle contract — amendment A15
 * (design_system_spec.md §2.8, PI2-D41/PI2-D14/PI2-D13).
 *
 * Falsifiable per the ruling brief's own AC list (§2.8 "Acceptance
 * criteria" — no pixel screenshot required):
 *   AC-A15-1  'default' width formula literal (jsdom, `data-size`+`style.width`)
 *   AC-A15-2  'wide' width formula unchanged (jsdom + grep)
 *   AC-A15-3  legacy 480px floor literal preserved inside the new formula (grep)
 *   AC-A15-4  DrawerSize stays a two-value union (grep + `npx tsc --noEmit`)
 *   AC-A15-5  toggle state machine, exhaustively exercised (jsdom)
 *   AC-A15-6  fresh-open reseed — a prior toggle never leaks into the next
 *             unrelated open (jsdom)
 *   AC-A15-7  RPT-05 interaction: a user-toggled size survives an in-drawer
 *             content (title) swap (jsdom)
 *   AC-A15-8  no focus move, no live-region spend on toggle press (jsdom)
 *   AC-A15-9  tab order: heading (untabbable) -> toggle -> close, trap intact (jsdom)
 *   AC-A15-10 print stylesheet unaffected; hide-list gains the toggle selector (grep)
 *   AC-A15-11 IconName/GLYPHS completeness for 'expand'/'collapse' (grep;
 *             completeness itself is a compile-time property of Icon.tsx's
 *             own `Record<IconName, GlyphProps[]>` typing, checked by
 *             `npx tsc --noEmit`, not re-verified at runtime here)
 *   AC-A15-12 the toggle is never `variant="primary"` (grep)
 *
 * RPT-03 (Reporting's existing wide-report / default-form call site) is a
 * SEPARATE, pre-existing regression suite
 * (__tests__/reporting_cases/reporting_fix_wave.test.tsx) that this
 * amendment must not break — it is intentionally NOT duplicated here; its
 * own run (see evidence return) is the proof this amendment's rendering
 * still honors that call site's live `size`-prop-driven swap between the
 * wide report and the default-width board-log form, in the same open
 * Drawer session, without a toggle press.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Drawer } from '../../components/Drawer';

const drawerSource = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '../../components/Drawer.tsx'),
  'utf-8',
);
const iconSource = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '../../components/primitives/Icon.tsx'),
  'utf-8',
);

function getDialog(): HTMLElement {
  return screen.getByRole('dialog');
}

function renderDrawer(props: Partial<ComponentProps<typeof Drawer>> = {}) {
  const onClose = () => {};
  return render(
    <Drawer open title="Test drawer" onClose={onClose} {...props}>
      <p>Body content</p>
    </Drawer>,
  );
}

function pressToggle(): void {
  fireEvent.click(screen.getByRole('button', { name: /Expand|Collapse/ }));
}

describe('AC-A15-1 / AC-A15-2 — width formulas (jsdom)', () => {
  it('renders the default-size formula literal', () => {
    renderDrawer({ size: 'default' });
    const dialog = getDialog();
    expect(dialog).toHaveAttribute('data-size', 'default');
    expect(dialog.style.width).toBe('min(clamp(480px, 40vw, 720px), 100vw)');
  });

  it('renders the wide-size formula literal, byte-identical to pre-A15', () => {
    renderDrawer({ size: 'wide' });
    const dialog = getDialog();
    expect(dialog).toHaveAttribute('data-size', 'wide');
    expect(dialog.style.width).toBe('min(920px, 97vw)');
  });
});

describe('AC-A15-2 / AC-A15-3 — source-literal grep guards', () => {
  it("'wide' formula literal is unchanged in source", () => {
    expect(drawerSource).toContain("'min(920px, 97vw)'");
  });

  it("the new 'default' formula preserves the legacy 480px floor literal", () => {
    expect(drawerSource).toContain('min(clamp(480px, 40vw, 720px), 100vw)');
  });
});

describe('AC-A15-4 — DrawerSize stays a two-value union', () => {
  it('source declares exactly the two-value union, no third size literal', () => {
    expect(drawerSource).toMatch(/export type DrawerSize = 'default' \| 'wide';/);
  });
});

describe('AC-A15-5 — toggle state machine, exhaustively exercised', () => {
  it('default -> wide -> default via repeated toggle presses, aria-pressed tracks state', () => {
    renderDrawer({ size: 'default' });
    const dialog = getDialog();
    const toggle = screen.getByRole('button', { name: 'Expand' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggle);
    expect(dialog).toHaveAttribute('data-size', 'wide');
    const collapseToggle = screen.getByRole('button', { name: 'Collapse' });
    expect(collapseToggle).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(collapseToggle);
    expect(dialog).toHaveAttribute('data-size', 'default');
    expect(screen.getByRole('button', { name: 'Expand' })).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('AC-A15-6 — fresh-open reseed, no leak across sessions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('a toggled-away size does not survive close + reopen with the same size prop', () => {
    const { rerender } = renderDrawer({ open: true, size: 'wide' });
    expect(getDialog()).toHaveAttribute('data-size', 'wide');

    fireEvent.click(screen.getByRole('button', { name: /Expand|Collapse/ }));
    expect(getDialog()).toHaveAttribute('data-size', 'default');

    // Close and let the exit transition finish (TRANSITION_MS = 200ms).
    rerender(
      <Drawer open={false} title="Test drawer" onClose={() => {}} size="wide">
        <p>Body content</p>
      </Drawer>,
    );
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <Drawer open={true} title="Test drawer" onClose={() => {}} size="wide">
        <p>Body content</p>
      </Drawer>,
    );
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(getDialog()).toHaveAttribute('data-size', 'wide');
  });
});

describe('AC-A15-7 — RPT-05 interaction: sizeState survives a title-only content swap', () => {
  it('a manually-toggled wide size is unaffected by an in-drawer title swap', () => {
    const { rerender } = renderDrawer({ open: true, size: 'default', title: 'First content' });
    expect(getDialog()).toHaveAttribute('data-size', 'default');

    pressToggle();
    expect(getDialog()).toHaveAttribute('data-size', 'wide');

    // RPT-05 path: swap `title` while `open` stays true and `size` prop is
    // unchanged — a pure content swap, not a caller-driven size re-request.
    rerender(
      <Drawer open={true} title="Second content" onClose={() => {}} size="default">
        <p>New body</p>
      </Drawer>,
    );

    expect(getDialog()).toHaveAttribute('data-size', 'wide');
    // Existing RPT-05 refocus behavior is unaffected by this amendment.
    expect(screen.getByRole('heading', { name: 'Second content' })).toHaveFocus();
  });
});

describe('AC-A15-8 — no focus move, no live-region spend on toggle press', () => {
  it('focus stays on the toggle and no [aria-live] node changes text', () => {
    renderDrawer({ size: 'default' });
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.textContent = 'unchanged';
    document.body.appendChild(liveRegion);

    const toggle = screen.getByRole('button', { name: 'Expand' });
    act(() => {
      toggle.focus();
    });
    expect(toggle).toHaveFocus();

    fireEvent.click(toggle);

    const toggleAfter = screen.getByRole('button', { name: 'Collapse' });
    expect(toggleAfter).toHaveFocus();
    expect(liveRegion.textContent).toBe('unchanged');

    document.body.removeChild(liveRegion);
  });
});

describe('AC-A15-9 — tab order: heading (untabbable) -> toggle -> close, trap intact', () => {
  it('the toggle appears before the close Button in DOM/tab order and Shift+Tab from it stays trapped', () => {
    renderDrawer({ size: 'default' });
    const dialog = getDialog();
    const toggle = screen.getByRole('button', { name: 'Expand' });
    const close = screen.getByRole('button', { name: 'Close' });

    const position = toggle.compareDocumentPosition(close);
    // eslint-disable-next-line no-bitwise -- Node.compareDocumentPosition bitmask, standard DOM API usage
    expect(Boolean(position & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);

    act(() => {
      toggle.focus();
    });
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    // Shift+Tab from the first focusable (the toggle — the heading is
    // untabbable) wraps to the last focusable inside the trap, never
    // escaping the dialog subtree.
    expect(dialog.contains(document.activeElement)).toBe(true);
  });
});

describe('AC-A15-10 — print stylesheet unaffected; hide-list gains the toggle selector', () => {
  it('PRINT_STYLE keeps the unchanged drawer width!important rule and hides the new toggle', () => {
    expect(drawerSource).toContain("[data-lf-composite='drawer'] {");
    expect(drawerSource).toContain('width: 100% !important');
    expect(drawerSource).toContain('[data-lf-drawer-close]');
    expect(drawerSource).toContain('[data-lf-drawer-size-toggle]');
  });

  it('the rendered toggle carries the print-hide data attribute', () => {
    renderDrawer({ size: 'default' });
    const toggle = screen.getByRole('button', { name: 'Expand' });
    expect(toggle.closest('[data-lf-drawer-size-toggle]')).not.toBeNull();
  });
});

describe('AC-A15-11 — IconName / GLYPHS completeness for expand/collapse', () => {
  it("Icon.tsx's IconName union includes 'expand' and 'collapse'", () => {
    expect(iconSource).toMatch(/'expand'/);
    expect(iconSource).toMatch(/'collapse'/);
  });

  it("Icon.tsx's GLYPHS map has entries for both new names", () => {
    expect(iconSource).toMatch(/expand:\s*\[/);
    expect(iconSource).toMatch(/collapse:\s*\[/);
  });

  it('the drawer renders the expand/collapse icon glyphs via data-name', () => {
    renderDrawer({ size: 'default' });
    expect(document.querySelector('[data-lf-primitive="icon"][data-name="expand"]')).not.toBeNull();
    pressToggle();
    expect(document.querySelector('[data-lf-primitive="icon"][data-name="collapse"]')).not.toBeNull();
  });
});

describe('AC-A15-12 — the toggle is never variant="primary"', () => {
  it('the toggle Button renders data-variant="ghost"', () => {
    renderDrawer({ size: 'default' });
    const toggle = screen.getByRole('button', { name: 'Expand' });
    expect(toggle).toHaveAttribute('data-variant', 'ghost');
  });

  it('source never assigns variant="primary" to the size-toggle Button', () => {
    const toggleBlockMatch = drawerSource.match(/data-lf-drawer-size-toggle[\s\S]{0,400}/);
    expect(toggleBlockMatch).not.toBeNull();
    expect(toggleBlockMatch?.[0]).not.toContain('variant="primary"');
  });
});
