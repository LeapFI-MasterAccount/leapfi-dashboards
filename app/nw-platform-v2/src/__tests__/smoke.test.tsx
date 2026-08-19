/**
 * Infra smoke test (D17): pins ported v1 base behavior — the app shell
 * boots with the sidebar navigation present.
 *
 * Base anchors (survey_map.md, leapfi-platform.html @ 1c230fe):
 *  - L27–116  "App shell (sidebar 236px, topbar, avatar, ...)"
 *  - L762–821 "Sidebar: Home, Reporting; OnSide (nested ...), Studio (...),
 *              Connect/AllRailz/Vantage 'Soon', Settings; footer 'v 1.071'"
 * The v2 port renders that shell sidebar as `<nav aria-label="Primary">`
 * (components/Sidebar.tsx), mounted by every screen including the boot
 * screen, Home.
 *
 * D18 (known flux): this test deliberately does NOT touch Home's
 * "Start the demo" entry affordance — it only asserts shell/sidebar
 * presence.
 */
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('app shell smoke (survey_map.md L27–116 shell, L762–821 sidebar)', () => {
  it('boots on Home with the primary sidebar navigation present (base L762–821)', () => {
    render(<App />)
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })
})
