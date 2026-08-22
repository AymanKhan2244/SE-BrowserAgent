---
name: ForgeAI Industrial Workstation
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e3bfb3'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#aa8a7f'
  outline-variant: '#5a4138'
  surface-tint: '#ffb59b'
  primary: '#ffb59b'
  on-primary: '#5b1a00'
  primary-container: '#f85e1c'
  on-primary-container: '#501600'
  inverse-primary: '#a93700'
  secondary: '#bfc7d3'
  on-secondary: '#29313b'
  secondary-container: '#3f4751'
  on-secondary-container: '#aeb6c2'
  tertiary: '#c4c6d0'
  on-tertiary: '#2d3038'
  tertiary-container: '#8e909a'
  on-tertiary-container: '#272a32'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59b'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#812800'
  secondary-fixed: '#dbe3f0'
  secondary-fixed-dim: '#bfc7d3'
  on-secondary-fixed: '#141c25'
  on-secondary-fixed-variant: '#3f4751'
  tertiary-fixed: '#e0e2ed'
  tertiary-fixed-dim: '#c4c6d0'
  on-tertiary-fixed: '#181b23'
  on-tertiary-fixed-variant: '#44474f'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Rajdhani
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: 0.05em
  headline-lg:
    fontFamily: Rajdhani
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 36px
  ui-label-bold:
    fontFamily: Share Tech Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
  ui-label-sm:
    fontFamily: Share Tech Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 14px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  terminal-md:
    fontFamily: Fira Sans
    fontSize: 14px
    fontWeight: '450'
    lineHeight: 20px
  dossier-text:
    fontFamily: Special Elite
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  panel-margin: 24px
  rivet-offset: 8px
  gutter-md: 16px
  internal-padding: 12px
  component-gap: 8px
---

## Brand & Style
The design system embodies a "Heavy Industrial Skeuomorphism" aesthetic, transforming a digital interface into a tactile, mechanical workstation. It is engineered for high-stakes AI development, evoking the feeling of a physical control room or an advanced fabrication plant.

The visual language is defined by physical weight and mechanical precision. Elements are not merely displayed; they are "machined," "riveted," or "embossed." The UI leverages a strict top-left lighting model to maintain 3D consistency across all surfaces. Materials include brushed aluminum for structural panels, gunmetal for recessed containers, and dark leather for peripheral padding. To enhance the "analog-digital" hybrid feel, the system incorporates CRT scan-line overlays and glowing physical LED indicators that simulate hardware light-bleed.

## Colors
The palette is rooted in industrial materials and safety signaling.

- **Forge Orange (#E8530E):** The primary structural color, used for critical branding, heavy-duty buttons, and structural highlights.
- **Gunmetal & Aluminum:** These form the tactile foundation. Aluminum is used for raised surfaces and "plates," while Gunmetal defines the chassis and recessed "well" areas.
- **CRT Phosphor (#33FF33):** Reserved strictly for data visualization, terminal output, and active code, simulating a vintage monochrome monitor.
- **Amber & Red:** Utilized for warning states and physical toggle indicators.
- **Terminal Black (#0A0A0A):** The deepest layer of the UI, used for the "glass" screens and terminal backgrounds.

## Typography
The typographic hierarchy mirrors industrial labeling systems.

- **Headlines (Rajdhani):** Bold and condensed, reminiscent of stenciled machinery markings. Use for main module titles.
- **UI Labels (Share Tech Mono):** Applied to buttons, toggle descriptions, and technical readouts. This font should always feel like it was printed or etched onto a metal plate.
- **Data & Code (Fira Sans):** High-legibility monospaced font for terminal interactions.
- **Content (Inter):** Used for documentation and standard interface text to ensure readability amidst the heavy visual styling.
- **Special Narratives (Special Elite):** Used for "Dossier" views or classified AI reports to simulate typewritten physical documents.

## Layout & Spacing
The layout follows a "Modular Rack-Mount" philosophy. The screen is divided into distinct physical "panels" or "blades." 

Each panel is treated as a separate slab of metal. Main containers use a 12-column grid with 16px gutters, but internal spacing is dictated by the physical constraints of the "machined" plates. Padding must be generous enough to account for the thickness of 3D borders and "beveled" edges. 

Breakpoints:
- **Desktop (1440px+):** Full multi-rack view with sidebars docked as physical control wings.
- **Tablet (768px - 1024px):** Single rack focus with collapsible "sliding metal" drawers.
- **Mobile:** Not recommended for full workstation use; strictly for LED status monitoring and critical overrides.

## Elevation & Depth
Depth is the primary driver of hierarchy in this design system.

- **Light Source:** A fixed light source at -45 degrees (top-left). All highlights must be white/light-grey on the top/left edges, and shadows must be dark-grey/black on the bottom/right edges.
- **The Chassis (Level 0):** A dark charcoal carbon-fiber texture.
- **Machined Plates (Level 1):** Brushed aluminum surfaces with a 2px bevel. Use `drop-shadow` for the plate itself and `inner-shadow` for the screw holes.
- **Recessed Wells (Level -1):** Use heavy `inner-shadow` (blur 10px, spread 2px) to make screen areas or terminal windows look "sunk" into the metal chassis.
- **3D Buttons (Level 2):** Multi-layered shadows. A sharp 1px highlight on the top edge, a 3px dark shadow for the button thickness, and a soft 8px ambient occlusion shadow on the plate below.

## Shapes
Shapes are functional and rigid. Most corners use a tight `0.25rem` (4px) radius to simulate machined metal that has been slightly deburred. 

- **Structural Plates:** 4px corners, often secured with "rivet" components (circular 8px shapes with a radial gradient and offset shadow).
- **Control Buttons:** Square or slightly rounded (4px).
- **Toggle Switches:** Circular or pill-shaped, but housed within rectangular recessed slots.
- **CRT Screens:** Larger 12px corner radius to simulate the curve of a glass tube.

## Components

### 3D Push Buttons
Buttons must look like physical plastic or metal blocks. 
- **Idle:** Gradient from `#E8530E` to `#B13E0A` with a 1px top highlight.
- **Pressed:** Remove the drop shadow, shift the background color 20% darker, and add a 2px inner shadow to simulate the physical travel of the switch.

### LED Indicators
Small circular domes.
- **State Off:** Dark desaturated version of the color with a small white spec-highlight.
- **State On:** Bright saturated color (`#00E676`) with a "bloom" effect (outer glow) and a subtle radial gradient.

### Input Fields
Inputs are "recessed" into the aluminum plates.
- Use a dark gunmetal background (`#2A2D35`).
- 2px inner shadow on the top and left to create a "punched-out" look.
- Text uses **Share Tech Mono** in Phosphor Green.

### Cards & Panels
Panels are "screwed" onto the background. Every panel should feature a "rivet" icon in the four corners. The header of a panel is often a darker strip of metal with etched (letter-pressed) text.

### Toggle Switches
Physical metal flippers. 
- The "well" behind the switch is a vertical dark slot.
- The switch handle uses a vertical brushed metal gradient.

### CRT Overlay
A global or container-specific overlay using a repeating linear-gradient pattern (1px green/black lines at 20% opacity) to simulate scan-lines, finished with a very subtle "flicker" animation.