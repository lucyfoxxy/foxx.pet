export type NavEntry = {
  id: 'home' | 'galleries' | 'stories' | 'imprint';
  href: string;
  label: string;
  includeInHeader: boolean;
};

export type HomePageContent = {
  meta: { title: string; description: string };
  hero: { heading: string; subheading: string };
  intro: { heading: string; paragraphs: string[]; signature: string };
  feature: { heading: string; description: string };
  contact: {
    heading: string;
    links: { href: string; label: string; kind: 'link' | 'mail' }[];
  };
};

export type GalleryCategory = {
  slug: string;
  title: string;
  description?: string;
};

export type GalleriesPageContent = {
  meta: { title: string; description: string };
  intro: { heading: string; description: string };
  categories: GalleryCategory[];
};

export type StoriesPageContent = {
  meta: { title: string; description: string };
  sections: { heading: string; paragraphs: string[] }[];
};

export type ImprintContact = {
  title: string;
  subtitle?: string;
  details: { term: string; value: string; type?: 'email' }[];
};

export type ImprintPageContent = {
  meta: { title: string; description: string };
  intro: string[];
  contacts: ImprintContact[];
  disclaimer: string;
};

export type SiteContent = {
  navigation: NavEntry[];
  pages: {
    home: HomePageContent;
    galleries: GalleriesPageContent;
    stories: StoriesPageContent;
    imprint: ImprintPageContent;
  };
};

export const siteContent: SiteContent = {
  navigation: [
    { id: 'home', href: '/', label: 'Home', includeInHeader: false },
    { id: 'galleries', href: '/galleries', label: 'Galleries', includeInHeader: true },
    { id: 'stories', href: '/stories', label: 'Stories', includeInHeader: true },
    { id: 'imprint', href: '/imprint', label: 'Imprint', includeInHeader: true },
  ],
  pages: {
    home: {
      meta: {
        title: 'Base Template - Your Project Name',
        description: 'Use this page as a starting point for a new Astro page.',
      },
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
      },
      contact: {
        heading: 'Get in Touch',
        links: [
          { href: 'https://example.com', label: 'External Link', kind: 'link' },
          { href: 'mailto:you@example.com', label: 'Email', kind: 'mail' },
        ],
      },
    },
    galleries: {
      meta: {
        title: 'Galleries',
        description: 'Explore a curated selection of previous works and themed collections.',
      },
      intro: {
        heading: 'Galleries',
        description: 'Here you gonna find a selection of my previous works.',
      },
      categories: [
        {
          slug: 'full-art-sfw',
          title: 'Full Art - SFW',
          description:
            'Detailed, full-color illustration - bring your character to life! Perfect as a wallpaper, poster, or heartfelt gift for your beloved ones!',
        },
        {
          slug: 'full-art-nsfw',
          title: 'Full Art - NSFW',
          description:
            'Detailed, kinky illustrations making your wildest and darkest dreams come true - at least as a piece of art!',
        },
        {
          slug: 'ref-sheets',
          title: 'Reference Sheets',
          description:
            'A complete overview of your fursona including every single detail (accessories, markings), mainly used by Suitmakers and other artists.',
        },
        {
          slug: 'badges',
          title: 'Badges',
          description:
            'Wearable art pieces made for conventions or everyday use. Badges are laminated and cut to shape, often used for identification or just to show off your character.',
        },
        {
          slug: 'sticker-packs',
          title: 'Sticker Packs',
          description:
            'Let’s create your very own personal sticker pack for messengers like Telegram. Any emotion or expression — including NSFW — is possible!',
        },
        {
          slug: 'prints',
          title: 'Prints',
          description:
            'The good old evergreens every furry needs: physical stickers and buttons — perfect to decorate your bag, trade at conventions, or stick to that lantern right outside your door!',
        },
        {
          slug: 'sketch',
          title: 'Sketches',
          description: 'Not sure how your idea might turn out? Let’s explore it together with a quick sketch first!',
        },
        {
          slug: 'line-art',
          title: 'Line Art',
          description:
            'Clear, clean line art — ready for you to colorize, or simply enjoy as it is. Great if you want to add your own creative touch.',
        },
        {
          slug: 'logos-tribals',
          title: 'Logos & Tribals',
          description:
            'Unique logos and tribal designs made just for you — whether for your wall, your car, or even yourself. Disclaimer: I won’t be the one sticking them on!',
        },
      ],
    },
    stories: {
      meta: {
        title: 'Stories',
        description: 'Read about upcoming tales from Lucy’s cosmos. A proper blog will follow soon.',
      },
      sections: [
        {
          heading: 'Stories Preview',
          paragraphs: [
            'A cozy corner for short tales, travel logs, and creative experiments will live here soon.',
            'Until the writing desk is ready you can look forward to curated highlights, behind-the-scenes snippets, and maybe even a cheeky poem or two.',
          ],
        },
        {
          heading: 'What to Expect',
          paragraphs: [
            'Expect whimsical adventures, progress updates, and crossovers with the visual galleries.',
            'This placeholder keeps the seat warm while the upcoming blog system is being prepared.',
          ],
        },
      ],
    },
    imprint: {
      meta: {
        title: 'Imprint / Impressum',
        description: 'Legal and contact information for foxx.pet.',
      },
      intro: [
        'In case of any suspected copyright infringement or any other legal claims, you may contact us at:',
      ],
      contacts: [
        {
          title: 'Content Management',
          subtitle: '- Artworks & Stories -',
          details: [
            { term: 'Nickname', value: 'Faelis Skribblekitty' },
            { term: 'Name, Surname', value: 'Jungmann, Stephanie' },
            { term: 'Address', value: 'Michaelstr. 38, 47055 Duisburg, NRW, Germany' },
            { term: 'Email', value: 'content@foxx.pet', type: 'email' },
          ],
        },
        {
          title: 'Site Administration',
          subtitle: '- Domain & Infrastructure -',
          details: [
            { term: 'Nickname', value: 'Lucy Foxx' },
            { term: 'Name, Surname', value: 'Wiese, Julian' },
            { term: 'Address', value: 'Michaelstr. 38, 47055 Duisburg, NRW, Germany' },
            { term: 'Email', value: 'admin@foxx.pet', type: 'email' },
          ],
        },
      ],
      disclaimer:
        'This is a private art website. No liability for external links; operators of linked pages are responsible for their content. Prices are subject to change and can change without any further notice.',
    },
  },
};
