/**
 * Entry-affordance weight — amendment A20 (PI2-D47, design_system_spec.md
 * §2.9.12). Falsifiable acceptance criteria AC-A20-10/11.
 *
 * PI2-D47's own words: "the CTA is crap" (ghost-weight, near-invisible
 * text-only chrome) — "the corner trigger must be a visually-assertive
 * control, not ghost text." Ruling: `Button` (P2) `variant` changes from
 * `ghost` to `secondary` at all six remaining onside/studio host screens
 * (StudioAsk drops the trigger entirely, §2.9.12, covered by
 * `ask-chat-entry-uniformity.test.tsx`/`studio-ask-a20-agent-canvas.
 * test.tsx` AC-A20-1/2/10 instead). `primary` is REJECTED — the trigger
 * must never compete with a screen's own stated primary CTA.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OnSideOverview } from '../../screens/OnSideOverview';
import { OnSideFeed } from '../../screens/OnSideFeed';
import { OnSideDocuments } from '../../screens/OnSideDocuments';
import { OnSideOwnership } from '../../screens/OnSideOwnership';
import { InvestmentDesign } from '../../screens/InvestmentDesign';
import { Roadmap } from '../../screens/Roadmap';

const SCREENS: { name: string; label: string; render: () => ReturnType<typeof render> }[] = [
  { name: 'OnSideOverview', label: 'Ask OnSide', render: () => render(<OnSideOverview onNavigate={() => {}} />) },
  { name: 'OnSideFeed', label: 'Ask OnSide', render: () => render(<OnSideFeed />) },
  { name: 'OnSideDocuments', label: 'Ask OnSide', render: () => render(<OnSideDocuments />) },
  { name: 'OnSideOwnership', label: 'Ask OnSide', render: () => render(<OnSideOwnership />) },
  { name: 'InvestmentDesign', label: 'Ask Studio', render: () => render(<InvestmentDesign />) },
  { name: 'Roadmap', label: 'Ask Studio', render: () => render(<Roadmap onNavigate={() => {}} />) },
];

describe('AC-A20-10 — entry-affordance weight: all six remaining trigger Buttons render data-variant="secondary"', () => {
  for (const screenDef of SCREENS) {
    it(screenDef.name, () => {
      screenDef.render();
      const trigger = screen.getByRole('button', { name: screenDef.label });
      expect(trigger).toHaveAttribute('data-variant', 'secondary');
    });
  }
});

describe('AC-A20-11 — no competing primary: on every one of the six screens, at most one Button carries data-variant="primary", and the entry-affordance trigger never does', () => {
  for (const screenDef of SCREENS) {
    it(screenDef.name, () => {
      const { container } = screenDef.render();
      const primaryButtons = container.querySelectorAll('button[data-variant="primary"]');
      expect(primaryButtons.length).toBeLessThanOrEqual(1);
      const trigger = screen.getByRole('button', { name: screenDef.label });
      expect(trigger).not.toHaveAttribute('data-variant', 'primary');
    });
  }
});
