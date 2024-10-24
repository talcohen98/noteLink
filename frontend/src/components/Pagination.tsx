import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > 5) {
    if (currentPage < 3) {
      endPage = 5;
    } else if (currentPage > totalPages - 2) {
      startPage = totalPages - 4;
    } else {
      startPage = currentPage - 2;
      endPage = currentPage + 2;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination">
      <button name="first" onClick={() => onPageChange(1)} disabled={currentPage === 1}>First</button>
      <button name="previous" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
      {pageNumbers.map(number => (
        <button
          key={number}
          name={`page-${number}`}
          onClick={() => onPageChange(number)}
          style={{ fontWeight: currentPage === number ? 'bold' : 'normal' }}
        >
          {number}
        </button>
      ))}
      <button name="next" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
      <button name="last" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>Last</button>
    </div>
  );
};
