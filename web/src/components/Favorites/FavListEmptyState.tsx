import { FavoriteBorderRounded } from "@mui/icons-material";

export const FavListEmptyState: React.FC<{ onExploreClick: () => void }> = ({
    onExploreClick,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <FavoriteBorderRounded
                sx={{ fontSize: 64, color: "#6B6B6B", mb: 2 }}
            />
            <p className="text-lg font-medium text-[#3E3C31]">
                Chưa có sản phẩm yêu thích
            </p>
            <p className="mt-2 text-sm text-[#6B6B6B]">
                Thêm sản phẩm vào danh sách yêu thích để theo dõi dễ dàng hơn
            </p>
            <button
                type="button"
                onClick={onExploreClick}
                className="mt-6 rounded-2xl bg-linear-to-b from-[#D5AD41] to-[#F4D799] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg cursor-pointer"
            >
                Khám phá sản phẩm
            </button>
        </div>
    );
};
