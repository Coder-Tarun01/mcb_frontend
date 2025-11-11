import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Hook to handle scroll to top on route changes
export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);
};

// Hook to handle click events on links
export const useLinkClickHandler = () => {
  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        // Check if it's an internal link
        const isInternalLink = link.href.startsWith(window.location.origin);
        
        if (isInternalLink) {
          // Small delay to ensure navigation happens first
          setTimeout(() => {
            window.scrollTo({
              top: 0,
              left: 0,
              behavior: 'smooth'
            });
          }, 100);
        }
      }
    };

    // Add event listener to document
    document.addEventListener('click', handleLinkClick);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);
};

export default useScrollToTop;
