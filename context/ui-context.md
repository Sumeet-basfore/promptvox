# UI Context

## Theme

Dark only. No light mode. Uses the Catppuccin Mocha palette, consistent
with the rest of the user's tooling.

All colors are defined as CSS custom properties in a shared stylesheet
in `packages/ui` and mapped to Tailwind tokens. Components must use
these tokens — no raw hex values or default Tailwind color classes.

| Role             | CSS Variable        | Hex       | Catppuccin Name |
| ---------------- | ------------------- | --------- | --------------- |
| Page background  | `--bg-base`         | `#1e1e2e` | Base            |
| Surface          | `--bg-surface`      | `#181825` | Mantle          |
| Elevated surface | `--bg-elevated`     | `#11111b` | Crust           |
| Subtle surface   | `--bg-subtle`       | `#313244` | Surface0        |
| Default border   | `--border-default`  | `#45475a` | Surface1        |
| Subtle border    | `--border-subtle`   | `#585b70` | Surface2        |
| Primary text     | `--text-primary`    | `#cdd6f4` | Text            |
| Secondary text   | `--text-secondary`  | `#bac2de` | Subtext1        |
| Muted text       | `--text-muted`      | `#a6adc8` | Subtext0        |
| Faint text       | `--text-faint`      | `#6c7086` | Overlay0        |
| Brand accent     | `--accent-primary`  | `#cba6f7` | Mauve           |
| AI accent        | `--accent-ai`       | `#89b4fa` | Blue            |
| Success          | `--state-success`   | `#a6e3a1` | Green           |
| Warning          | `--state-warning`   | `#f9e2af` | Yellow          |
| Error            | `--state-error`     | `#f38ba8` | Red             |
| Recording pulse  | `--state-recording` | `#eba0ac` | Maroon          |

## Typography

| Role      | Font                | CSS Variable  |
| --------- | ------------------- | ------------- |
| UI text   | JetBrains Mono Nerd | `--font-ui`   |
| Code/mono | JetBrains Mono Nerd | `--font-mono` |

A single monospace family is used throughout for both UI text and code,
consistent with the user's terminal and editor setup.

## Border Radius

| Context           | Class         |
| ----------------- | ------------- |
| Inline / small UI | `rounded-lg`  |
| Cards / panels    | `rounded-xl`  |
| Modal / overlay   | `rounded-2xl` |

## Component Library

shadcn/ui on top of Tailwind, shared from `packages/ui`. No app-specific
copies of primitives — both the extension popup and the desktop app
import the same component package.

## Layout Patterns

### Extension Popup

- Fixed width (~380px), variable height up to a capped max.
- Single-column: capture button at top, transcript/output view below,
  settings/history reachable via icon buttons in a header bar.

### Desktop App

- Small, focused window (not a full workspace) — capture state front
  and center, output view below, settings and history behind tabs or a
  slide-over panel.
- Always-on-top toggle available, since the app is meant to be invoked
  quickly and dismissed.

### Recording State

- A clear, high-contrast recording indicator (pulsing dot using
  `--state-recording`) is visible on both platforms whenever the
  microphone is active — this must never be ambiguous to the user.

## Icons

Lucide React. Stroke-based icons only. Icon sizes: `h-4 w-4` inline,
`h-5 w-5` for buttons, `h-8 w-8` for empty-state illustrations.
