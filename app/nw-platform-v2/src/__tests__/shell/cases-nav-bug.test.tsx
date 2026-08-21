/**
 * Regression — call-19 "Cases" nav bug (planning/call-19-navigation-bug-fix.md;
 * meeting_notes_2026-08-20.md:111, Adam Schlesinger: "the 'Cases' button
 * does not return the user to the main cases screen as expected").
 *
 * ROOT CAUSE (reproduced here first, then fixed in App.tsx): `Cases.tsx`
 * holds the open-case detail (`selectedCaseId`) as local component state,
 * not shell state. `App.tsx`'s `navigateToScreen('cases')` early-returns
 * (`if (id === screenId) return`) whenever `screenId` is ALREADY `'cases'`
 * — true whenever a case detail Drawer is open, since opening a case never
 * changes `screenId` away from `'cases'`. The early return skips the
 * `<Cases>` element's own re-key, so the mounted `Cases` instance survives
 * untouched, `selectedCaseId` keeps its prior value, and the open case
 * Drawer never closes — clicking "Cases" while a case is open is a no-op
 * for the drawer, exactly Adam's reported symptom.
 *
 * This file pins both directions: the test FAILS against the pre-fix
 * `navigateToScreen` (proven via a reverted scratch copy — see dispatch
 * evidence) and PASSES once every generic nav to `'cases'` forces a fresh
 * `Cases` mount (a `casesResetNonce`-keyed remount), matching the AC's
 * "clear any... detail views... from the previous navigation."
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import App from '../../App'
import { CASES, seedCases } from '../../data/cases'
import { DOCLIB } from '../../data/doclib'

function openFirstCaseDetail(): void {
  const firstCaseId = CASES[0]?.id
  expect(firstCaseId).toBeTruthy()
  const idCell = screen.getByText(firstCaseId as string)
  const row = idCell.closest('tr')
  expect(row).not.toBeNull()
  fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }))
}

function clickCasesNav(): void {
  const nav = screen.getByRole('navigation', { name: 'Primary' })
  const nested = within(nav).getByRole('list', { name: 'OnSide sections' })
  fireEvent.click(within(nested).getByRole('button', { name: /^Cases/ }))
}

beforeEach(() => {
  seedCases(DOCLIB)
})

describe('call-19 — "Cases" nav button returns to the cases list', () => {
  it('navigating to Cases from Home lands on the cases list (baseline, not itself the bug)', () => {
    render(<App />)
    clickCasesNav()
    expect(screen.getByRole('heading', { name: 'Cases' })).toBeInTheDocument()
    expect(document.querySelector('[data-lf-view="case-detail"]')).toBeNull()
  })

  it('clicking "Cases" while a case detail is open closes the detail and returns to the cases list (the reported bug)', () => {
    render(<App />)
    clickCasesNav()
    openFirstCaseDetail()
    expect(document.querySelector('[data-lf-view="case-detail"]')).not.toBeNull()

    // The reported defect: pressing "Cases" again while a case is open.
    clickCasesNav()

    expect(document.querySelector('[data-lf-view="case-detail"]')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Cases' })).toBeInTheDocument()
  })

  it('the fix works from a non-cases context too: Home -> open a case -> another screen -> Cases still returns to the list', () => {
    render(<App />)
    clickCasesNav()
    openFirstCaseDetail()
    expect(document.querySelector('[data-lf-view="case-detail"]')).not.toBeNull()

    // Leave Cases entirely for another screen without closing the drawer.
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    fireEvent.click(within(nav).getByRole('button', { name: 'Home' }))
    expect(screen.queryByRole('heading', { name: 'Cases' })).not.toBeInTheDocument()

    clickCasesNav()
    expect(document.querySelector('[data-lf-view="case-detail"]')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Cases' })).toBeInTheDocument()
  })
})
