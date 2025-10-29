# foxx.pet

foxx.pet is the codebase for the public portfolio and commission site of Faelis Paw Artistry. The site is built with [Astro](https://astro.build) and ships two workspaces – a **dev** app for local iteration and a **prod** app that mirrors the production deployment. Shared helper scripts live in the repository root.

## Repository layout

```
.
├── app/
│   ├── dev/   # Local development workspace (Astro project)
│   └── prod/  # Production workspace (Astro project)
├── config/    # Deployment helpers (Apache vhost, shell scripts)
├── scripts/   # Shared maintenance scripts
├── makefile   # Utility tasks for the repo owner
└── package.json
```

Each workspace has its own `astro.config.mjs`, `package.json`, and `tsconfig.json`, but they share the same content, assets, and styling through the monorepo setup.

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run the dev workspace**
   ```bash
   npm run dev:dev
   ```
   This starts the Astro dev server for `app/dev`.
3. **Build the prod workspace**
   ```bash
   npm run build:prod
   ```
   Use `npm run preview:prod` to inspect the generated production build locally.

### Synchronising gallery content

Artwork and gallery manifests are fetched from an Immich instance via `scripts/fetch-immich.mjs`. The script is exposed through npm scripts:

```bash
# Populate development galleries
npm run fetch:dev

# Populate production galleries
npm run fetch:prod
```

Provide the following environment variables in `app/<target>/.env` before running a fetch:

| Variable | Purpose |
| --- | --- |
| `IMMICH_BASE_URL` (or `IMMICH_URL`) | Base URL of the Immich server (e.g. `https://i.foxx.pet`). |
| `IMMICH_API_KEY` | Immich API key with access to the referenced albums. |
| `IMMICH_ALBUMS` | Comma separated map of gallery slugs to Immich album IDs (`slug:uuid,slug:uuid`). |
| `IMMICH_BESTOF_SHARED_LINK` | Optional shared link ID or key for the curated “best of” gallery. |

The script downloads assets into `app/<target>/src/assets/galleries/<slug>/`, renders thumbnails and resized images via Sharp, and writes JSON indices to `app/<target>/src/content/galleries/index/`. The manifest stored at `app/<target>/src/content/galleries/manifest.json` is regenerated automatically and only references slugs supplied through `IMMICH_ALBUMS`.

## Content architecture

Content collections are defined with `astro:content` in [`app/dev/src/content/config.ts`](app/dev/src/content/config.ts) and currently only cover gallery image metadata. Shared navigation, page copy, and descriptions are centralised in [`app/dev/src/content/site.ts`](app/dev/src/content/site.ts) so both workspaces can reuse the same wording.

### Reusing the start page

If you want to create your own landing page while keeping the site layout, the `StartPage.astro` component now accepts props so it can serve as a reusable template. See [`docs/start-page-template.md`](docs/start-page-template.md) for a walkthrough.

## Typography guidelines

Typography tokens are centralised in [`app/dev/src/styles/tokens.css`](app/dev/src/styles/tokens.css) and implemented in [`app/dev/src/styles/typography.css`](app/dev/src/styles/typography.css).

### Font stacks

- **Primary font family** – `Grandstander` with a system sans-serif fallback. Used for body copy and the default site type.
- **Secondary font family** – `Fuzzy Bubbles`, falling back to the primary stack. Applied to display elements such as headings, navigation links, pricing table highlights, and accent chips.
- **Font weights** – Normal text uses `var(--normal-font-weight)` (400) and emphasis uses `var(--bold-font-weight)` (700).

Fonts are preloaded in the shared layout (`@Layout/Main.astro`) to avoid layout shifts.

### Type scale tokens

| Token | Clamp range | Typical usage |
| --- | --- | --- |
| `--font-size-s` | `clamp(.95rem, .54rem + .4vw, 1.05rem)` | Captions, footer text, chips. |
| `--font-size-m` | `clamp(1.08rem, .66rem + .55vw, 1.2rem)` | Default body text. |
| `--font-size-l` | `clamp(1.38rem, .85rem + .9vw, 1.65rem)` | Secondary headings (`h2`). |
| `--font-size-xl` | `clamp(1.78rem, 1.1rem + 1.3vw, 2.2rem)` | Primary headings (`h1`). |

Complementary rhythm tokens:

- Line heights: `--line-height-s` (1.5), `--line-height-m` (1.35), `--line-height-l` (1.2), `--line-height-xl` (1.15).
- Letter spacing: `--letter-spacing-s` (.005em), `--letter-spacing-m` (.02em), `--letter-spacing-l` (.04em).
- Paragraph spacing inside panels: `--flow-gap` (`clamp(.65rem, .5rem + .3vw, .95rem)`).

### Application rules

- The `body` element defaults to the primary family, medium size, and small line height for crisp reading on dark backgrounds.
- Navigation links (`.header a`) use the secondary family with bold weight, medium line height, and medium letter spacing for clearer scanability.
- The footer inherits the medium letter spacing but scales text down via `--font-size-s` for visual hierarchy.
- Panels scope most typography. Within `.panel` containers:
  - Headings reset margins, adopt the secondary family, and use the scale tokens above.
  - Paragraphs and `.prose` blocks share consistent spacing governed by `--flow-gap`.
  - Inline links inherit the panel color palette and switch to the accent color on hover/focus.
  - Lists, blockquotes, and pricing tables reuse the same rhythm tokens to stay aligned with prose.
- Table-specific styles promote key data: headers become bold, subtitle rows keep a medium line height, and note chips stay compact using the small font size token.

When introducing new components, prefer reusing these tokens instead of hard-coding values. This keeps typography in sync across dev and prod builds while letting tokens evolve in one place.

## CSS layer styleguide

The project follows a five-layer CSS architecture. Stylesheets are located in `app/dev/src/styles/` and are loaded in this order within the shared layout:

1. **`tokens.css`** – design tokens (colors, spacing, radii, shadows, fonts). Define variables only.
2. **`base.css`** – resets and baseline defaults (box sizing, body defaults, focus states, motion preferences).
3. **`typography.css`** – global typography rules scoped largely to `.panel` containers to give panels their own typographic voice.
4. **`site.css`** – structural layout for header, footer, navigation, containers, and panels.
5. **`content.css`** – reusable content modules (hero, contact widgets, gallery components, tables).
6. **`media.css`** – gallery-specific refinements such as viewer transitions.
7. **`table.css`** – pricing table refinements.

Import order matters to preserve the cascade:

```astro
import '@styles/tokens.css';
import '@styles/base.css';
import '@styles/typography.css';
import '@styles/site.css';
import '@styles/content.css';
import '@styles/media.css';
import '@styles/table.css';
```

Keep selectors narrow and lean on the shared tokens, especially when adding new modules to `content.css`. This maintains consistency with the typography rules outlined above.

## Helpful npm scripts

From the repository root you can run the following convenience commands:

| Command | Description |
| --- | --- |
| `npm run dev:dev` | Start the dev workspace in watch mode. |
| `npm run dev:prod` | Start the prod workspace locally (rarely needed). |
| `npm run build:dev` | Create a production build for the dev workspace. |
| `npm run build:prod` | Create a production build for the prod workspace. |
| `npm run preview:dev` | Preview the dev build locally. |
| `npm run preview:prod` | Preview the prod build locally. |
| `npm run fetch:dev` | Sync galleries for the dev workspace. |
| `npm run fetch:prod` | Sync galleries for the prod workspace. |
| `npm run sync:dev` | Run `astro sync` for the dev workspace. |
| `npm run sync:prod` | Run `astro sync` for the prod workspace. |

Refer to `makefile` for owner-specific deployment shortcuts.

---

This README is a starting point for broader project documentation. Extend it with deployment notes, content workflows, or additional design guidelines as the project evolves.
