import { useState, useEffect } from "react";
import { apiUrl } from "../../config/api";
import { useUser } from "../../context/useUser";
import toast from "react-hot-toast";
import { Settings, Save } from "@mui/icons-material";
import { AdminLayout } from "../../components/Admin";

interface AuctionSettings {
    auto_extend_threshold: number;
    auto_extend_duration: number;
}

export const AuctionSettingsManager: React.FC = () => {
    const { token } = useUser();
    const [settings, setSettings] = useState<AuctionSettings>({
        auto_extend_threshold: 5,
        auto_extend_duration: 10,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch(apiUrl("/api/settings/auction"));
            const data = await response.json();

            if (data.success) {
                setSettings(data.data);
            } else {
                toast.error("Không thể tải cài đặt");
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("Lỗi khi tải cài đặt");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            // Validate inputs
            if (settings.auto_extend_threshold < 1 || settings.auto_extend_threshold > 60) {
                toast.error("Thời gian ngưỡng phải từ 1 đến 60 phút");
                return;
            }

            if (settings.auto_extend_duration < 1 || settings.auto_extend_duration > 120) {
                toast.error("Thời gian gia hạn phải từ 1 đến 120 phút");
                return;
            }

            setSaving(true);
            const response = await fetch(apiUrl("/api/settings/auction"), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(settings),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Cập nhật cài đặt thành công");
                setSettings(data.data);
            } else {
                toast.error(data.message || "Không thể cập nhật cài đặt");
            }
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error("Lỗi khi cập nhật cài đặt");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof AuctionSettings, value: string) => {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setSettings((prev) => ({
                ...prev,
                [field]: numValue,
            }));
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex justify-center items-start min-h-screen p-6">
                <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl w-full">
                    <div className="flex items-center gap-3 mb-6">
                        <Settings className="text-yellow-600" fontSize="large" />
                        <h2 className="text-2xl font-bold text-gray-800">
                            Cài Đặt Đấu Giá
                    </h2>
                </div>

                <div className="space-y-6">
                    <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                        <div className="flex items-start gap-3">
                            <span className="text-yellow-600 mt-0.5"></span>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                Các cài đặt này áp dụng cho toàn bộ sản phẩm trong hệ thống. 
                                Khi có lượt đấu giá mới gần thời điểm kết thúc, 
                                hệ thống sẽ tự động gia hạn thời gian.
                            </p>
                        </div>
                    </div>

                    {/* Auto Extend Threshold */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Thời Gian Ngưỡng Gia Hạn (phút)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Nếu có lượt đấu giá mới trong khoảng thời gian này trước
                            khi kết thúc, đấu giá sẽ được gia hạn tự động
                        </p>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={settings.auto_extend_threshold}
                            onChange={(e) =>
                                handleChange("auto_extend_threshold", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Nhập số phút (1-60)"
                        />
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                            <span>Tối thiểu: 1 phút</span>
                            <span>Tối đa: 60 phút</span>
                        </div>
                    </div>

                    {/* Auto Extend Duration */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Thời Gian Gia Hạn (phút)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Thời gian sẽ được thêm vào khi có lượt đấu giá trong
                            khoảng thời gian ngưỡng
                        </p>
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={settings.auto_extend_duration}
                            onChange={(e) =>
                                handleChange("auto_extend_duration", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Nhập số phút (1-120)"
                        />
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                            <span>Tối thiểu: 1 phút</span>
                            <span>Tối đa: 120 phút</span>
                        </div>
                    </div>

                    {/* Example */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Ví dụ</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            Sản phẩm còn <span className="font-semibold text-gray-900">{settings.auto_extend_threshold} phút</span> nữa kết thúc → 
                            Có người đặt giá → 
                            Hệ thống tự động gia hạn thêm <span className="font-semibold text-gray-900">{settings.auto_extend_duration} phút</span>.
                        </p>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save />
                        {saving ? "Đang lưu..." : "Lưu Cài Đặt"}
                    </button>
                </div>
            </div>
            </div>
        </AdminLayout>
    );
};
