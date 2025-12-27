import { PackageOpen } from "lucide-react";

export const OrderLoginPrompt: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-[1480px] px-8 py-16">
                <div className="flex flex-col items-center justify-center text-center">
                    <PackageOpen
                        size={64}
                        className="text-[#6B6B6B] mb-4"
                    />
                    <p className="text-lg font-medium text-[#3E3C31]">
                        Vui lòng đăng nhập để xem đơn hàng
                    </p>
                </div>
            </div>
        </div>
    );
};