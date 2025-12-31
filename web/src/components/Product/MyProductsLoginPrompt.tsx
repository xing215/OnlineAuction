import { Inventory2Rounded } from "@mui/icons-material";

export const MyProductsLoginPrompt: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-[1480px] px-8 py-16">
                <div className="flex flex-col items-center justify-center text-center">
                    <Inventory2Rounded
                        sx={{ fontSize: 64, color: "#6B6B6B" }}
                        className="mb-4"
                    />
                    <p className="text-lg font-medium text-[#3E3C31]">
                        Vui lòng đăng nhập để xem sản phẩm của bạn
                    </p>
                </div>
            </div>
        </div>
    );
};