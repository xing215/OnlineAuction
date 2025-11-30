interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Logic tính toán các trang cần hiển thị
  const getVisiblePages = () => {
    const maxVisible = 5; // Số lượng nút tối đa muốn hiện
    const pages = [];

    // Tính toán trang bắt đầu: Cố gắng để trang hiện tại nằm giữa
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    
    // Tính toán trang kết thúc
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // Nếu trang kết thúc chạm trần, phải lùi trang bắt đầu lại để đủ số lượng nút
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-2xl border transition-colors ${
            currentPage === page
              ? 'bg-[#D5AD41] text-black border-0' // Trang hiện tại
              : 'bg-gray-200 text-gray-700 hover:bg-gray-100 border-gray-200'
          }`}
        >
          {page}
        </button>
      ))}
    </div>
  );
}