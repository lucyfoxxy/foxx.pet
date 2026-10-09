import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { runOnReady } from '../_runOnReady.js';

beforeAll(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => cb(0));
});

beforeEach(() => {
  document.body.innerHTML = '';
  Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });
});

describe('runOnReady', () => {
  it('re-runs after astro swap navigation when the URL changes', () => {
    const callback = vi.fn();

    window.history.replaceState({}, '', '/first');
    runOnReady(callback);

    expect(callback).toHaveBeenCalledTimes(1);

    callback.mockClear();
    document.dispatchEvent(new Event('astro:page-load'));
    expect(callback).not.toHaveBeenCalled();

    window.history.replaceState({}, '', '/second');
    document.dispatchEvent(new Event('astro:after-swap'));

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
