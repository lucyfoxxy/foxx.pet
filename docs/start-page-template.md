# Reusing the start page as a template

The `StartPage.astro` component (located at `app/dev/src/components/Pages/StartPage.astro`) now accepts props so you can plug in
 your own copy, messaging, and contact links without rewriting the markup. This guide walks you through creating a new page that
 reuses the component as a base template.

## 1. Import the defaults

`StartPage.astro` exports a `defaults` object that mirrors the live site content. Clone and adjust only the pieces you need.

```astro
---
import Layout from '@Design/Layout.astro';
import StartPage, { defaults } from '@Pages/StartPage.astro';

const myContent = {
  ...defaults,
  title: 'Home - Your Brand',
  hero: {
    mascot: { src: '/images/your-mascot.webp', alt: 'Your mascot' },
    logo: { src: '/images/your-logo.svg', alt: 'Your Brand' },
  },
  intro: {
    heading: 'Hello there!',
    paragraphs: [
      'Introduce yourself with one or more paragraphs. **Markdown** and inline HTML such as `<a>` tags are supported.',
      'Keep sentences short to stay in sync with the layout typography.',
    ],
    signature: '<i>Your Name</i>',
  },
  gallery: {
    ...defaults.gallery,
    slug: 'featured',
    heading: 'Featured work',
    interval: 5000,
  },
  links: [
    { href: 'mailto:hello@example.com', label: 'Email', kind: 'mail' },
    { href: 'https://t.me/your-handle', label: 'Telegram', kind: 'telegram' },
  ],
  headings: {
    contact: 'Say hi:',
  },
};
---

<Layout title={myContent.title}>
  <StartPage {...myContent} />
</Layout>
```

## 2. Create a new route

Save a copy of the snippet above into `app/dev/src/pages/<your-page>.astro`. Astro automatically registers the route so you can
preview it at `http://localhost:4321/<your-page>` when running `npm run dev:dev`.

## 3. Update production (optional)

If you also maintain the production workspace, duplicate the file inside `app/prod/src/pages/` so both builds stay in sync.

## Component reference

| Prop | Type | Description |
| --- | --- | --- |
| `title` | `string` | Document title forwarded to the shared `Layout`. Defaults to the Faelis site title. |
| `hero` | `{ mascot: { src, alt? }, logo: { src, alt } }` | Controls the masthead artwork. Provide project-relative asset paths or external URLs. |
| `intro` | `{ heading, paragraphs[], signature }` | Primary welcome copy. Each string inside `paragraphs` is rendered as a `<p>` and can include inline HTML. |
| `gallery` | `{ slug, heading?, autoplay?, interval?, random? }` | Configures the preview gallery hook. Supply your own slug to connect a different media manifest. |
| `links` | `Array<{ href, label, kind }>` | Contact buttons rendered at the bottom of the page. `kind` must be one of the icons exposed by `@Design/Icons.astro`. |
| `headings` | `Partial<{ welcome, preview, contact }>` | Overrides for the section headings while keeping the original structure intact. |

Remember to preload any new hero image via the `<head>` slot or by pointing `hero.mascot.src` at an asset handled by Astro.

> **Note**
> `StartPage` keeps the `title` inside `defaults` for convenience, but it does not alter the document title itself. Pass the value to `Layout` (as shown in the snippet above) to update the `<title>` tag.
