export function initBlogChapters(options) {
  if (!options) return;
  const { chapters, targetSelector = '#blog-chapter-target' } = options;
  if (!Array.isArray(chapters) || chapters.length === 0) return;

  const run = () => {
    const host = document.querySelector(targetSelector);
    if (!host) return;

    const blocks = {};

    // --- Kapitel wrappen ---
    chapters.forEach((ch) => {
      const el = host.querySelector('#' + ch.id);
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
    const tocLinks = document.querySelectorAll('[data-chapter]');

    const show = (id) => {
      allWrappers.forEach((w) => {
        const active = w.dataset.blogChapter === id;
        w.style.display = active ? '' : 'none';
        requestAnimationFrame(() => {
          w.style.opacity = active ? '1' : '0';
        });
      });

      // reset scroll (nur, wenn Nutzer nicht gerade mitten im Text ist)
      host.scrollTo?.({ top: 0, behavior: 'smooth' });

      // aktiven TOC-Link markieren
      tocLinks.forEach((a) => {
        a.toggleAttribute('data-active', a.dataset.chapter === id);
      });
    };

    document.addEventListener('click', (ev) => {
      const a = ev.target.closest('[data-chapter]');
      if (!a) return;
      const id = a.dataset.chapter;
      if (!id || !blocks[id]) return;
      ev.preventDefault();
      history.replaceState(null, '', '#' + id);
      show(id);
    });

    const initialHash = window.location.hash.replace('#', '');
    const first = chapters[0]?.id;
    show(initialHash && blocks[initialHash] ? initialHash : first);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else run();
}


export default initBlogChapters;
