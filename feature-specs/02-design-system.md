Read `AGENTS.md` and `context/ui-context.md` before starting.

Add the shared design system in `packages/ui`.

## Implementation

Install and configure `shadcn/ui` inside `packages/ui`.

Add these shadcn components:

- Button
- Card
- Dialog
- Input
- Tabs
- Textarea
- ScrollArea
- Switch

Also install `lucide-react`.

Define the Catppuccin Mocha CSS custom properties from
`context/ui-context.md` in a shared stylesheet exported by `packages/ui`.

Create a reusable `cn()` helper for merging Tailwind classes.

Build one shared component not covered by shadcn defaults: a
`RecordingIndicator` — a pulsing dot using `--state-recording`, with an
`active` boolean prop.

## Scope Limits

- Components must only use the CSS variable tokens, no raw hex values.
- Do not build any feature-specific components yet (no capture button,
  no output view) — primitives and the recording indicator only.

## Check When Done

- Both `apps/extension` and `apps/desktop` can import components from
  `packages/ui` and render with the Catppuccin Mocha theme applied.
- `RecordingIndicator` visibly pulses when `active` is true.
- No default (light) shadcn styling appears anywhere.
