import Base from '@Templates/Base.astro';
import Footer from '@Templates/Base/Footer.astro';
import Meta from '@Templates/Base/Meta.astro';
import Header from '@Templates/Base/Header.astro';

import Card from '@Templates/Card.astro';
import TitleWithIcon from '@Templates/TitleWithIcon.astro';
import TileView from '@Templates/TileView.astro'
import HeaderActions from '@Templates/HeaderActions.astro';

import Section from '@Views/Section.astro';
import Category from '@Views/Category.astro';

import Entry from '@Views/Entry.astro';
import EntryAlbum from '@Templates/EntryAlbum.astro';
import EntryBlog from '@Templates/EntryBlog.astro';


export const View = {
    Section,
    Category,
    Entry
}

export const Template = {
    Base,
    Card,
    TitleWithIcon,
    TileView,
    HeaderActions,
    EntryAlbum,
    EntryBlog
}

export const BaseParts = {
    Header,
    Footer,
    Meta
}