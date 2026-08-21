/**
 * Light-mode outline fix (hostile-review Class C finding C3) —
 * lightmode_amendment_proposal.md §6.2 (categorical Aqua/Glacier) and
 * §6.3 (semantic Positive/Caution/Alert) flat-fill uses on light
 * surfaces.
 *
 * Both provisions computed the SAME bare-fill non-text ratios cited in
 * C3's finding (Aqua 2.33:1, Glacier 1.75:1 on Frost Panel; Positive
 * 2.08:1, Caution 1.96:1 on Frost Panel — all under the 3:1 non-text
 * floor) and prescribe a mandatory Midnight (`#0A2342`) outline stroke —
 * 1px for the two disqualified categorical hues (§6.2), 1.5px for the
 * three semantic dot/chip fills (§6.3) — present ONLY on light surfaces,
 * a no-op on dark (dark-mode fills were never the problem).
 *
 * Mechanism: `--cat-outline` / `--sem-outline` (tokens.css) are a single
 * swap-point token pair whose *rendered form* differs by theme (`none`
 * in dark, an inset box-shadow ring in light) — the same pattern
 * design_system_spec.md §1.3 already sanctions for `--focus-ring` (glow
 * vs. solid ring). This is a color/value swap at one point, not a
 * per-theme branch in component structure (§1.2): both RoadmapGantt and
 * Tag render byte-identical JSX in both themes; only the CSS custom
 * property each references resolves differently.
 *
 * jsdom does not resolve CSS custom properties (see
 * components/Topbar.tsx's own "TESTED VIA CSSOM, NOT COMPUTED STYLE"
 * note, and `panel-seated-contrast.test.tsx`'s identical caveat) — these
 * assertions read the literal `var(--x)` string React puts on the inline
 * `style` attribute, not a themed, resolved value.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoadmapGantt } from '../../components/RoadmapGantt';
import { Tag } from '../../components/primitives/Tag';
import type { RoadmapPhase } from '../../components/RoadmapGantt';

describe('RoadmapGantt (C14) — Aqua/Glacier categorical fills carry the §6.2 outline fix', () => {
  // CAT_TOKENS cycles ['--cat-1' .. '--cat-6'] by phase index — Aqua is
  // index 2 (--cat-3, 3rd phase), Glacier is index 4 (--cat-5, 5th phase).
  const phases: RoadmapPhase[] = Array.from({ length: 6 }, (_, i) => ({
    id: `phase-${i}`,
    name: `Phase ${i}`,
    segments: [{ id: `phase-${i}-seg-0`, label: 'Sprint 1', status: 'complete' }],
  }));

  it('the Aqua-fill (3rd) phase segment carries the outline-fix box-shadow', () => {
    render(<RoadmapGantt phases={phases} />);
    const allSegments = document.querySelectorAll('[data-lf-composite="roadmap-gantt-phase"]');
    const aquaRow = allSegments[2];
    const glacierRow = allSegments[4];
    const steelRow = allSegments[0];
    expect(aquaRow).toBeTruthy();
    expect(glacierRow).toBeTruthy();
    const aquaBar = aquaRow?.querySelector('[title]') as HTMLElement | null;
    const glacierBar = glacierRow?.querySelector('[title]') as HTMLElement | null;
    const steelBar = steelRow?.querySelector('[title]') as HTMLElement | null;
    expect(aquaBar?.style.boxShadow).toBe('var(--cat-outline)');
    expect(glacierBar?.style.boxShadow).toBe('var(--cat-outline)');
    // Steel Blue (--cat-1) is not a disqualified hue (§6.2 table, PASS) —
    // it must NOT carry the fix (scoped to exactly the two DISQUALIFIED hues).
    expect(steelBar?.style.boxShadow).not.toBe('var(--cat-outline)');
  });
});

describe('Tag (P4) status variants — semantic flat-fill chips carry the §6.3 outline fix', () => {
  it.each(['status-positive', 'status-caution', 'status-alert'] as const)(
    '%s carries the mandatory outline-fix box-shadow (§6.3: "every semantic dot/chip carries...")',
    (variant) => {
      render(<Tag variant={variant} text="Status" />);
      const tag = screen.getByText('Status');
      expect(tag.style.boxShadow).toBe('var(--sem-outline)');
    },
  );
});
