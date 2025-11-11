# Scroll to Top Functionality

This implementation ensures that when users click on any link anywhere on the website, they are redirected to the correct endpoint and the page automatically scrolls to the top for quick access.

## Components

### 1. ScrollToTop Component (`src/components/common/ScrollToTop.tsx`)
- Automatically scrolls to top when route changes
- Handles all link clicks to ensure scroll to top behavior
- Listens for internal link clicks and applies scroll behavior

### 2. Navigation Utils (`src/utils/navigation.ts`)
- Enhanced with scroll-to-top functionality
- All navigation methods now include automatic scroll to top
- Optional `scrollToTop` parameter to disable if needed

### 3. Scroll Utils (`src/utils/scrollUtils.ts`)
- Utility functions for scroll behavior
- `scrollToTop()` - Scroll to top with smooth animation
- `scrollToElement()` - Scroll to specific element
- `navigateWithScrollToTop()` - Navigate and scroll to top

### 4. Custom Hooks (`src/hooks/useScrollToTop.ts`)
- `useScrollToTop()` - Hook for route-based scroll to top
- `useLinkClickHandler()` - Hook for handling link clicks

## How It Works

1. **Route Changes**: When the route changes (via React Router), the ScrollToTop component automatically scrolls to the top
2. **Link Clicks**: All link clicks are intercepted and checked if they're internal links
3. **Smooth Animation**: Uses CSS `scroll-behavior: smooth` for smooth scrolling
4. **Timing**: Small delay (100ms) ensures navigation happens before scrolling

## Usage

The functionality is automatically enabled when the ScrollToTop component is included in the App.tsx:

```tsx
<Router>
  <ScrollToTop />
  {/* Rest of your app */}
</Router>
```

## Features

- ✅ Automatic scroll to top on route changes
- ✅ Handles all internal link clicks
- ✅ Smooth scrolling animation
- ✅ Works with React Router navigation
- ✅ Works with programmatic navigation
- ✅ Configurable scroll behavior
- ✅ No impact on external links
- ✅ Clean and efficient implementation

## Browser Support

- Modern browsers with CSS `scroll-behavior` support
- Fallback to instant scroll for older browsers
- Works with all major browsers (Chrome, Firefox, Safari, Edge)
