/**
 * Shell regression — Sidebar (C3): top-level items + nested expand/collapse.
 *
 * D17: every test pins ported v1 base behavior, cited to base-page line
 * anchors (leapfi-platform.html @1c230fe via survey_map.md):
 *  - L762–821  sidebar: Home, Reporting; OnSide (nested), Studio (Ask /
 *              Investment Design / Roadmaps), Connect/AllRailz/Vantage,
 *              Settings; footer "v 1.071".
 *  - parity_ia_addendum.md §0: OnSide carries 4 nested children with
 *    Overview FIRST, matching the base engine's own `os-sub` ordering
 *    (survey_map.md 762–821).
 *  - survey_map.md §(b) Nav model: no routing/history — nav is a plain
 *    state switch; sidebar nesting toggles are the base's own L2 gesture.
 *
 * D18: no test here touches Home's "Start the demo" affordance.
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'

describe('sidebar structure (base L762–821)', () => {
  it('renders the six top-level items and the "v 1.071" footer (base L762–821)', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    for (const label of ['Home', 'OnSide', 'Studio', 'Connect', 'Reporting', 'Settings']) {
      expect(within(nav).getByRole('button', { name: label })).toBeInTheDocument()
    }
    // Footer version string, verbatim from the base sidebar footer (L762–821).
    expect(within(nav).getByText('v 1.071')).toBeInTheDocument()
  })

  it('boots with Home as the current item (base boot lands on #mod-home, L858–881 / §(b))', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(nav).getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  })
})

describe('OnSide nested expand/collapse (base L762–821 os-sub; addendum §0 ordering)', () => {
  it('OnSide starts collapsed, expands on press with aria-expanded, and lists 4 children with Overview first (base L762–821, addendum §0)', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const onSide = within(nav).getByRole('button', { name: 'OnSide' })

    expect(onSide).toHaveAttribute('aria-expanded', 'false')
    expect(within(nav).queryByRole('button', { name: 'Overview' })).not.toBeInTheDocument()

    await user.click(onSide)
    expect(onSide).toHaveAttribute('aria-expanded', 'true')

    const nested = within(nav).getByRole('list', { name: 'OnSide sections' })
    const childLabels = within(nested)
      .getAllByRole('button')
      .map((b) => b.textContent?.trim())
    // Base `os-sub` ordering, overview first (survey_map.md 762–821 / addendum §0).
    expect(childLabels).toEqual(['Overview', 'Regulatory feed', 'Documents', 'Ownership'])
  })

  it('pressing OnSide again collapses the group and removes the nested items from the DOM (base sidebar nesting toggle, §(b) L2 gesture)', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const onSide = within(nav).getByRole('button', { name: 'OnSide' })

    await user.click(onSide)
    expect(within(nav).getByRole('button', { name: 'Regulatory feed' })).toBeInTheDocument()

    await user.click(onSide)
    expect(onSide).toHaveAttribute('aria-expanded', 'false')
    expect(within(nav).queryByRole('button', { name: 'Regulatory feed' })).not.toBeInTheDocument()
  })

  it('a nested child navigates to its screen and becomes the current item (base onsideShow nav, §(b); breadcrumb per topbar L823–854)', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })

    await user.click(within(nav).getByRole('button', { name: 'OnSide' }))
    await user.click(within(nav).getByRole('button', { name: 'Regulatory feed' }))

    // New screen's topbar breadcrumb reflects the destination.
    const banner = screen.getByRole('banner')
    expect(within(banner).getByText('OnSide · Regulatory feed')).toBeInTheDocument()

    // The active nested item carries aria-current="page" — and its group
    // stays expanded while it is active (the audience can always see
    // "where am I", the base's own on-screen anchor rule).
    const newNav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(newNav).getByRole('button', { name: 'Regulatory feed' })).toHaveAttribute('aria-current', 'page')
  })
})
