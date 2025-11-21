export default function _isMobile() {
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue('--is-mobile')
    .trim()
    .replace(/['"]/g, '');
  return val === 'true';
}

