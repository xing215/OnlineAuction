interface ProfileTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function ProfileTabs({
    activeTab,
    onTabChange,
}: ProfileTabsProps) {
    const tabs = [
        { id: "info", label: "Thông tin cá nhân" },
        { id: "fav", label: "Yêu thích" },
        { id: "bidding", label: "Đang đấu giá" },
        { id: "won", label: "Đã thắng" },
        { id: "rating", label: "Đánh giá" },
    ];

    return (
        <div className="bg-gray-100 rounded-full p-1 mb-8 flex">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex-1 py-3 text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                        activeTab === tab.id
                            ? "bg-white text-gray-800 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
