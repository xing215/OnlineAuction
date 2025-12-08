import React from "react";
import { formatDate } from "../../utilities";
import type { Product } from "../../types";

type TabType = "description" | "bidHistory" | "questions";

interface ProductTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    product: Product;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({
    activeTab,
    onTabChange,
    product,
}) => {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div className="flex border-b border-gray-200">
                <button
                    className={`flex-1 px-4 py-4 text-base font-medium transition-colors relative ${
                        activeTab === "description"
                            ? "text-blue-600"
                            : "text-gray-600 hover:text-blue-600"
                    }`}
                    onClick={() => onTabChange("description")}
                >
                    Mô tả
                    {activeTab === "description" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                    )}
                </button>
                <button
                    className={`flex-1 px-4 py-4 text-base font-medium transition-colors relative ${
                        activeTab === "bidHistory"
                            ? "text-blue-600"
                            : "text-gray-600 hover:text-blue-600"
                    }`}
                    onClick={() => onTabChange("bidHistory")}
                >
                    Lịch sử đấu giá
                    {activeTab === "bidHistory" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                    )}
                </button>
                <button
                    className={`flex-1 px-4 py-4 text-base font-medium transition-colors relative ${
                        activeTab === "questions"
                            ? "text-blue-600"
                            : "text-gray-600 hover:text-blue-600"
                    }`}
                    onClick={() => onTabChange("questions")}
                >
                    Hỏi đáp
                    {activeTab === "questions" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                    )}
                </button>
            </div>
            <div className="p-5">
                {activeTab === "description" && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">
                            Thông tin chi tiết
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {product.description || "Chưa có mô tả chi tiết."}
                        </p>
                        {product.description_updates &&
                            product.description_updates.length > 0 && (
                                <div className="mt-5 pt-5 border-t border-gray-200">
                                    <h4 className="text-base font-semibold mb-4 text-gray-800">
                                        Cập nhật mô tả:
                                    </h4>
                                    {product.description_updates.map(
                                        (update, index) => (
                                            <div
                                                key={index}
                                                className="mb-4 p-2 bg-gray-50 rounded"
                                            >
                                                <p className="mb-1 text-gray-700">
                                                    {update.content}
                                                </p>
                                                <span className="text-xs text-gray-400">
                                                    {formatDate(
                                                        update.created_at.toISOString()
                                                    )}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                    </div>
                )}
                {activeTab === "bidHistory" && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">
                            Lịch sử đấu giá
                        </h3>
                    </div>
                )}
                {activeTab === "questions" && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">
                            Hỏi đáp
                        </h3>
                        <p className="text-gray-400 italic">
                            Chưa có cuộc hỏi đáp nào
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
