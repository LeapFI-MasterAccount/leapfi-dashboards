/**
 * Shell regression — navigation-with-payload / deep links (P1a
 * NAV-PAYLOAD dispatch). Pins App.tsx's exported DeepLink contract (file
 * header "NAVIGATION-WITH-PAYLOAD / DEEP LINKS"), the mechanism the
 * base's cross-screen verbs need ported.
 *
 * Base anchors (leapfi-dashboards/src/leapfi-platform.html @ pin 1c230fe):
 *  - Home panel headers navigate WITH a payload — goOnside('domains'/
 *    'feed-lifecycle'/'gaps'), goStudio('design'), openReport('roi')
 *    (source 868–878).
 *  - Report heads cross-navigate: closeDrawer();goOnside('overview')
 *    (source 1481–1482); report register rows openObl(domKey, id)
 *    (source 1590–1612); Home's top-play rows openPlay(n) (source 4249).
 *
 * Probe technique: `Home` and `OnSideDocuments` are vi.mock'd with tiny
 * probes that surface the three spread props (`deepLink`, `onDeepLink`,
 * `onDeepLinkConsumed`) as DOM — real layout is out of jsdom's reach, but
 * the handler/prop contract is exactly what these tests pin (D17:
 * observe, never adapt the app). `OnSideOverview` stays REAL: the
 * 'domain' kind bridges onto its shipped `deepLinkDomainKey` prop, so
 * that path is asserted end to end (accordion row expands + focuses —
 * the base onsideShow domKey branch, source 3021–3054).
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import type { DeepLinkScreenProps } from '../../App'

type ProbeProps = DeepLinkScreenProps & { onNavigate?: (id: string) => void }

vi.mock('../../screens/Home', () => ({
  Home: (props: ProbeProps) => (
    <div>
      <h1>home-probe</h1>
      <button onClick={() => props.onNavigate?.('onside.documents')}>probe-nav-documents</button>
      <button onClick={() => props.onDeepLink?.({ screen: 'onside.documents', kind: 'doc-redline', id: 'ln-policy' })}>
        probe-deeplink-doc
      </button>
      <button onClick={() => props.onDeepLink?.({ screen: 'onside.overview', kind: 'domain', id: 'mrm' })}>
        probe-deeplink-domain
      </button>
    </div>
  ),
}))

vi.mock('../../screens/OnSideDocuments', () => ({
  OnSideDocuments: (props: ProbeProps) => (
    <div>
      <h1>documents-probe</h1>
      <output data-testid="deep-link-view">
        {props.deepLink ? `${props.deepLink.kind}:${props.deepLink.id}:${props.deepLink.nonce}` : 'none'}
      </output>
      <button onClick={() => props.onDeepLink?.({ screen: 'onside.documents', kind: 'doc-redline', id: 'ln-policy' })}>
        probe-refire-same-target
      </button>
      <button onClick={() => props.deepLink && props.onDeepLinkConsumed?.(props.deepLink.nonce)}>probe-consume</button>
      <button onClick={() => props.onDeepLinkConsumed?.(1)}>probe-consume-nonce-1</button>
      <button onClick={() => props.onNavigate?.('home')}>probe-nav-home</button>
    </div>
  ),
}))

describe('deep-link trigger (onDeepLink → navigate + deliver payload)', () => {
  it('navigates to the target screen and delivers {kind, id} stamped with nonce 1', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('heading', { name: 'home-probe' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'probe-deeplink-doc' }))

    expect(screen.getByRole('heading', { name: 'documents-probe' })).toBeInTheDocument()
    expect(screen.getByTestId('deep-link-view')).toHaveTextContent(/^doc-redline:ln-policy:1$/)
  })

  it('a same-target re-press delivers a FRESH nonce with no remount needed (SH-8 generalized)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'probe-deeplink-doc' })) // nonce 1
    await user.click(screen.getByRole('button', { name: 'probe-refire-same-target' })) // same screen+kind+id

    expect(screen.getByTestId('deep-link-view')).toHaveTextContent(/^doc-redline:ln-policy:2$/)
  })
})

describe('consume + clear (onDeepLinkConsumed)', () => {
  it('consuming the current nonce clears the payload, and a consumed nonce value is never reused', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'probe-deeplink-doc' })) // nonce 1
    await user.click(screen.getByRole('button', { name: 'probe-consume' }))
    expect(screen.getByTestId('deep-link-view')).toHaveTextContent(/^none$/)

    // Re-press after consumption must be nonce 2 — a counter reset to 1
    // would be Object.is-equal to the consumed press for any consumer
    // keying on the nonce (the SH-8 dead-re-press failure mode).
    await user.click(screen.getByRole('button', { name: 'probe-refire-same-target' }))
    expect(screen.getByTestId('deep-link-view')).toHaveTextContent(/^doc-redline:ln-policy:2$/)
  })

  it('a stale consume never clobbers a newer press', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'probe-deeplink-doc' })) // nonce 1
    await user.click(screen.getByRole('button', { name: 'probe-refire-same-target' })) // nonce 2
    await user.click(screen.getByRole('button', { name: 'probe-consume-nonce-1' })) // stale consume of nonce 1

    expect(screen.getByTestId('deep-link-view')).toHaveTextContent(/^doc-redline:ln-policy:2$/)
  })
})

describe('generic navigation clears an unconsumed payload', () => {
  it('after a plain nav away, a plain nav back shows the screen with no payload', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'probe-deeplink-doc' })) // payload pending, unconsumed
    await user.click(screen.getByRole('button', { name: 'probe-nav-home' })) // generic nav — drops it
    expect(screen.getByRole('heading', { name: 'home-probe' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'probe-nav-documents' })) // generic nav back
    expect(screen.getByTestId('deep-link-view')).toHaveTextContent(/^none$/)
  })
})

describe("the 'domain' kind bridge (base goOnside('dom-KEY') → OnSideOverview's deepLinkDomainKey)", () => {
  it('deep-linking domain "mrm" lands on the real overview with the Model Risk accordion row expanded and focused', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'probe-deeplink-domain' }))

    // Real OnSideOverview mounted, MRM row force-expanded by the bridge
    // (base onsideShow's expandedDoms[domKey]=true, source 3021–3054).
    // `expanded: true` scopes the query to the accordion header button —
    // the domain name also appears in other button text on the screen.
    const rowButton = screen.getByRole('button', { name: /Model Risk Management/, expanded: true })
    expect(rowButton).toHaveAttribute('aria-expanded', 'true')

    // The 80ms scroll+focus handoff (base setTimeout(...,80), source 3052).
    await waitFor(() => {
      const row = document.querySelector('[data-lf-composite="domains-accordion-row"][data-state="open"]')
      expect(row).toHaveFocus()
    })
  })
})
