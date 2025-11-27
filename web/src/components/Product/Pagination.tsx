interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Nếu chỉ có 1 trang thì không cần hiện thanh phân trang
  if (totalPages <= 1) return null;

  // Tạo mảng số trang [1, 2, 3...]
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      {/* Các nút số trang */}
      {pages.map((page) => (
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