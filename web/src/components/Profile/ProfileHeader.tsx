import { Star, TrendingUp, Trophy } from "lucide-react";
import { useEffect } from "react";
import { useUser } from "../../context/useUser";

export default function ProfileHeader() {
    const { user, token, loading, refreshUser } = useUser();

    useEffect(() => {
        if (loading || user || !token) {
            return;
        }

        refreshUser().catch((error) => {
            console.warn('Failed to refresh profile header user', error);
        });
    }, [loading, refreshUser, token, user]);

    const profile = user;

    return (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 w-full md:w-auto">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gray-300 overflow-hidden shrink-0 border-4 border-gray-50">
                    <img
                        //src={profile?.avatar ? `/uploads/${profile.avatar}` : "https://i.pravatar.cc/300?img=11"}
                        src="https://i.pravatar.cc/300?img=11"
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* User Info */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {profile?.full_name || profile?.fullName || 'Người dùng'}
                    </h2>
                    <p className="text-gray-500 mb-2">{profile?.email ? `✉ ${profile.email}` : ''}</p>
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-[#D5AD41] fill-[#D5AD41]" />
                        <span className="font-bold text-lg text-[#D5AD41]">4.8</span>
                        <span className="text-gray-400 text-sm">Đánh giá</span>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="flex gap-10 md:gap-16 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-10 w-full md:w-auto justify-center md:justify-end">
                <div className="text-center group cursor-pointer">
                    <div className="w-12 h-12 bg-[#D5AD41]/10 rounded-full flex items-center justify-center text-[#D5AD41] mx-auto mb-2 group-hover:bg-[#D5AD41] group-hover:text-white transition-colors">
                        <TrendingUp size={24} />
                    </div>
                    <div className="text-3xl font-bold text-gray-800">127</div>
                    <div className="text-sm text-gray-500">Lượt đặt giá</div>
                </div>

                <div className="text-center group cursor-pointer">
                    <div className="w-12 h-12 bg-[#D5AD41]/10 rounded-full flex items-center justify-center text-[#D5AD41] mx-auto mb-2 group-hover:bg-[#D5AD41] group-hover:text-white transition-colors">
                        <Trophy size={24} />
                    </div>
                    <div className="text-3xl font-bold text-gray-800">45</div>
                    <div className="text-sm text-gray-500">Sản phẩm thắng</div>
                </div>
            </div>
        </div>
    );
}
