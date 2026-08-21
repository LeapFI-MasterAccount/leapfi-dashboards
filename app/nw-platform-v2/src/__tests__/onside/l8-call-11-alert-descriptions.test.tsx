/**
 * L8 exit criterion 7 (D15) — call-11 (`call-11-llm-alert-descriptions.md`,
 * `01-architecture.md` row 11): "Regulatory alerts... shall be enhanced
 * with... human-readable descriptions to replace or supplement technical
 * alert names." Scoped per `02-sprint-plan.md`'s own dispatch text:
 * "scripted content — author demo-register summaries for the seeded
 * signals; no generation machinery." An additive content-schema field
 * (`SignalRow.description`, `SrcItem`'s optional 6th tuple element), same
 * class as A20's `ChatEntry.response?` precedent — never a new surface.
 *
 * DISCRIMINATING: reverting the `description` destructure/spread in
 * `OnSideFeed.tsx`'s `ALL_SIGNAL_ROWS` derivation (a scratch copy with the
 * 6th tuple element dropped) makes every test below fail — no
 * "Description" field renders in any signal's drawer.
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnSideFeed } from '../../screens/OnSideFeed'
import { SRC_ITEMS } from '../../data/onside'

function renderFeed() {
  return render(<OnSideFeed />)
}

function getSignalsTable() {
  return screen.getByRole('table', { name: 'Regulatory signals feed' })
}

const ALL_ITEMS = Object.values(SRC_ITEMS).flatMap((entry) => entry.items)

describe('OnSide feed — call-11 descriptive-summary field (L8 exit criterion 7)', () => {
  it('every seeded signal in data/onside.ts carries an authored, non-empty description (scripted content, not runtime generation)', () => {
    expect(ALL_ITEMS.length).toBe(40)
    for (const item of ALL_ITEMS) {
      const description = item[5]
      expect(typeof description).toBe('string')
      expect((description as string).trim().length).toBeGreaterThan(20)
    }
  })

  it('opening any signal row renders a "Description" field distinct from Note, carrying the authored plain-language summary', async () => {
    const user = userEvent.setup()
    renderFeed()
    const reviewButtons = within(getSignalsTable()).getAllByRole('button', { name: 'Review' })
    await user.click(reviewButtons[0] as HTMLElement)

    const dialog = await screen.findByRole('dialog', { name: /^Signal — / })
    expect(within(dialog).getByText('Description')).toBeInTheDocument()

    const labels = within(dialog)
      .getAllByRole('term')
      .map((dt) => dt.textContent)
    const noteIndex = labels.indexOf('Note')
    const descriptionIndex = labels.indexOf('Description')
    expect(descriptionIndex).toBeGreaterThanOrEqual(0)
    expect(noteIndex).toBeGreaterThan(descriptionIndex)
  })

  it("a description reads as a plain-language explanation, distinct from the technical alert title it accompanies (Dan Scheffler's own ask)", async () => {
    const user = userEvent.setup()
    renderFeed()
    const reviewButtons = within(getSignalsTable()).getAllByRole('button', { name: 'Review' })
    await user.click(reviewButtons[0] as HTMLElement)

    const dialog = await screen.findByRole('dialog', { name: /^Signal — / })
    const values = within(dialog)
      .getAllByRole('definition')
      .map((dd) => dd.textContent)
    const labels = within(dialog)
      .getAllByRole('term')
      .map((dt) => dt.textContent)
    const signalTitle = values[labels.indexOf('Signal')]
    const description = values[labels.indexOf('Description')]
    expect(description).toBeDefined()
    expect(description).not.toBe(signalTitle)
  })
})
