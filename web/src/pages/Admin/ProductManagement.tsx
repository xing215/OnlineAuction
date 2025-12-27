import { useProductFiltering } from "../../hooks/useProductFiltering";
import { useCategories } from "../../hooks/useCategories";
import { apiUrl } from "../../config/api";
import ProductItem from "../../components/Product/ProductItem";
import ProductFilters from "../../components/Product/ProductFilter";
import Pagination from "../../components/Product/Pagination";
import AdminLayout from "../../components/Admin/AdminLayout";
import toast from "react-hot-toast";

const ProductManagement = () => {
    const { categories } = useCategories();

    const {
        currentProducts,
        totalResults,
        totalPages,
        isLoading,

        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        sortOption,
        setSortOption,
        currentPage,
        setCurrentPage,
        status,
        setStatus,

        refresh,
    } = useProductFiltering();

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

        try {
            const res = await fetch(apiUrl(`/api/products/${id}`), {
                method: "DELETE",
            });
            const json = await res.json();

            if (json.success) {
                toast.success(json.message);
                refresh();
            } else {
                toast.error(json.message || "Xóa thất bại");
            }
        } catch (error) {
            toast.error("Đã xảy ra lỗi kết nối");
        }
    };

    // Component Tab Button
    const TabButton = ({ label, value }: { label: string; value: string }) => (
        <button
            onClick={() => setStatus(value)}
            className={`relative pb-3 px-1 text-sm font-medium transition-colors ${
                status === value
                    ? "text-[#D9A52A] border-b-2 border-[#D9A52A]"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
            }`}
        >
            {label}
        </button>
    );

    return (
        <AdminLayout>
            <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-6 font-sans">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Quản lý Sản phẩm
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Dữ liệu từ Server
                        </p>
                    </div>

                    {/* 1. FILTER */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <ProductFilters
                            categories={categories}
                            activeCategory={activeCategory}
                            onCategoryChange={setActiveCategory}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            sortOption={sortOption}
                            onSortChange={setSortOption}
                            totalProducts={totalResults}
                        />
                    </div>

                    {/* 2. TABS */}
                    <div className="flex gap-6 border-b border-gray-200 overflow-x-auto">
                        <TabButton label="Đang diễn ra" value="active" />
                        <TabButton label="Đã bán" value="sold" />
                        <TabButton label="Hết hạn" value="expired" />
                        <TabButton label="Tất cả" value="all" />
                    </div>

                    {/* 3. PRODUCT LIST */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center py-20 text-gray-500">
                                Đang tải dữ liệu...
                            </div>
                        ) : currentProducts.length > 0 ? (
                            currentProducts.map((product) => (
                                <ProductItem
                                    key={product.id}
                                    product={product}
                                    onDelete={handleDelete}
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-500">
                                    Không tìm thấy sản phẩm nào.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 4. PAGINATION */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProductManagement;
