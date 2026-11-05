# Project Constitution & Memory State

## Tech Stack
- **Framework**: React with Vite or Next.js (App Router), TypeScript
- **Styling**: Tailwind CSS, Lucide React (icons), Canvas-Confetti
- **Audio**: Native HTML5 Web Audio API (no external CDN audio file dependencies)
- **State**: React hooks / Context API with persistent local storage sync
- **UI UX System**: UI UX Pro Max Specification (`ui_ux_guidelines.md`)

## Design Rules (UI UX Pro Max Standards)
- **Aesthetic**: Modern obsidian bento-grid layout (`#060709` base, `#101217` bento cards, `rgba(255,255,255,0.06)` subtle borders).
- **Glow Accents**: Focused neon glows (`#6366F1` Focus, `#10B981` Emerald Break, `#06B6D4` Flowmodoro).
- **Zero Layout Shift (CLS = 0.00)**:
  - Tabular figures (`tabular-nums` / `font-mono`) for all timer readouts and counters to eliminate digit jitter.
  - Rigid, fixed-dimension containers for buttons, toggles, badges, and skeleton screens.
  - `scrollbar-gutter: stable` to avoid horizontal layout shifts.
- **Smooth Micro-interactions**:
  - GPU-accelerated spring animations (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - Tactile press depressions (`scale(0.98)`), hover elevations with subtle radial border glows.
  - Smooth stroke-dashoffset transitions for the circular SVG timer ring.
- **Accessibility & Contrast (WCAG 2.2 AAA)**:
  - Text contrast exceeds 4.5:1 minimum (primary text 17:1 on dark surfaces).
  - Dedicated `focus-visible` styling (`ring-2 ring-indigo-500/70`).
  - Screen-reader accessible live regions (`aria-live="polite"`).
  - Reduced motion fallbacks via `@media (prefers-reduced-motion: reduce)`.
- **Keyboard Shortcuts**:
  - `Space`: Start / Pause Timer
  - `F`: Toggle Zen Fullscreen Mode
  - `M`: Toggle Soundscape Master Mute

