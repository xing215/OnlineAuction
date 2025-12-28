import CategorySidebar from "../../components/Category/CategorySidebar";
import CategoryForm from "../../components/Category/CategoryForm";
import EmptyState from "../../components/Category/EmptyState";
import AdminLayout from "../../components/Admin/AdminLayout";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useState } from "react";

import { useCategoryManagement } from "../../hooks/useCategoryManagement";

const CategoryManagement = () => {
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const {
        treeData,
        loading,
        selectedId,
        expandedIds,
        mode,
        selectedCategory,
        parentNameForCreate,

        handleSelectNode,
        handleToggleNode,
        handlePrepareCreateRoot,
        handlePrepareCreateSub,
        handleCancel,

        createCategory,
        updateCategory,
        deleteCategory,
        executeDelete,
    } = useCategoryManagement();

    const handleDeleteClick = () => {
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        setIsConfirmModalOpen(false);
        executeDelete();
    };

    if (loading && treeData.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500">
                Đang tải dữ liệu...
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-6 font-sans">
                <div className="max-w-6xl mx-auto mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Quản lý Danh mục
                    </h1>
                    <p className="text-gray-500 text-sm"></p>
                </div>

                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
                    {/* SIDEBAR */}
                    <div className="shrink-0">
                        <CategorySidebar
                            treeData={treeData}
                            expandedIds={expandedIds}
                            selectedId={selectedId}
                            onToggle={handleToggleNode}
                            onSelect={handleSelectNode}
                            onAddRoot={handlePrepareCreateRoot}
                        />
                    </div>

                    {/* FORM */}
                    <div className="flex-1 min-h-[500px]">
                        {mode === "view" && <EmptyState />}

                        {mode === "create" && (
                            <CategoryForm
                                mode="create"
                                parentName={parentNameForCreate}
                                onSubmit={createCategory}
                                onCancel={handleCancel}
                            />
                        )}

                        {mode === "edit" && selectedCategory && (
                            <CategoryForm
                                mode="edit"
                                initialData={selectedCategory}
                                onSubmit={updateCategory}
                                onDelete={handleDeleteClick}
                                onAddSubCategory={handlePrepareCreateSub}
                                onCancel={handleCancel}
                            />
                        )}
                    </div>
                </div>

                {/* Confirm Modal */}
                <ConfirmModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Xác nhận xóa danh mục"
                    message="Bạn có chắc chắn muốn xóa danh mục này? Tất cả danh mục con cũng sẽ bị xóa."
                    confirmText="Xóa"
                    type="danger"
                />
            </div>
        </AdminLayout>
    );
};

export default CategoryManagement;
