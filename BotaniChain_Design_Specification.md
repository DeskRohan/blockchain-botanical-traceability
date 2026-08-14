# Design Specification Document (LLM Build Guide)

## Project

**Product:** Blockchain-Based Botanical Traceability System for Ayurvedic Herbs  
**Goal:** Build a premium SaaS-style product website inspired by the visual theme of the Hostinger “Poveda” template.

---

# 1. Design Intent

Create a **luxury, calm, trustworthy, and modern** website that feels like a premium health-tech or sustainability product.

The site should communicate:

- Trust
- Transparency
- Authenticity
- Scientific credibility
- Government-grade reliability
- Natural wellness

The aesthetic must feel **editorial rather than corporate**.

---

# 2. Visual Theme

## Overall Style

- Minimalist
- Spacious
- Soft neutral background
- Large typography
- Rounded cards
- Subtle shadows
- Organic imagery
- Warm beige + sage green palette

Avoid:

- Bright saturated colors
- Heavy gradients
- Neon effects
- Dense layouts
- Complex animations

---

# 3. Color System

## Primary Palette

- Background: `#F6F1E7`
- Surface: `#FBF8F2`
- Primary Text: `#1E1E1B`
- Secondary Text: `#5B5B55`
- Accent Green: `#5E7C5A`
- Accent Green Dark: `#3F5C3B`
- Border: `#E4DDD0`
- Success: `#4F7A4F`

Use mostly neutral backgrounds with green only for CTAs and highlights.

---

# 4. Typography

## Font Pairing

Use Google Fonts:

### Headings

- **Cormorant Garamond**
- Weight: 600–700

### Body

- **Inter**
- Weight: 400–500

### Scale

- H1: 64px desktop / 42px mobile
- H2: 44px desktop / 32px mobile
- H3: 28px
- Body: 18px
- Small: 15px

Headings should have tight line-height (1.05–1.15).

---

# 5. Layout System

## Container

- Max width: **1200px**
- Horizontal padding: **24px mobile / 48px desktop**

## Vertical Rhythm

- Section padding: **120px desktop / 80px mobile**
- Card padding: **32px**
- Grid gap: **32px**

Use generous whitespace everywhere.

---

# 6. Page Structure

## Single-page Landing Site

1. Sticky Header
2. Hero
3. Trust Metrics
4. Problem Statement
5. Solution Overview
6. How It Works
7. Feature Grid
8. Supply Chain Timeline
9. QR Verification Demo
10. Stakeholders
11. Security & Compliance
12. Screenshots Preview
13. Testimonials / Government Readiness
14. FAQ
15. CTA Banner
16. Footer

---

# 7. Header

## Style

- Sticky top
- Height: 80px
- Background: semi-transparent beige with blur
- Border bottom: 1px solid `#E4DDD0`

## Left

Logo icon + text:

- **BotaniChain**
- small subtitle: “Ayurvedic Traceability”

## Right Navigation

- Features
- Workflow
- Verification
- Dashboard
- Contact

## CTA Button

“Request Demo”

Button:

- Background `#1E1E1B`
- Text `#FFFFFF`
- Radius `999px`
- Height `48px`

---

# 8. Hero Section

## Layout

Two-column desktop / stacked mobile.

### Left Content

Eyebrow:
“Ministry of AYUSH • Blockchain Traceability”

Headline:
**Trace every Ayurvedic herb from farm to formulation.**

Body:
“Geo-tagged collection, laboratory verification, blockchain-backed audit trails, and QR-based consumer authentication in one trusted platform.”

Buttons:

- Primary: “View Traceability Demo”
- Secondary: “See Workflow”

### Right Content

Large rounded image card showing:

- Ayurvedic herbs
- farmer in field
- GPS map pin
- QR code overlay
- soft shadow

Background should remain light beige.

---

# 9. Trust Metrics

Four centered cards:

- 100% Batch Traceability
- Geo-tagged Source Records
- QR Product Verification
- Immutable Audit Trail

Cards:

- White surface
- Radius 24px
- Soft shadow
- Large number + small label

---

# 10. Problem Section

Use a split layout.

Left: short paragraph.

Right: checklist cards with icons:

- Adulteration risk
- Unknown origin
- Manual records
- Compliance difficulty
- Low consumer trust

Use muted icons and thin borders.

---

# 11. Solution Overview

Large centered heading.

Below: three horizontal feature cards:

1. Geo-tagged Collection
2. Blockchain Tracking
3. Consumer Verification

Each card:

- Icon top-left
- Title
- Two-line description
- Radius 28px

---

# 12. How It Works

Use a **vertical timeline** with connecting line.

Steps:

1. Farmer collects herb
2. GPS captured
3. Batch created
4. Lab tests uploaded
5. Manufacturer formulates product
6. QR code generated
7. Consumer verifies authenticity

Add simple line icons and subtle hover elevation.

---

# 13. Feature Grid

3-column desktop / 1-column mobile.

Features:

- Role-based access
- Laboratory reports
- Batch history
- Inventory tracking
- Regulatory dashboard
- Export documentation

Use white cards with light borders.

---

# 14. Supply Chain Visualization

Create a horizontal process diagram with rounded nodes:

Farmer → Collection Center → Processor → Laboratory → Manufacturer → Retailer → Consumer

Use green connecting arrows and beige node backgrounds.

---

# 15. QR Verification Demo

Large mock phone card.

Screen should display:

- Product name
- Herb name
- Collection location map
- Lab status badge
- Manufacturing date
- Timeline

Add a real-looking QR code on the side.

---

# 16. Stakeholder Section

Use circular avatar illustrations and labels:

- Farmer
- Collector
- Laboratory
- Manufacturer
- Regulator
- Consumer

Arrange in a responsive grid.

---

# 17. Security & Compliance

Dark section (`#1E1E1B`) with light text.

Use two-column checklist:

- Firebase Authentication
- Role-based permissions
- HTTPS encryption
- Audit logs
- Secure document storage
- Tamper-resistant records

Add a subtle green glow behind icons.

---

# 18. Dashboard Preview

Display three overlapping browser-window mockups:

- Regulator dashboard
- Manufacturer dashboard
- Traceability analytics

Use rounded corners and soft shadows.

---

# 19. Testimonials / Readiness

Two large quote cards.

Example:
“Designed to support transparent herbal sourcing and regulatory confidence.”

Add a small “SIH 2025 Ready” badge.

---

# 20. FAQ

Accordion component with smooth height animation.

Questions:

- How is traceability ensured?
- Can consumers verify products?
- What data is stored?
- Is GPS mandatory?
- Can regulators access all records?

---

# 21. Final CTA Banner

Full-width rounded banner.

Headline:
**Build trust into every Ayurvedic product.**

Buttons:

- “Request Pilot”
- “Download PRD”

Background: dark green with beige text.

---

# 22. Footer

Four columns:

- Product
- Resources
- Compliance
- Contact

Bottom row:

- Copyright
- Privacy Policy
- Terms
- LinkedIn / GitHub icons

Background `#171714`.

---

# 23. Motion Design

Use subtle motion only.

### Allowed

- Fade-in on scroll (200–400ms)
- Card lift on hover
- Button scale 1.02
- Accordion expand

### Avoid

- Parallax
- Heavy transforms
- Continuous floating objects

Use Framer Motion if implemented.

---

# 24. Imagery Direction

Use warm natural photography:

- Medicinal herbs
- Ayurvedic ingredients
- Farmers in fields
- Laboratory testing
- Hands holding herbs
- Packaging with QR labels

Apply:

- Slight desaturation
- Warm tint
- Rounded corners (32px)

---

# 25. Accessibility

- Minimum contrast ratio 4.5:1
- Focus-visible outlines
- Keyboard navigable menus
- Alt text for all images
- Buttons minimum height 44px

---

# 26. Responsive Rules

## Mobile

- Single-column layout
- Hero image below text
- H1 = 42px
- Section padding = 80px
- Sticky header reduced to 68px

## Tablet

- Two-column sections may stack at 900px breakpoint.

---

# 27. Technical Implementation Targets

Use:

- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React icons

No component library; build custom components.

---

# 28. Component Inventory

- Header
- Hero
- MetricCard
- ProblemCard
- FeatureCard
- TimelineStep
- ProcessDiagram
- QRPhoneMockup
- StakeholderCard
- SecurityChecklist
- DashboardMockup
- TestimonialCard
- FAQAccordion
- CTASection
- Footer

---

# 29. Tone of Copy

Voice:

- Calm
- Confident
- Scientific
- Trustworthy
- Human-centered

Avoid marketing hype such as “revolutionary”, “disruptive”, or “world’s best”.

Prefer:

- “verified”
- “traceable”
- “authenticated”
- “compliant”
- “transparent”
- “trusted”

---

# 30. LLM Build Instruction

Generate a **fully responsive React + TypeScript + Tailwind CSS landing page** that follows every section, spacing, color, typography, and component rule in this document. The final result should visually resemble a premium Hostinger editorial template while being customized for the Ayurvedic traceability product.
