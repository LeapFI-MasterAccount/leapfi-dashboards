/**
 * Context-scoped Ask chat — entry-affordance uniformity (design_system_
 * spec.md §2.9.5/§5.8/§6, amendment A16 / PI2-D42, AC-A16-11).
 *
 * "All seven onside./studio. screens render the utility-corner trigger with
 * the correct per-module label; no screen inside either module is missing
 * it." One assertion per screen, mounted standalone (no App.tsx routing
 * needed — the trigger is screen-local chrome).
 *
 * NARROWED by amendment A20 (PI2-D47, design_system_spec.md §2.9.12,
 * AC-A20-1/2/10): `StudioAsk.tsx` loses its "Ask Studio" utility-corner
 * trigger entirely in the same edit that removes its local Drawer/
 * AskChatPanel mount — "the screen IS the agent," so a second, ghost-weight
 * entry into the same concept is retired, not merely reweighted. The
 * uniformity rule above still binds the remaining six `onside.*`/
 * `studio.*` screens; StudioAsk drops out of this suite the same way it
 * already drops out of the Section 2.9.1 q1-S-03 reconciliation's seven-screen
 * set per §2.9.12's own text. The variant flip those six screens' triggers
 * also get (`ghost` → `secondary`) is covered separately by
 * `entry-affordance-weight-a20.test.tsx` (AC-A20-10/11), not duplicated here.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OnSideOverview } from '../../screens/OnSideOverview';
import { OnSideFeed } from '../../screens/OnSideFeed';
import { OnSideDocuments } from '../../screens/OnSideDocuments';
import { OnSideOwnership } from '../../screens/OnSideOwnership';
import { InvestmentDesign } from '../../screens/InvestmentDesign';
import { Roadmap } from '../../screens/Roadmap';

describe('OnSide module — "Ask OnSide" present on all four screens (AC-A16-11)', () => {
  it('Overview', () => {
    render(<OnSideOverview onNavigate={() => {}} />);
    expect(screen.getByRole('button', { name: 'Ask OnSide' })).toBeInTheDocument();
  });
  it('Regulatory feed', () => {
    render(<OnSideFeed />);
    expect(screen.getByRole('button', { name: 'Ask OnSide' })).toBeInTheDocument();
  });
  it('Documents', () => {
    render(<OnSideDocuments />);
    expect(screen.getByRole('button', { name: 'Ask OnSide' })).toBeInTheDocument();
  });
  it('Ownership', () => {
    render(<OnSideOwnership />);
    expect(screen.getByRole('button', { name: 'Ask OnSide' })).toBeInTheDocument();
  });
});

describe('Studio module — "Ask Studio" present on the two remaining screens (AC-A16-11, narrowed by A20 — StudioAsk no longer carries this trigger)', () => {
  it('Investment Design', () => {
    render(<InvestmentDesign />);
    expect(screen.getByRole('button', { name: 'Ask Studio' })).toBeInTheDocument();
  });
  it('Roadmap', () => {
    render(<Roadmap onNavigate={() => {}} />);
    expect(screen.getByRole('button', { name: 'Ask Studio' })).toBeInTheDocument();
  });
});
