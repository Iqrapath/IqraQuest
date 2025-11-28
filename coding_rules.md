IqraQuest Design System & Coding Rules
This document defines the design system structure, coding conventions, and best practices for the IqraQuest project.

1. Technology Stack
Frontend Framework
React 19.2 with TypeScript
Inertia.js for Laravel-React integration
Vite 7 as build tool
Styling
Tailwind CSS 4.0 with custom configuration
CSS Variables for design tokens
Custom utility classes defined in 
resources/css/app.css
UI Libraries
Radix UI for headless components (Avatar, Dialog, Dropdown, Select, etc.)
Lucide React for icons
Headless UI for additional components
class-variance-authority (CVA) for component variants
clsx and tailwind-merge for className utilities
2. Design Tokens
Location
All design tokens are defined in 
resources/css/app.css
 using CSS variables within the @theme directive.

Color System
Primary Colors
--color-midnight-blue: #1c2a3a
--color-white: #ffffff
Greyscale
--color-gray-50 through --color-gray-900
Semantic Colors
--color-deep-teal: #014737
--color-teal: #4d9b91
--color-light-teal: #a4cfc3
--color-green: #93c19e
--color-pale-green: #def7e4
Theme Variables
Light and dark mode colors are defined in :root and .dark selectors:

--background, --foreground
--primary, --secondary, --accent
--destructive, --muted
--border, --input, --ring
Typography
Font Families
Primary: Poppins (headings, body text)
Secondary: Inter (body text, buttons)
Nunito: Used for landing page components
Font Loading
Fonts are loaded via Bunny Fonts CDN in page <Head>:

<link href="https://fonts.bunny.net/css?family=poppins:300,400,500,600,700|inter:400,500,600,700|nunito:400,500,600,700,800" rel="stylesheet" />
Typography Classes
Custom utility classes for consistent typography:

Desktop: .text-h1 through .text-h5, .text-body-1, .text-body-2, .text-body-3
Tablet: .text-h1-tablet through .text-h6-tablet
Mobile: .text-h1-mobile through .text-h6-mobile
Body: .text-body-xl, .text-body-lg, .text-body-s-*, .text-body-xs-*
Button: .text-button
Spacing & Radius
--radius: 0.625rem (10px)
--radius-lg: var(--radius)
--radius-md: calc(var(--radius) - 2px)
--radius-sm: calc(var(--radius) - 4px)
3. Component Architecture
Component Location
UI Components: resources/js/components/ui/ (Radix-based, reusable)
App Components: resources/js/components/ (app-specific)
Landing Components: resources/js/components/landing/ (marketing pages)
Pages: resources/js/pages/ (Inertia pages)
Layouts: resources/js/layouts/ (page layouts)
Component Patterns
UI Components
Use CVA for variant-based styling:

import { cva, type VariantProps } from 'class-variance-authority';
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "...",
        outline: "...",
      },
      size: {
        default: "...",
        sm: "...",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
Utility Function
Use cn() from resources/js/lib/utils.ts for className merging:

import { cn } from '@/lib/utils';
<div className={cn("base-class", conditionalClass && "extra-class", className)} />
Inertia.js Patterns
Page Components
import { Head, Link, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
export default function PageName() {
    const { auth } = usePage<SharedData>().props;
    
    return (
        <>
            <Head title="Page Title" />
            {/* content */}
        </>
    );
}
Route Helpers
Import from @/routes:

import { dashboard, login, register } from '@/routes';
<Link href={dashboard()}>Dashboard</Link>
4. Styling Approach
Tailwind CSS Usage
Prefer Tailwind classes for most styling
Use arbitrary values for exact Figma values: bg-[#fff7e4], px-[80px], text-[21px]
Use custom utilities from app.css for typography
Use semantic color variables when possible: bg-primary, text-foreground
Dark Mode
Use the dark: variant for dark mode styles
Dark mode is toggled via .dark class on root element
Custom dark mode variant: @custom-variant dark (&:is(.dark *))
Responsive Design
Mobile-first approach
Breakpoints: sm:, md:, lg:, xl:, 2xl:
Use responsive typography classes for tablet/mobile
5. Asset Management
Images
Location: public/images/
Reference: /images/filename.png (absolute path from public)
Optimization: Use appropriate formats (PNG, JPG, WebP)
Icons
Primary: Iconify (https://icon-sets.iconify.design/)
Installation: Install @iconify/react package
Usage: Browse icon sets at https://icon-sets.iconify.design/ and use the icon name
import { Icon } from '@iconify/react';
// Material Design Icons
<Icon icon="mdi:home" className="h-[clamp(1rem,2vw,1.5rem)] w-[clamp(1rem,2vw,1.5rem)]" />
// Font Awesome
<Icon icon="fa:user" className="h-[clamp(1rem,2vw,1.5rem)] w-[clamp(1rem,2vw,1.5rem)]" />
// Heroicons
<Icon icon="heroicons:menu-alt-3" className="h-[clamp(1rem,2vw,1.5rem)] w-[clamp(1rem,2vw,1.5rem)]" />
// With color
<Icon icon="mdi:heart" className="h-6 w-6 text-red-500" />
Icon Sets Available:

Material Design Icons: mdi:icon-name
Font Awesome: fa:icon-name, fa-solid:icon-name, fa-brands:icon-name
Heroicons: heroicons:icon-name
Bootstrap Icons: bi:icon-name
Feather Icons: feather:icon-name
And 100+ more icon sets
Best Practices:

Use responsive sizing with clamp(): h-[clamp(1rem,2vw,1.5rem)] w-[clamp(1rem,2vw,1.5rem)]
Apply colors with Tailwind: text-primary, text-[#317b74]
Search for icons at: https://icon-sets.iconify.design/
6. File Organization
resources/
├── css/
│   └── app.css          # Design tokens, utilities
├── js/
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   ├── landing/     # Landing page components
│   │   └── *.tsx        # App-specific components
│   ├── layouts/         # Page layouts
│   ├── pages/           # Inertia pages
│   ├── lib/
│   │   └── utils.ts     # Utility functions (cn)
│   ├── types/           # TypeScript types
│   └── app.tsx          # App entry point
└── views/
    └── app.blade.php    # Laravel view template
7. Code Style & Conventions
TypeScript
Use TypeScript for all React components
Define prop types with interfaces or types
Use SharedData type for Inertia props
Naming Conventions
Components: PascalCase (Navbar.tsx, Button.tsx)
Files: kebab-case for non-components (utils.ts, app.css)
CSS Variables: kebab-case (--color-primary)
Tailwind Classes: Use exact Figma values in arbitrary syntax
Import Aliases
import { Component } from '@/components/ui/component';
import { SharedData } from '@/types';
import { cn } from '@/lib/utils';
import { route } from '@/routes';
Component Structure
import statements
interface Props {
  // prop types
}
export default function ComponentName({ prop1, prop2 }: Props) {
  // hooks
  // handlers
  
  return (
    // JSX
  );
}
8. Figma Design Implementation
Color Matching
Use arbitrary values for exact Figma colors: bg-[#317b74]
Match exact spacing from Figma: px-[80px], gap-[40px]
Use exact font sizes: text-[21px]
Font Families
Use arbitrary font-family syntax: font-['Nunito']
Ensure fonts are loaded in page <Head>
Layout
Match exact dimensions from Figma
Use flexbox for layouts: flex, items-center, justify-between
Use grid when appropriate
9. Best Practices
Performance
Use React.memo() for expensive components
Lazy load heavy components
Optimize images
Accessibility
Use semantic HTML
Include alt text for images
Ensure keyboard navigation
Use ARIA attributes when needed
Code Quality
3. Component Architecture
Component Location
UI Components: resources/js/components/ui/ (Radix-based, reusable)
App Components: resources/js/components/ (app-specific)
Landing Components: resources/js/components/landing/ (marketing pages)
Pages: resources/js/pages/ (Inertia pages)
Layouts: resources/js/layouts/ (page layouts)
Component Patterns
UI Components
Use CVA for variant-based styling:

import { cva, type VariantProps } from 'class-variance-authority';
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "...",
        outline: "...",
      },
      size: {
        default: "...",
        sm: "...",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
Utility Function
Use cn() from resources/js/lib/utils.ts for className merging:

import { cn } from '@/lib/utils';
<div className={cn("base-class", conditionalClass && "extra-class", className)} />
Inertia.js Patterns
Page Components
import { Head, Link, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
export default function PageName() {
    const { auth } = usePage<SharedData>().props;
    
    return (
        <>
            <Head title="Page Title" />
            {/* content */}
        </>
    );
}
Route Helpers
Import from @/routes:

import { dashboard, login, register } from '@/routes';
<Link href={dashboard()}>Dashboard</Link>
4. Styling Approach
Tailwind CSS Usage
Prefer Tailwind classes for most styling
Use arbitrary values for exact Figma values: bg-[#fff7e4], px-[80px], text-[21px]
Use custom utilities from app.css for typography
Use semantic color variables when possible: bg-primary, text-foreground
Dark Mode
Use the dark: variant for dark mode styles
Dark mode is toggled via .dark class on root element
Custom dark mode variant: @custom-variant dark (&:is(.dark *))
Responsive Design
Mobile-first approach
Breakpoints: sm:, md:, lg:, xl:, 2xl:
Use responsive typography classes for tablet/mobile
5. Asset Management
Images
Location: public/images/
Reference: /images/filename.png (absolute path from public)
Optimization: Use appropriate formats (PNG, JPG, WebP)
Icons
Primary: Lucide React icons
import { IconName } from 'lucide-react';
<IconName className="h-4 w-4" />
6. File Organization
resources/
├── css/
│   └── app.css          # Design tokens, utilities
├── js/
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   ├── landing/     # Landing page components
│   │   └── *.tsx        # App-specific components
│   ├── layouts/         # Page layouts
│   ├── pages/           # Inertia pages
│   ├── lib/
│   │   └── utils.ts     # Utility functions (cn)
│   ├── types/           # TypeScript types
│   └── app.tsx          # App entry point
└── views/
    └── app.blade.php    # Laravel view template
7. Code Style & Conventions
TypeScript
Use TypeScript for all React components
Define prop types with interfaces or types
Use SharedData type for Inertia props
Naming Conventions
Components: PascalCase (Navbar.tsx, Button.tsx)
Files: kebab-case for non-components (utils.ts, app.css)
CSS Variables: kebab-case (--color-primary)
Tailwind Classes: Use exact Figma values in arbitrary syntax
Import Aliases
import { Component } from '@/components/ui/component';
import { SharedData } from '@/types';
import { cn } from '@/lib/utils';
import { route } from '@/routes';
Component Structure
import statements
interface Props {
  // prop types
}
export default function ComponentName({ prop1, prop2 }: Props) {
  // hooks
  // handlers
  
  return (
    // JSX
  );
}
8. Figma Design Implementation
Color Matching
Use arbitrary values for exact Figma colors: bg-[#317b74]
Match exact spacing from Figma: px-[80px], gap-[40px]
Use exact font sizes: text-[21px]
Font Families
Use arbitrary font-family syntax: font-['Nunito']
Ensure fonts are loaded in page <Head>
Layout
Match exact dimensions from Figma
Use flexbox for layouts: flex, items-center, justify-between
Use grid when appropriate
9. Best Practices
Performance
Use React.memo() for expensive components
Lazy load heavy components
Optimize images
Accessibility
Use semantic HTML
Include alt text for images
Ensure keyboard navigation
Use ARIA attributes when needed
Code Quality
Run npm run lint before committing
Run npm run format to format code
Use TypeScript strict mode
Write descriptive component names
Scaling & Responsiveness
Test layouts on multiple viewport sizes
Prefer flexible grids and containers
Avoid pixel-perfect copying; emulate design proportionally
Use Tailwind's responsive variants for all scalable components
Use clamp() for fluid typography and spacing
State Management
Use Inertia.js for server state
Use React hooks for local state
Avoid prop drilling (use context if needed)
Documentation & Changelog
README.md: Keep updated with project overview, setup, and recent changes
Development Log: Document major updates in README.md under "Development Log" section
Commit Messages: Use descriptive messages (e.g., "feat: add responsive navbar", "fix: icon sizing")
Code Comments: Add comments for complex logic, not obvious code
Update Log Format:
#### YYYY-MM-DD
- ✅ Feature/change description
- 🐛 Bug fix description
- 📝 Documentation update
When to Update README:

New features or components added
Major architectural changes
New dependencies installed
Design system updates
Breaking changes
10. Figma → Tailwind Conversion Guide
Base Rules
Avoid fixed pixels for main layout – use rem, %, vw, vh, or clamp() for sizes.

Responsive Containers
Wrap all main sections in a responsive container:

<div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
  {/* content */}
</div>
Flex & Grid Layouts
Use for alignment, spacing, and responsive layouts:

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[clamp(1rem,2vw,2rem)]">
  {/* cards */}
</div>
Typography Scaling
Responsive Font Sizes
<h1 className="text-[clamp(1.5rem,4vw,3rem)] font-bold">Heading</h1>
<p className="text-[clamp(1rem,2vw,1.25rem)]">Body text</p>
Font Families
Match Figma fonts using arbitrary syntax:

font-['Nunito'] // for headings or special components
Line Height
Scale with font size:

leading-[clamp(1.2rem,2.5vw,2rem)]
Spacing & Padding
Convert Figma pixel values to proportional spacing:

px-[clamp(1rem,2vw,3rem)] // horizontal padding
py-[clamp(0.5rem,1vw,1.5rem)] // vertical padding
gap-[clamp(1rem,2vw,2rem)] // spacing between flex/grid items
Use flexbox gap instead of margin for child spacing.

Colors & Themes
Semantic Colors (Preferred)
bg-primary
text-foreground
hover:bg-accent
Exact Figma Colors
Use Tailwind arbitrary syntax:

bg-[#317b74]
text-[#ffffff]
Dark Mode
Always toggle with .dark class:

dark:bg-[#1c2a3a]
dark:text-[#def7e4]
Images & Icons
Responsive Images
<img src="/images/photo.png" className="max-w-full h-auto" />
Scalable Icons
<IconName className="h-[clamp(1rem,2vw,2rem)] w-[clamp(1rem,2vw,2rem)]" />
Figma to Tailwind Conversion Table
Figma Property	Tailwind Equivalent
Absolute Width/Height (px)	clamp(min, vw%, max) or % or rem
Spacing (px)	gap-[clamp(...)], px-[clamp(...)], py-[clamp(...)]
Font Size	text-[clamp(...)]
Rounded Corners	rounded-[value]
Shadows	shadow, shadow-md, or shadow-[0_4px_6px_rgba(0,0,0,0.1)]
Color	Semantic bg-primary or bg-[#hex]
Flex Alignment	flex, items-center, justify-between
Grid Layout	grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[clamp(...)]
Component Conversion Template
import { cn } from '@/lib/utils';
interface ComponentProps {
  title: string;
  subtitle?: string;
  image?: string;
}
export default function Card({ title, subtitle, image }: ComponentProps) {
  return (
    <div className="flex flex-col items-start gap-[clamp(0.5rem,1vw,1rem)] rounded-[1rem] bg-white p-[clamp(1rem,2vw,2rem)] shadow-md dark:bg-midnight-blue">
      {image && <img src={image} className="h-auto w-full rounded-[0.5rem]" />}
      <h3 className="font-['Nunito'] text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold">
        {title}
      </h3>
      {subtitle && <p className="text-[clamp(1rem,2vw,1.25rem)]">{subtitle}</p>}
    </div>
  );
}
AI Coding Agent Guidelines
When converting Figma designs to code:

Default scaling: Convert all Figma dimensions into clamp(min, vw, max) automatically
Containers: Wrap sections in responsive max-width containers
Flex/Grid layout: Prefer flex/grid over absolute positioning
Typography: Always use scalable units; never copy raw Figma pixels
Spacing: Convert gaps/margins to clamp() or % for responsive design
Colors: Use semantic variables, fallback to Figma hex if missing
Dark Mode: Include .dark: variants automatically
Images & Icons: Scale with max-w-full h-auto or clamp()
Key Rule: Always wrap spacing, font, and container values in clamp() for scaling. Avoid hard-coded px unless it's a fixed UI element (like borders).

Figma → Tailwind Automated Scaling System
Goal: Every pixel from Figma is automatically converted to a responsive Tailwind-friendly size.

Base Formula: px → clamp() → Tailwind
clamp(minSize, (px / designWidth) * 100vw, maxSize)
px: the pixel value in Figma
designWidth: width of the Figma artboard (e.g., 1440px)
minSize: minimum readable size (rem)
maxSize: maximum size before it stops growing (rem)
Example:

Figma heading = 48px, designWidth = 1440px, min = 2rem, max = 4rem:

text-[clamp(2rem, 48/1440*100vw, 4rem)]
// Automatically becomes:
text-[clamp(2rem,3.33vw,4rem)]
Scaling Rules
Typography:

// Heading / Body / Button
text-[clamp(min, px/designWidth*100vw, max)]
// Line-height (scale proportionally)
leading-[clamp(min, px/designWidth*100vw, max)]
Spacing / Padding / Margin:

p-[clamp(0.5rem, 20/1440*100vw, 1.5rem)]
m-[clamp(0.5rem, 16/1440*100vw, 1rem)]
gap-[clamp(0.5rem, 24/1440*100vw, 2rem)]
Borders / Radius:

rounded-[clamp(0.25rem, 8/1440*100vw, 1rem)]
Icons / Images:

w-[clamp(1rem, 32/1440*100vw, 2rem)]
h-[clamp(1rem, 32/1440*100vw, 2rem)]
Automation Strategy for AI Agent
Input: Figma JSON or design tokens (px values, font sizes, spacing)

Step 1: Identify designWidth (default 1440px)
Step 2: Map px → clamp() using formula
Step 3: Generate Tailwind class:
text-[clamp(minRem, (px/designWidth*100)vw, maxRem)]
px-[clamp(minRem, (px/designWidth*100)vw, maxRem)]
Step 4: Add responsive breakpoints automatically:
sm:text-[clamp(...)]
md:text-[clamp(...)]
lg:text-[clamp(...)]
Step 5: Combine semantic variables when possible:
bg-[var(--primary)]
text-[clamp(1rem,2vw,1.25rem)]
Recommended Defaults
Type	Min (rem)	Max (rem)	Notes
Heading	1.5	4	h1–h6
Body text	1	1.5	p, span
Button text	0.875	1.25	font-medium
Spacing	0.25	2	padding, margin, gap
Border/radius	0.25	1	rounded corners
Icon size	1	2	scalable SVG icons
Example Conversion
Figma input:

Heading: 48px
Body: 16px
Padding: 32px
Radius: 8px
Tailwind output:

<h1 className="text-[clamp(2rem,3.33vw,4rem)] font-bold font-['Nunito']">
  Title
</h1>
<p className="text-[clamp(1rem,1.11vw,1.25rem)]">
  Body text here
</p>
<div className="p-[clamp(0.5rem,2.22vw,2rem)] rounded-[clamp(0.25rem,0.55vw,1rem)] bg-primary">
  Content box
</div>
Tips for AI Agent Implementation
Always read Figma designWidth to scale everything
Convert all px values → clamp()
Use arbitrary Tailwind syntax for precision
Add dark mode variants automatically: .dark:bg-[#1c2a3a]
Apply mobile-first scaling, then add sm:, md:, lg: overrides
11. Common Patterns
Button Component
import { cn } from '@/lib/utils';
<button className={cn(
  "rounded-[56px] bg-[#338078] px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.5rem,1vw,0.75rem)]",
  "font-['Nunito'] text-[clamp(0.875rem,1.5vw,1rem)] font-medium text-white",
  "hover:bg-[#2a6b64] transition-colors"
)}>
  Button Text
</button>
Link Component
import { Link } from '@inertiajs/react';
<Link 
  href="/path"
  className="text-[#317b74] hover:opacity-80 text-[clamp(0.875rem,1.5vw,1rem)]"
>
  Link Text
</Link>
Responsive Navigation
<nav className="sticky top-0 z-50 w-full bg-[#fff7e4] px-[clamp(1rem,5vw,5rem)] py-[clamp(1rem,2vw,2rem)]">
  <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-[clamp(2rem,5vw,6rem)]">
    {/* Logo, Nav Links, Actions */}
  </div>
</nav>
Last Updated: 2025-11-27 Version: 2.0
