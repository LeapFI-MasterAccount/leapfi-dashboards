/**
 * Home greeting — viewer-local-clock defect fix (PI2-D40 follow-up, user
 * report on rev-76): the h1 greeting picked randomly from the full
 * HOME_GREETINGS set regardless of the viewer's clock, so a user in their
 * local afternoon saw "Good morning" — a copy claim that contradicts the
 * viewer's own clock (this program's "no lying controls" class, PI2-D24,
 * applied to copy).
 *
 * Fix: the greeting is now chosen at random WITHIN a time-of-day bucket
 * derived from the viewer's local clock (`Date#getHours()`) at mount, via
 * `resolveHomeGreetings` exported from `screens/Home.tsx` (see that file's
 * header for the bucket boundaries). These tests mock the system clock
 * (`vi.setSystemTime`) and `Math.random` so every assertion is
 * deterministic — no flaky dependency on the real wall clock at test-run
 * time.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../App'
import {
  HOME_GREETINGS_AFTERNOON,
  HOME_GREETINGS_EVENING,
  HOME_GREETINGS_MORNING,
  resolveHomeGreetings,
} from '../../screens/Home'

// Phrases that are exclusive to one bucket (not the shared time-neutral
// "Welcome back" entry) — used to assert a wrong-bucket phrase never
// renders, not merely that a right-bucket phrase sometimes does.
const MORNING_ONLY = 'Good morning'
const AFTERNOON_ONLY = 'Good afternoon'
const EVENING_ONLY = 'Good evening'

function setLocalClock(hour: number, minute = 0, second = 0, ms = 0) {
  const now = new Date()
  now.setHours(hour, minute, second, ms)
  vi.setSystemTime(now)
}

function renderHeadingWithRandom(randomValue: number): string {
  const spy = vi.spyOn(Math, 'random').mockReturnValue(randomValue)
  try {
    const { unmount } = render(<App />)
    const heading = screen.getByRole('heading', { level: 1 })
    const text = heading.textContent ?? ''
    unmount()
    return text
  } finally {
    spy.mockRestore()
  }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Home greeting — bucket membership by local clock', () => {
  it('at 08:00 local (morning), renders only morning-bucket greetings across the random range', () => {
    setLocalClock(8, 0)
    const low = renderHeadingWithRandom(0)
    const high = renderHeadingWithRandom(0.999999)

    const possible = HOME_GREETINGS_MORNING.map((g) => `${g}, Rachel`)
    expect(possible).toContain(low)
    expect(possible).toContain(high)
  })

  it('at 15:00 local (afternoon), renders only afternoon-bucket greetings across the random range', () => {
    setLocalClock(15, 0)
    const low = renderHeadingWithRandom(0)
    const high = renderHeadingWithRandom(0.999999)

    const possible = HOME_GREETINGS_AFTERNOON.map((g) => `${g}, Rachel`)
    expect(possible).toContain(low)
    expect(possible).toContain(high)
  })

  it('at 20:00 local (evening), renders only evening-bucket greetings across the random range', () => {
    setLocalClock(20, 0)
    const low = renderHeadingWithRandom(0)
    const high = renderHeadingWithRandom(0.999999)

    const possible = HOME_GREETINGS_EVENING.map((g) => `${g}, Rachel`)
    expect(possible).toContain(low)
    expect(possible).toContain(high)
  })
})

describe('Home greeting — bucket boundary edges', () => {
  it('11:59:59.999 local resolves to the morning bucket', () => {
    setLocalClock(11, 59, 59, 999)
    const now = new Date()
    expect(resolveHomeGreetings(now)).toBe(HOME_GREETINGS_MORNING)
  })

  it('12:00:00.000 local resolves to the afternoon bucket', () => {
    setLocalClock(12, 0, 0, 0)
    const now = new Date()
    expect(resolveHomeGreetings(now)).toBe(HOME_GREETINGS_AFTERNOON)
  })

  it('16:59:59.999 local resolves to the afternoon bucket', () => {
    setLocalClock(16, 59, 59, 999)
    const now = new Date()
    expect(resolveHomeGreetings(now)).toBe(HOME_GREETINGS_AFTERNOON)
  })

  it('17:00:00.000 local resolves to the evening bucket', () => {
    setLocalClock(17, 0, 0, 0)
    const now = new Date()
    expect(resolveHomeGreetings(now)).toBe(HOME_GREETINGS_EVENING)
  })

  it('04:59:59.999 local resolves to the evening bucket', () => {
    setLocalClock(4, 59, 59, 999)
    const now = new Date()
    expect(resolveHomeGreetings(now)).toBe(HOME_GREETINGS_EVENING)
  })

  it('05:00:00.000 local resolves to the morning bucket', () => {
    setLocalClock(5, 0, 0, 0)
    const now = new Date()
    expect(resolveHomeGreetings(now)).toBe(HOME_GREETINGS_MORNING)
  })
})

describe('Home greeting — a wrong-bucket phrase can never render', () => {
  it('never renders a morning or evening phrase at 15:00 local (afternoon)', () => {
    setLocalClock(15, 0)
    for (const randomValue of [0, 0.25, 0.5, 0.75, 0.999999]) {
      const text = renderHeadingWithRandom(randomValue)
      expect(text).not.toBe(`${MORNING_ONLY}, Rachel`)
      expect(text).not.toBe(`${EVENING_ONLY}, Rachel`)
    }
  })

  it('never renders an afternoon or evening phrase at 08:00 local (morning) — the user-reported defect', () => {
    setLocalClock(8, 0)
    for (const randomValue of [0, 0.25, 0.5, 0.75, 0.999999]) {
      const text = renderHeadingWithRandom(randomValue)
      expect(text).not.toBe(`${AFTERNOON_ONLY}, Rachel`)
      expect(text).not.toBe(`${EVENING_ONLY}, Rachel`)
    }
  })

  it('never renders a morning or afternoon phrase at 20:00 local (evening)', () => {
    setLocalClock(20, 0)
    for (const randomValue of [0, 0.25, 0.5, 0.75, 0.999999]) {
      const text = renderHeadingWithRandom(randomValue)
      expect(text).not.toBe(`${MORNING_ONLY}, Rachel`)
      expect(text).not.toBe(`${AFTERNOON_ONLY}, Rachel`)
    }
  })
})
