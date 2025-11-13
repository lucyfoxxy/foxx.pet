# Stylesheet Guide

This directory now groups the global styles into a consistent set of layers:

- `tokens.css` – design tokens, colors, spacing, typography, and motion presets.
- `base.css` – reset, document background, and anchor defaults.
- `typography.css` – font-face declarations and text hierarchy.
- `site.css` – structural layout for the shell (header, footer, panel).
- `content.css` – rich text flow, content cards, and grid helpers.
- `controls.css` – reusable UI elements (chips, badges, call-to-action buttons).
- `media.css` – hero artwork, gallery frames, and lightbox controls.
- `table.css` – tabular data and definition lists.

## Suggested Next Steps

1. **Adopt CSS Cascade Layers** – wrap each stylesheet in a named `@layer` to make the cascade order explicit (`@layer tokens, base, layout, components, utilities`). Astro supports native CSS modules, so layers help tame future overrides.
2. **Break Out Component-Level Styles** – gallery, card, and button patterns could live alongside their Astro components as co-located CSS modules. Global files would shrink to only shared primitives.
3. **Introduce Light/Dark Themes** – the consolidated token file is ready for theme switching. Create additional `:root[data-theme="light"]` and `:root[data-theme="dark"]` blocks that override only the necessary tokens.
4. **Automate Linting & Formatting** – add `stylelint` (with the `stylelint-config-standard` preset) or integrate Astro’s `--experimental-asset-checks` to enforce ordering and catch regressions.
5. **Document Token Usage** – consider generating a zero-dependency style guide page that renders chips, buttons, cards, and tables using the tokens. It helps catch visual regressions during future cleanups.

The refactor also introduced motion tokens (`--transition-*`) so components can reuse consistent easing and durations when new UI elements arrive.
