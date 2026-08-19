---
name: Agro-Satellite Insight
colors:
  surface: '#0c1324'
  surface-dim: '#0c1324'
  surface-bright: '#33394c'
  surface-container-lowest: '#070d1f'
  surface-container-low: '#151b2d'
  surface-container: '#191f31'
  surface-container-high: '#23293c'
  surface-container-highest: '#2e3447'
  on-surface: '#dce1fb'
  on-surface-variant: '#bbcac0'
  inverse-surface: '#dce1fb'
  inverse-on-surface: '#2a3043'
  outline: '#85948b'
  outline-variant: '#3c4a42'
  surface-tint: '#45dfa4'
  primary: '#5af0b3'
  on-primary: '#003825'
  primary-container: '#34d399'
  on-primary-container: '#00563b'
  inverse-primary: '#006c4b'
  secondary: '#62df7d'
  on-secondary: '#003914'
  secondary-container: '#1ca64d'
  on-secondary-container: '#003111'
  tertiary: '#b2e2c3'
  on-tertiary: '#083822'
  tertiary-container: '#97c6a8'
  on-tertiary-container: '#27533c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#68fcbf'
  primary-fixed-dim: '#45dfa4'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#7ffc97'
  secondary-fixed-dim: '#62df7d'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#bdeece'
  tertiary-fixed-dim: '#a2d1b3'
  on-tertiary-fixed: '#002111'
  on-tertiary-fixed-variant: '#234f38'
  background: '#0c1324'
  on-background: '#dce1fb'
  surface-variant: '#2e3447'
  surface-soft: '#F8FAFC'
  surface-deep: '#0F172A'
  border-muted: '#1E293B'
typography:
  display-hero:
    fontFamily: Sora
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Sora
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  button-text:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 32px
  margin-x: 24px
  section-gap: 120px
  card-padding: 40px
---

## Brand & Style

The design system is built on a narrative of "Precision Agriculture." It balances the raw, organic nature of farming with the high-tech precision of satellite monitoring. The target audience includes individual farmers, agricultural officers, and data scientists, necessitating a UI that is simultaneously accessible and authoritative.

The style is **Corporate / Modern** with a **Minimalist** edge. It utilizes a deep, dark foundation to allow vibrant green accents—symbolizing life and growth—to pop. The aesthetic is clean, professional, and data-driven, using high-quality photography and structural grid alignment to establish trust and technological superiority.

## Colors

The color palette is dominated by a "Midnight Navy" neutral base, creating a high-contrast environment for technical data. The primary accent is a vibrant **Emerald Green (#34D399)**, used for critical calls to action and success states. 

Darker forest greens are used for container backgrounds and secondary elements to provide a sense of depth without breaking the dark-mode immersion. Typography primarily uses pure white or high-lightness slate for maximum legibility against the dark backgrounds.

## Typography

This design system employs a three-tier typographic strategy:
1. **Sora** for headlines: Its geometric yet friendly structure provides a modern, technical feel for large displays.
2. **Inter** for body text: A highly legible sans-serif that ensures clarity in complex agricultural advice and data descriptions.
3. **JetBrains Mono** for technical labels: Used for metadata, "Powered by" tags, and coordinate data to reinforce the "satellite-tech" narrative.

Hierarchy is established through significant scale differences between hero text and body content, utilizing tight line-heights for headlines to maintain impact.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop, centering content within a 1280px container to ensure readability. 

- **Hero Section:** Uses a full-width background image with a left-aligned content stack. A data-summary bar is anchored to the bottom of the hero section, bridging the gap between the header and the main content.
- **Three-Column Grid:** Features are organized into a strict three-column layout on desktop. These columns reflow to a single-column stack on mobile devices.
- **Vertical Rhythm:** Large section gaps (120px+) are used to provide breathing room between distinct information blocks, emphasizing the "clean" and "open" brand personality.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** rather than heavy shadows. 
- **Level 0 (Base):** The primary neutral background.
- **Level 1 (Cards/Containers):** Slightly lighter navy or translucent glass layers (backdrop-blur: 12px) to lift elements off the background.
- **Level 2 (Interaction):** Subtle, low-opacity green glows (bloom effects) are used for active states or primary buttons to simulate a digital "radar" or "screen" feel.

Outlines are kept thin and low-contrast (#1E293B) to maintain a sleek, seamless appearance.

## Shapes

The design system uses a **Rounded** (0.5rem) baseline. This softens the technical edges of the data-heavy interface, making it feel more approachable for the agricultural sector. 

- **Buttons & Inputs:** Follow the 0.5rem (8px) standard.
- **Feature Cards:** Utilize `rounded-xl` (24px) to create a distinct containerized look.
- **Status Tags/Chips:** Use a full pill-shape to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid green (#16A34A) background with white text. Includes a trailing arrow icon.
- **Secondary/Ghost:** Transparent background with a thin border.
- **Tertiary:** Pure text with a subtle underline or arrow on hover.

### Feature Cards
Feature cards are white or very light gray in light sections, and deep navy in dark sections. They feature:
- A top-aligned icon in a colored square container (rounded-lg).
- A Sora-weight headline.
- Bulleted lists for feature details.
- A "footer" link with an arrow icon.

### Input Fields
Search bars in the hero section are large, white, and pill-shaped or heavily rounded, containing a search icon and a high-contrast placeholder.

### Data Chips
Small, low-contrast capsules used for "Available Languages" or "Filter Tags." They use JetBrains Mono for a technical, utility-first appearance.