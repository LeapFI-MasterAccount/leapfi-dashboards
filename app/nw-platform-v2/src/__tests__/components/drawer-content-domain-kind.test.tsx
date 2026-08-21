/**
 * DrawerContent (C8) — `kind: 'domain'` addition (amendment A20, PI2-D47,
 * design_system_spec.md §2.9.9). "Same non-structural, additive, 'purely a
 * semantic/data-attribute hint' widening `DrawerContent.tsx`'s own header
 * already establishes for `kind` in general... an R-2 extension, never a
 * new composite." This is the composite-level unit proof, independent of
 * the integration coverage at StudioAsk's response canvas
 * (`studio-ask-a20-agent-canvas.test.tsx` AC-A20-5).
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DrawerContent } from '../../components/DrawerContent';

describe('DrawerContent kind="domain"', () => {
  it('renders data-kind="domain" and its fields/tags/actions exactly like every other kind (no structural branch)', () => {
    const { container } = render(
      <DrawerContent
        kind="domain"
        fields={[
          { label: 'Regulatory bodies', value: 'OCC · FRB · FDIC' },
          { label: 'Owner', value: 'A. Kaur · Model Risk Manager' },
        ]}
        tags={[{ text: 'Below target', variant: 'status-caution' }]}
        actions={[{ label: 'See in OnSide', variant: 'secondary', onPress: () => {} }]}
      />,
    );
    const root = container.querySelector('[data-lf-composite="drawer-content"]');
    expect(root).toHaveAttribute('data-kind', 'domain');
    expect(screen.getByText('OCC · FRB · FDIC')).toBeInTheDocument();
    expect(screen.getByText('A. Kaur · Model Risk Manager')).toBeInTheDocument();
    expect(screen.getByText('Below target')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'See in OnSide' })).toBeInTheDocument();
  });
});
