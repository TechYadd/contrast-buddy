# Contrast Buddy

A tiny WCAG contrast checker built with React + Vite.

Enter a text color and background color and it will calculate:
- Contrast ratio
- WCAG AA / AAA pass/fail (normal text or large text)

It also provides an accessible preview and a copyable CSS snippet.

## What this is for

- Quickly validating text/background color choices before shipping a UI
- Helping designers/developers meet WCAG AA/AAA targets
- A small portfolio project that shows accessible form design and useful calculations

## Features

- Computes contrast ratio using WCAG relative luminance
- AA/AAA pass/fail for normal and large text
- Accessible preview area
- Copyable CSS snippet

## Requirements

- Node.js (LTS recommended)
- npm (comes with Node)

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown in your terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

Then open the preview URL shown in your terminal (usually `http://localhost:4173`).

## How to use

1. Pick text and background colors (picker or hex input).
2. Toggle “Large text mode” if you’re checking headings (different WCAG thresholds).
3. Check the AA/AAA results and adjust until it passes.
4. Click “Copy CSS” to copy a ready-to-use snippet.

## Author

Moayed Musa — https://github.com/TechYadd
