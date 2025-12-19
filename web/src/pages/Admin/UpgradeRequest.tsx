import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Check, X, AlertCircle } from "lucide-react";
import { apiUrl } from "../../config/api";
import { formatDate } from "../../utilities/FormatDate";
import { useUser } from "../../context/useUser";
import AdminLayout from "../../components/Admin/AdminLayout";

interface UpgradeRequestItem {
    _id: string;
    user: {
        _id: string;
        full_name: string;
        email: string;
    };
    reason: string;
    status: "pending" | "approved" | "rejected";
    admin_note: string;
    createdAt: string;
    updatedAt: string;
}

export const UpgradeRequest: React.FC = () => {
    const [requests, setRequests] = useState<UpgradeRequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] =
        useState<UpgradeRequestItem | null>(null);
    const [adminNote, setAdminNote] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState<"approve" | "reject" | null>(
        null
    );
    const { token } = useUser();

    useEffect(() => {
        if (token) {
            fetchRequests();
        }
    }, [token, filterStatus]);

    const fetchRequests = async () => {
        if (!token) return;

        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus !== "all") {
                params.append("status", filterStatus);
            }
            params.append("limit", "100"); // Get more results

            const response = await fetch(
                apiUrl(`/api/upgrade/all?${params.toString()}`),
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                setRequests(data.data?.requests || []);
            } else {
                console.error("Failed to fetch requests:", response.statusText);
            }
        } catch (error) {
            console.error("Failed to fetch requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = React.useMemo(() => {
        return requests.filter((request) => {
            const matchesSearch =
                request.user.full_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                request.user.email
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesStatus =
                filterStatus === "all" || request.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [requests, searchTerm, filterStatus]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-50 border-yellow-300 text-yellow-700";
            case "approved":
                return "bg-green-50 border-green-300 text-green-700";
            case "rejected":
                return "bg-red-50 border-red-300 text-red-700";
            default:
                return "bg-gray-50 border-gray-200 text-gray-700";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "pending":
                return "Chờ xử lý";
            case "approved":
                return "Chấp thuận";
            case "rejected":
                return "Từ chối";
            default:
                return status;
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;
        try {
            const response = await fetch(
                apiUrl(`/api/upgrade/${selectedRequest._id}/approve`),
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        admin_note: adminNote || "Yêu cầu đã được chấp nhận",
                        expiry_days: 365,
                    }),
                }
            );

            if (response.ok) {
                alert("Đã chấp nhận yêu cầu nâng cấp!");
                fetchRequests();
                setIsModalOpen(false);
                setSelectedRequest(null);
                setAdminNote("");
            } else {
                const data = await response.json();
                alert(data.message || "Không thể chấp nhận yêu cầu");
            }
        } catch (error) {
            console.error("Failed to approve request:", error);
            alert("Lỗi kết nối. Vui lòng thử lại.");
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;

        if (!adminNote.trim()) {
            alert("Vui lòng nhập lý do từ chối");
            return;
        }

        try {
            const response = await fetch(
                apiUrl(`/api/upgrade/${selectedRequest._id}/reject`),
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        admin_note: adminNote.trim(),
                    }),
                }
            );

            if (response.ok) {
                alert("Đã từ chối yêu cầu");
                fetchRequests();
                setIsModalOpen(false);
                setSelectedRequest(null);
                setAdminNote("");
            } else {
                const data = await response.json();
                alert(data.message || "Không thể từ chối yêu cầu");
            }
        } catch (error) {
            console.error("Failed to reject request:", error);
            alert("Lỗi kết nối. Vui lòng thử lại.");
        }
    };

    const openActionModal = (
        request: UpgradeRequestItem,
        action: "approve" | "reject"
    ) => {
        setSelectedRequest(request);
        setModalAction(action);
        setAdminNote("");
        setIsModalOpen(true);
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 md:mb-8">
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                            Yêu cầu nâng cấp
                        </h1>
                        <p className="text-sm md:text-base text-gray-600">
                            Quản lý các yêu cầu từ người dùng muốn nâng cấp
                            thành người bán
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-3xl shadow-sm p-4 md:p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên hoặc email..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-12 pr-4 py-2 rounded-2xl bg-neutral-50 border border-gray-200 focus:outline-none focus:border-yellow-500"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setStatusDropdownOpen(
                                            !statusDropdownOpen
                                        )
                                    }
                                    className="bg-neutral-50 border border-gray-200 px-4 py-2 rounded-2xl text-sm font-medium text-gray-800 hover:bg-gray-100 flex items-center gap-2 w-full md:w-auto"
                                >
                                    <span>
                                        {filterStatus === "all"
                                            ? "Tất cả trạng thái"
                                            : filterStatus === "pending"
                                            ? "Chờ xử lý"
                                            : filterStatus === "approved"
                                            ? "Chấp thuận"
                                            : "Từ chối"}
                                    </span>
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform ${
                                            statusDropdownOpen
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </button>

                                {statusDropdownOpen && (
                                    <div className="absolute top-full mt-2 w-full md:w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                                        <button
                                            onClick={() => {
                                                setFilterStatus("all");
                                                setStatusDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 font-medium border-b border-gray-100 transition-colors"
                                        >
                                            Tất cả trạng thái
                                        </button>
                                        {(
                                            [
                                                "pending",
                                                "approved",
                                                "rejected",
                                            ] as const
                                        ).map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    setFilterStatus(status);
                                                    setStatusDropdownOpen(
                                                        false
                                                    );
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 font-medium border-b border-gray-100 transition-colors last:border-b-0"
                                            >
                                                {status === "pending"
                                                    ? "Chờ xử lý"
                                                    : status === "approved"
                                                    ? "Chấp thuận"
                                                    : "Từ chối"}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            Tìm thấy {filteredRequests.length} yêu cầu
                        </p>
                    </div>

                    {/* Request List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="w-8 h-8 border-4 border-gray-200 border-t-yellow-600 rounded-full animate-spin"></div>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">
                                    Không tìm thấy yêu cầu nào
                                </p>
                            </div>
                        ) : (
                            filteredRequests.map((request) => (
                                <div
                                    key={request._id}
                                    className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100 hover:border-gray-200 transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        {/* Request Info */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {request.user.full_name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {request.user.email}
                                            </p>
                                            <div className="text-xs md:text-sm text-gray-500 space-y-1">
                                                <p>
                                                    Ngày yêu cầu:{" "}
                                                    <span className="font-medium">
                                                        {formatDate(
                                                            request.createdAt
                                                        )}
                                                    </span>
                                                </p>
                                                {request.reason && (
                                                    <p>
                                                        Lý do:{" "}
                                                        <span className="font-medium text-gray-700">
                                                            {request.reason}
                                                        </span>
                                                    </p>
                                                )}
                                                {request.admin_note && (
                                                    <p>
                                                        Ghi chú admin:{" "}
                                                        <span className="font-medium text-gray-700">
                                                            {request.admin_note}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status and Actions */}
                                        <div className="flex flex-col md:flex-col items-stretch gap-3">
                                            <div className="flex justify-center">
                                                <span
                                                    className={`inline-flex px-4 py-2 rounded-full border text-xs md:text-sm font-medium ${getStatusColor(
                                                        request.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(
                                                        request.status
                                                    )}
                                                </span>
                                            </div>

                                            {request.status === "pending" && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            openActionModal(
                                                                request,
                                                                "approve"
                                                            )
                                                        }
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors whitespace-nowrap"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        <span>Chấp thuận</span>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            openActionModal(
                                                                request,
                                                                "reject"
                                                            )
                                                        }
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors whitespace-nowrap"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        <span>Từ chối</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Action Modal */}
                {isModalOpen && selectedRequest && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 max-w-md w-full">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                                {modalAction === "approve"
                                    ? "Chấp thuận yêu cầu"
                                    : "Từ chối yêu cầu"}
                            </h2>

                            <div className="mb-6">
                                <p className="text-sm md:text-base text-gray-700 font-medium mb-2">
                                    {selectedRequest.user.full_name}
                                </p>
                                <p className="text-xs md:text-sm text-gray-500 mb-3">
                                    {selectedRequest.user.email}
                                </p>
                                {selectedRequest.reason && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-xs font-medium text-gray-600 mb-1">
                                            Lý do của người dùng:
                                        </p>
                                        <p className="text-sm text-gray-800">
                                            {selectedRequest.reason}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                    Ghi chú từ Admin
                                    {modalAction === "reject" && (
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    )}
                                </label>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) =>
                                        setAdminNote(e.target.value)
                                    }
                                    placeholder={
                                        modalAction === "reject"
                                            ? "Nhập lý do từ chối (bắt buộc)..."
                                            : "Nhập ghi chú (tùy chọn)..."
                                    }
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-yellow-500 focus:outline-none resize-none text-sm"
                                    rows={3}
                                    required={modalAction === "reject"}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 rounded-2xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={
                                        modalAction === "approve"
                                            ? handleApprove
                                            : handleReject
                                    }
                                    disabled={
                                        modalAction === "reject" &&
                                        !adminNote.trim()
                                    }
                                    className={`flex-1 px-4 py-2 rounded-2xl text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                                        modalAction === "approve"
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-red-600 hover:bg-red-700"
                                    }`}
                                >
                                    {modalAction === "approve"
                                        ? "Chấp thuận"
                                        : "Từ chối"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default UpgradeRequest;
