# FOLDER STRUCTURE CONCEPT
---

## Below you gonna find the conceptual Folder Structure, which – as soon as working as intended – shall be the Criteria for Release of v1

```
app/dev/src
├── assets
│   ├── Icons.astro
│   └── ui.ts
├── components
│   ├── Templates
│   │   ├── baseLayout.astro
│   │   ├── albumPage.astro
│   │   ├── blogPage.astro
│   │   ├── CategoriesPage.astro
│   │   ├── SubcategoriesPage.astro
│   │   ├── Card.astro
│   │   └── partials (for use inside other Templates)
│   └── Pages (containing Startpage, Imprint)
│       ├── album (containing PawsPage & FramesPage)
│       └── blog (containing TailsPage & NomsPage)
├── content
│   ├── album (json's containing immich URLs etc.)
│   │   ├── paws
│   │   │   ├── conventions
│   │   │   ├── furmeets
│   │   │   └── suitwalks
│   │   └── frames
│   │       ├── nsfw
│   │       └── sfw
│   ├── blog (md's containing the blog articles)
│   │   ├── tails
│   │   │   ├── lucys-journeys
│   │   │   ├── lucy-and-friends
│   │   │   └── cosmic-foxes
│   │   └── noms
│   │       ├── baking
│   │       └── cooking
│   ├── catalog
│   │   └── categories.json (Containing all Categories & Subcategories for all 4 areas)
│   └── sitePages (keep for meta & stuff, just adjust names accordingly)
├── pages
│   ├── blog
│   │   ├── tails (→ current "/stories")
│   │   │   ├── [category] (→ "Lucy's Journeys", "Lucy & Friends", "Cosmic Foxes")
│   │   │   │   └── [entry].astro
│   │   │   ├── [slug].astro
│   │   │   └── index.astro
│   │   └── noms (→ current "/cookbook")
│   │       ├── [category] (→ "Baking", "Cooking")
│   │       │   └── [entry].astro
│   │       ├── [slug].astro
│   │       └── index.astro
│   └── album
│       ├── frames (→ NEW Gallery containing Artworks)
│       │   ├── [slug].astro (→ "NSFW", "SFW" — no subcategories here)
│       │   └── index.astro
│       └── paws (→ existing "/galleries")
│           ├── [category] (→ "Suitwalks", "Furmeets", "Conventions")
│           │   └── [entry].astro
│           ├── [slug].astro
│           └── index.astro
├── scripts
│   └── utils
├── styles
└── types
```