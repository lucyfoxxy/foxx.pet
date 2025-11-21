# Style and Token Audit

This document captures the CSS class selectors and design tokens defined in `app/dev/src/styles` and shows where they are used across Astro pages, components, scripts, and supporting styles. File counts include Astro components/pages, JavaScript utilities, and structured content files. JSON usage totals are aggregated by folder to keep the report concise.

## Overview

| Stylesheet | Classes Defined | Tokens Defined |
| --- | ---: | ---: |
| `src/styles/base.css` | 2 | 0 |
| `src/styles/bg.css` | 2 | 0 |
| `src/styles/content.css` | 27 | 2 |
| `src/styles/controls.css` | 28 | 5 |
| `src/styles/media.css` | 18 | 1 |
| `src/styles/site.css` | 4 | 0 |
| `src/styles/site_footer.css` | 12 | 0 |
| `src/styles/site_header.css` | 9 | 0 |
| `src/styles/table.css` | 13 | 0 |
| `src/styles/tokens.css` | 0 | 108 |
| `src/styles/typography.css` | 16 | 2 |

Total unique classes: 110  
Total unique tokens: 117

## Classes by Stylesheet

### `src/styles/base.css`

| Class | Selector Count | Total Uses | Usage Locations |
| --- | ---: | ---: | --- |
| `header__nav` | 6 | 1 | `src/components/Templates/Base/Header.astro` (1) |
| `panel` | 11 | 1 | `src/components/Templates/Base.astro` (1) |

### `src/styles/bg.css`

| Class | Selector Count | Total Uses | Usage Locations |
| --- | ---: | ---: | --- |
| `section` | 1 | 109 | `src/components/StaticPages/ImprintPage.astro` (4)<br>`src/components/StaticPages/StartPage.astro` (8)<br>`src/components/Templates/EntryBlog.astro` (6)<br>`src/components/Views/Category.astro` (12)<br>`src/components/Views/Entry.astro` (11)<br>`src/components/Views/Section.astro` (8)<br>`src/components/utils/getEntries.ts` (10)<br>`src/content/blog/noms/baking/cosmic-cinnamon-rolls.md` (1)<br>`src/content/blog/noms/cooking/meteorite-stew.md` (1)<br>`src/content/blog/tails/live-and-love/literally-made-for-each-other.md` (1)<br>`src/content/blog/tails/lucys-journeys/starlit-liftoff.md` (1)<br>`src/content/config.ts` (3)<br>`src/pages/frames/[slug].astro` (2)<br>`src/pages/noms/[category]/[entry].astro` (1)<br>`src/pages/noms/[slug].astro` (1)<br>`src/pages/paws/[category]/[album].astro` (1)<br>`src/pages/paws/[slug].astro` (1)<br>`src/pages/tails/[category]/[entry].astro` (1)<br>`src/pages/tails/[slug].astro` (1)<br>`src/pages/test.astro` (8)<br>`src/content/album/frames/nsfw/` (1)<br>`src/content/album/frames/sfw/` (1)<br>`src/content/album/paws/bestof/` (1)<br>`src/content/album/paws/conventions/` (5)<br>`src/content/album/paws/furmeets/` (7)<br>`src/content/album/paws/suitwalks/` (12) |
| `span` | 12 | 98 | `src/components/Templates/AlbumFrame.astro` (4)<br>`src/components/Templates/Base/Footer.astro` (10)<br>`src/components/Templates/Base/Header.astro` (2)<br>`src/components/Templates/EntryBlog.astro` (6)<br>`src/components/Templates/TileView.astro` (4)<br>`src/components/Templates/TitleWithIcon.astro` (2)<br>`src/pages/test.astro` (70) |

### `src/styles/content.css`

| Class | Selector Count | Total Uses | Usage Locations |
| --- | ---: | ---: | --- |
| `card` | 1 | 8 | `src/components/Templates/Base/Meta.astro` (1)<br>`src/components/Templates/Card.astro` (1)<br>`src/pages/test.astro` (6) |
| `card--dark` | 1 | 2 | `src/pages/test.astro` (2) |
| `card--flush` | 2 | 3 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/AlbumThumbs.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (1) |
| `card--ghost` | 1 | 0 | _Not referenced outside stylesheets_ |
| `card--plain` | 2 | 6 | `src/components/StaticPages/ImprintPage.astro` (1)<br>`src/components/StaticPages/StartPage.astro` (1)<br>`src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Views/Category.astro` (1)<br>`src/components/Views/Section.astro` (1)<br>`src/pages/test.astro` (1) |
| `card__badges` | 2 | 9 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (1)<br>`src/components/Templates/TileView.astro` (1)<br>`src/pages/test.astro` (6) |
| `card__body` | 12 | 1 | `src/components/Templates/Card.astro` (1) |
| `card__foot` | 1 | 1 | `src/components/Templates/Card.astro` (1) |
| `card__head` | 4 | 1 | `src/components/Templates/Card.astro` (1) |
| `card__head--column` | 1 | 11 | `src/components/StaticPages/StartPage.astro` (2)<br>`src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (1)<br>`src/components/Templates/TileView.astro` (1)<br>`src/pages/test.astro` (6) |
| `card__hero-banner` | 1 | 1 | `src/components/Templates/EntryBlog.astro` (1) |
| `card__overlay` | 5 | 3 | `src/components/Templates/AlbumFrame.astro` (2)<br>`src/components/Templates/EntryBlog.astro` (1) |
| `card__overlay--bottom` | 1 | 2 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (1) |
| `card__overlay--column` | 1 | 1 | `src/components/Templates/EntryBlog.astro` (1) |
| `card__overlay--controls` | 1 | 2 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/scripts/galleryViewer.js` (1) |
| `card__overlay--title` | 3 | 2 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (1) |
| `card__overlay--top` | 1 | 1 | `src/components/Templates/AlbumFrame.astro` (1) |
| `card__spacer` | 1 | 0 | _Not referenced outside stylesheets_ |
| `card__title` | 3 | 22 | `src/components/StaticPages/ImprintPage.astro` (3)<br>`src/components/StaticPages/StartPage.astro` (4)<br>`src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (3)<br>`src/components/Templates/TileView.astro` (1)<br>`src/components/Templates/TitleWithIcon.astro` (1)<br>`src/components/Views/Category.astro` (1)<br>`src/components/Views/Section.astro` (1)<br>`src/pages/test.astro` (7) |
| `content-section` | 11 | 25 | `src/components/StaticPages/ImprintPage.astro` (2)<br>`src/components/StaticPages/StartPage.astro` (4)<br>`src/components/Templates/EntryBlog.astro` (3)<br>`src/components/Views/Category.astro` (4)<br>`src/components/Views/Entry.astro` (4)<br>`src/components/Views/Section.astro` (4)<br>`src/pages/test.astro` (4) |
| `content-section--head` | 1 | 5 | `src/components/StaticPages/StartPage.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (1)<br>`src/components/Views/Category.astro` (1)<br>`src/components/Views/Entry.astro` (1)<br>`src/components/Views/Section.astro` (1) |
| `card--animate` | 3 | 3 | `src/components/Templates/TileView.astro` (1)<br>`src/pages/test.astro` (2) |
| `card--center` | 2 | 18 | `src/components/StaticPages/ImprintPage.astro` (1)<br>`src/components/StaticPages/StartPage.astro` (1)<br>`src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/AlbumThumbs.astro` (1)<br>`src/components/Templates/TileView.astro` (1)<br>`src/components/Views/Category.astro` (3)<br>`src/components/Views/Entry.astro` (2)<br>`src/components/Views/Section.astro` (3)<br>`src/pages/test.astro` (5) |
| `card--condense` | 1 | 2 | `src/components/StaticPages/StartPage.astro` (1)<br>`src/pages/test.astro` (1) |
| `is-italic` | 1 | 1 | `src/components/StaticPages/StartPage.astro` (1) |
| `panel` | 11 | 1 | `src/components/Templates/Base.astro` (1) |
| `prose` | 8 | 12 | `src/components/StaticPages/ImprintPage.astro` (2)<br>`src/components/StaticPages/StartPage.astro` (2)<br>`src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (1)<br>`src/components/Views/Category.astro` (1)<br>`src/components/Views/Section.astro` (1)<br>`src/pages/test.astro` (4) |

### `src/styles/controls.css`

| Class | Selector Count | Total Uses | Usage Locations |
| --- | ---: | ---: | --- |
| `card__badges` | 2 | 9 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (1)<br>`src/components/Templates/TileView.astro` (1)<br>`src/pages/test.astro` (6) |
| `control` | 4 | 45 | `src/components/StaticPages/StartPage.astro` (1)<br>`src/components/Templates/AlbumFrame.astro` (2)<br>`src/components/Templates/Base/Footer.astro` (3)<br>`src/components/Templates/Base/Header.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (3)<br>`src/components/Templates/TileView.astro` (2)<br>`src/pages/test.astro` (33) |
| `control--animated` | 2 | 1 | `src/components/StaticPages/StartPage.astro` (1) |
| `control--badge` | 7 | 25 | `src/components/Templates/AlbumFrame.astro` (2)<br>`src/components/Templates/Base/Footer.astro` (2)<br>`src/components/Templates/EntryBlog.astro` (1)<br>`src/components/Templates/TileView.astro` (2)<br>`src/pages/test.astro` (18) |
| `control--button` | 10 | 20 | `src/components/StaticPages/StartPage.astro` (1)<br>`src/components/Templates/Base/Footer.astro` (1)<br>`src/components/Templates/Base/Header.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (2)<br>`src/pages/test.astro` (15) |
| `control--circle` | 1 | 2 | `src/components/Templates/EntryBlog.astro` (2) |
| `control--large` | 2 | 4 | `src/components/StaticPages/StartPage.astro` (1)<br>`src/pages/test.astro` (3) |
| `control--plain` | 2 | 11 | `src/components/Templates/Base/Footer.astro` (3)<br>`src/components/Templates/Base/Header.astro` (1)<br>`src/components/Templates/HeaderActions.astro` (1)<br>`src/pages/test.astro` (6) |
| `control--small` | 2 | 8 | `src/components/Templates/Base/Footer.astro` (1)<br>`src/components/Templates/Base/Header.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (2)<br>`src/components/Templates/HeaderActions.astro` (1)<br>`src/pages/test.astro` (3) |
| `controls` | 1 | 28 | `src/components/StaticPages/StartPage.astro` (1)<br>`src/components/Templates/AlbumFrame.astro` (3)<br>`src/components/Templates/Base.astro` (1)<br>`src/components/Templates/Base/Footer.astro` (2)<br>`src/components/Templates/Base/Header.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (2)<br>`src/components/Templates/TileView.astro` (1)<br>`src/pages/test.astro` (10)<br>`src/scripts/galleryViewer.js` (7) |
| `controls--around` | 1 | 1 | `src/components/Templates/Base/Header.astro` (1) |
| `controls--center` | 1 | 2 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/Base/Footer.astro` (1) |
| `controls--end` | 1 | 3 | `src/components/Templates/AlbumFrame.astro` (2)<br>`src/components/Templates/Base/Footer.astro` (1) |
| `controls--evenly` | 1 | 0 | _Not referenced outside stylesheets_ |
| `controls--nowrap` | 1 | 3 | `src/components/Templates/Base/Footer.astro` (1)<br>`src/components/Templates/Base/Header.astro` (1)<br>`src/pages/test.astro` (1) |
| `controls--roomy` | 1 | 1 | `src/components/Templates/Base/Header.astro` (1) |
| `controls--spread` | 1 | 4 | `src/components/Templates/EntryBlog.astro` (1)<br>`src/pages/test.astro` (3) |
| `controls--start` | 1 | 1 | `src/components/StaticPages/StartPage.astro` (1) |
| `controls--stretch` | 1 | 0 | _Not referenced outside stylesheets_ |
| `controls--tight` | 1 | 5 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/Base/Footer.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (1)<br>`src/components/Templates/TileView.astro` (1)<br>`src/pages/test.astro` (1) |
| `media-controls` | 9 | 8 | `src/components/Templates/AlbumFrame.astro` (6)<br>`src/components/Templates/AlbumThumbs.astro` (2) |
| `media-next` | 4 | 4 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/AlbumThumbs.astro` (1)<br>`src/scripts/galleryViewer.js` (2) |
| `media-pause` | 1 | 2 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/scripts/galleryViewer.js` (1) |
| `media-play` | 1 | 2 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/scripts/galleryViewer.js` (1) |
| `media-prev` | 4 | 4 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/AlbumThumbs.astro` (1)<br>`src/scripts/galleryViewer.js` (2) |

### `src/styles/media.css`

| Class | Selector Count | Total Uses | Usage Locations |
| --- | ---: | ---: | --- |
| `content-section` | 11 | 25 | `src/components/StaticPages/ImprintPage.astro` (2)<br>`src/components/StaticPages/StartPage.astro` (4)<br>`src/components/Templates/EntryBlog.astro` (3)<br>`src/components/Views/Category.astro` (4)<br>`src/components/Views/Entry.astro` (4)<br>`src/components/Views/Section.astro` (4)<br>`src/pages/test.astro` (4) |
| `media-empty` | 1 | 0 | _Not referenced outside stylesheets_ |
| `media-frame` | 6 | 12 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/TileView.astro` (1)<br>`src/pages/test.astro` (7)<br>`src/scripts/galleryViewer.js` (3) |
| `media-frame--thumb` | 9 | 2 | `src/scripts/galleryViewer.js` (2) |
| `media-icon` | 1 | 7 | `src/components/StaticPages/StartPage.astro` (1)<br>`src/components/Templates/AlbumFrame.astro` (3)<br>`src/components/Templates/Base/Footer.astro` (1)<br>`src/components/Templates/Base/Header.astro` (1)<br>`src/components/Templates/TitleWithIcon.astro` (1) |
| `media-icon--large` | 1 | 2 | `src/components/Templates/Base/Header.astro` (1)<br>`src/components/Templates/TitleWithIcon.astro` (1) |
| `media-icon--small` | 1 | 0 | _Not referenced outside stylesheets_ |
| `media-image` | 4 | 14 | `src/components/StaticPages/StartPage.astro` (1)<br>`src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (1)<br>`src/components/Templates/TileView.astro` (2)<br>`src/pages/test.astro` (6)<br>`src/scripts/galleryViewer.js` (3) |
| .media-image--banner` | 2 | 1 | `src/components/Templates/EntryBlog.astro` (1) |
| `media-image--placeholder` | 1 | 0 | _Not referenced outside stylesheets_ |
| `media-image--thumb` | 1 | 2 | `src/scripts/galleryViewer.js` (2) |
| `media-lightbox` | 4 | 2 | `src/scripts/galleryViewer.js` (2) |
| `media-lightbox__close` | 3 | 2 | `src/scripts/galleryViewer.js` (2) |
| `media-progress` | 3 | 2 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/scripts/galleryViewer.js` (1) |
| `media-wrapper` | 1 | 9 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/AlbumThumbs.astro` (2)<br>`src/components/Templates/TileView.astro` (1)<br>`src/pages/test.astro` (4)<br>`src/scripts/galleryViewer.js` (1) |
| `media-wrapper--controls` | 1 | 2 | `src/components/Templates/AlbumFrame.astro` (1)<br>`src/scripts/galleryViewer.js` (1) |
| `media-wrapper--frames` | 1 | 2 | `src/components/Templates/AlbumThumbs.astro` (1)<br>`src/scripts/galleryViewer.js` (1) |
| `media-wrapper--thumbs` | 1 | 2 | `src/components/Templates/AlbumThumbs.astro` (1)<br>`src/scripts/galleryViewer.js` (1) |

### `src/styles/site.css`

| Class | Selector Count | Total Uses | Usage Locations |
| --- | ---: | ---: | --- |
| `container` | 4 | 1 | `src/components/Templates/Base.astro` (1) |
| `panel-shell` | 6 | 2 | `src/components/Templates/Base.astro` (1)<br>`src/components/Templates/Base/Meta.astro` (1) |
| `prose` | 8 | 12 | `src/components/StaticPages/ImprintPage.astro` (2)<br>`src/components/StaticPages/StartPage.astro` (2)<br>`src/components/Templates/AlbumFrame.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (1)<br>`src/components/Views/Category.astro` (1)<br>`src/components/Views/Section.astro` (1)<br>`src/pages/test.astro` (4) |
| `stars-canvas` | 1 | 2 | `src/components/Templates/Base.astro` (1)<br>`src/components/Templates/Base/Meta.astro` (1) |

### `src/styles/site_footer.css`

| Class | Selector Count | Total Uses | Usage Locations |
| --- | ---: | ---: | --- |
| `control` | 4 | 45 | `src/components/StaticPages/StartPage.astro` (1)<br>`src/components/Templates/AlbumFrame.astro` (2)<br>`src/components/Templates/Base/Footer.astro` (3)<br>`src/components/Templates/Base/Header.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (3)<br>`src/components/Templates/TileView.astro` (2)<br>`src/pages/test.astro` (33) |
| `control--badge` | 7 | 25 | `src/components/Templates/AlbumFrame.astro` (2)<br>`src/components/Templates/Base/Footer.astro` (2)<br>`src/components/Templates/EntryBlog.astro` (1)<br>`src/components/Templates/TileView.astro` (2)<br>`src/pages/test.astro` (18) |
| `footer` | 4 | 3 | `src/components/Templates/Base/Footer.astro` (3) |
| `footer__center` | 2 | 1 | `src/components/Templates/Base/Footer.astro` (1) |
| `footer__left` | 1 | 1 | `src/components/Templates/Base/Footer.astro` (1) |
| `footer__nav` | 10 | 1 | `src/components/Templates/Base/Footer.astro` (1) |
| `footer__right` | 1 | 1 | `src/components/Templates/Base/Footer.astro` (1) |
| `header` | 10 | 3 | `src/components/Templates/Base/Header.astro` (3) |
| `footer__actions` | 2 | 6 | `src/components/Templates/Base.astro` (2)<br>`src/components/Templates/Base/Footer.astro` (1)<br>`src/components/Views/Category.astro` (1)<br>`src/components/Views/Entry.astro` (1)<br>`src/components/Views/Section.astro` (1) |
| `footer__crumb` | 2 | 1 | `src/components/Templates/Base/Footer.astro` (1) |
| `footer__crumb-separator` | 1 | 1 | `src/components/Templates/Base/Footer.astro` (1) |
| `header__nav-text` | 7 | 1 | `src/components/Templates/Base/Header.astro` (1) |

### `src/styles/site_header.css`

| Class | Selector Count | Total Uses | Usage Locations |
| --- | ---: | ---: | --- |
| `control` | 4 | 45 | `src/components/StaticPages/StartPage.astro` (1)<br>`src/components/Templates/AlbumFrame.astro` (2)<br>`src/components/Templates/Base/Footer.astro` (3)<br>`src/components/Templates/Base/Header.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (3)<br>`src/components/Templates/TileView.astro` (2)<br>`src/pages/test.astro` (33) |
| `header` | 10 | 3 | `src/components/Templates/Base/Header.astro` (3) |
| `header__bar` | 6 | 0 | _Not referenced outside stylesheets_ |
| `header__bar--bottom` | 2 | 0 | _Not referenced outside stylesheets_ |
| `header__bar--top` | 3 | 0 | _Not referenced outside stylesheets_ |
| `header__nav` | 6 | 1 | `src/components/Templates/Base/Header.astro` (1) |
| `header__nav-item` | 4 | 1 | `src/components/Templates/Base/Header.astro` (1) |
| `header__nav-symbol` | 3 | 1 | `src/components/Templates/Base/Header.astro` (1) |
| `header__nav-text` | 7 | 1 | `src/components/Templates/Base/Header.astro` (1) |

### `src/styles/table.css`

| Class | Selector Count | Total Uses | Usage Locations |
| --- | ---: | ---: | --- |
| `deflist` | 1 | 1 | `src/components/StaticPages/ImprintPage.astro` (1) |
| `deflist__desc` | 1 | 1 | `src/components/StaticPages/ImprintPage.astro` (1) |
| `deflist__term` | 1 | 1 | `src/components/StaticPages/ImprintPage.astro` (1) |
| `table` | 1 | 1 | `src/components/Templates/Base.astro` (1) |
| `table__price` | 3 | 0 | _Not referenced outside stylesheets_ |
| `table__td` | 2 | 0 | _Not referenced outside stylesheets_ |
| `table__td--right` | 2 | 0 | _Not referenced outside stylesheets_ |
| `table__th` | 3 | 0 | _Not referenced outside stylesheets_ |
| `table__th--left` | 1 | 0 | _Not referenced outside stylesheets_ |
| `table__th--right` | 1 | 0 | _Not referenced outside stylesheets_ |
| `table__tr` | 2 | 0 | _Not referenced outside stylesheets_ |
| `table__unit` | 1 | 0 | _Not referenced outside stylesheets_ |
| `table__wrap` | 1 | 0 | _Not referenced outside stylesheets_ |

### `src/styles/typography.css`

| Class | Selector Count | Total Uses | Usage Locations |
| --- | ---: | ---: | --- |
| `badge` | 1 | 0 | _Not referenced outside stylesheets_ |
| `button` | 1 | 44 | `src/components/Templates/AlbumFrame.astro` (16)<br>`src/components/Templates/AlbumThumbs.astro` (6)<br>`src/components/Templates/EntryBlog.astro` (6)<br>`src/components/Templates/HeaderActions.astro` (1)<br>`src/scripts/galleryViewer.js` (15) |
| `button--large` | 1 | 0 | _Not referenced outside stylesheets_ |
| `control--badge` | 7 | 25 | `src/components/Templates/AlbumFrame.astro` (2)<br>`src/components/Templates/Base/Footer.astro` (2)<br>`src/components/Templates/EntryBlog.astro` (1)<br>`src/components/Templates/TileView.astro` (2)<br>`src/pages/test.astro` (18) |
| `control--button` | 10 | 20 | `src/components/StaticPages/StartPage.astro` (1)<br>`src/components/Templates/Base/Footer.astro` (1)<br>`src/components/Templates/Base/Header.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (2)<br>`src/pages/test.astro` (15) |
| `control--large` | 2 | 4 | `src/components/StaticPages/StartPage.astro` (1)<br>`src/pages/test.astro` (3) |
| `control--small` | 2 | 8 | `src/components/Templates/Base/Footer.astro` (1)<br>`src/components/Templates/Base/Header.astro` (1)<br>`src/components/Templates/EntryBlog.astro` (2)<br>`src/components/Templates/HeaderActions.astro` (1)<br>`src/pages/test.astro` (3) |
| `footer` | 4 | 3 | `src/components/Templates/Base/Footer.astro` (3) |
| `header__nav` | 6 | 1 | `src/components/Templates/Base/Header.astro` (1) |
| `header__nav-item` | 4 | 1 | `src/components/Templates/Base/Header.astro` (1) |
| `header__nav-text` | 7 | 1 | `src/components/Templates/Base/Header.astro` (1) |
| `is-current` | 1 | 1 | `src/components/Templates/Base/Footer.astro` (1) |
| `panel` | 11 | 1 | `src/components/Templates/Base.astro` (1) |
| `table__price` | 3 | 0 | _Not referenced outside stylesheets_ |
| `table__subtitle` | 1 | 0 | _Not referenced outside stylesheets_ |
| `table__th` | 3 | 0 | _Not referenced outside stylesheets_ |

## Tokens

| Token | Defined In | Definition Count | Total Uses | Usage Locations |
| --- | --- | ---: | ---: | --- |
| `--animated` | `src/styles/controls.css` | 1 | 0 | _No var(--token) references found_ |
| `--overlay--dim` | `src/styles/tokens.css` | 1 | 2 | `src/styles/base.css` (1)<br>`src/styles/site.css` (1) |
| `--badge` | `src/styles/typography.css` | 1 | 0 | _No var(--token) references found_ |
| `--bg-dim` | `src/styles/tokens.css` | 1 | 1 | `src/styles/tokens.css` (1) |
| `--bg-dim-alpha` | `src/styles/tokens.css` | 1 | 1 | `src/styles/tokens.css` (1) |
| `--bg-field` | `src/styles/tokens.css` | 1 | 0 | _No var(--token) references found_ |
| `--bg-nebula` | `src/styles/tokens.css` | 1 | 0 | _No var(--token) references found_ |
| `--bg-stars` | `src/styles/tokens.css` | 1 | 0 | _No var(--token) references found_ |
| `--blur-l` | `src/styles/tokens.css` | 1 | 2 | `src/styles/content.css` (1)<br>`src/styles/site_footer.css` (1) |
| `--blur-m` | `src/styles/tokens.css` | 1 | 4 | `src/styles/content.css` (2)<br>`src/styles/media.css` (1)<br>`src/styles/site_header.css` (1) |
| `--blur-s` | `src/styles/tokens.css` | 1 | 1 | `src/styles/controls.css` (1) |
| `--blur-xl` | `src/styles/tokens.css` | 1 | 0 | _No var(--token) references found_ |
| `--blur-xs` | `src/styles/tokens.css` | 1 | 0 | _No var(--token) references found_ |
| `--blur-xxl` | `src/styles/tokens.css` | 1 | 0 | _No var(--token) references found_ |
| `--blur-xxs` | `src/styles/tokens.css` | 1 | 0 | _No var(--token) references found_ |
| `--font-weight-bold` | `src/styles/tokens.css` | 1 | 5 | `src/styles/content.css` (2)<br>`src/styles/typography.css` (3) |
| `--button` | `src/styles/controls.css`<br>`src/styles/typography.css` | 4 | 0 | _No var(--token) references found_ |
| `--card-gap` | `src/styles/tokens.css` | 1 | 8 | `src/styles/content.css` (7)<br>`src/styles/media.css` (1) |
| `--card-padding` | `src/styles/tokens.css` | 1 | 3 | `src/styles/content.css` (2)<br>`src/styles/table.css` (1) |
| `--card-shadow--inset` | `src/styles/tokens.css` | 1 | 0 | _No var(--token) references found_ |
| `--color-dark--soft` | `src/styles/tokens.css` | 1 | 10 | `src/styles/content.css` (3)<br>`src/styles/media.css` (3)<br>`src/styles/site_footer.css` (1)<br>`src/styles/site_header.css` (1)<br>`src/styles/table.css` (2) |
| `--color-light--ghosty` | `src/styles/tokens.css` | 1 | 4 | `src/styles/content.css` (1)<br>`src/styles/media.css` (2)<br>`src/styles/site_header.css` (1) |
| `--cluster-gap` | `src/styles/tokens.css` | 1 | 2 | `src/styles/site_footer.css` (1)<br>`src/styles/table.css` (1) |
| `--color-accent` | `src/styles/tokens.css` | 1 | 9 | `src/styles/base.css` (1)<br>`src/styles/content.css` (1)<br>`src/styles/controls.css` (1)<br>`src/styles/tokens.css` (5)<br>`src/styles/typography.css` (1) |
| `--color-dark` | `src/styles/tokens.css` | 1 | 10 | `src/styles/controls.css` (3)<br>`src/styles/site.css` (2)<br>`src/styles/tokens.css` (5) |
| `--color-light--soft` | `src/styles/tokens.css` | 1 | 2 | `src/styles/tokens.css` (2) |
| `--color-light--strong` | `src/styles/tokens.css` | 1 | 3 | `src/styles/tokens.css` (3) |
| `--color-light` | `src/styles/tokens.css` | 1 | 5 | `src/styles/media.css` (1)<br>`src/styles/tokens.css` (4) |
| `--color-dark--soft` | `src/styles/tokens.css` | 1 | 6 | `src/styles/tokens.css` (6) |
| `--color-dark--strong` | `src/styles/tokens.css` | 1 | 10 | `src/styles/content.css` (2)<br>`src/styles/media.css` (2)<br>`src/styles/tokens.css` (6) |
| `--container-max` | `src/styles/tokens.css` | 1 | 2 | `src/styles/site.css` (1)<br>`src/styles/tokens.css` (1) |
| `--container-padding` | `src/styles/tokens.css` | 1 | 1 | `src/styles/site.css` (1) |
| `--control-border-radius` | `src/styles/controls.css` | 1 | 1 | `src/styles/controls.css` (1) |
| `--control-gap` | `src/styles/tokens.css` | 1 | 11 | `src/styles/content.css` (1)<br>`src/styles/controls.css` (4)<br>`src/styles/media.css` (1)<br>`src/styles/site_footer.css` (2)<br>`src/styles/site_header.css` (1)<br>`src/styles/table.css` (1)<br>`src/styles/tokens.css` (1) |
| `--control-glow` | `src/styles/tokens.css` | 1 | 2 | `src/styles/controls.css` (2) |
| `--control-padding` | `src/styles/tokens.css` | 1 | 7 | `src/styles/controls.css` (6)<br>`src/styles/table.css` (1) |
| `--control-shadow--inset` | `src/styles/tokens.css` | 1 | 2 | `src/styles/controls.css` (1)<br>`src/styles/media.css` (1) |
| `--color-dark` | `src/styles/tokens.css` | 1 | 6 | `src/styles/controls.css` (2)<br>`src/styles/media.css` (3)<br>`src/styles/site_footer.css` (1) |
| `--control-surface--light` | `src/styles/tokens.css` | 1 | 1 | `src/styles/controls.css` (1) |
| `--flow-gap` | `src/styles/tokens.css` | 1 | 14 | `src/styles/content.css` (7)<br>`src/styles/media.css` (1)<br>`src/styles/typography.css` (6) |
| `--font-size-l` | `src/styles/tokens.css` | 1 | 4 | `src/styles/content.css` (1)<br>`src/styles/tokens.css` (1)<br>`src/styles/typography.css` (2) |
| `--font-size-m` | `src/styles/tokens.css` | 1 | 4 | `src/styles/content.css` (2)<br>`src/styles/tokens.css` (1)<br>`src/styles/typography.css` (1) |
| `--font-size-s` | `src/styles/tokens.css` | 1 | 6 | `src/styles/content.css` (2)<br>`src/styles/tokens.css` (1)<br>`src/styles/typography.css` (3) |
| `--font-size-xl` | `src/styles/tokens.css` | 1 | 1 | `src/styles/typography.css` (1) |
| `--font-size-xs` | `src/styles/tokens.css` | 1 | 2 | `src/styles/site_footer.css` (1)<br>`src/styles/typography.css` (1) |
| `--gallery-interval` | `src/styles/tokens.css` | 1 | 1 | `src/styles/media.css` (1) |
| `--glow` | `src/styles/controls.css` | 1 | 0 | _No var(--token) references found_ |
| `--hero-size` | `src/styles/tokens.css` | 1 | 1 | `src/styles/media.css` (1) |
| `--icon-shadow` | `src/styles/tokens.css` | 1 | 0 | _No var(--token) references found_ |
| `--icon-size-l` | `src/styles/tokens.css` | 1 | 1 | `src/styles/media.css` (1) |
| `--icon-size-m` | `src/styles/tokens.css` | 1 | 1 | `src/styles/media.css` (1) |
| `--icon-size-s` | `src/styles/tokens.css` | 1 | 1 | `src/styles/media.css` (1) |
| `--letter-spacing-l` | `src/styles/tokens.css` | 1 | 3 | `src/styles/typography.css` (3) |
| `--letter-spacing-m` | `src/styles/tokens.css` | 1 | 0 | _No var(--token) references found_ |
| `--letter-spacing-s` | `src/styles/tokens.css` | 1 | 1 | `src/styles/typography.css` (1) |
| `--letter-spacing-xl` | `src/styles/tokens.css` | 1 | 1 | `src/styles/typography.css` (1) |
| `--line-height-l` | `src/styles/tokens.css` | 1 | 1 | `src/styles/content.css` (1) |
| `--line-height-m` | `src/styles/tokens.css` | 1 | 5 | `src/styles/content.css` (4)<br>`src/styles/typography.css` (1) |
| `--line-height-s` | `src/styles/tokens.css` | 1 | 1 | `src/styles/typography.css` (1) |
| `--line-height-xl` | `src/styles/tokens.css` | 1 | 1 | `src/styles/typography.css` (1) |
| `--line-height-xs` | `src/styles/tokens.css` | 1 | 3 | `src/styles/typography.css` (3) |
| `--media-control-size` | `src/styles/controls.css` | 1 | 2 | `src/styles/controls.css` (2) |
| `--nav-gap--column` | `src/styles/tokens.css` | 1 | 0 | _No var(--token) references found_ |
| `--nav-gap--row` | `src/styles/tokens.css` | 1 | 0 | _No var(--token) references found_ |
| `--font-weight-normal` | `src/styles/tokens.css` | 1 | 4 | `src/styles/typography.css` (4) |
| `--outline` | `src/styles/tokens.css` | 1 | 1 | `src/styles/media.css` (1) |
| `--bars-padding` | `src/styles/tokens.css` | 1 | 5 | `src/styles/site_footer.css` (1)<br>`src/styles/site_header.css` (4) |
| `--panel-padding` | `src/styles/tokens.css` | 1 | 5 | `src/styles/site.css` (2)<br>`src/styles/site_footer.css` (1)<br>`src/styles/site_header.css` (1)<br>`src/styles/tokens.css` (1) |
| `--plain` | `src/styles/content.css` | 1 | 0 | _No var(--token) references found_ |
| `--font--display` | `src/styles/tokens.css` | 1 | 2 | `src/styles/tokens.css` (1)<br>`src/styles/typography.css` (1) |
| `--radius-l` | `src/styles/tokens.css` | 1 | 5 | `src/styles/content.css` (1)<br>`src/styles/media.css` (3)<br>`src/styles/tokens.css` (1) |
| `--radius-m` | `src/styles/tokens.css` | 1 | 13 | `src/styles/content.css` (5)<br>`src/styles/controls.css` (1)<br>`src/styles/media.css` (1)<br>`src/styles/site_footer.css` (2)<br>`src/styles/table.css` (3)<br>`src/styles/tokens.css` (1) |
| `--radius-s` | `src/styles/tokens.css` | 1 | 2 | `src/styles/controls.css` (1)<br>`src/styles/tokens.css` (1) |
| `--radius-xl` | `src/styles/tokens.css` | 1 | 6 | `src/styles/content.css` (1)<br>`src/styles/site_footer.css` (2)<br>`src/styles/site_header.css` (2)<br>`src/styles/tokens.css` (1) |
| `--radius-xs` | `src/styles/tokens.css` | 1 | 1 | `src/styles/tokens.css` (1) |
| `--radius-xxl` | `src/styles/tokens.css` | 1 | 1 | `src/styles/tokens.css` (1) |
| `--radius-xxs` | `src/styles/tokens.css` | 1 | 1 | `src/styles/tokens.css` (1) |
| `--font--fancy` | `src/styles/tokens.css` | 1 | 1 | `src/styles/typography.css` (1) |
| `--section-gap` | `src/styles/tokens.css` | 1 | 4 | `src/styles/content.css` (3)<br>`src/styles/site_footer.css` (1) |
| `--site-logo--size` | `src/styles/tokens.css` | 1 | 0 | _No var(--token) references found_ |
| `--space-l` | `src/styles/tokens.css` | 1 | 1 | `src/styles/tokens.css` (1) |
| `--space-m` | `src/styles/tokens.css` | 1 | 0 | _No var(--token) references found_ |
| `--space-s` | `src/styles/tokens.css` | 1 | 10 | `src/styles/tokens.css` (10) |
| `--space-xl` | `src/styles/tokens.css` | 1 | 2 | `src/styles/tokens.css` (2) |
| `--space-xs` | `src/styles/tokens.css` | 1 | 4 | `src/styles/tokens.css` (4) |
| `--space-xxl` | `src/styles/tokens.css` | 1 | 3 | `src/styles/tokens.css` (3) |
| `--space-xxs` | `src/styles/tokens.css` | 1 | 3 | `src/styles/tokens.css` (3) |
| `--surface-glow--soft` | `src/styles/tokens.css` | 1 | 2 | `src/styles/content.css` (1)<br>`src/styles/controls.css` (1) |
| `--surface-glow--strong` | `src/styles/tokens.css` | 1 | 2 | `src/styles/content.css` (2) |
| `--shadow--default` | `src/styles/tokens.css` | 1 | 9 | `src/styles/content.css` (4)<br>`src/styles/controls.css` (1)<br>`src/styles/media.css` (2)<br>`src/styles/site_footer.css` (2) |
| `--shadow--soft` | `src/styles/tokens.css` | 1 | 4 | `src/styles/content.css` (1)<br>`src/styles/controls.css` (2)<br>`src/styles/media.css` (1) |
| `--shadow--strong` | `src/styles/tokens.css` | 1 | 2 | `src/styles/media.css` (1)<br>`src/styles/site.css` (1) |
| `--color-accent--bright` | `src/styles/tokens.css` | 1 | 2 | `src/styles/base.css` (1)<br>`src/styles/site_footer.css` (1) |
| `--text-color` | `src/styles/tokens.css` | 1 | 4 | `src/styles/base.css` (1)<br>`src/styles/controls.css` (1)<br>`src/styles/site_footer.css` (1)<br>`src/styles/typography.css` (1) |
| `--text-glow--soft` | `src/styles/tokens.css` | 1 | 5 | `src/styles/base.css` (1)<br>`src/styles/content.css` (1)<br>`src/styles/controls.css` (1)<br>`src/styles/typography.css` (2) |
| `--text-glow` | `src/styles/tokens.css` | 1 | 2 | `src/styles/base.css` (1)<br>`src/styles/site_footer.css` (1) |
| `--text-highlight` | `src/styles/tokens.css` | 1 | 1 | `src/styles/content.css` (1) |
| `--text-shadow` | `src/styles/tokens.css` | 1 | 4 | `src/styles/base.css` (2)<br>`src/styles/controls.css` (1)<br>`src/styles/site_footer.css` (1) |
| `--text-shadow` | `src/styles/tokens.css` | 1 | 4 | `src/styles/content.css` (1)<br>`src/styles/typography.css` (3) |
| `--font-weight-thick` | `src/styles/tokens.css` | 1 | 3 | `src/styles/content.css` (1)<br>`src/styles/typography.css` (2) |
| `--font-weight-thin` | `src/styles/tokens.css` | 1 | 2 | `src/styles/typography.css` (2) |
| `--thumb` | `src/styles/media.css` | 6 | 7 | `src/styles/media.css` (7) |
| `--thumb-size` | `src/styles/tokens.css` | 1 | 7 | `src/styles/media.css` (7) |
| `--title` | `src/styles/content.css` | 2 | 0 | _No var(--token) references found_ |
| `--transform-raise` | `src/styles/tokens.css` | 1 | 1 | `src/styles/controls.css` (1) |
| `--transform-scale` | `src/styles/tokens.css` | 1 | 4 | `src/styles/content.css` (1)<br>`src/styles/controls.css` (2)<br>`src/styles/media.css` (1) |
| `--transition--control` | `src/styles/tokens.css` | 1 | 3 | `src/styles/controls.css` (2)<br>`src/styles/site_footer.css` (1) |
| `--transition--interactive` | `src/styles/tokens.css` | 1 | 1 | `src/styles/base.css` (1) |
| `--transition--opacity` | `src/styles/tokens.css` | 1 | 2 | `src/styles/media.css` (2) |
| `--transition--raise` | `src/styles/tokens.css` | 1 | 4 | `src/styles/controls.css` (2)<br>`src/styles/media.css` (2) |
| `--transition--soft` | `src/styles/tokens.css` | 1 | 3 | `src/styles/content.css` (2)<br>`src/styles/media.css` (1) |
