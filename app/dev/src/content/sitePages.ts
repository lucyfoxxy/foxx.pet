export type ContactLink = {
  href: string;
  label: string;
  kind: 'link' | 'mail';
};

export type GalleryCategory = {
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
};

export type SitePageBase = {
  id: 'home' | 'galleries' | 'stories' | 'imprint';
  href: string;
  navLabel: string;
  includeInHeader?: boolean;
  meta: {
    title: string;
    description: string;
  };
};

export type HomePageContent = SitePageBase & {
  id: 'home';
  includeInHeader: false;
  hero: {
    assetKey: string;
    heading: string;
    subheading: string;
  };
  intro: {
    heading: string;
    paragraphs: string[];
    signature: string;
  };
  feature: {
    heading: string;
    description: string;
  };
  contactLinks: ContactLink[];
};

export type GalleriesPageContent = SitePageBase & {
  id: 'galleries';
  heading: string;
  description: string;
  categories: GalleryCategory[];
};

export type StoriesPageContent = SitePageBase & {
  id: 'stories';
  heading: string;
  paragraphs: string[];
};

export type ImprintPageContent = SitePageBase & {
  id: 'imprint';
  heading: string;
  description: string;
};

export type SitePageContent =
  | HomePageContent
  | GalleriesPageContent
  | StoriesPageContent
  | ImprintPageContent;

const homePage: HomePageContent = {
  id: 'home',
  href: '/',
  navLabel: 'Home',
  includeInHeader: false,
  meta: {
    title: 'Base Template - Your Project Name',
    description: 'Use this page as a starting point for a new Astro page.',
  },
  hero: {
    assetKey: 'logo_hero',
    heading: 'Welcome to',
    subheading: 'Home of a small purple fox flying around!',
  },
  intro: {
    heading: 'Welcome Title',
    paragraphs: [
      'Introduce yourself or your project with a warm welcome.',
      'Explain what visitors can expect to find on this page.',
      'Highlight a call to action such as linking to your gallery or services.',
    ],
    signature: 'Your Name',
  },
  feature: {
    heading: 'Featured Section',
    description:
      'Use this area to showcase a highlight, image carousel, or any other element you want to bring attention to.',
  },
  contactLinks: [
    { href: 'https://example.com', label: 'External Link', kind: 'link' },
    { href: 'mailto:you@example.com', label: 'Email', kind: 'mail' },
  ],
};

const galleriesPage: GalleriesPageContent = {
  id: 'galleries',
  href: '/galleries',
  navLabel: 'Galleries',
  includeInHeader: true,
  meta: {
    title: 'Galleries',
    description: 'Browse a selection of previous artworks and explore each gallery in more detail.',
  },
  heading: 'Galleries',
  description: 'Here you gonna find a selection of my previous works.',
  categories: [
    {
      slug: 'full-art-sfw',
      title: 'Full Art - SFW',
      subtitle: 'Full-color illustration (incl. shadings) · SFW · digital / traditional',
      description:
        'Detailed, full-color illustration - bring your character to life! Perfect as a wallpaper, poster, or heartfelt gift for your beloved ones!',
    },
    {
      slug: 'full-art-nsfw',
      title: 'Full Art - NSFW',
      subtitle: 'Full-color illustration (incl. shadings) · NSFW (18+) · digital / traditional',
      description:
        'Detailed, kinky illustrations making your wildest and darkest dreams come true - at least as a piece of art!',
    },
    {
      slug: 'ref-sheets',
      title: 'Reference Sheets',
      subtitle: 'Price depends on character complexity / number of views. · digital only',
      description:
        'A complete overview of your fursona including every single detail (accessories, markings), mainly used by Suitmakers and other artists.',
    },
    {
      slug: 'badges',
      title: 'Badges',
      subtitle: 'incl. laminating, die-cutting & keychain eyelet · digital / traditional',
      description:
        'Wearable art pieces made for conventions or everyday use. Badges are laminated and cut to shape, often used for identification or just to show off your character.',
    },
    {
      slug: 'sticker-packs',
      title: 'Sticker Packs',
      subtitle: 'Shadings will add +2€ / sticker · Bundled as sticker pack (on request) · SFW / NSFW · digital only',
      description:
        'Let’s create your very own personal sticker pack for messengers like Telegram. Any emotion or expression — including NSFW — is possible!',
    },
    {
      slug: 'prints',
      title: 'Prints',
      subtitle: 'Physical items · Various designs available (see gallery) · Custom designs on request.',
      description:
        'The good old evergreens every furry needs: physical stickers and buttons — perfect to decorate your bag, trade at conventions, or stick to that lantern right outside your door!',
    },
    {
      slug: 'sketch',
      title: 'Sketches',
      subtitle: 'Quick sketch style · SFW / NSFW · digital / traditional',
      description:
        'Not sure how your idea might turn out? Let’s explore it together with a quick sketch first!',
    },
    {
      slug: 'line-art',
      title: 'Line Art',
      subtitle: 'Clean lines, without coloring · SFW / NSFW · digital / traditional',
      description:
        'Clear, clean line art — ready for you to colorize, or simply enjoy as it is. Great if you want to add your own creative touch.',
    },
    {
      slug: 'logos-tribals',
      title: 'Logos & Tribals',
      subtitle: 'Custom symbol or mark for use as wall-, car-, body-tattoo etc. · b/w or colored · digital only',
      description:
        'Unique logos and tribal designs made just for you — whether for your wall, your car, or even yourself. Disclaimer: I won’t be the one sticking them on!',
    },
  ],
};

const storiesPage: StoriesPageContent = {
  id: 'stories',
  href: '/stories',
  navLabel: 'Stories',
  includeInHeader: true,
  meta: {
    title: 'Stories',
    description: 'A cosy corner for future tales and blog-style musings from the cosmos.',
  },
  heading: 'Stories',
  paragraphs: [
    'Welcome to the story den! This is where future tales, updates, and behind-the-scenes musings will live.',
    'Grab a cup of tea, make yourself comfortable, and check back soon for narrative adventures from Lucy’s cosmic journeys.',
  ],
};

const imprintPage: ImprintPageContent = {
  id: 'imprint',
  href: '/imprint',
  navLabel: 'Imprint',
  includeInHeader: true,
  meta: {
    title: 'Imprint / Impressum',
    description: 'Legal notice and contact information for the foxx.pet website.',
  },
  heading: 'Imprint / Impressum',
  description: 'In case of any suspected copyright infringement or other legal claims, you may contact us at:',
};

export const orderedSitePages: SitePageContent[] = [
  homePage,
  galleriesPage,
  storiesPage,
  imprintPage,
];

export const sitePages = {
  home: homePage,
  galleries: galleriesPage,
  stories: storiesPage,
  imprint: imprintPage,
} as const;

const normalizePath = (path: string) => {
  if (!path || path === '/') return '/';
  return path.replace(/\/+$/, '') || '/';
};

export const sitePagesByPath = new Map<string, SitePageContent>(
  orderedSitePages.map((page) => [normalizePath(page.href), page]),
);

export const headerNavPages = orderedSitePages.filter((page) => page.includeInHeader);

export const defaultMeta = {
  ...homePage.meta,
  url: 'https://foxx.pet',
};

export function findPageByPath(path: string | URL | undefined) {
  if (!path) return undefined;
  const normalized = normalizePath(typeof path === 'string' ? path : path.pathname);
  return sitePagesByPath.get(normalized);
}
