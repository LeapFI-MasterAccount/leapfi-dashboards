/**
 * Context-scoped Ask chat — entry-affordance uniformity (design_system_
 * spec.md §2.9.5/§5.8/§6, amendment A16 / PI2-D42, AC-A16-11).
 *
 * "All seven onside./studio. screens render the utility-corner trigger with
 * the correct per-module label; no screen inside either module is missing
 * it." One assertion per screen, mounted standalone (no App.tsx routing
 * needed — the trigger is screen-local chrome).
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OnSideOverview } from '../../screens/OnSideOverview';
import { OnSideFeed } from '../../screens/OnSideFeed';
import { OnSideDocuments } from '../../screens/OnSideDocuments';
import { OnSideOwnership } from '../../screens/OnSideOwnership';
import { StudioAsk } from '../../screens/StudioAsk';
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

describe('Studio module — "Ask Studio" present on all three screens (AC-A16-11)', () => {
  it('Ask', () => {
    render(<StudioAsk onNavigate={() => {}} />);
    expect(screen.getByRole('button', { name: 'Ask Studio' })).toBeInTheDocument();
  });
  it('Investment Design', () => {
    render(<InvestmentDesign />);
    expect(screen.getByRole('button', { name: 'Ask Studio' })).toBeInTheDocument();
  });
  it('Roadmap', () => {
    render(<Roadmap onNavigate={() => {}} />);
    expect(screen.getByRole('button', { name: 'Ask Studio' })).toBeInTheDocument();
  });
});
