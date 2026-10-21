# NeuraGlow 🧠 — Universal AI Study Companion

> Built with a **Claymorphism + Soft Brutalism Hybrid** design system.  
> Inspired by the craft of Linear, Apple, and Vercel. 100% free of generic AI gradients, glassmorphism, or dark neon cliches.

---

## 🎨 Design System Philosophy

NeuraGlow marries the tactile, friendly warmth of **Claymorphism** (soft 3D pillowy dual-depth shadows, pressable tactile buttons) with the structural conviction of **Soft Neo-Brutalism** (bold solid borders, confident typography, high-contrast badges, offset drop shadows).

### Core Aesthetic Rules
- **No generic AI gradients**: Zero purple/indigo blurry glows.
- **No glassmorphism**: Real high-contrast clay cards with solid borders and hard offset shadows (`box-shadow: 6px 6px 0px var(--shadow-clay)`).
- **Pressable Clay Buttons**: Hover `-2px, -2px` with expanded shadow; active `+2px, +2px` with sunken shadow.
- **Typography Hierarchy**:
  - Headings: SF Pro Display (`tracking-tight`, -0.03em)
  - Body: SF Pro Text (`leading-relaxed`, 1.6em)
  - Code & Math: SF Mono
- **4 Switchable Clay Themes**:
  1. 🪵 **Cream Clay (Default)**: `#F5F1EB` warm canvas, `#FF6B35` vibrant terracotta orange, `#2D4A3E` forest green accent.
  2. 🌙 **Midnight Clay**: Deep warm `#1C1B1F` clay slate with soft coral `#FFB4A2` and cream highlights.
  3. 📐 **Mono Precision**: High-impact editorial `#FAFAF8` pure paper with obsidian `#000000` structure and `#FF4500` international orange accents.
  4. 🌿 **Botanical**: `#E8F0E6` sage leaf canvas with deep olive `#2D5016` and terracotta earth `#8B4513`.

---

## 🧩 Learning Engines

Every topic in NeuraGlow activates 7 specialized pedagogical engines:

| Engine | Route | Capabilities |
| :--- | :--- | :--- |
| **Deep Notes** | `/learn/:topic/notes` | High-density textbook chapters, reading progress bar, chapter quick-links, and floating action bubble on text selection (*Explain, Simplify, Example, Ask AI*). |
| **Presentation Deck** | `/learn/:topic/slides` | 16:9 interactive slide canvas with keyboard arrow navigation, speaker notes toggle, slide thumbnails carousel, and presenter mode. |
| **Step-by-Step Practice** | `/learn/:topic/practice` | Guided problem solver with instant step validation, progressive hint reveal, chalkboard formula callouts, and step progress dots. |
| **Adaptive Quiz** | `/learn/:topic/quiz` | Active recall MCQs with optional countdown timer, `canvas-confetti` celebration on correct answers, misconception trap explanations, and final letter-grade report. |
| **Audio Lecture** | `/learn/:topic/audio` | Dynamic waveform audio player with 120px chunky play/pause button, 0.75x–2.0x playback speed pills, and synchronized interactive transcript. |
| **Interactive Simulator** | `/learn/:topic/simulator` | Real-time mathematical simulation with parameter sliders, live SVG physics canvas, readout telemetry, and experimental challenges. |
| **Socratic Tutor** | `/learn/:topic/tutor` | Socratic dialogue engine with chunky chat bubbles, inquiry chips, voice recording pulse, LaTeX math rendering, and a persistent right-side drawer across all engines. |

---

## ⚡ Bonus Power-User Features

- **Command Palette (`Cmd+K` / `Ctrl+K`)**: Instant fuzzy search across all pages, library topics, and quick actions.
- **Focus Mode & Pomodoro Timer**: Distraction-free single-canvas learning with a toggleable 25-minute Pomodoro countdown.
- **Quick Scratchpad (`Cmd+J` / `Ctrl+J`)**: Floating draggable clay pencil icon opening a persistent quick-note pad.
- **Keyboard Shortcuts (`?`)**: Full modal cheat-sheet showing hotkeys for navigation, engines, and shortcuts.
- **Offline Resilient Badge**: Live navigator status badge signaling online/offline connectivity.
- **Persistent Tutor Drawer**: 320px collapsible tutor sidecar in `/learn/:topic` allowing continuous inquiry while browsing slides, notes, or simulations.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Cmd/Ctrl + K` | Open Command Palette |
| `Cmd/Ctrl + J` | Toggle Quick Scratchpad |
| `?` or `Shift + /` | Open Keyboard Shortcuts Modal |
| `Escape` | Close active modal or drawer |
| `←` / `→` | Navigate slides in Presentation Deck |
| `F` | Toggle Focus Mode (distraction-free) |
| `T` | Toggle / Cycle Clay Themes |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Start the Development Server
```bash
npm run dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## 📁 Project Architecture

```
d:/NeuraGlow/NG/neuraglow/
├── app/
│   ├── layout.tsx                # Root layout with ThemeProvider, ClientShell, Toaster
│   ├── globals.css               # Claymorphism + Brutalism CSS tokens & utility classes
│   ├── page.tsx                  # High-craft Landing Page (Hero, Marquee, Bento, Pricing, CTA)
│   ├── dashboard/page.tsx        # Daily dashboard with streak greeting, hero search, continue cards
│   ├── search/page.tsx           # Search page with instant preview, autosuggest & animated states
│   ├── library/page.tsx          # Saved topics bento grid with subject tags & sort filters
│   ├── progress/page.tsx         # Heatmap, mastery bars, donut chart, milestone badges, report card
│   ├── settings/page.tsx         # Visual theme switcher cards, typography slider, preferences
│   ├── auth/
│   │   ├── login/page.tsx        # Claymorphic login modal overlay
│   │   └── signup/page.tsx       # Claymorphic signup modal overlay
│   └── learn/[topicId]/
│       ├── page.tsx              # Main 3-column learning hub
│       ├── notes/page.tsx        # Deep notes subroute
│       ├── slides/page.tsx       # Slide deck subroute
│       ├── practice/page.tsx     # Practice engine subroute
│       ├── quiz/page.tsx         # Quiz engine subroute
│       ├── audio/page.tsx        # Audio engine subroute
│       ├── simulator/page.tsx    # Simulator engine subroute
│       └── tutor/page.tsx        # Socratic tutor subroute
├── components/
│   ├── ui/                       # ClayButton, ClayCard, ClayInput, ClayBadge, ClaySlider, ClaySwitch, ChunkyModal, ClayShapes, ClayIcons
│   ├── layout/                   # Navbar, Sidebar, ThemeContext, ThemeToggle, ClientShell
│   ├── engines/                  # DeepNotesEngine, PresentationEngine, PracticeEngine, QuizEngine, AudioEngine, SimulatorEngine, SocraticTutorEngine, PersistentTutorDrawer
│   └── bonus/                    # CommandPalette, FocusModeButton, KeyboardShortcutsModal, QuickNoteWidget
├── lib/
│   └── mockData.ts               # Topics (Quantum Entanglement, French Revolution, React Hooks, etc.), stats, and activity
└── tailwind.config.js            # Custom clay tokens, shadows, radiuses, and animations
```
