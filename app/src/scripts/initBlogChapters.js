// src/scripts/initBlogChapters.js (oder inline im globalen Script,
// Kern ist: KEIN runOnReady hier drin)
window.initBlogChapters = function initBlogChapters(options) {
  if (!options) return;

  var chapters = options.chapters;
  var targetSelector = options.targetSelector || '#blog-chapter-target';
  var titleSelector = options.titleSelector || '[data-chapter-title]';
  var prevSelector = options.prevSelector || '[data-chapter-prev]';
  var nextSelector = options.nextSelector || '[data-chapter-next]';

  if (!Array.isArray(chapters) || !chapters.length) return;

  var host = document.querySelector(targetSelector);
  if (!host) return;

  // Guard: Seite nicht doppelt initialisieren
  if (host.dataset.blogChaptersInit === '1') return;
  host.dataset.blogChaptersInit = '1';

  var titleEl = document.querySelector(titleSelector);
  var prevBtn = document.querySelector(prevSelector);
  var nextBtn = document.querySelector(nextSelector);
  var tocLinks = document.querySelectorAll('[data-chapter]');

  var wrappers = [];
  var allNodes = Array.from(host.childNodes).filter(function (node) {
    return (
      node.nodeType === Node.ELEMENT_NODE ||
      (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '')
    );
  });

  function findIndexById(id) {
    return allNodes.findIndex(function (node) {
      return node.nodeType === Node.ELEMENT_NODE && node.id === id;
    });
  }

  for (var i = 0; i < chapters.length; i++) {
    var chapter = chapters[i];
    var startIdx = findIndexById(chapter.id);
    if (startIdx === -1) continue;

    var nextChapterId = i < chapters.length - 1 ? chapters[i + 1].id : null;
    var endIdx = nextChapterId ? findIndexById(nextChapterId) : allNodes.length;

    if (endIdx !== -1 && endIdx <= startIdx) continue;

    var range = document.createRange();
    range.setStartBefore(allNodes[startIdx]);

    if (endIdx === -1 || endIdx >= allNodes.length) {
      range.setEndAfter(allNodes[allNodes.length - 1]);
    } else {
      range.setEndBefore(allNodes[endIdx]);
    }

    var wrapper = document.createElement('div');
    wrapper.dataset.blogChapter = chapter.id;
    wrapper.classList.add('blog-chapter-block');

    var contents = range.extractContents();
    wrapper.appendChild(contents);
    host.appendChild(wrapper);
    wrappers.push(wrapper);
  }

  if (!wrappers.length) {
    delete host.dataset.blogChaptersInit;
    return;
  }

  var currentIndex = 0;

  function showByIndex(idx) {
    if (idx < 0 || idx >= wrappers.length) return;
    currentIndex = idx;
    var chapter = chapters[idx];
    var activeId = chapter.id;

    wrappers.forEach(function (w) {
      var active = w.dataset.blogChapter === activeId;
      if (active) {
        w.removeAttribute('hidden');
      } else {
        w.setAttribute('hidden', '');
      }
    });

    tocLinks.forEach(function (a) {
      a.toggleAttribute('data-active', a.dataset.chapter === activeId);
    });

    if (titleEl) {
      titleEl.textContent = chapter.title || 'Chapter';
    }

    if (prevBtn) {
      var disabledPrev = idx === 0;
      prevBtn.disabled = disabledPrev;
      prevBtn.classList.toggle('is-disabled', disabledPrev);
    }

    if (nextBtn) {
      var disabledNext = idx === wrappers.length - 1;
      nextBtn.disabled = disabledNext;
      nextBtn.classList.toggle('is-disabled', disabledNext);
    }

    if (host.scrollTo) {
      host.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (history.replaceState) {
      history.replaceState(null, '', '#' + activeId);
    }
  }

  function onTocClick(ev) {
    var a = ev.target.closest && ev.target.closest('[data-chapter]');
    if (!a) return;
    var id = a.dataset.chapter;
    if (!id) return;

    var idx = chapters.findIndex(function (c) {
      return c.id === id;
    });
    if (idx === -1) return;

    ev.preventDefault();
    showByIndex(idx);
  }

  function onPrev() {
    var nextIdx = currentIndex - 1;
    if (nextIdx >= 0) showByIndex(nextIdx);
  }

  function onNext() {
    var nextIdx = currentIndex + 1;
    if (nextIdx < wrappers.length) showByIndex(nextIdx);
  }

  document.addEventListener('click', onTocClick);
  if (prevBtn) prevBtn.addEventListener('click', onPrev);
  if (nextBtn) nextBtn.addEventListener('click', onNext);

  var initialHash = window.location.hash.replace('#', '');
  var initialIdx = initialHash
    ? chapters.findIndex(function (c) {
        return c.id === initialHash;
      })
    : 0;

  showByIndex(initialIdx >= 0 ? initialIdx : 0);

  window.__blogChaptersCleanup = function () {
    document.removeEventListener('click', onTocClick);
    if (prevBtn) prevBtn.removeEventListener('click', onPrev);
    if (nextBtn) nextBtn.removeEventListener('click', onNext);
    if (host && host.dataset) {
      delete host.dataset.blogChaptersInit;
    }
  };
};
