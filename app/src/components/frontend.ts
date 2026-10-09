import Base from '@Templates/Base.astro';
import Footer from '@Templates/Base/Footer.astro';
import Header from '@Templates/Base/Header.astro';
import Meta from '@Templates/Base/Meta.astro';

import Card from '@Templates/Card.astro';
import MediaFrame from '@Templates/Media/Frame.astro';
import MediaThumbs from '@Templates/Media/Thumbs.astro';
import MediaLightbox from '@Templates/Media/Lightbox.astro';
import EntryBlog from '@Templates/EntryBlog.astro';
import HeaderActions from '@Templates/HeaderActions.astro';
import TileView from '@Templates/TileView.astro';
import TitleWithIcon from '@Templates/TitleWithIcon.astro';


import Category from '@Views/Category.astro';
import Entry from '@Views/Entry.astro';
import Section from '@Views/Section.astro';

import StartPage from '@StaticPages/StartPage.astro';
import ImprintPage from '@StaticPages/ImprintPage.astro';

export const View = {
  Section,
  Category,
  Entry,
};

export const Template = {
  Base,
  Card,
  TitleWithIcon,
  TileView,
  HeaderActions,
  MediaFrame,
  MediaThumbs,
  MediaLightbox,
  EntryBlog,
};

export const BaseParts = {
  Header,
  Footer,
  Meta,
};

export const StaticPages = {
  StartPage,
  ImprintPage,
};
