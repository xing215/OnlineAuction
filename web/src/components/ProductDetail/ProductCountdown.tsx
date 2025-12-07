import React from "react";
import { AccessTime } from "@mui/icons-material";

interface ProductCountdownProps {
    timeRemaining: string;
}

export const ProductCountdown: React.FC<ProductCountdownProps> = ({
    timeRemaining,
}) => {
    return (
        <div className="bg-gray-100 p-4 rounded-xl">
            <span className="block text-sm text-gray-600 mb-2">
                Thời gian còn lại
            </span>
            <div className="flex items-center gap-2">
                <AccessTime className="text-black text-sm sm:text-xl" />
                <span className="text-sm sm:text-2xl font-semibold text-black">
                    {timeRemaining}
                </span>
            </div>
        </div>
    );
};
