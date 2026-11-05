# Project Specifications: Masterpiece Study Timer

## 1. App Vision
An ambient, distraction-free study and deep-work hub combining precision interval timing, generative background audio, task session tagging, and gamified analytics.

## 2. Core Functional Modules
- **Timer Engine**:
  - Modes: Classic Pomodoro (25/5), Long Focus (50/10), Flowmodoro (count-up stopwatch), and Custom Intervals.
  - Controls: Start, Pause, Skip, Reset, Quick +5m extension.
  - Background Execution: High-accuracy delta timing via Web Worker.
- **Ambient Soundscape (Web Audio API)**:
  - Synthetic procedural audio generators: Rain, Binaural 40Hz Focus Waves, Pink Noise, and Café Ambience.
  - Independent volume faders and audio blending.
- **Task & Tagging Management**:
  - Session tagging (e.g., "Deep Work", "Reading", "Revision").
  - Daily goal progress bar and session completion logging.
- **Analytics & Gamification**:
  - Focus streak counter, daily focus heatmap, and session distribution charts.
  - Subtle milestone confetti celebrations.
- **Visuals & Zen Mode**:
  - Minimalist Dark Obsidian / Midnight aesthetic with soft glow accents.
  - Fullscreen Zen Mode hiding all metrics except the central glowing dial.
  - Keyboard shortcuts (Space = Start/Stop, F = Zen Fullscreen, M = Mute).

## 3. Storage & State
- Local-first persistence via `localStorage` for offline use.
- Prepared schema integration for Supabase cloud sync.