/**
 * Component-library fix-wave regressions (P1b COMPONENTS batch, plus the
 * gate dispatch's C-unbounded-growth-04 App.tsx fix):
 * A-overlap-01, A-overlap-03/C-unbounded-growth-03, A-overlap-04,
 * A-overlap-05, B-dead-interactions-11, B-dead-interactions-12,
 * B-dead-interactions-13, C-unbounded-growth-02, C-unbounded-growth-04,
 * C-unbounded-growth-05.
 *
 * Every pinned expectation is anchored to leapfi-platform.html @ 1c230fe:
 *  - 663   `.deck-stage{...overflow:hidden}` — deck slide containment (A-01).
 *  - 1524 / 1682-1683  deck-dots markup + `dots[j].onclick = deckShow(j)` —
 *          per-slide jump dots (B-13).
 *  - 35    `.nav{flex:1;...;overflow-y:auto}` — sidebar's own scroll chain
 *          (A-03 / C-03).
 *  - 110   `#toast{position:fixed;left:50%;bottom:26px;...pointer-events:
 *          none;...z-index:120}` — bottom-center self-positioning (A-04).
 *  - 3966  `setTimeout(...,4200)` — toast auto-hide default (A-04).
 *  - 3962-3966  `toast(msg)` — a single slot: every call replaces the text
 *          and re-arms the timer, so two toasts can never coexist (C-04).
 *  - 66    `.crumb{...white-space:nowrap;overflow:hidden;text-overflow:
 *          ellipsis}` — bounded topbar breadcrumb (A-05).
 *  - 803   `<span class="os-sub os-modlink" onclick="go('connect')">` —
 *          Connect group header navigates (B-11).
 *  - 852   pm-reset "Reset demo" row in the avatar menu (B-12).
 *  - 4343 / 4348  chat-log scroll-to-latest on every appended line (C-02).
 *  - 1431 / 1680 / 2376  `dr.scrollTop=0` on every showDrawer (C-05).
 *
 * Per the fix dispatch's test doctrine: interaction/containment contracts
 * jsdom can express (handlers, DOM structure, inline-style contracts) are
 * pinned here; real layout geometry (what actually overlaps at a given
 * viewport) is not fakeable in jsdom and is deliberately not asserted.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { ChatHero } from '../../components/ChatHero'
import type { ChatMessage } from '../../components/ChatHero'
import { DeckView } from '../../components/DeckView'
import type { DeckViewSlide } from '../../components/DeckView'
import { Drawer } from '../../components/Drawer'
import { Toast } from '../../components/Toast'
import { Topbar } from '../../components/Topbar'
import type { TopbarProps } from '../../components/Topbar'
import { DEFAULT_SLIDERS, getDemoSliders, setDemoSliders } from '../../state/demoStore'

const SLIDES: DeckViewSlide[] = [
  { id: 's1', kind: 'generic', heading: 'Alpha' },
  { id: 's2', kind: 'generic', heading: 'Beta' },
  { id: 's3', kind: 'generic', heading: 'Gamma' },
]

/** The shell Topbar (C4). Not `getByRole('banner')` on splash screens:
 * SoonSplash's own `<header>` is ALSO computed as a banner by
 * testing-library's role engine (same workaround as connect-soon.test.tsx). */
function shellTopbar(): HTMLElement {
  const el = document.querySelector('[data-lf-composite="topbar"]')
  if (!(el instanceof HTMLElement)) throw new Error('Topbar not rendered')
  return el
}

function topbarProps(overrides: Partial<TopbarProps> = {}): TopbarProps {
  return {
    breadcrumb: 'OnSide · Regulatory feed',
    onOpenBoardDeck: () => {},
    date: 'Friday, August 15, 2026',
    profile: { name: 'Rachel Fischer', initials: 'RF' },
    profileMenuItems: [],
    ...overrides,
  }
}

describe('A-overlap-01 — DeckView slide box carries the base .deck-stage overflow discipline (663)', () => {
  it('the slide box clips horizontally and scrolls vertically instead of painting under the pagination row', () => {
    render(<DeckView slides={SLIDES} />)
    const slideBox = document.querySelector('[data-lf-composite="deck-view-slide"]') as HTMLElement
    expect(slideBox).not.toBeNull()
    // Base `.deck-stage{overflow:hidden}` + the dispatch's internal-scroll
    // contract: sideways clip, inward vertical scroll.
    expect(slideBox).toHaveStyle({ overflowX: 'hidden', overflowY: 'auto' })
  })
})

describe('B-dead-interactions-13 — per-slide deck dots (base 1524, 1682-1683)', () => {
  it('renders one dot per slide with aria-current on the active one, and a dot click jumps straight to that slide', async () => {
    const user = userEvent.setup()
    const onIndexChange = vi.fn()
    render(<DeckView slides={SLIDES} onIndexChange={onIndexChange} />)

    const dots = within(document.querySelector('[data-lf-composite="deck-view-dots"]') as HTMLElement).getAllByRole('button')
    expect(dots).toHaveLength(3)
    expect(dots[0]).toHaveAttribute('aria-current', 'true')
    expect(dots[2]).not.toHaveAttribute('aria-current')

    // Base deckShow(j): a dot is a direct jump, not a step.
    await user.click(screen.getByRole('button', { name: 'Go to slide 3: Gamma' }))
    expect(onIndexChange).toHaveBeenCalledWith(2)
    expect(screen.getByRole('heading', { name: 'Gamma' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to slide 3: Gamma' })).toHaveAttribute('aria-current', 'true')
    // At the last slide the Next step control disables (bounds unchanged).
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Go to slide 1: Alpha' }))
    expect(screen.getByRole('heading', { name: 'Alpha' })).toBeInTheDocument()
    // The count span the base kept alongside the dots (source 1524).
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })
})

describe('A-overlap-03 / C-unbounded-growth-03 — sidebar nav is its own scroll container (base .nav, 35)', () => {
  it('the sidebar item list carries flex:1/minHeight:0/overflowY:auto so an expanded tree scrolls inside the sidebar, never the page', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const list = nav.querySelector('ul') as HTMLElement
    expect(list).not.toBeNull()
    // (jsdom computes an inline `min-height: 0` as '0', not '0px'.)
    expect(list).toHaveStyle({ overflowY: 'auto', minHeight: '0', flex: '1 1 auto' })
  })
})

describe('B-dead-interactions-11 — Connect group header navigates AND expands; chevron toggles only (base 803)', () => {
  it('pressing the Connect label navigates to the Connect splash and marks the header current', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = () => screen.getByRole('navigation', { name: 'Primary' })

    // Connect ships expanded (§3.1) — collapse it first via the chevron so
    // the label press can demonstrate navigate-AND-expand.
    await user.click(within(nav()).getByRole('button', { name: 'Connect sections' }))
    expect(within(nav()).queryByRole('button', { name: 'AllRailz' })).not.toBeInTheDocument()

    await user.click(within(nav()).getByRole('button', { name: 'Connect' }))

    // Navigated: the topbar breadcrumb is the Connect module splash's label,
    // and the splash heading renders (base go('connect'), source 803).
    expect(within(shellTopbar()).getByText('Connect')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'LeapFI · Connect' })).toBeInTheDocument()
    // Expanded: the children are revealed by the same press.
    expect(within(nav()).getByRole('button', { name: 'AllRailz' })).toBeInTheDocument()
    // The routed group header is itself the current item.
    expect(within(nav()).getByRole('button', { name: 'Connect' })).toHaveAttribute('aria-current', 'page')
  })

  it('the chevron control toggles expansion WITHOUT navigating, and carries the disclosure semantics', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = () => screen.getByRole('navigation', { name: 'Primary' })
    const chevron = () => within(nav()).getByRole('button', { name: 'Connect sections' })

    expect(chevron()).toHaveAttribute('aria-expanded', 'true')
    await user.click(chevron())
    expect(chevron()).toHaveAttribute('aria-expanded', 'false')
    expect(within(nav()).queryByRole('button', { name: 'Vantage' })).not.toBeInTheDocument()
    // No navigation happened: still at Home.
    expect(within(screen.getByRole('banner')).getByText('Home')).toBeInTheDocument()

    await user.click(chevron())
    expect(chevron()).toHaveAttribute('aria-expanded', 'true')
    expect(within(nav()).getByRole('button', { name: 'Vantage' })).toBeInTheDocument()
    expect(within(screen.getByRole('banner')).getByText('Home')).toBeInTheDocument()
  })

  it('non-navigable group headers (OnSide) keep the original toggle-on-press contract', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = () => screen.getByRole('navigation', { name: 'Primary' })
    const onSide = () => within(nav()).getByRole('button', { name: 'OnSide' })

    // OnSide ships expanded by default (PI2-D33) — press toggles it closed,
    // then open again, purely a toggle (no navigation either press).
    expect(onSide()).toHaveAttribute('aria-expanded', 'true')
    await user.click(onSide())
    expect(onSide()).toHaveAttribute('aria-expanded', 'false')
    // Press toggled only — still at Home, no OnSide chevron split control.
    expect(within(screen.getByRole('banner')).getByText('Home')).toBeInTheDocument()
    expect(within(nav()).queryByRole('button', { name: 'OnSide sections' })).not.toBeInTheDocument()

    await user.click(onSide())
    expect(onSide()).toHaveAttribute('aria-expanded', 'true')
    expect(within(screen.getByRole('banner')).getByText('Home')).toBeInTheDocument()
  })
})

describe('B-dead-interactions-12 — profile menu "Reset demo" row calls the store resetDemo (base 852)', () => {
  it('the row renders below the persona items and pressing it restores demo state to the seed', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Rehearsal mutation the reset must undo.
    act(() => {
      setDemoSliders({ ...DEFAULT_SLIDERS, budget: 990000, tol: 90 })
    })
    expect(getDemoSliders()).not.toEqual(DEFAULT_SLIDERS)

    await user.click(within(screen.getByRole('banner')).getByRole('button', { name: 'Rachel Fischer' }))
    const menu = screen.getByRole('menu', { name: 'Rachel Fischer account menu' })
    const menuItems = within(menu).getAllByRole('menuitem')
    // Base pm-reset sat below the persona rows (source 852).
    expect(menuItems[menuItems.length - 1]).toHaveTextContent('Reset demo')

    await user.click(within(menu).getByRole('menuitem', { name: 'Reset demo' }))
    expect(getDemoSliders()).toEqual(DEFAULT_SLIDERS)
    // Menu closes on selection, like every other row.
    expect(screen.queryByRole('menu', { name: 'Rachel Fischer account menu' })).not.toBeInTheDocument()
  })
})

describe('A-overlap-04 — Toast is self-positioning at the base #toast slot (110) with a default auto-dismiss (3966)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders inside a fixed bottom-center pointer-events:none anchor, with hits re-enabled on the pill only', () => {
    render(<Toast variant="success" message="Redline adopted." onDismiss={() => {}} />)
    const pill = screen.getByRole('status')
    const anchor = pill.parentElement as HTMLElement
    expect(anchor.hasAttribute('data-lf-toast-anchor')).toBe(true)
    // Base #toast geometry (source 110): fixed, bottom-center, above chrome,
    // pointer-inert outside the pill's own box.
    expect(anchor).toHaveStyle({
      position: 'fixed',
      left: '50%',
      bottom: '26px',
      pointerEvents: 'none',
      zIndex: '120',
    })
    expect(pill).toHaveStyle({ pointerEvents: 'auto' })
  })

  it('auto-dismisses after the base 4200ms when the caller omits autoDismissMs — no toast persists forever by omission', () => {
    const onDismiss = vi.fn()
    render(<Toast variant="info" message="Digest set to weekly." onDismiss={onDismiss} />)

    act(() => {
      vi.advanceTimersByTime(4199)
    })
    expect(onDismiss).not.toHaveBeenCalled()

    // 4200ms timer + 180ms exit transition → onDismiss.
    act(() => {
      vi.advanceTimersByTime(1 + 180)
    })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('autoDismissMs={null} is the explicit sticky escape hatch — only the close control dismisses', () => {
    const onDismiss = vi.fn()
    render(<Toast variant="success" message="Sticky until closed." onDismiss={onDismiss} autoDismissMs={null} />)

    act(() => {
      vi.advanceTimersByTime(60000)
    })
    expect(onDismiss).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }))
    act(() => {
      vi.advanceTimersByTime(180)
    })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})

describe('C-unbounded-growth-04 — App has ONE toast slot, matching the base singleton toast() (3962-3966)', () => {
  // Scoped to `[data-lf-composite="toast"]`, not `getByRole('status')`:
  // `PresenterRail`'s own always-mounted SR-only announcer is ALSO
  // `role="status"` (PresenterRail.tsx:440), so a bare role query is
  // ambiguous the moment the rail exists in the tree (every render).
  function toastPills(): HTMLElement[] {
    return Array.from(document.querySelectorAll('[data-lf-composite="toast"]'))
  }

  it('pressing Restart while the design-partner toast is still visible replaces it — the two can never coexist', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Reach the board-deck CTA slide and fire the design-partner ask.
    await user.click(within(screen.getByRole('banner')).getByRole('button', { name: 'Open board deck' }))
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    await user.click(screen.getByRole('button', { name: 'Become a design partner' }))

    expect(toastPills()).toHaveLength(1)
    expect(toastPills()[0]).toHaveTextContent('Design partner interest noted for this session.')

    // Restart (rail chord + button) while that toast is still up. The
    // former two-boolean state (`designPartnerToast`/`restartToast`) left
    // the design-partner toast mounted forever (Restart never cleared it)
    // while ALSO mounting the restart toast — two opaque pills at the
    // identical fixed anchor (base anchor: source 110).
    fireEvent.keyDown(window, { key: 'P', code: 'KeyP', ctrlKey: true, altKey: true, shiftKey: true })
    const rail = screen.getByRole('region', { name: 'Presenter rail' })
    await user.click(within(rail).getByRole('button', { name: 'Restart' }))

    // Still exactly one toast — the restart message replaced the
    // design-partner one, matching base toast()'s single-slot replace.
    const toasts = toastPills()
    expect(toasts).toHaveLength(1)
    expect(toasts[0]).toHaveTextContent('Demo reset. Every gap, redline, lever, filter, and conversation is back to the opening state.')
    expect(screen.queryByText('Design partner interest noted for this session.')).not.toBeInTheDocument()
  })
})

describe('A-overlap-05 — Topbar breadcrumb is bounded like the base .crumb (66)', () => {
  it('the breadcrumb span ellipsizes (nowrap + hidden overflow + minWidth:0) so the right-hand cluster can never be pushed off-screen by a long crumb', () => {
    render(<Topbar {...topbarProps({ breadcrumb: 'OnSide · Regulatory feed · An extremely long breadcrumb label' })} />)
    const crumb = within(screen.getByRole('banner')).getByText('OnSide · Regulatory feed · An extremely long breadcrumb label')
    // (jsdom computes an inline `min-width: 0` as '0', not '0px'.)
    expect(crumb).toHaveStyle({
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minWidth: '0',
    })
    // And the bar itself may shrink below its nowrap min-content floor.
    expect(screen.getByRole('banner')).toHaveStyle({ minWidth: '0' })
  })
})

describe('C-unbounded-growth-02 — ChatHero scrolls the newest message into view (base 4343/4348)', () => {
  const baseMessages: ChatMessage[] = [
    { id: 'm1', role: 'user', text: 'What does our policy say about auto lending?' },
    { id: 'm2', role: 'assistant', text: 'Here is the policy answer.' },
  ]

  function heroProps(messages: ChatMessage[], state: 'idle' | 'submitting' | 'answer-complete') {
    return {
      counters: [],
      messages,
      suggestions: [],
      inputValue: '',
      onInputChange: () => {},
      onAsk: () => {},
      state,
    }
  }

  it('calls scrollIntoView on the latest list item when a message is appended and when the busy bubble appears', () => {
    const spy = vi.spyOn(Element.prototype, 'scrollIntoView')
    const { rerender } = render(<ChatHero {...heroProps(baseMessages, 'idle')} />)
    spy.mockClear()

    const appended: ChatMessage[] = [...baseMessages, { id: 'm3', role: 'user', text: 'And what about indirect auto?' }]
    rerender(<ChatHero {...heroProps(appended, 'submitting')} />)
    expect(spy).toHaveBeenCalled()
    // The scrolled element is the newest bubble in the bounded list — with
    // state 'submitting' that is the busy "Thinking…" bubble appended after
    // the new user line (base botSay's typing placeholder, 4348).
    const lastTarget = spy.mock.contexts[spy.mock.contexts.length - 1] as HTMLElement
    expect(lastTarget.textContent).toContain('Thinking…')

    spy.mockClear()
    const answered: ChatMessage[] = [...appended, { id: 'm4', role: 'assistant', text: 'Indirect auto answer.' }]
    rerender(<ChatHero {...heroProps(answered, 'answer-complete')} />)
    expect(spy).toHaveBeenCalled()
    const answerTarget = spy.mock.contexts[spy.mock.contexts.length - 1] as HTMLElement
    expect(answerTarget.textContent).toContain('Indirect auto answer.')
    spy.mockRestore()
  })
})

describe('C-unbounded-growth-05 — Drawer resets its scroll body on content swap (base 1431/1680/2376)', () => {
  it('an in-place title+children swap zeroes [data-lf-drawer-body].scrollTop, so swapped-in content opens at the top', () => {
    const { rerender } = render(
      <Drawer open title="Regulatory change report" onClose={() => {}}>
        <p>tall report body</p>
      </Drawer>,
    )
    const body = document.querySelector('[data-lf-drawer-body]') as HTMLElement
    expect(body).not.toBeNull()

    // jsdom has no layout, so model a deep scroll with a writable instance
    // property — the fix's `scrollTop = 0` write is then observable.
    Object.defineProperty(body, 'scrollTop', { value: 240, writable: true, configurable: true })
    expect(body.scrollTop).toBe(240)

    rerender(
      <Drawer open title="Log a board update" onClose={() => {}}>
        <p>form body</p>
      </Drawer>,
    )
    expect(body.scrollTop).toBe(0)
  })
})
