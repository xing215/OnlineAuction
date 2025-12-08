import React from "react";
import { Star } from "@mui/icons-material";
import { formatDate } from "../../utilities";
import type { User } from "../../types";

interface ProductHeaderProps {
    productName: string;
    seller: User | null;
    createdAt: Date;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({
    productName,
    seller,
    createdAt,
}) => {
    return (
        <div className="border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-semibold mb-2 text-gray-800">
                {productName}
            </h1>
            <div className="flex items-center gap-2 text-sm">
                <div className="flex gap-0.5">
                    <span className="text-gray-600">Người bán:</span>
                    <span className="text-blue-600 font-medium">
                        {seller?.full_name}
                    </span>
                </div>
                <span className="flex justify-center items-center text-orange-400">
                    <Star />
                    {seller?.rating_percentage || 0}%
                </span>
                <div className="flex gap-0.5">
                    <span className="text-gray-600 hidden sm:inline">
                        Ngày đăng:
                    </span>
                    <span className="text-gray-600">
                        {formatDate(createdAt)}
                    </span>
                </div>
            </div>
        </div>
    );
};
