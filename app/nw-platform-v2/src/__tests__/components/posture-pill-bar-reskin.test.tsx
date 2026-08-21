/**
 * PosturePillBar (C12) — L5 re-skin (call-01-progress-gauges.md,
 * DECISIONS.md D2/D2a/D2b).
 *
 * D2 rules PosturePillBar re-skinned IN PLACE — never a new composite,
 * never a new token value; the 5-band ordinal progression stays on the
 * component's own already-consumed `--accent`/`--chart-axis` set (plus
 * the core `--panel`/`--bg`/`--ink`/`--border` roles it already used
 * pre-re-skin). This file pins the re-skin's THREE concrete asks from the
 * L5 dispatch brief, each implemented as a GEOMETRY/WEIGHT change only —
 * zero new color pairing is introduced (verified against
 * `panel-seated-contrast.test.tsx`'s existing PosturePillBar coverage,
 * which this dispatch leaves untouched and green):
 *
 *  1. "reads as the gauge/power-zone visualization" — segments tighten
 *     into a single track (smaller inter-segment gap) and swap the full
 *     pill shape (`--radius-pill`, 999px) for the codebase's own
 *     `--radius-md` zone-block shape (already used elsewhere, e.g.
 *     `OnSideOverview.tsx`'s `KPI_BUTTON_STYLE`) — no new radius token.
 *  2. "stronger target-band fill" — the goal segment's existing solid
 *     `--accent` fill gets heavier visual weight (bolder text, larger
 *     padding) — same fill color, stronger presence.
 *  3. "clear now/goal markers" + "unmistakable on-target state" — the
 *     "now" (current) segment's outline ring is thickened, and the
 *     combined current+target case (a domain already AT its goal) gets
 *     BOTH the goal's solid fill AND an emphasized ring, so it reads
 *     strictly stronger than either "now, not yet at goal" (ring only) or
 *     "goal, not yet reached" (fill only) alone.
 *
 * Contrast note: every color pairing below (accent/bg fill, panel/ink
 * outline, panel/chart-axis default) is UNCHANGED from the pre-re-skin
 * component — independently recomputed from tokens.css hex values, both
 * themes (WCAG relative-luminance formula):
 *   dark  target/on-target  bg(#000)   on accent(#00f2ff) = 15.14:1
 *   dark  current           ink(#fff)  on panel(#0d1525)  = 18.24:1
 *   dark  between/default   chart-axis(#7c8ca3) on panel  =  5.33:1 (D2b)
 *   light target/on-target  bg(#fff)   on accent(#006d75) =  6.10:1 (D2b)
 *   light current           ink(#0a2342) on panel(#f1f5f9)= 14.39:1 (D2b)
 *   light between/default   chart-axis(#5a6b82) on panel  =  4.97:1 (D2b)
 * All six clear the 4.5:1 AA text floor in both themes.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PosturePillBar } from '../../components/PosturePillBar';
import type { PostureSegment } from '../../engine/plan';

const segments: PostureSegment[] = [
  { index: 0, band: 'Ad hoc', isCurrent: false, isTarget: false, isBetween: false, label: '1 · Ad hoc' },
  { index: 1, band: 'Developing', isCurrent: false, isTarget: false, isBetween: true, label: '2 · Developing' },
  { index: 2, band: 'Defined', isCurrent: true, isTarget: false, isBetween: false, label: '3 · Defined · now' },
  { index: 3, band: 'Managed', isCurrent: false, isTarget: true, isBetween: false, label: '4 · Managed · goal' },
];

// A domain that has already reached its own target — current === target —
// the combined-emphasis case (D2's "unmistakable on-target state").
const onTargetSegments: PostureSegment[] = [
  { index: 0, band: 'Ad hoc', isCurrent: false, isTarget: false, isBetween: false, label: '1 · Ad hoc' },
  { index: 1, band: 'Developing', isCurrent: false, isTarget: false, isBetween: false, label: '2 · Developing' },
  { index: 2, band: 'Defined', isCurrent: true, isTarget: true, isBetween: false, label: '3 · Defined · now' },
  { index: 3, band: 'Managed', isCurrent: false, isTarget: false, isBetween: false, label: '4 · Managed' },
];

describe('PosturePillBar re-skin · track/gauge geometry (no new token)', () => {
  it('groups segments into a tight track (smaller gap than a scattered chip row)', () => {
    const { container } = render(<PosturePillBar segments={segments} />);
    const list = container.querySelector('[data-lf-composite="posture-pill-bar"]') as HTMLElement;
    expect(list).toBeTruthy();
    // Pre-re-skin baseline was 0.5rem (isolated-pill spacing); the
    // gauge/power-zone read requires strictly tighter grouping.
    expect(list.style.gap).not.toBe('0.5rem');
    expect(list.style.gap).toBe('0.25rem');
  });

  it('every segment uses the zone-block radius (--radius-md), never the isolated-pill radius (--radius-pill)', () => {
    render(<PosturePillBar segments={segments} />);
    for (const segment of segments) {
      const el = screen.getByText(segment.label);
      expect(el.style.borderRadius).not.toBe('var(--radius-pill, 999px)');
      expect(el.style.borderRadius).toBe('var(--radius-md, 10px)');
    }
  });
});

describe('PosturePillBar re-skin · stronger target-band fill (D2: same --accent fill, heavier weight)', () => {
  it('the goal-only segment keeps its solid accent fill but gains heavier text weight and larger padding than a plain segment', () => {
    render(<PosturePillBar segments={segments} />);
    const goal = screen.getByText('4 · Managed · goal');
    const plain = screen.getByText('1 · Ad hoc');
    expect(goal.style.background).toBe('var(--accent)');
    expect(goal.style.color).toBe('var(--bg)');
    expect(Number(goal.style.fontWeight)).toBeGreaterThan(Number(plain.style.fontWeight));
    expect(goal.style.padding).not.toBe(plain.style.padding);
  });
});

describe('PosturePillBar re-skin · clear now/goal markers (D2: --accent outline vs --accent fill, distinct weights)', () => {
  it('the "now" (current, not-yet-at-goal) segment keeps its outlined (not filled) treatment, with a thickened ring', () => {
    render(<PosturePillBar segments={segments} />);
    const now = screen.getByText('3 · Defined · now');
    expect(now.style.background).toBe('var(--panel)');
    expect(now.style.color).toBe('var(--ink)');
    expect(now.style.borderColor).toBe('var(--accent)');
    // Pre-re-skin baseline ring was 2px; thickened for a clearer marker.
    expect(now.style.borderWidth).not.toBe('2px');
    expect(Number.parseFloat(now.style.borderWidth)).toBeGreaterThanOrEqual(3);
  });
});

describe('PosturePillBar re-skin · unmistakable on-target state (D2: target-band fill, strengthened when current === target)', () => {
  it('a segment that is BOTH current and target (domain already at its own goal) reads strictly stronger than either alone', () => {
    const plainRender = render(<PosturePillBar segments={segments} />);
    const plainGoal = screen.getByText('4 · Managed · goal');
    const plainCurrent = screen.getByText('3 · Defined · now');
    expect(plainGoal.style.boxShadow).toBeFalsy();
    expect(plainCurrent.style.boxShadow).toBeFalsy();
    plainRender.unmount();

    render(<PosturePillBar segments={onTargetSegments} />);
    // The on-target segment's <li> now carries extra child nodes (the
    // HR-A11Y-01 checkmark + sr-only marker) alongside `segment.label`, so
    // it's located via `closest('li')` off the label text rather than an
    // exact-text match on the whole element.
    const combinedLi = screen.getByText('3 · Defined · now', { exact: false }).closest('li') as HTMLElement;
    const combined = combinedLi;

    // The combined segment keeps the goal's solid fill...
    expect(combined.style.background).toBe('var(--accent)');
    expect(combined.style.color).toBe('var(--bg)');
    // ...PLUS a stronger ring than a plain current-only segment (2px/3px baseline).
    expect(Number.parseFloat(combined.style.borderWidth)).toBeGreaterThanOrEqual(3);
    // ...PLUS a visible boundary ring (box-shadow) neither the plain goal-only
    // nor the plain current-only segment carries — the literal "unmistakable" delta.
    expect(combined.style.boxShadow).toBeTruthy();
  });

  // HR-A11Y-01 (S2, hostile review, CONFIRMED) — the pre-fix ring used
  // `var(--bg)`, which is near-identical in luminance to both real
  // consumer backgrounds (~1.1:1 panel-seated, exactly 1:1 page-level —
  // both far under the WCAG 1.4.11 3:1 non-text floor). The fix recolors
  // the ring to `var(--ink)`, already consumed elsewhere in this file
  // (the plain-current branch) and independently verified >4.5:1 against
  // both `--panel` and `--bg` in both themes (file header contrast
  // table). Pinned here as a rendered-style assertion so a regression
  // back to `--bg` (or any token failing the D2b contrast set) is caught
  // directly, not just by a re-derivation from tokens.css.
  it('the on-target boundary ring uses --ink (contrast-verified against both real consumer backgrounds), never --bg (near-invisible, HR-A11Y-01)', () => {
    render(<PosturePillBar segments={onTargetSegments} />);
    const combined = screen.getByText('3 · Defined · now', { exact: false }).closest('li') as HTMLElement;
    expect(combined.style.boxShadow).toBe('0 0 0 2px var(--ink)');
    expect(combined.style.boxShadow).not.toContain('var(--bg)');
  });

  // HR-A11Y-01 (S2) — `segment.label` alone (computed upstream in
  // `engine/plan.ts`, out of this component's allowlist) is byte-identical
  // between a plain current-only segment and an on-target segment (both
  // end in " • now", never "goal"). This component's own markup now adds
  // an explicit, independent on-target marker (decorative checkmark +
  // sr-only text) so the fact is genuinely carried in text for both
  // sighted-at-a-glance and assistive-tech users, not just implied by a
  // ring a user has to notice.
  //
  // DISCRIMINATING: reverting this dispatch's marker (removing the
  // `onTarget ? <>...</> : null` block in `PosturePillBar.tsx`) makes
  // this test fail — confirmed by rerunning this file unmodified against
  // that scratch revert.
  it('the on-target segment carries an explicit text/assistive-tech marker beyond the shared "now" label — a plain current-only segment does not', () => {
    const onTargetRender = render(<PosturePillBar segments={onTargetSegments} />);
    const combinedLi = screen.getByText('3 · Defined · now', { exact: false }).closest('li') as HTMLElement;
    expect(combinedLi.textContent).toContain('✓');
    expect(combinedLi.textContent).toContain('target met');
    onTargetRender.unmount();

    render(<PosturePillBar segments={segments} />);
    const plainCurrentLi = screen.getByText('3 · Defined · now', { exact: false }).closest('li') as HTMLElement;
    expect(plainCurrentLi.textContent).not.toContain('target met');
  });

  it('aria-current is still set only on the current segment — text/ARIA meaning is unchanged by the visual re-skin', () => {
    render(<PosturePillBar segments={onTargetSegments} />);
    const li = screen.getByText('3 · Defined · now', { exact: false }).closest('li');
    expect(li).toHaveAttribute('aria-current', 'true');
    const other = screen.getByText('1 · Ad hoc').closest('li');
    expect(other).not.toHaveAttribute('aria-current');
  });
});

describe('PosturePillBar re-skin · a11y baseline preserved (composite C12 spec: no change to list semantics)', () => {
  it('keeps the semantic list role and its labelled-in-text guarantee', () => {
    render(<PosturePillBar segments={segments} />);
    const list = screen.getByRole('list', { name: /Control-maturity posture/ });
    expect(list).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(segments.length);
  });
});
