import { useMemo, useRef, useState } from 'react'
import './App.css'

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

const normalizeHex = (value) => {
  const raw = String(value || '').trim().replace(/^#/, '').toLowerCase()
  if (/^[0-9a-f]{3}$/.test(raw)) {
    return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`
  }
  if (/^[0-9a-f]{6}$/.test(raw)) return `#${raw}`
  return null
}

const hexToRgb = (hex) => {
  const h = normalizeHex(hex)
  if (!h) return null
  const n = parseInt(h.slice(1), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

const srgbToLinear = (c) => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

const luminance = (rgb) => {
  const r = srgbToLinear(rgb.r)
  const g = srgbToLinear(rgb.g)
  const b = srgbToLinear(rgb.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrastRatio = (fgHex, bgHex) => {
  const fg = hexToRgb(fgHex)
  const bg = hexToRgb(bgHex)
  if (!fg || !bg) return null
  const l1 = luminance(fg)
  const l2 = luminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

const grade = (ratio, isLargeText) => {
  if (ratio == null) return { aa: false, aaa: false }
  const aa = ratio >= (isLargeText ? 3 : 4.5)
  const aaa = ratio >= (isLargeText ? 4.5 : 7)
  return { aa, aaa }
}

const formatRatio = (ratio) => (ratio == null ? '—' : `${ratio.toFixed(2)}:1`)

function App() {
  const [fg, setFg] = useState('#0b0b12')
  const [bg, setBg] = useState('#f0f8ff')
  const [fgText, setFgText] = useState('#0b0b12')
  const [bgText, setBgText] = useState('#f0f8ff')
  const [largeText, setLargeText] = useState(false)
  const [announcement, setAnnouncement] = useState('Ready.')
  const liveRef = useRef(null)

  const ratio = useMemo(() => contrastRatio(fg, bg), [fg, bg])
  const levels = useMemo(() => grade(ratio, largeText), [ratio, largeText])

  const applyHex = (setter, textSetter, value) => {
    const h = normalizeHex(value)
    textSetter(value)
    if (h) {
      setter(h)
      setAnnouncement('Color updated.')
    } else {
      setAnnouncement('Invalid hex color.')
    }
    if (liveRef.current) liveRef.current.textContent = ''
  }

  const swap = () => {
    setFg(bg)
    setBg(fg)
    setFgText(bg)
    setBgText(fg)
    setAnnouncement('Colors swapped.')
  }

  const cssSnippet = `color: ${fg};\nbackground-color: ${bg};`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cssSnippet)
      setAnnouncement('Copied CSS to clipboard.')
    } catch (e) {
      setAnnouncement('Could not copy. Select and copy manually.')
    }
  }

  const badgeText = ratio == null ? 'Fix colors' : levels.aaa ? 'AAA' : levels.aa ? 'AA' : 'Fail'
  const badgeClass = badgeText.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to checker
      </a>
      <header className="header">
        <h1 className="brand">Contrast Buddy</h1>
        <p className="sub">A small WCAG contrast checker with an accessible preview.</p>
      </header>

      <main id="main" className="grid">
        <section className="card" aria-labelledby="controls-title">
          <h2 id="controls-title">Colors</h2>

          <div className="fields">
            <div className="row">
              <label className="field">
                <span>Text color</span>
                <div className="inputRow">
                  <input
                    type="color"
                    value={fg}
                    onChange={(e) => applyHex(setFg, setFgText, e.target.value)}
                    aria-label="Text color picker"
                  />
                  <input
                    className="hex"
                    value={fgText}
                    inputMode="text"
                    spellCheck={false}
                    onChange={(e) => applyHex(setFg, setFgText, e.target.value)}
                    aria-label="Text color hex"
                  />
                </div>
              </label>
            </div>

            <div className="row">
              <label className="field">
                <span>Background color</span>
                <div className="inputRow">
                  <input
                    type="color"
                    value={bg}
                    onChange={(e) => applyHex(setBg, setBgText, e.target.value)}
                    aria-label="Background color picker"
                  />
                  <input
                    className="hex"
                    value={bgText}
                    inputMode="text"
                    spellCheck={false}
                    onChange={(e) => applyHex(setBg, setBgText, e.target.value)}
                    aria-label="Background color hex"
                  />
                </div>
              </label>
            </div>

            <div className="controls" role="group" aria-label="Actions">
              <button type="button" className="primary" onClick={swap}>
                Swap
              </button>
              <button type="button" onClick={copy}>
                Copy CSS
              </button>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={largeText}
                  onChange={(e) => setLargeText(e.target.checked)}
                />
                <span>Large text mode</span>
              </label>
            </div>
          </div>

          <div className="results" aria-label="Results">
            <div className="metric">
              <div className="metricLabel">Contrast</div>
              <div className="metricValue">{formatRatio(ratio)}</div>
            </div>
            <div className="metric">
              <div className="metricLabel">AA</div>
              <div className="metricValue">{levels.aa ? 'Pass' : 'Fail'}</div>
            </div>
            <div className="metric">
              <div className="metricLabel">AAA</div>
              <div className="metricValue">{levels.aaa ? 'Pass' : 'Fail'}</div>
            </div>
            <div className={`badge ${badgeClass}`} aria-label="Overall rating">
              {badgeText}
            </div>
          </div>

          <p className="sr-only" aria-live="polite" aria-atomic="true" ref={liveRef}>
            {announcement}
          </p>
        </section>

        <section className="card" aria-labelledby="preview-title">
          <div className="previewHeader">
            <h2 id="preview-title">Preview</h2>
            <div className="previewHint">
              {largeText ? 'Large text thresholds' : 'Normal text thresholds'}
            </div>
          </div>

          <div className="preview" style={{ color: fg, backgroundColor: bg }}>
            <p className={largeText ? 'sample large' : 'sample'}>
              Accessible preview text. Adjust colors and copy the CSS when it passes.
            </p>
            <p className="sampleSecondary">
              Try using colors that meet AA for body text and AAA for headings.
            </p>
            <pre className="code" aria-label="CSS snippet">
              {cssSnippet}
            </pre>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a href="https://github.com/TechYadd" target="_blank" rel="noreferrer">
          TechYadd
        </a>
      </footer>
    </div>
  )
}

export default App
