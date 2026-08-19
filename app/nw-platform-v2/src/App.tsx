import { useEffect, useState } from 'react'
import './App.css'

type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'nw-platform-v2-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark'
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'dark'
}

// Placeholder shell — proves the D13-ratified dark/light token swap.
// Structural markup/CSS is byte-identical between themes; only the
// `data-theme` attribute (and therefore the CSS custom properties in
// src/theme/tokens.css) changes, per the amendment's S7 theme-switching rule.
function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = (): void => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-chevron" aria-hidden="true" />
        <h1 className="app-title">
          LeapFI Platform <span className="app-title-sep">&middot;</span> NorthWinds Credit
          Union (V2) <span className="app-scaffold-tag">&mdash; scaffold</span>
        </h1>
      </header>

      <main className="app-main">
        <p className="app-lede">
          Theme-token scaffold for the D14 twin build pipeline. The toggle below
          proves the dark/light token swap defined in
          <code> src/theme/tokens.css</code>.
        </p>

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-pressed={theme === 'light'}
        >
          <span className="theme-toggle-indicator" aria-hidden="true" data-theme-state={theme} />
          Switch to {theme === 'dark' ? 'light' : 'dark'} mode
        </button>

        <section className="token-preview" aria-label="Token color preview">
          <div className="token-swatch token-swatch--panel">
            <span className="token-label">--panel</span>
          </div>
          <div className="token-swatch token-swatch--accent">
            <span className="token-label">--accent</span>
          </div>
          <div className="token-swatch token-swatch--accent2">
            <span className="token-label">--accent2</span>
          </div>
        </section>

        <p className="app-meta">
          Current theme: <strong aria-live="polite">{theme}</strong>
        </p>
      </main>
    </div>
  )
}

export default App
