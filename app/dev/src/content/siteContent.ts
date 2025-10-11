export const SITE_CONTENT = {
  home: {
    id: 'home',
    href: '/',
    title: 'Lucy\'s Cosmos',
    navLabel: '↩ Home',
    includeInHeader: false,
    description: "A small cosmic fox on their big journey across the universe!",
    hero: {
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
      placeholder:
        'Replace this block with your own gallery, story teaser, or any custom component.',
    },
    contactLinks: [
      { href: 'https://example.com', label: 'External Link', kind: 'link' },
      { href: 'mailto:you@example.com', label: 'Email', kind: 'mail' },
    ],
  },
  galleries: {
    id: 'galleries',
    href: '/galleries',
    title: 'Paw\u202FPrints\u202F🐾',
    navLabel: 'Paw\u202FPrints\u202F🐾',
    includeInHeader: true,
    description: 'Here you gonna find a selection of my previous works.',
    introParagraphs: [
      'Browse through themed collections of illustrations, sketches, and experiments that chart the journey of Lucy across the stars.',
    ],
  },
  stories: {
    id: 'stories',
    href: '/stories',
    title: 'Fuzzy\u202FFops\u202F🚀',
    navLabel: 'Fuzzy\u202FFops\u202F🚀',
    includeInHeader: true,
    description: 'Narrative experiments and cosmic adventures — coming soon.',
    introParagraphs: [
      'This is the new home for short tales and blog-style updates about Lucy\'s travels.',
      'Expect cosy updates, creative experiments, and behind-the-scenes looks once the first entries launch.',
    ],
    sections: [
      {
        title: 'Stories are still brewing',
        paragraphs: [
          'The archive is warming up. While the quills and keyboards get ready, this page serves as a placeholder for future adventures.',
        ],
      },
      {
        title: 'Stay tuned',
        paragraphs: [
          'Subscribe to your favourite channel, follow Lucy on social media, or simply swing by every now and then to catch the latest updates.',
          'A fully-fledged blog system is planned to land here in the future.',
        ],
      },
    ],
  },
  imprint: {
    id: 'imprint',
    href: '/imprint',
    title: 'Imprint / Impressum',
    navLabel: 'Imprint',
    includeInHeader: false,
    description: 'Legal and contact information for foxx.pet.',
    introParagraphs: [
      'In case of any suspected copyright infringement or other legal claims, you may contact us at the following addresses.',
    ],
    contacts: [
      {
        title: 'Content Management',
        subtitle: '- Artworks -',
        entries: [
          { term: 'Nickname', description: 'Faelis Skribblekitty' },
          { term: 'Name, Surname', description: 'Jungmann, Stephanie' },
          { term: 'Address', description: 'Michaelstr. 38, 47055 Duisburg, NRW, Germany' },
          { term: 'Email', description: 'content@foxx.pet', kind: 'mail' },
        ],
      },
      {
        title: 'Site Administration',
        subtitle: '- Domain & Infrastructure -',
        entries: [
          { term: 'Nickname', description: 'Lucy Foxx' },
          { term: 'Name, Surname', description: 'Wiese, Julian' },
          { term: 'Address', description: 'Michaelstr. 38, 47055 Duisburg, NRW, Germany' },
          { term: 'Email', description: 'admin@foxx.pet', kind: 'mail' },
        ],
      },
    ],
    disclaimer: [
      'This is a private art website. No liability for external links; operators of linked pages remain responsible for their content.',
    ],
  },
  cookbook: {
    id: 'cookbook',
    href: '/cookbook',
    title: 'Nom\u202FNoms\u202F🍪',
    navLabel: 'Nom\u202FNoms\u202F🍪',
    includeInHeader: true,
    description: 'Baking and Cooking recipes approved by the cosmic dinner foundation will soon be published here!',
    introParagraphs: [
      'This is the upcoming place where you gonna find all the foxx\' recipes!',

    ],
    sections: [
      {
        title: 'Cakes are still baking...',
        paragraphs: [
          'Soon there will be a lot to munch!',
        ],
      },
      {
        title: '...eggs are still cooking',
        paragraphs: [
          'For now it seems you\'ll need to look somewhere else to get something delicious!',
          'But soon, that will for sure gonna change!',
        ],
      },
    ],
  }
} as const;

type SiteContent = typeof SITE_CONTENT;
export type PageKey = keyof SiteContent;
export type PageContent<K extends PageKey = PageKey> = SiteContent[K];

const pagesList = Object.values(SITE_CONTENT);

const normalizePath = (path: string) => (path === '/' ? '/' : path.replace(/\/+$/, '') || '/');

export const getPageContent = <K extends PageKey>(key: K): PageContent<K> => SITE_CONTENT[key];

export const getNavigationLinks = () =>
  pagesList.map((page) => ({
    href: page.href,
    label: page.navLabel ?? page.title,
    includeInHeader: page.includeInHeader ?? true,
  }));

export const findPageByHref = (href: string) => {
  const target = normalizePath(href);
  return pagesList.find((page) => normalizePath(page.href) === target);
};
