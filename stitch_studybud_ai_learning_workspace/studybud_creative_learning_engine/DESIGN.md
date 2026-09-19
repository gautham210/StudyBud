---
name: StudyBud Creative Learning Engine
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#6d5e00'
  on-secondary: '#ffffff'
  secondary-container: '#f9da00'
  on-secondary-container: '#6d5f00'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#3d0600'
  on-tertiary-container: '#ec4a27'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#ffe243'
  secondary-fixed-dim: '#e3c600'
  on-secondary-fixed: '#211b00'
  on-secondary-fixed-variant: '#524700'
  tertiary-fixed: '#ffdad3'
  tertiary-fixed-dim: '#ffb4a4'
  on-tertiary-fixed: '#3d0600'
  on-tertiary-fixed-variant: '#8c1800'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-xxl:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xxl-mobile:
    fontFamily: Space Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system blends lightweight neo-editorial clarity with the tactile energy of a grass-roots student maker collective. It prioritizes curiosity, agency, and collaborative study through an approachable, high-contrast canvas.

### Design Movement & Aesthetic
- **Light Neo-Editorial & Maker Spirit**: Clean paper-like layouts (#FFFFFF and #FAFAFA), precise 1px ink-black structural bounding boxes, and confident geometric headlines paired with warm, readable body copy.
- **Selective Vibrant Accents**: Utilitarian structure grounded by vibrant high-energy markers—electric yellow, vivid coral, zesty lime, and expressive lilac—serving as highlighter markers for learning journeys and maker achievements.
- **Modern Tactile Touches**: Minimalist frosted glass overlays (`rgba(255, 255, 255, 0.75)` with soft 12px backdrops), pill-shaped tag clusters, and playful modular divider squiggles.
- **Emotional Resonance**: Energetic, transparent, unpretentious, and encouraging. The interface feels like an interactive whiteboard or creative workshop bench rather than an institutional LMS.

## Colors

The palette operates on pure contrast: dominant stark obsidian on canvas white, accented with vibrant pop colors drawn from maker culture (highlighter inks, circuit board silkscreens, and workshop stickers).

### Palette Architecture
- **Canvas Base**: Pure White `#FFFFFF` for modular cards and interactive surfaces; `#FAFAFA` for root page backgrounds.
- **Primary Ink & Lines**: Obsidian `#121212` for primary typography, icons, active bottom navigation pills, and razor-sharp 1px linear structural strokes. Secondary text falls back to `#5A5A5A`.
- **Accent - Sunny Yellow (`#FFDF00`)**: Key highlight state, community badge backdrops, and active workshop tags.
- **Accent - Electric Coral (`#FF5733`)**: High-priority milestones, maker spotlight callouts, and notifications.
- **Accent - Maker Lime (`#22C55E`)**: Status indicators ("Available", "Active Hub"), project completion pips, and verified checkmarks.
- **Accent - Vivid Lilac (`#E0B0FF`)**: Secondary category indicators, creative tracks, and subtle background gradient flares.
- **Glass Frost**: `rgba(255, 255, 255, 0.75)` with `backdrop-filter: blur(12px)` and a `1px solid rgba(18, 18, 18, 0.08)` outline.

## Typography

Typography establishes an editorial maker voice:

- **Headlines & Labels (`Space Grotesk`)**: Provides geometric precision, technical posture, and purposeful student zine energy. Used for student names, card titles, tracking labels, and section headings.
- **Body Content (`Plus Jakarta Sans`)**: Delivers friendly, open optical geometry with exceptional legibility for bios, workshop syllabi, and technical summaries.
- **Labels & Microcopy**: Formatted in uppercase with relaxed letter spacing (`0.04em`–`0.06em`) to match technical schematic diagrams and industrial tags.

## Layout & Spacing

The layout is built upon an 8pt base grid system that emphasizes airiness, modular segmentation, and rhythmic separation.

### Structure
- **Mobile First**: Single-column vertical stream with `1rem` (16px) margins. Content modules are framed with 1px border containers or clean vertical stacks.
- **Tablet & Desktop**: Fluid 12-column grid using `1.5rem` gutters and max-width containers of 1180px for desktop editorial displays.
- **Decorative Separators**: Custom decorative squiggles or subtle 1px dashed rules create editorial rhythm between distinct content modules without visual clutter.

## Elevation & Depth

Visual hierarchy uses clean borders and layered surfaces instead of muddy drop shadows.

- **Crisp Structural Outlines**: The core depth mechanism uses clean `1px solid #121212` or `1px solid #E5E5E5` outlines. Cards and modal sheets define space via distinct perimeter lines.
- **Frosted Translucent Depth**: Sticky top navigation bars, pill overlays, and secondary toolbars use `background: rgba(255, 255, 255, 0.72)` paired with `backdrop-filter: blur(14px)` and a subtle `1px solid rgba(18, 18, 18, 0.08)` border.
- **Tactile Offsets**: Interactive elements, such as featured cards or hover-active buttons, apply a sharp neo-brutalist offset shadow: `box-shadow: 2px 2px 0px #121212` with 0px blur.
- **No Heavy Ambient Shadows**: Soft ambient blurs are excluded to preserve the crisp editorial print look.

## Shapes

The shape language pairs architectural sharpness with rounded, approachable components.

- **Core Containers (`rounded-lg` / 16px)**: Workshop cards, featured banners, profile summaries, and action panels use a consistent 16px corner radius.
- **Pills & Badges (`rounded-full` / 9999px)**: Tags, category chips, status pills, user handles, and primary buttons use full pill-rounded styling.
- **Sub-elements (`rounded-sm` / 6px)**: Nested progress indicators, thumbnail previews, and inner icon tiles use small radii to distinguish them from outer boundary containers.

## Components

### Buttons
- **Primary Pill**: Pure black `#121212` background, pure white `#FFFFFF` text, `Space Grotesk` medium typography, pill shape (`rounded-full`), padded `0.65rem 1.4rem`. 
- **Outline / Secondary Button**: `#FFFFFF` background with a crisp `1px solid #121212` boundary, Obsidian text, changing to `#FAFAFA` with subtle `box-shadow: 1px 1px 0px #121212` on hover.
- **Action Compact Button**: Small, sharp, rounded caps (`rounded-full`), `1px solid #121212`, internal uppercase label font, with directional arrows (e.g., `VISIT ↗`, `READ ↗`).

### Chips & Interest Tags
- Pill-shaped (`rounded-full`) inline elements with subtle light backgrounds (`#F5F5F5` or accent tints like `#FFF9D2` for AI/Maker tags).
- Accompanied by minimal emojis, SVG geometric icons, or 4px colored circular status markers.
- Typography set in `Space Grotesk` uppercase `label-sm` (10px–11px, bold).

### Cards & Activity Tiles
- **Workshop/Event Card**: Solid `#FFFFFF` surface enclosed by a `1px solid #E5E5E5` border (switching to `#121212` on focus/hover), 16px border-radius, vertical stack:
  1. Upper section: Title, time/venue metadata, tags.
  2. Lower section: Split-cell graphic display or colorful illustration tile with an ink-line separation.
- **Maker Highlight Card**: Vibrant background (e.g., vivid lilac or sunny yellow wash) with 1px black outline, containing high-contrast black typography and an embedded secondary action pill button.

### Navigation
- **Floating Island Bottom Bar**: Compact pill-shaped bar anchored above the bottom safe area. Encased in frosted translucent white with a `1px solid rgba(18, 18, 18, 0.1)` edge.
- **Active Navigation Item**: High-contrast black pill (`#121212`) encasing white icon and text label; inactive items display as minimalist outline icons on subtle `#F0F0F0` circular tap targets.

### Lists & Activity Links
- Clean horizontal rows divided by 1px rules (`#EEEEEE`).
- Left side: Monoline category icon in a 36px circular or squircle container with bold item headline.
- Right side: Uppercase label with diagonal link glyph (`VISIT ↗`).

### Input Fields & Controls
- Input surfaces use `#FFFFFF` with a `1px solid #121212` or `#D1D5DB` border, `rounded-lg` (12px) corners, and clean inset padding (`0.75rem 1rem`). Focus state switches to a 2px obsidian outline.
- Checkboxes and radio buttons feature 1.5px black border frames with sharp solid black fills when active.