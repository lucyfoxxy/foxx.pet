// src/scripts/initBlogChapters.js
export function initBlogChapters(options) {
  if (!options) return;

  const {
    chapters,
    targetSelector = '#blog-chapter-target',
    titleSelector = '[data-chapter-title]',
    prevSelector = '[data-chapter-prev]',
    nextSelector = '[data-chapter-next]',
  } = options;

  if (!Array.isArray(chapters) || chapters.length === 0) return;

  const run = () => {
    const host = document.querySelector(targetSelector);
    if (!host) return;

    const blocks = {};
    let currentIndex = 0;

    // Headline & Buttons
    const titleEl = document.querySelector(titleSelector);
    const prevBtn = document.querySelector(prevSelector);
    const nextBtn = document.querySelector(nextSelector);
    const tocLinks = document.querySelectorAll('[data-chapter]');

    // --- Kapitel in Wrapper packen ---
    chapters.forEach((ch) => {
      const el =
        host.querySelector('#' + ch.id) ||
        host.querySelector(`[id="${ch.id}"]`);
      if (!el) return;

      const wrapper = document.createElement('div');
      wrapper.dataset.blogChapter = ch.id;
      wrapper.style.opacity = '0';
      wrapper.style.transition = 'opacity 0.25s ease';

      host.insertBefore(wrapper, el);
      wrapper.appendChild(el);

      let next = wrapper.nextSibling;
      while (
        next &&
        !(next.nodeType === 1 && next.id && chapters.some((c) => c.id === next.id))
      ) {
        const move = next;
        next = next.nextSibling;
        wrapper.appendChild(move);
      }

      blocks[ch.id] = wrapper;
    });

    const allWrappers = host.querySelectorAll('[data-blog-chapter]');

    const showByIndex = (idx) => {
      if (idx < 0 || idx >= chapters.length) return;
      const chapter = chapters[idx];
      currentIndex = idx;
      const id = chapter.id;

      // Inhalt umschalten
      allWrappers.forEach((w) => {
        const active = w.dataset.blogChapter === id;
        w.style.display = active ? '' : 'none';
        requestAnimationFrame(() => {
          w.style.opacity = active ? '1' : '0';
        });
      });

      // TOC-Active
      tocLinks.forEach((a) => {
        a.toggleAttribute('data-active', a.dataset.chapter === id);
      });

      // Titel setzen
      if (titleEl) {
        titleEl.textContent = chapter.title ?? 'Chapter';
      }

      // Buttons en/disable
      if (prevBtn) {
        prevBtn.disabled = idx === 0;
        prevBtn.classList.toggle('is-disabled', idx === 0);
      }
      if (nextBtn) {
        nextBtn.disabled = idx === chapters.length - 1;
        nextBtn.classList.toggle('is-disabled', idx === chapters.length - 1);
      }

      // nach oben
      host.scrollTo?.({ top: 0, behavior: 'smooth' });

      // URL aktualisieren
      history.replaceState?.(null, '', '#' + id);
    };

    // Clicks im TOC
    document.addEventListener('click', (ev) => {
      const a = ev.target.closest('[data-chapter]');
      if (!a) return;
      const id = a.dataset.chapter;
      if (!id) return;

      const idx = chapters.findIndex((c) => c.id === id);
      if (idx === -1) return;

      ev.preventDefault();
      showByIndex(idx);
    });

    // Prev / Next Buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const nextIdx = currentIndex - 1;
        if (nextIdx >= 0) showByIndex(nextIdx);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const nextIdx = currentIndex + 1;
        if (nextIdx < chapters.length) showByIndex(nextIdx);
      });
    }

    // Initial: Hash oder erstes Kapitel
    const initialHash = window.location.hash.replace('#', '');
    const initialIdx = initialHash
      ? chapters.findIndex((c) => c.id === initialHash)
      : 0;

    showByIndex(initialIdx >= 0 ? initialIdx : 0);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}



export default initBlogChapters;
