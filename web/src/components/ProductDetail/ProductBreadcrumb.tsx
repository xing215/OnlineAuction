import React from "react";

interface ProductBreadcrumbProps {
    categoryName: string;
    productName: string;
    onHomeClick: () => void;
}

export const ProductBreadcrumb: React.FC<ProductBreadcrumbProps> = ({
    categoryName,
    productName,
    onHomeClick,
}) => {
    return (
        <div className="flex items-center gap-2 mb-5 text-xs sm:text-sm text-gray-600">
            <span
                className="cursor-pointer hover:text-blue-600 transition-colors"
                onClick={onHomeClick}
            >
                Trang chủ
            </span>
            <span className="text-gray-400">›</span>
            <span className="cursor-pointer hover:text-blue-600 transition-colors">
                {categoryName}
            </span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-800 font-medium">{productName}</span>
        </div>
    );
};
