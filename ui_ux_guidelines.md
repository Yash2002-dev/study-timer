# UI/UX Pro Max Design System & Guidelines
**Project:** Masterpiece Study Timer  
**Aesthetic:** Modern Obsidian Bento-Grid · Tactile Neo-Grotesque · Ambient Deep Work  
**Target Compliance:** WCAG 2.2 AAA Contrast · Zero Layout Shift (CLS = 0.00) · 60/120 FPS Micro-Interactions

---

## 1. Visual Architecture & Obsidian Palette

The design language draws inspiration from obsidian volcanic glass: ultra-deep, cold neutral dark tones layered with sub-surface borders and radiant neon energy glows that symbolize deep concentration.

### 1.1 Color Palette Tokens

```css
:root {
  /* Obsidian Base Layers */
  --obsidian-950: #060709;       /* Deepest viewport canvas background */
  --obsidian-900: #0A0B0E;       /* Primary bento surface level 0 */
  --obsidian-850: #101217;       /* Card / Bento tile background */
  --obsidian-800: #171A21;       /* Elevated interactive cards / popovers */
  --obsidian-700: #222631;       /* Active card state / Hover surface */

  /* Structural Borders & Separators */
  --border-subtle: rgba(255, 255, 255, 0.06);   /* Standard tile outline */
  --border-glow: rgba(99, 102, 241, 0.25);       /* Focused / Active tile glow */
  --border-divider: #1E222D;                     /* Internal component dividers */

  /* Text & Foreground Contrast (Strict WCAG AAA) */
  --text-primary: #F8FAFC;        /* High-contrast crisp white (17.5:1 on #0A0B0E) */
  --text-secondary: #94A3B8;      /* Readable metadata & subtext (6.2:1 on #0A0B0E) */
  --text-muted: #64748B;          /* Supplementary tags / inactive states (4.5:1 minimum) */
  --text-disabled: #475569;       /* Disabled toggles / placeholding */

  /* Energy & Focus Accents */
  --accent-indigo: #6366F1;       /* Focus Mode primary glow */
  --accent-indigo-glow: rgba(99, 102, 241, 0.15);
  --accent-emerald: #10B981;      /* Short Break / Active Streak */
  --accent-emerald-glow: rgba(16, 185, 129, 0.15);
  --accent-cyan: #06B6D4;         /* Flowmodoro Stopwatch mode */
  --accent-amber: #F59E0B;        /* Long Break / Goal Near Completion */
  --accent-rose: #F43F5E;         /* Warning / Timer Reset / Critical Alert */
}
```

### 1.2 Surface Depth & Glass Sheen
- **Bento Tiles**: Solid high-performance base `--obsidian-850` with `1px solid var(--border-subtle)`.
- **Translucent Overlays (Modals & Faders)**: `backdrop-filter: blur(16px)` with `background: rgba(10, 11, 14, 0.78)`.
- **Corner Curvature**: Outer bento tiles use uniform `rounded-3xl` (24px) with inner elements rounded to `rounded-xl` (12px) or `rounded-lg` (8px) for harmonious concentric geometry.

---

## 2. Bento-Grid Layout System & Responsive Matrix

The layout organizes complex multi-modal study tools into an organic, modular Bento-Grid. Each tile functions as a dedicated micro-instrument while maintaining layout cohesion.

### 2.1 Bento Layout Architecture

```
+-----------------------------------------------------------------------------------------+
|                                     TOP NAVIGATION BAR                                   |
| Logo / Session Counter                Status Indicator                 Zen Mode / Mute  |
+--------------------------------------------------+--------------------------------------+
|                                                  |                                      |
|                 HERO TIMER TILE                  |           AMBIENT SOUNDSCAPE         |
|                                                  |                 MIXER                |
|  - Circular SVG Dial with Glow Pulse             |  - Procedural Rain, 40Hz Waves,      |
|  - Monospace Tabular Readout (00:00:00)          |    Pink Noise, Café Sound faders     |
|  - Interval Mode Switcher (Pomo/Long/Flow/Cust)  |  - Master volume & mute toggles      |
|  - Tactile Controls: Play / Pause / +5m / Reset  |                                      |
|                                                  |                                      |
+--------------------------------------------------+--------------------------------------+
|            DAILY GOAL & TASK MATRIX              |          ANALYTICS & STREAKS         |
|  - Current Active Task Tag (Deep Work, Revision) |  - 7-Day Focus Heatmap & Bar Chart   |
|  - Visual Progress Bar (X of Y hours completed)  |  - Total Time Today / Current Streak |
|  - Session History Quick-Feed                    |  - Milestone Badge Display           |
+-----------------------------------------------------------------------------------------+
```

### 2.2 Breakpoint & Grid Specifications
- **Desktop (`>= 1024px`)**:
  - `grid-template-columns: repeat(12, minmax(0, 1fr))`
  - Hero Timer Tile: `col-span-7`
  - Ambient Soundscape Mixer: `col-span-5`
  - Task Matrix Tile: `col-span-6`
  - Analytics & Streak Tile: `col-span-6`
  - `gap: 1.5rem (24px)`
- **Tablet (`768px - 1023px`)**:
  - `grid-template-columns: repeat(2, minmax(0, 1fr))`
  - Timer: `col-span-2`
  - Ambient Soundscape: `col-span-1`
  - Task Matrix: `col-span-1`
  - Analytics: `col-span-2`
  - `gap: 1rem (16px)`
- **Mobile (`< 768px`)**:
  - `grid-template-columns: 1fr`
  - Linear stacked bento cards with sticky bottom mobile action dock.
  - `gap: 0.875rem (14px)`

---

## 3. Zero Cumulative Layout Shift (CLS = 0.00) Protocols

Layout jitter ruins concentration. The following ironclad rules eliminate all dynamic size recalculations:

### 3.1 Tabular Figures & Fixed Glyphs
- **Mandatory CSS Rule for Numbers**:
  ```css
  .timer-readout, .metric-value, .stat-counter {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum";
    font-family: 'JetBrains Mono', 'SF Mono', 'Roboto Mono', Menlo, monospace;
    letter-spacing: -0.02em;
  }
  ```
- **Timer Readout Fixed Width**: The digits `00:00` or `00:00:00` must reside within an explicit `min-width` container:
  ```css
  .timer-display-container {
    display: inline-flex;
    justify-content: center;
    min-width: 8.5ch; /* Pre-allocated width for 00:00:00 */
    text-align: center;
  }
  ```

### 3.2 Dynamic Elements Pre-Allocation
- **Buttons & Icon Toggles**: Play/Pause icons must share identical 24x24px bounding boxes; the button itself has fixed height `h-12` and minimum width `min-w-[120px]`.
- **Skeleton Screens**: All data-dependent tiles (Analytics, Task History) render static skeleton boxes of the exact pixel dimensions before local storage or sync hydration completes.
- **Scrollbar Stability**: Enforce `scrollbar-gutter: stable` on root to prevent horizontal page twitching when task lists expand.

---

## 4. Micro-Interactions & Animation Physics

All animations prioritize physical tactility and high-framerate rendering via hardware-accelerated CSS transforms.

### 4.1 Transition Tokens & Easing Curves
- **Micro-Spring (Interactive Buttons, Toggles)**:
  `transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease`
- **Fluid Layout Transitions (Zen Mode Toggle, Modal Drops)**:
  `transition: all 300ms cubic-bezier(0.22, 1, 0.36, 1)`
- **Dial SVG Progress Ring**:
  `transition: stroke-dashoffset 850ms cubic-bezier(0.4, 0, 0.2, 1)`

### 4.2 Tactile Interaction States
| State | Visual Treatment | CSS Property |
| :--- | :--- | :--- |
| **Idle** | Clean obsidian tile, subtle border | `transform: scale(1); border-color: var(--border-subtle)` |
| **Hover** | 1.015x elevation, border highlight, radial sheen | `transform: translateY(-1px) scale(1.01); border-color: var(--border-glow); box-shadow: 0 8px 24px -4px rgba(0,0,0,0.45)` |
| **Active / Press** | Tactile 0.98x compression | `transform: scale(0.98); filter: brightness(0.92)` |
| **Focus-Visible** | 2px Indigo ring with 2px offset | `ring-2 ring-indigo-500/70 ring-offset-2 ring-offset-[#0A0B0E]` |

### 4.3 Reduced Motion Accessibility
Respect user sensory preferences:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 5. Zen Mode & Ambient Immersion

Zen Mode strips every visual distraction to channel 100% focus.

- **Trigger**: Click "Zen Mode" toggle or press key `F`.
- **Visual Behavior**:
  - Bento grid softly fades out (`opacity: 0`, `pointer-events: none`).
  - Central timer dial smoothly scales up to `1.25x` and centers in viewport.
  - Background darkens to pure obsidian `#050608`.
  - Ambient sound controls remain accessible via a subtle floating bottom drawer on mouse hover or tap.
  - Press `Esc` or `F` to smoothly return to full Bento Grid without page reload.

---

## 6. Soundscape Mixer UI Ergonomics

The ambient audio mixer features tactile horizontal faders and procedural sound switches:

- **Fader Track**: Deep charcoal channel (`#171A21`) with rounded pill thumb.
- **Active Fill**: Dynamic gradient tracking volume level (`0%` to `100%`).
- **Waveform Activity Light**: A pulsing 6px dot indicates when an oscillator/noise generator is actively outputting sound.
- **Master Quick-Mute**: Global mute toggle (Key `M`) smoothly ramps down Web Audio gain nodes over 80ms to avoid audio popping or clicks.

---

## 7. Implementation Checklist for Engineers

- [ ] **Tabular Fonts**: Ensure all numbers use `font-mono` / `tabular-nums`.
- [ ] **Color Tokens**: Check that text-to-background contrast never dips below 4.5:1 (6.5+:1 for primary actions).
- [ ] **Button Sizing**: Play/Pause and action buttons have rigid bounding dimensions to guarantee CLS = 0.
- [ ] **Keyboard Nav**: Full keyboard operability (`Space` for timer, `F` for Zen, `M` for sound, `Tab` order logical).
- [ ] **ARIA Live Regions**: `aria-live="polite"` applied to status badges and countdown readouts.
- [ ] **Hardware Acceleration**: Only animate `transform`, `opacity`, and `filter`. Avoid animating `width`, `height`, `margin`, or `padding`.

