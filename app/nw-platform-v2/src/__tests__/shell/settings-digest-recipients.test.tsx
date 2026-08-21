/**
 * Settings · Toggles — Digest & Alerts "AD recipients" extension
 * (PI-3, L7 / call-12, `DECISIONS.md` D7: extends `RegulatoryFeedSources.tsx`'s
 * relocated Digest & Alerts panel — sprint-plan.md L7 row + D7's full shape).
 *
 * D7 shape: Input (P6, recipient entry) + Chip (P5, `filter`, reusing the
 * panel's own frequency-Chip toggle pattern) + DataTable (C6, one row per
 * digest — cardinality-1, never a multi-digest CRUD list). AD-recipient
 * source: `data/studio.ts`'s `USERS` array (the "Active Directory mock"
 * roster) — reused as the lookup source, never free text.
 *
 * Cardinality cap (D7): single digest configuration only — edit fields
 * (frequency/delivery/recipients), remove-recipient, enable/disable. No
 * "add a second digest" affordance exists anywhere; the management
 * DataTable always renders exactly one row.
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsToggles } from '../../screens/SettingsToggles'
import { USERS } from '../../data/studio'

function renderSettings() {
  return render(<SettingsToggles />)
}

function getRecipientChipGroup() {
  return screen.getByRole('group', { name: 'Digest recipients' })
}

function getRecipientInput() {
  return screen.getByLabelText('Add recipient')
}

describe('Settings · Toggles — digest recipients (D7: AD roster, Chip filter reuse)', () => {
  it('renders one Chip per data/studio.ts USERS entry, none selected (no recipients) initially', () => {
    renderSettings()
    const group = getRecipientChipGroup()
    const chips = within(group).getAllByRole('button')
    expect(chips.map((chip) => chip.textContent)).toEqual(USERS.map((user) => user.name))
    for (const chip of chips) {
      expect(chip).toHaveAttribute('aria-pressed', 'false')
    }
    expect(screen.getByText('0 recipients on this digest')).toBeInTheDocument()
  })

  it('pressing a roster Chip adds that user as a recipient and confirms via toast (edit fields)', async () => {
    const user = userEvent.setup()
    renderSettings()
    const group = getRecipientChipGroup()

    await user.click(within(group).getByRole('button', { name: 'Priya Raman' }))

    expect(within(group).getByRole('button', { name: 'Priya Raman' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('1 recipient on this digest')).toBeInTheDocument()
    expect(screen.getByText('Priya Raman added as a digest recipient.')).toBeInTheDocument()
  })

  it('pressing an already-selected roster Chip removes that recipient (remove-recipient, D7 cap)', async () => {
    const user = userEvent.setup()
    renderSettings()
    const group = getRecipientChipGroup()

    await user.click(within(group).getByRole('button', { name: 'Priya Raman' }))
    await user.click(within(group).getByRole('button', { name: 'Priya Raman' }))

    expect(within(group).getByRole('button', { name: 'Priya Raman' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('0 recipients on this digest')).toBeInTheDocument()
    expect(screen.getByText('Priya Raman removed as a digest recipient.')).toBeInTheDocument()
  })

  it('the recipient Input (P6) adds a matched AD user by exact email lookup, never free text', async () => {
    const user = userEvent.setup()
    renderSettings()
    const input = getRecipientInput()

    await user.type(input, 'dana.reyes@northwindscu.org{Enter}')

    const group = getRecipientChipGroup()
    expect(within(group).getByRole('button', { name: 'Dana Reyes' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Dana Reyes added as a digest recipient.')).toBeInTheDocument()
    // Input clears after a successful lookup-add.
    expect(input).toHaveValue('')
  })

  it('the recipient Input reports "no match" rather than adding unconstrained free text', async () => {
    const user = userEvent.setup()
    renderSettings()
    const input = getRecipientInput()

    await user.type(input, 'nobody@example.com{Enter}')

    expect(screen.getByText('No Active Directory match for "nobody@example.com".')).toBeInTheDocument()
    const group = getRecipientChipGroup()
    for (const chip of within(group).getAllByRole('button')) {
      expect(chip).toHaveAttribute('aria-pressed', 'false')
    }
  })

  it('the recipient Input reports an already-added match rather than double-adding', async () => {
    const user = userEvent.setup()
    renderSettings()
    const group = getRecipientChipGroup()
    await user.click(within(group).getByRole('button', { name: 'Priya Raman' }))

    const input = getRecipientInput()
    await user.type(input, 'priya.raman@northwindscu.org{Enter}')

    expect(screen.getByText('Priya Raman is already a digest recipient.')).toBeInTheDocument()
  })
})

describe('Settings · Toggles — digest management DataTable (D7: DataTable C6, one row per digest, cardinality-1)', () => {
  function getDigestTable() {
    return screen.getByRole('table', { name: 'Daily digest management' })
  }

  function getDigestDataRow(table: HTMLElement): HTMLElement {
    const rows = within(table).getAllByRole('row')
    const dataRow = rows[1]
    expect(dataRow).toBeDefined()
    return dataRow as HTMLElement
  }

  it('renders exactly one management row — never a multi-digest CRUD list', () => {
    renderSettings()
    const table = getDigestTable()
    expect(within(table).getAllByRole('row')).toHaveLength(1 + 1) // + header
    expect(screen.queryByRole('button', { name: /add.*digest/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /new digest/i })).not.toBeInTheDocument()
  })

  it('reflects live frequency and recipient-count state, and starts Active', () => {
    renderSettings()
    const table = getDigestTable()
    const dataRow = getDigestDataRow(table)
    expect(within(dataRow).getByText('Daily')).toBeInTheDocument()
    expect(within(dataRow).getByText('0 recipients')).toBeInTheDocument()
    expect(within(dataRow).getByText('Active')).toBeInTheDocument()
    expect(within(dataRow).getByRole('button', { name: 'Disable' })).toBeInTheDocument()
  })

  it('the row action toggles enable/disable and confirms via toast (D7 cap: enable/disable, not delete)', async () => {
    const user = userEvent.setup()
    renderSettings()
    const table = getDigestTable()
    const dataRow = getDigestDataRow(table)

    await user.click(within(dataRow).getByRole('button', { name: 'Disable' }))

    expect(within(dataRow).getByText('Disabled')).toBeInTheDocument()
    expect(within(dataRow).getByRole('button', { name: 'Enable' })).toBeInTheDocument()
    expect(screen.getByText('Digest disabled.')).toBeInTheDocument()

    await user.click(within(dataRow).getByRole('button', { name: 'Enable' }))
    expect(within(dataRow).getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Digest enabled.')).toBeInTheDocument()
  })

  it('double-clicking the row action toggle settles on the correct final state (no torn double-submission)', async () => {
    const user = userEvent.setup()
    renderSettings()
    const table = getDigestTable()
    const dataRow = getDigestDataRow(table)

    const disableButton = within(dataRow).getByRole('button', { name: 'Disable' })
    await user.dblClick(disableButton)

    // Two toggles from Active: Active -> Disabled -> Active. Final state must
    // be a single, coherent claim — never a stuck or ambiguous intermediate.
    expect(within(dataRow).getByText('Active')).toBeInTheDocument()
    expect(within(dataRow).getByRole('button', { name: 'Disable' })).toBeInTheDocument()
  })
})
