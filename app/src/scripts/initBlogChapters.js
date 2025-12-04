export default function initBlogChapters () {
  var CLEANUP_KEY = '__blogChaptersCleanup';
  var BOOT_FLAG_KEY = '__blogChaptersBootInstalled';

  if (window[BOOT_FLAG_KEY]) return;
  window[BOOT_FLAG_KEY] = true;

  function initBlogChaptersForCurrentPage() {
    var dataEl = document.getElementById('blog-chapters-data');
    var host = document.getElementById('blog-chapter-target');
    
    
    if (!dataEl || !host) return; // keine Blogseite

    // Guard: pro Seite nur einmal
    if (host.dataset.blogChaptersInit === '1') return;
    host.dataset.blogChaptersInit = '1';

    var raw = dataEl.dataset.chapters;
    if (!raw) return;

    var chapters;
    try {
      chapters = JSON.parse(raw);
    } catch (err) {
      console.warn('Blog chapters JSON invalid:', err, raw);
      return;
    }

    if (!Array.isArray(chapters) || !chapters.length) return;

    var chapterIds = chapters
      .map(function (c) { return c && c.id; })
      .filter(function (id) { return !!id; });

    if (!chapterIds.length) return;

    var titleEl = document.querySelector('[data-chapter-title]');
    var prevBtn = document.querySelector('[data-chapter-prev]');
    var nextBtn = document.querySelector('[data-chapter-next]');
    var tocLinks = document.querySelectorAll('[data-chapter]');

    var children = Array.from(host.children); // nur direkte Elemente
    var currentIndex = 0;

    function showByIndex(idx) {
      if (idx < 0 || idx >= chapterIds.length) return;
      currentIndex = idx;
      var activeId = chapterIds[idx];

      var currentChapterId = null;

      children.forEach(function (el) {
        // Falls dieses Element ein Kapitel-Header ist, aktuellen Abschnitt setzen
        if (chapterIds.indexOf(el.id) !== -1) {
          currentChapterId = el.id;
        }
        var visible = currentChapterId === activeId;
        el.hidden = !visible;
      });

      // TOC-State
      tocLinks.forEach(function (a) {
        a.toggleAttribute('data-active', a.dataset.chapter === activeId);
      });

      // Titel
      if (titleEl) {
        var ch = chapters[idx];
        titleEl.textContent = ch && ch.title ? ch.title : 'Chapter';
      }

      // Buttons
  if (prevBtn) {
    var atFirst = idx === 0;
    prevBtn.toggleAttribute('hidden', atFirst);
  }
  if (nextBtn) {
    var atLast = idx === chapterIds.length - 1;
    nextBtn.toggleAttribute('hidden', atLast);
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

      var idx = chapterIds.indexOf(id);
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
      if (nextIdx < chapterIds.length) showByIndex(nextIdx);
    }

    document.addEventListener('click', onTocClick);
    if (prevBtn) prevBtn.addEventListener('click', onPrev);
    if (nextBtn) nextBtn.addEventListener('click', onNext);

    // initiales Kapitel bestimmen
    var initialHash = window.location.hash.replace('#', '');
    var initialIdx = initialHash ? chapterIds.indexOf(initialHash) : 0;
    if (initialIdx < 0) initialIdx = 0;

    showByIndex(initialIdx);

    // Cleanup für nächste Seite
    window[CLEANUP_KEY] = function () {
      document.removeEventListener('click', onTocClick);
      if (prevBtn) prevBtn.removeEventListener('click', onPrev);
      if (nextBtn) nextBtn.removeEventListener('click', onNext);
      delete host.dataset.blogChaptersInit;
      // im Zweifel alles wieder sichtbar machen
      children.forEach(function (el) {
        el.hidden = false;
      });
    };
  }

  function boot() {
    var oldCleanup = window[CLEANUP_KEY];
    if (typeof oldCleanup === 'function') {
      oldCleanup();
      window[CLEANUP_KEY] = null;
    }
    initBlogChaptersForCurrentPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  document.addEventListener('astro:page-load', boot);
};