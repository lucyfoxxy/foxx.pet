const hasHeadingTag = (element) =>
  typeof element?.tagName === 'string' && /^H[1-6]$/.test(element.tagName);

const escapeId = (value) => {
  if (typeof value !== 'string') return '';
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/"/g, '\\"').replace(/\s/g, '\\ ');
};

const normalizeChapters = (chapters) =>
  Array.isArray(chapters)
    ? chapters
        .map((chapter) => ({
          ...chapter,
          id: typeof chapter?.id === 'string' ? chapter.id.trim() : '',
        }))
        .filter((chapter) => chapter.id.length > 0)
    : [];

const isChapterHeading = (node, chapterIds) => {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;

  const element = node;
  if (!hasHeadingTag(element)) return false;

  const id = element.getAttribute('id');
  return typeof id === 'string' && chapterIds.has(id);
};

const createChapterHtmlMap = (target, chapters) => {
  const chapterIds = new Set(chapters.map((chapter) => chapter.id));
  const firstChapterId = chapters[0]?.id ?? null;
  const chapterMap = new Map();

  chapters.forEach((chapter) => {
    const heading = target.querySelector(`#${escapeId(chapter.id)}`);

    if (!heading) return;

    const wrapper = document.createElement('div');

    if (firstChapterId && chapter.id === firstChapterId) {
      const leadingNodes = [];
      let previous = heading.previousSibling;

      while (previous) {
        leadingNodes.push(previous.cloneNode(true));
        previous = previous.previousSibling;
      }

      for (let index = leadingNodes.length - 1; index >= 0; index -= 1) {
        wrapper.appendChild(leadingNodes[index]);
      }
    }

    let current = heading;

    while (current) {
      if (current !== heading && isChapterHeading(current, chapterIds)) {
        break;
      }

      wrapper.appendChild(current.cloneNode(true));
      current = current.nextSibling;
    }

    const html = wrapper.innerHTML.trim();

    if (html.length > 0) {
      chapterMap.set(chapter.id, html);
    }
  });

  return chapterMap;
};

const setActiveChapterLink = (chapterId) => {
  const links = document.querySelectorAll('[data-chapter]');

  links.forEach((link) => {
    if (!(link instanceof HTMLElement)) return;

    const isActive = link.dataset.chapter === chapterId;
    link.classList.toggle('is-active', isActive);

    if (isActive) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

const updateHash = (chapterId) => {
  try {
    const url = new URL(window.location.href);
    url.hash = chapterId;
    window.history.replaceState(null, '', url);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to update chapter hash', error);
  }
};

const renderChapter = (target, chapterMap, chapterId, { scrollIntoView = false } = {}) => {
  const html = chapterMap.get(chapterId);

  if (typeof html !== 'string') return false;

  target.innerHTML = html;

  if (scrollIntoView) {
    requestAnimationFrame(() => {
      try {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (error) {
        target.scrollIntoView();
      }
    });
  }

  return true;
};

const attachLinkListeners = (chapterMap, onSelect) => {
  const links = document.querySelectorAll('[data-chapter]');

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!(event.currentTarget instanceof HTMLElement)) return;

      const chapterId = event.currentTarget.dataset.chapter ?? '';

      if (!chapterMap.has(chapterId)) return;

      event.preventDefault();
      onSelect(chapterId, { scrollIntoView: true, updateHash: true });
    });
  });
};

const initHashListener = (chapterMap, onSelect) => {
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace(/^#/, '');

    if (!chapterMap.has(hash)) return;

    onSelect(hash, { scrollIntoView: true, updateHash: false });
  });
};

const initBlogChapters = (options = {}) => {
  const { chapters: rawChapters, targetSelector } = options;

  const target =
    typeof targetSelector === 'string' && targetSelector.length > 0
      ? document.querySelector(targetSelector)
      : null;

  if (!(target instanceof HTMLElement)) return;
  if (target.dataset.blogChaptersInitialized === 'true') return;

  const chapters = normalizeChapters(rawChapters);

  if (chapters.length === 0) return;

  const chapterMap = createChapterHtmlMap(target, chapters);

  if (chapterMap.size === 0) return;

  const initialHash = window.location.hash.replace(/^#/, '');
  const defaultChapterId = chapterMap.has(initialHash)
    ? initialHash
    : chapters[0]?.id;

  if (!defaultChapterId) return;

  const selectChapter = (chapterId, { scrollIntoView = false, updateHash: shouldUpdateHash = false } = {}) => {
    if (!chapterMap.has(chapterId)) return;

    renderChapter(target, chapterMap, chapterId, { scrollIntoView });
    setActiveChapterLink(chapterId);

    if (shouldUpdateHash) {
      updateHash(chapterId);
    }
  };

  target.dataset.blogChaptersInitialized = 'true';

  selectChapter(defaultChapterId, { updateHash: initialHash.length > 0 });

  attachLinkListeners(chapterMap, selectChapter);
  initHashListener(chapterMap, selectChapter);
};

export default initBlogChapters;
