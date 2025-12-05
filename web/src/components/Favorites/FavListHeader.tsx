import { Favorite } from "@mui/icons-material";

interface FavListHeaderProps {
    productCount: number;
    isLoading: boolean;
}

export const FavListHeader: React.FC<FavListHeaderProps> = ({
    productCount,
    isLoading,
}) => {
    return (
        <>
            {/* Header */}
            <div className="mb-8 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center">
                        <Favorite
                            sx={{
                                fontSize: 32,
                                color: "red",
                                pointerEvents: "none",
                            }}
                        />
                    </div>
                    <h1 className="leading-6 text-[#3E3C31] font-bold text-3xl">
                        Danh sách yêu thích
                    </h1>
                </div>
                <p className="text-base font-normal leading-6 text-[#6B6B6B]">
                    Các sản phẩm bạn đã lưu để theo dõi
                </p>
            </div>

            {/* Product Count */}
            <div className="mb-12">
                <p className="text-base font-normal leading-6 text-[#6B6B6B]">
                    {isLoading ? "Đang tải..." : `${productCount} sản phẩm`}
                </p>
            </div>
        </>
    );
};
