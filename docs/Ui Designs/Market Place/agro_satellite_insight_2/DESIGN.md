---
name: Agro-Satellite Insight
colors:
  surface: '#FFFFFF'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#F8FAFC'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6c7a71'
  outline-variant: '#bbcac0'
  surface-tint: '#006c4b'
  primary: '#006c4b'
  on-primary: '#ffffff'
  primary-container: '#34d399'
  on-primary-container: '#00563b'
  inverse-primary: '#45dfa4'
  secondary: '#575e72'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff7'
  on-secondary-container: '#5c6277'
  tertiary: '#904c16'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffa668'
  on-tertiary-container: '#783901'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#68fcbf'
  primary-fixed-dim: '#45dfa4'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#dce2fa'
  secondary-fixed-dim: '#c0c6dd'
  on-secondary-fixed: '#141b2c'
  on-secondary-fixed-variant: '#40465a'
  tertiary-fixed: '#ffdcc7'
  tertiary-fixed-dim: '#ffb787'
  on-tertiary-fixed: '#311300'
  on-tertiary-fixed-variant: '#723600'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  text-primary: '#0C1324'
  text-secondary: '#475569'
  border-base: '#E2E8F0'
  border-muted: '#F1F5F9'
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
  unit: 8px
---

## Brand & Style

The design system is centered on "Precision Agriculture"—the intersection of organic growth and high-tech satellite monitoring. This light mode variant shifts the narrative from a "control room" feel to an "open field" aesthetic. It targets farmers, agronomists, and data scientists who require clarity and transparency.

The style is **Corporate / Modern** with a focus on **Minimalism**. By utilizing a white and light-slate base, the design emphasizes openness and legibility. The signature **Emerald Green** remains the focal point, now acting as a vibrant symbol of health and vitality against a crisp, clean background. The aesthetic is professional and data-driven, using generous white space to reduce cognitive load when viewing complex agricultural data.

## Colors

The light mode palette is anchored by a pure **White (#FFFFFF)** surface to maximize brightness and clarity. The primary accent is **Emerald Green (#34D399)**, which provides a high-energy contrast against the light background for primary actions and status indicators.

**Dark Navy (#0C1324)** is reserved for primary typography and iconography to ensure AAA accessibility. A secondary scale of slates and grays handles "surface-container" roles and secondary text, creating a subtle hierarchy without the need for heavy shadows. Borders have been refined to light grays to maintain a structured but "airy" feel.

## Typography

This design system uses a technical but approachable typographic triad. **Sora** provides a geometric, modern authority for headlines. **Inter** handles the bulk of the agricultural data and advice, offering neutral and highly legible character sets. **JetBrains Mono** is utilized specifically for coordinates, satellite metadata, and technical labels to reinforce the product's technological foundation.

In light mode, weight is used strategically to maintain hierarchy against the white background, with headlines taking a bold stance in Dark Navy to ensure immediate visual anchoring.

## Layout & Spacing

The layout utilizes a **Fixed Grid** model on desktop, centered within a 1280px container. A consistent 8px spatial rhythm guides all padding and margin decisions.

- **Grid:** A 12-column grid is used for desktop layouts, typically broken into a 3-column feature pattern.
- **Sectioning:** Large vertical gaps (120px) are essential to maintain the "Minimalist" brand promise, allowing the high-contrast elements to breathe.
- **Mobile Adaptivity:** On devices smaller than 768px, columns reflow to a single-column stack, and horizontal margins shrink to 24px to maximize screen real estate.

## Elevation & Depth

Visual hierarchy in the light mode system is achieved through **Tonal Layers** and **Low-contrast outlines**. 

- **Level 0 (Base):** The primary background is #FFFFFF.
- **Level 1 (Containers):** Cards and data containers use #F8FAFC (Surface-Container) with a subtle #E2E8F0 border to define boundaries without adding visual weight.
- **Floating Elements:** Only high-priority interactive elements (like tooltips or dropdowns) utilize a very soft, diffused shadow (15% opacity Dark Navy) to indicate they sit above the main canvas.

## Shapes

The design system follows a **Rounded** (0.5rem) logic to soften the technical nature of satellite data. 

- **Standard (8px):** Used for buttons, input fields, and small UI components.
- **Large (16px - 24px):** Used for feature cards and main content containers to create a distinct, modular appearance.
- **Full (Pill):** Reserved for status badges and chips to differentiate them from square-cornered or slightly rounded interactive buttons.

## Components

### Buttons
- **Primary:** Solid Emerald Green (#34D399) with Dark Navy text for maximum legibility. 
- **Secondary:** Transparent with a 1.5px Dark Navy border.
- **Tertiary:** Dark Navy text with an icon suffix; no background or border.

### Feature Cards
Containers are styled with #F8FAFC backgrounds and a subtle #E2E8F0 border. They feature a 24px corner radius. Icons inside cards are housed in a small Emerald Green tinted square (10% opacity) to provide a splash of brand color.

### Input Fields
Inputs use a white background with a 1px #E2E8F0 border. On focus, the border transitions to Emerald Green with a subtle 2px outer glow in the same color.

### Status Chips
Status chips use JetBrains Mono. They are rendered as full-pill shapes with light background tints (e.g., light green for 'Active', light red for 'Alert') and high-contrast text.