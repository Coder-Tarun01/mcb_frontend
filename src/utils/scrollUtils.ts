// Utility functions for scroll behavior

/**
 * Scroll to top of the page with smooth animation
 */
export const scrollToTop = (smooth: boolean = true) => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
};

/**
 * Scroll to a specific element by ID
 */
export const scrollToElement = (elementId: string, smooth: boolean = true) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'start'
    });
  }
};

/**
 * Scroll to a specific position
 */
export const scrollToPosition = (x: number, y: number, smooth: boolean = true) => {
  window.scrollTo({
    top: y,
    left: x,
    behavior: smooth ? 'smooth' : 'auto'
  });
};

/**
 * Check if user is at the top of the page
 */
export const isAtTop = (): boolean => {
  return window.pageYOffset === 0;
};

/**
 * Get current scroll position
 */
export const getScrollPosition = (): { x: number; y: number } => {
  return {
    x: window.pageXOffset,
    y: window.pageYOffset
  };
};

/**
 * Handle navigation with scroll to top
 */
export const navigateWithScrollToTop = (navigate: (path: string) => void, path: string) => {
  navigate(path);
  // Small delay to ensure navigation happens first
  setTimeout(() => {
    scrollToTop(true);
  }, 100);
};

export default {
  scrollToTop,
  scrollToElement,
  scrollToPosition,
  isAtTop,
  getScrollPosition,
  navigateWithScrollToTop
};
