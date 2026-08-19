/**
 * rev-68 DEFECT 1 regression — "document scrolls past the app shell into
 * void."
 *
 * ROOT CAUSE (verified live): every visually-hidden ("sr-only") element in
 * this app used the standard 1px-clipped-box recipe (`position: absolute`,
 * `width/height: 1`, `overflow: hidden`, `clip: rect(0,0,0,0)`) but never
 * pinned `top`/`left`. An absolutely-positioned box with no `top`/`left`
 * falls back to its in-flow "static position" — wherever it would have
 * rendered as a normal-flow box. With no positioned ancestor between the
 * box and the document root, that static position is measured against the
 * *initial containing block* (the root), so a 1px box sitting deep inside
 * a scrolled `<main>` could still extend `html.scrollHeight` well past the
 * visible app shell, even though nothing about the box is visible.
 *
 * FIX (two-part, both provable statically as a style contract — no jsdom
 * layout engine involved, so these are style-contract pins, not layout
 * assertions):
 *  1. Every copy of the sr-only recipe (DataTable.tsx `srOnlyStyle` and its
 *     14 sibling copies + 6 one-off inline literals — 17 instances across
 *     15 files, enumerated in this dispatch's evidence return) now pins
 *     `top: 0, left: 0`. A 1px box pinned at its containing block's origin
 *     can never itself extend page scroll.
 *  2. Every screen's scrolling `<main>` (`MAIN_STYLE`, 13 screens) now also
 *     carries `position: 'relative'`, making it the containing block for
 *     any absolute descendant — today's sr-only spans and any future
 *     third-party absolute-positioned content alike — so an unpinned
 *     absolute box would resolve inside the scroll region instead of
 *     against the document root even if a future edit dropped `top`/`left`
 *     again.
 *
 * This file pins both halves: (A) a generic "every sr-only-shaped element
 * anywhere in a render is pinned at (0,0)" check exercised against every
 * component/view that owns its own copy of the recipe, standalone where
 * that is cheap and through the owning screen where the recipe is inline
 * JSX with no standalone component to mount; (B) a table-driven check that
 * every screen's `<main>` computes `position: relative`.
 */
import { describe, expect, it } from 'vitest'
import { act, render } from '@testing-library/react'
import { createRef } from 'react'
import type { ReactElement } from 'react'

// Screens (all 13 MAIN_STYLE owners; also where the recipe's inline,
// non-const literals live — OnSideOverview x2, InvestmentDesign x2).
import { OnSideOverview } from '../../screens/OnSideOverview'
import { Reporting } from '../../screens/Reporting'
import { Roadmap } from '../../screens/Roadmap'
import { Home } from '../../screens/Home'
import { OnSideDocuments } from '../../screens/OnSideDocuments'
import { SettingsToggles } from '../../screens/SettingsToggles'
import { ConnectSoon } from '../../screens/ConnectSoon'
import { OnSideOwnership } from '../../screens/OnSideOwnership'
import { StudioAsk } from '../../screens/StudioAsk'
import { Cases } from '../../screens/Cases'
import { OnSideFeed } from '../../screens/OnSideFeed'
import { SettingsAbout } from '../../screens/SettingsAbout'
import { InvestmentDesign } from '../../screens/InvestmentDesign'
import { makeTopbarProps } from '../onside/helpers'

// Standalone leaf components/views that own their own copy of the recipe.
import { DataTable } from '../../components/DataTable'
import type { DataTableColumn } from '../../components/DataTable'
import { PlanTable } from '../../components/PlanTable'
import { FilterBar } from '../../components/FilterBar'
import { DeckView } from '../../components/DeckView'
import type { DeckViewSlide } from '../../components/DeckView'
import { PresenterRail } from '../../components/PresenterRail'
import type { PresenterRailHandle } from '../../components/PresenterRail'
import { SliderControlRow } from '../../components/SliderControlRow'
import { Slider } from '../../components/primitives/Slider'
import { Input } from '../../components/primitives/Input'
import { NotificationBellPanel } from '../../views/NotificationBellPanel'
import { HomeCustomizeBar, DEFAULT_VISIBLE_KEYS } from '../../views/HomeCustomizeBar'
import { DEFAULT_SLIDERS } from '../../state/demoStore'
import { SCRIPTS, DEFAULT_SCRIPT_KEY } from '../../data/script'
import type { Notif } from '../../data/cases'

/** Matches this app's visually-hidden ("sr-only") recipe by shape — any
 * element with the 1px-clipped-box signature, regardless of which file's
 * copy of the recipe produced it or what its `clip` value's exact syntax
 * is. Deliberately does NOT check `clip` — different copies spell it
 * `rect(0,0,0,0)` vs `rect(0, 0, 0, 0)` vs (DeckView) the legacy
 * space-separated 4-value form; the shape (absolute + 1x1 + clipped) is
 * what identifies the pattern, matching how DEFECT 1's mechanism actually
 * works (position, not the exact clip spelling, is what let boxes escape). */
function findSrOnlyShapedElements(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('*')).filter((el) => {
    const s = el.style
    return s.position === 'absolute' && s.width === '1px' && s.height === '1px' && s.overflow === 'hidden'
  })
}

/** The regression check itself: every sr-only-shaped element found must
 * pin `top: 0; left: 0` (DEFECT 1's fix). `minCount` guards against a
 * vacuous pass — a render that stopped containing any sr-only element at
 * all would otherwise satisfy an unconditional "all pinned" loop over zero
 * elements without proving anything. */
function expectEverySrOnlyElementPinnedAtOrigin(root: ParentNode, minCount: number): void {
  const found = findSrOnlyShapedElements(root)
  expect(found.length).toBeGreaterThanOrEqual(minCount)
  for (const el of found) {
    expect(el.style.top).toBe('0px')
    expect(el.style.left).toBe('0px')
  }
}

describe('DEFECT 1 fix, part 1 — every sr-only-shaped element pins top/left to 0', () => {
  it('DataTable (C6) — the shared srOnlyStyle const used by <caption> and both "Actions" header spans', () => {
    const columns: readonly DataTableColumn<{ id: string; name: string }>[] = [
      { id: 'name', header: 'Name', render: (row) => row.name },
    ]
    const { container } = render(
      <DataTable caption="Rows" columns={columns} rows={[{ id: 'r1', name: 'Alpha' }]} getRowId={(r) => r.id} />,
    )
    // Exactly one sr-only element here (the caption) — no rowAction/onRowClick means neither "Actions" header span mounts.
    expectEverySrOnlyElementPinnedAtOrigin(container, 1)
  })

  it('PlanTable (C13) — the inline "Actions" header span (its own one-off object literal, not a shared const)', () => {
    const { container } = render(<PlanTable rows={[]} />)
    expectEverySrOnlyElementPinnedAtOrigin(container, 1)
  })

  it('FilterBar — the shared srOnlyStyle const on its live-region announcement span', () => {
    const { container } = render(<FilterBar groups={[]} />)
    expectEverySrOnlyElementPinnedAtOrigin(container, 1)
  })

  it('DeckView (C-carousel) — the inline live-region div (its own one-off object literal, legacy space-separated clip() syntax)', () => {
    const slides: DeckViewSlide[] = [{ id: 's1', kind: 'generic', heading: 'Alpha' }]
    const { container } = render(<DeckView slides={slides} />)
    expectEverySrOnlyElementPinnedAtOrigin(container, 1)
  })

  it('PresenterRail (C21) — the shared SR_ONLY_STYLE const on its step-announcement span', () => {
    const ref = createRef<PresenterRailHandle>()
    const { container } = render(
      <PresenterRail ref={ref} script={SCRIPTS[DEFAULT_SCRIPT_KEY]} onNavigate={() => {}} onRestart={() => {}} />,
    )
    // Hidden until start() — see the component's own "Hidden -> Visible[step=1]" contract.
    act(() => {
      ref.current?.start()
    })
    expectEverySrOnlyElementPinnedAtOrigin(container, 1)
  })

  it('primitives/Slider (P) — the shared srOnly const on its commit-announcement status span', () => {
    const { container } = render(<Slider min={0} max={10} value={5} label="Test lever" onChange={() => {}} />)
    expectEverySrOnlyElementPinnedAtOrigin(container, 1)
  })

  it('primitives/Input (P6) — the shared srOnly const, applied to the <label> when hideLabel is set', () => {
    const { container } = render(<Input label="Ask a question" hideLabel value="" onChange={() => {}} />)
    expectEverySrOnlyElementPinnedAtOrigin(container, 1)
  })

  it('NotificationBellPanel — the shared srOnlyStyle const on its panel-state announcement span', () => {
    const notifs: Notif[] = [{ to: 'cro', title: 'Test notification', cid: 'CASE-1', kind: 'app', when: 'now', read: false }]
    const { container } = render(
      <NotificationBellPanel notifs={notifs} currentRoleKey="cro" currentRoleLabel="Chief Risk Officer" onOpenCase={() => {}} />,
    )
    expectEverySrOnlyElementPinnedAtOrigin(container, 1)
  })

  it('HomeCustomizeBar — the shared srOnlyStyle const on its disclosure-state announcement span', () => {
    const { container } = render(
      <HomeCustomizeBar roleKey="cro" roleFirstName="Rachel" visibleKeys={DEFAULT_VISIBLE_KEYS} onChange={() => {}} />,
    )
    expectEverySrOnlyElementPinnedAtOrigin(container, 1)
  })

  it('SliderControlRow — its own row-level announcement span, PLUS one per nested primitives/Slider lever (composition case)', () => {
    const { container } = render(<SliderControlRow sliders={DEFAULT_SLIDERS} onSlidersChange={() => {}} />)
    // At least the row-level span; SliderControlRow also composes several
    // <Slider> levers, each contributing its own sr-only status span.
    expectEverySrOnlyElementPinnedAtOrigin(container, 1)
  })
})

describe('DEFECT 1 fix, part 1 (continued) — screens carrying the recipe as one-off inline JSX (no standalone component to mount)', () => {
  it("OnSideOverview — the KPI-strip and Cases-section sr-only <h2> headings (each its own one-off object literal)", () => {
    const { container } = render(<OnSideOverview topbar={makeTopbarProps()} onNavigate={() => {}} />)
    // The two hand-written <h2> literals, at minimum (DomainsAccordion's
    // rows are collapsed by default so contribute no DataTable of their own).
    expectEverySrOnlyElementPinnedAtOrigin(container, 2)
  })

  it('InvestmentDesign — the FeatureTable/BenchTable "Action" column spans (each its own one-off object literal), plus its composed PlanTable/SliderControlRow', () => {
    const { container } = render(<InvestmentDesign topbar={makeTopbarProps()} onNavigate={() => {}} />)
    expectEverySrOnlyElementPinnedAtOrigin(container, 2)
  })
})

describe('DEFECT 1 fix, part 2 — every screen\'s scrolling <main> is a positioned containing block', () => {
  const SCREEN_CASES: ReadonlyArray<[name: string, element: () => ReactElement]> = [
    ['OnSideOverview', () => <OnSideOverview topbar={makeTopbarProps()} onNavigate={() => {}} />],
    ['Reporting', () => <Reporting topbar={makeTopbarProps()} onNavigate={() => {}} />],
    ['Roadmap', () => <Roadmap topbar={makeTopbarProps()} onNavigate={() => {}} />],
    ['Home', () => <Home topbar={makeTopbarProps()} onNavigate={() => {}} />],
    ['OnSideDocuments', () => <OnSideDocuments topbar={makeTopbarProps()} onNavigate={() => {}} />],
    ['SettingsToggles', () => <SettingsToggles topbar={makeTopbarProps()} onNavigate={() => {}} />],
    ['ConnectSoon', () => <ConnectSoon topbar={makeTopbarProps()} onNavigate={() => {}} moduleKey="connect" />],
    ['OnSideOwnership', () => <OnSideOwnership topbar={makeTopbarProps()} onNavigate={() => {}} />],
    ['StudioAsk', () => <StudioAsk topbar={makeTopbarProps()} onNavigate={() => {}} />],
    ['Cases', () => <Cases topbar={makeTopbarProps()} onNavigate={() => {}} />],
    ['OnSideFeed', () => <OnSideFeed topbar={makeTopbarProps()} onNavigate={() => {}} />],
    ['SettingsAbout', () => <SettingsAbout topbar={makeTopbarProps()} onNavigate={() => {}} />],
    ['InvestmentDesign', () => <InvestmentDesign topbar={makeTopbarProps()} onNavigate={() => {}} />],
  ]

  for (const [name, element] of SCREEN_CASES) {
    it(`${name}'s <main> carries position: relative`, () => {
      const { container } = render(element())
      const main = container.querySelector('main')
      expect(main, `${name} did not render a <main>`).not.toBeNull()
      expect((main as HTMLElement).style.position).toBe('relative')
    })
  }
})
