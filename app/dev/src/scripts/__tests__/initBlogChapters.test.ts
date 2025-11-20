import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import initBlogChapters from '../initBlogChapters.js';

const chapters = [
  { id: 'one', title: 'Chapter One' },
  { id: 'two', title: 'Chapter Two' },
];

const setupDom = () => {
  document.body.innerHTML = `
    <div id="blog-chapter-target">
      <section id="one">First</section>
      <section id="two">Second</section>
    </div>
    <h2 data-chapter-title></h2>
    <button data-chapter-prev></button>
    <button data-chapter-next></button>
    <nav>
      <a data-chapter="one">One</a>
      <a data-chapter="two">Two</a>
    </nav>
  `;
};

beforeAll(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => cb(0));
  Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });
  // @ts-expect-error - jsdom lacks scrollTo
  Element.prototype.scrollTo = vi.fn();
});

beforeEach(() => {
  setupDom();
});

describe('initBlogChapters lifecycle', () => {
  it('returns a cleanup function that prevents listener accumulation', () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    const cleanup = initBlogChapters({ chapters });
    replaceStateSpy.mockClear();

    cleanup?.();
    setupDom();

    const secondCleanup = initBlogChapters({ chapters });
    replaceStateSpy.mockClear();

    const tocLink = document.querySelector('[data-chapter="two"]');
    tocLink?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(replaceStateSpy).toHaveBeenCalledTimes(1);

    secondCleanup?.();
  });
});
