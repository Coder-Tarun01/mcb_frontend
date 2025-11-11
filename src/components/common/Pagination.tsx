import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPrevNext = true,
  maxVisiblePages = 5,
  className = ''
}) => {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  // Calculate the range of pages to show
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Adjust if we're near the beginning or end
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages);
    }
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }
    
    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      onPageChange(page);
    }
  };

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`pagination-container ${className}`}>
      <div className="pagination">
        {showPrevNext && (
          <button
            className={`pagination-button prev-button ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={handlePrevClick}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="pagination-icon" />
            <span>Prev</span>
          </button>
        )}

        <div className="pagination-pages">
          {visiblePages.map((page, index) => (
            <button
              key={index}
              className={`pagination-button page-button ${
                page === currentPage ? 'active' : ''
              } ${typeof page === 'string' ? 'ellipsis' : ''}`}
              onClick={() => handlePageClick(page)}
              disabled={typeof page === 'string'}
              aria-label={typeof page === 'number' ? `Go to page ${page}` : undefined}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        {showPrevNext && (
          <button
            className={`pagination-button next-button ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={handleNextClick}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <span>Next</span>
            <ChevronRight className="pagination-icon" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Pagination;