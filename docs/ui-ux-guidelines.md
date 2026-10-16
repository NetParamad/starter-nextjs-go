# UI/UX Guidelines

This document is the shared reference for frontend look and feel in this
template. Use it when adding new pages, refining existing ones, or keeping
future UI work visually consistent.

The frontend follows the stock shadcn design system (neutral base color,
Geist Sans + Geist Mono, `0.625rem` radius) with light/dark mode via
`next-themes`. Prefer stock shadcn primitives and tokens over custom styling.

## Purpose

- Keep interaction behavior intentional instead of page-specific.
- Preserve a reusable design language for future products built on the kit.
- Document theme and motion decisions in one place instead of scattering them
  across components.

## Core Principles

- Prefer subtle motion over flashy motion.
- Keep hover states smooth, not jumpy.
- Let emphasis come from spacing, typography, and contrast before color.
- Avoid layout jolts when content or errors appear.
- Respect `prefers-reduced-motion` where motion is used.

## Theme Tokens

- All colors come from CSS variables in `frontend/src/app/globals.css`
  (`--background`, `--foreground`, `--primary`, `--muted`, `--border`, ...).
- Never hardcode palette colors in components; use utilities like
  `bg-background`, `text-muted-foreground`, `border-border`, `bg-muted`.
- Dark mode works through the `.dark` variant and the `ModeToggle` in the
  header. Every new surface must be readable in both modes: avoid hardcoded
  `bg-white`, `text-white`, or white/translucent glassmorphism.
- Fonts come from `next/font` variables (`--font-geist-sans`,
  `--font-geist-mono`) mapped in `@theme`. Body text inherits the sans font
  automatically; use `font-mono` only for code.

Current implementation:

- `frontend/src/app/globals.css`
- `frontend/src/app/layout.tsx`
- `frontend/src/components/mode-toggle.tsx`
- `frontend/src/components/providers.tsx`

## Motion

- This template ships with no scroll-reveal or entrance-animation system.
  Content renders statically; do not reintroduce reveal-on-scroll unless a
  product page explicitly needs it.
- Route changes reset scroll position via `RouteScrollReset`.
- Any motion you add must support `prefers-reduced-motion`.

Current implementation:

- `frontend/src/components/route-scroll-reset.tsx`
- `frontend/src/components/route-content-frame.tsx`
- `frontend/src/layouts/root-shell.tsx`

## Buttons

- Use stock shadcn `buttonVariants` (`default`, `destructive`, `outline`,
  `secondary`, `ghost`, `link`) and sizes (`default`, `sm`, `lg`, `icon`).
- Hover is a plain color transition (`hover:bg-primary/90`); no scaling,
  lifting, or glow effects.
- Destructive actions use the `destructive` variant with
  `text-destructive-foreground`.

Current implementation:

- `frontend/src/components/ui/button.tsx`

## Links And Navigation

- Header nav links are text-led: `text-muted-foreground`, turning
  `text-foreground` with `bg-secondary/50` on hover, `bg-secondary` when
  active.
- Body links use `text-primary` with underline on hover.
- The footer is a bordered, muted two-zone layout, not a floating card.

Current implementation:

- `frontend/src/components/site-header.tsx`
- `frontend/src/components/site-footer.tsx`

## Cards And Surfaces

- Use stock shadcn `Card` parts (`CardHeader`, `CardTitle`,
  `CardDescription`, `CardContent`, `CardFooter`) with default padding.
- Secondary panels use `bg-muted`; detail grids use plain `border`
  containers, not tinted gradients.
- Status alerts: destructive uses `border-destructive/50` +
  `bg-destructive/10` + `text-destructive`; success uses the emerald
  `500/10` + `500/30` combination with dark-mode text adjustment.

Current implementation:

- `frontend/src/components/ui/card.tsx`
- `frontend/src/components/ui/badge.tsx`
- `frontend/src/components/ui/empty-state.tsx`
- `frontend/src/components/ui/stat-card.tsx`

## Forms And Feedback

- Inputs use stock shadcn styling (`h-9`, `rounded-md`, `border-input`,
  `focus-visible:ring-ring/50`).
- Error messages should not blink out during retries if the request is still
  failing.
- Status messages should not make cards feel unstable or suddenly overflow.
- Auth cards size to their own content (`w-full` inside a centered or split
  shell).

Current implementation:

- `frontend/src/components/ui/input.tsx`
- `frontend/src/components/ui/label.tsx`
- `frontend/src/features/auth/components/auth-form-shell.tsx`
- `frontend/src/features/auth/components/auth-split-shell.tsx`
- `frontend/src/features/auth/components/auth-centered-shell.tsx`

## Backgrounds And Atmosphere

- The overall surface is plain `bg-background` in both modes. No gradients,
  radial glows, or decorative blobs.
- Native scrollbars; no custom scrollbar styling.

Current implementation:

- `frontend/src/app/globals.css`

## How To Use This Doc

- Add new interaction rules here when they become shared patterns.
- If a style is only for one page, note why before promoting it into a global
  utility.
- Prefer updating shared primitives only when the behavior is truly reusable.
- When a tweak is one-off, scope it locally and mention it here if future pages
  may want the same idea.

## Quick Checklist For Future UI Work

- Does the motion feel smooth and restrained?
- Does hover add clarity without causing layout shift?
- Does the surface read well in both light and dark mode?
- Does the effect work with the template's neutral palette and Geist type?
- Is the rule reusable enough to live in a shared primitive?
