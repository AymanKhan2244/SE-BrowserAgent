---
name: Terminal Velocity
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#191c23'
  surface-container: '#1d2027'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e0e2ec'
  on-surface-variant: '#cdc7aa'
  inverse-surface: '#e0e2ec'
  inverse-on-surface: '#2d3038'
  outline: '#979177'
  outline-variant: '#4b4731'
  surface-tint: '#dec800'
  primary: '#ffffff'
  on-primary: '#373100'
  primary-container: '#fde400'
  on-primary-container: '#716500'
  inverse-primary: '#6a5f00'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#ffffff'
  on-tertiary: '#68000d'
  tertiary-container: '#ffdad7'
  on-tertiary-container: '#bd2c32'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#fde400'
  primary-fixed-dim: '#dec800'
  on-primary-fixed: '#201c00'
  on-primary-fixed-variant: '#504700'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#920418'
  background: '#10131a'
  on-background: '#e0e2ec'
  surface-variant: '#32353c'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 19px
    letterSpacing: 0em
  body-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.08em
  code-stream:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.375rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

This design system delivers a high-density, mission-critical workspace tailored for autonomous software engineering agents, browser execution environments, and systems engineers. Built on an aggressive Neo-Brutalist developer aesthetic, it strips away non-functional decoration in favor of structural clarity, precise delineation, and high information throughput.

The visual style combines the raw industrial tactility of retro terminal interfaces with the sharp, ultra-responsive feel of contemporary developer tooling. Key principles:
- **Zero Ambiguity:** Strict hard-edge geometries, high-contrast boundaries, and zero-blur hard offsets eliminate blurriness and visual hesitation.
- **Instrumental Density:** UI elements prioritize immediate data accessibility and high component packability over decorative breathing room.
- **Controlled Velocity:** Saturated accent hits punctuate deep dark slate backgrounds, guiding visual triage during real-time DOM runs, network intercepts, and agent execution loops.

## Colors

The palette operates in strict dark mode, anchored by deep carbon surfaces that resist eye fatigue during extended terminal monitoring while providing maximum visual pop for status telemetry.

- **Background & Canvas:**
  - Base canvas: `#0c0e12` (Deep Void)
  - Surface elevations & container panels: `#12151c` (Carbon Core), `#181c26` (Raised Surface), `#222736` (Border/Divider Contrast)
- **Primary Accent (`#ffe600` - Electric Canary):** The authoritative action color. Reserved strictly for execution controls, primary triggers, active browser run indicators, and focal interaction states.
- **Secondary Accent (`#00e5ff` - Cyber Cyan):** Diagnostic and technical feedback. Used for active selector highlights, protocol nodes, network telemetry, and parameter parsing.
- **Status & Alerts:**
  - Negative / Fatal / Intercept: `#ff5c5c` (Coral Shock)
  - Positive / Verified / Complete: `#00f5a0` (Mint Run)
  - Notice / Pending / Active Loop: `#ffe600`
- **Text & Foreground:**
  - Primary text: `#f4f6fa` (Crisp Chalk)
  - Muted code / Secondary metadata: `#8c96a8` (Muted Steel)
  - Structural strokes / Outlines: `#282e3d` (Subtle boundary), `#000000` (Hard drop key)

## Typography

The typographic hierarchy is split intentionally:
- **Headings & Structural Wayfinding (Space Grotesk):** Provides mechanical, authoritative geometry for page anchors, drawer headers, and system status dashboards.
- **Body, Code & Telemetry (JetBrains Mono):** Dominates 85% of the viewport. Its distinct glyph forms, strict tabular alignment, and enlarged code ligatures guarantee legibility across real-time DOM logs, raw JSON dumps, and micro-metrics.
- **Labels & Micro-Status:** Always rendered uppercase with slight letter-spacing to allow instant recognition in dense sub-toolbars.

## Layout & Spacing

The layout model favors a rigid, panelized fixed/fluid split screen typical of IDEs and operator consoles.

- **Grid Architecture:** Multi-pane master-detail layout. Typically composed of:
  - Persistent mini tool rail (48px fixed)
  - Collapsible agent action log & tree explorer (280px-360px)
  - Fluid central browser viewport / DOM canvas
  - Dynamic inspection & console dock (collapsible bottom or right split)
- **Rhythm & Density:** Based on an ultra-compact 4px baseline module. Empty padding is intentionally condensed (`space-xs` to `space-md`) to ensure the agent's real-time step trace, console out, and browser canvas remain simultaneously visible above the fold.
- **Breakpoints:**
  - **Desktop (>= 1280px):** Multi-pane simultaneous view (3 columns: Navigation/Tree, Live Browser, Terminal/Inspector).
  - **Tablet (768px - 1279px):** Split-view with toggleable overlay drawer for inspector logs.
  - **Mobile (< 768px):** Single-pane tabbed view with persistent execution switch bar anchored at bottom.

## Elevation & Depth

This design system deliberately eschews soft ambient blurs and gradient drops. Elevation is achieved through hard architectural layering and tangible Neo-Brutalist offsets:

- **Border Architecture:** Every card, container, dock, and control is enclosed in a crisp `1.5px` or `2px` solid stroke (`#282e3d` resting, `#ffe600` focused/active, `#000000` on accented tiles).
- **Hard Offset Shadows:**
  - Standard interactive tiles & elevated cards: `3px 3px 0px #000000`
  - High-priority floating modals & debug panels: `5px 5px 0px #000000`
  - Active / Pressed state: Transforms `translate(3px, 3px)` with `0px 0px 0px transparent`, delivering immediate tactile feedback.
- **Layering Order:**
  - `Layer 0`: Viewport canvas (`#0c0e12`)
  - `Layer 1`: Functional sidebars and terminal panels (`#12151c` with solid `1.5px` dividers)
  - `Layer 2`: Cards, code cells, step nodes (`#181c26` with `3px 3px 0px #000000`)
  - `Layer 3`: Floating overlays, popovers, active modal triggers (`#12151c` with `5px 5px 0px #000000` and `2px` solid `#00e5ff` or `#ffe600` borders)

## Shapes

The shape system adopts a minimal softening (`roundedness: 1` — base radius of `2px` to `4px`). 

- Default elements (buttons, inputs, status tags, cards) maintain sharp corners with just enough rounding (`2px` / `0.125rem` to `4px` / `0.25rem`) to prevent visual aliasing artifacts on high-DPI displays while maintaining a hard-edged, technical silhouette.
- Never use pill shapes or circular floating pills; all badges, tokens, and chips remain rectangular.

## Components

### Buttons
- **Primary ("Run" / "Execute"):** Background `#ffe600`, text `#000000`, font `Space Grotesk` bold. Solid `2px` black border, `3px 3px 0px #000000` hard shadow. Active: `translate(3px, 3px)` with shadow collapsed.
- **Secondary ("Inspect" / "Step"):** Background `#181c26`, text `#f4f6fa`, border `1.5px` solid `#282e3d`. Hover: border `#00e5ff`, text `#00e5ff`, shadow `3px 3px 0px #000000`.
- **Destructive ("Abort" / "Kill"):** Background `#ff5c5c`, text `#000000`, border `2px` solid `#000000`.

### Cards & Panels
- Background `#12151c`, border `1.5px` solid `#282e3d`, corner radius `4px`.
- Panel headers feature a fixed 32px height, border-bottom `1.5px` solid `#282e3d`, monospace section labels (`label-sm`), and right-aligned status indicators.

### Inputs & Terminal Prompts
- Background `#0c0e12`, border `1.5px` solid `#282e3d`, text `#f4f6fa`, typography `JetBrains Mono` 13px.
- Focus state: border `1.5px` solid `#ffe600`, offset shadow `2px 2px 0px #ffe600`.
- Prefix indicators (`$`, `>`, `DOM:`) styled in `#00e5ff`.

### Status Badges & Chips
- Compact rectangular badges: padding `2px 6px`, border `1px` solid, font `10px` JetBrains Mono uppercase.
- Status variants:
  - Running / Active: `#ffe600` background, `#000000` text, solid `#000000` border.
  - Valid / Success: `#00f5a0` text, border `#00f5a0`, background `rgba(0, 245, 160, 0.08)`.
  - Error / Break: `#ff5c5c` text, border `#ff5c5c`, background `rgba(255, 92, 92, 0.08)`.

### Checkboxes & Toggle Controls
- Custom square box (14px × 14px), 2px radius, border `1.5px` solid `#8c96a8`.
- Checked state: `#ffe600` fill with `#000000` stark checkmark, border `1.5px` solid `#ffe600`.

### Agent Execution Tree & Lists
- Monospaced rows with alternating hover states (`#181c26`).
- Indentation lines rendered as explicit `1px` dotted `#282e3d` vertical guide rails.
- Step outcome icons: hard geometric square tags (`[OK]`, `[ERR]`, `[RUN]`).