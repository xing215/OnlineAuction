import React, { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, MoreVertical } from "lucide-react";
import { apiUrl } from "../../config/api";
import { formatDate } from "../../utilities/FormatDate";
import { useUser } from "../../context/useUser";

interface User {
    _id: string;
    full_name: string;
    email: string;
    role: "bidder" | "seller" | "admin";
    status: "unverified" | "active" | "locked";
    rating_percentage?: number;
    createdAt: string;
}

export const ManageUser: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editRole, setEditRole] = useState<"bidder" | "seller" | "admin">(
        "bidder"
    );
    const [editStatus, setEditStatus] = useState<
        "unverified" | "active" | "locked"
    >("active");
    const { token } = useUser();

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiUrl("/api/users"), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data.data || []);
            } else {
                console.error("Failed to fetch users:", response.statusText);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.full_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSearch;
        });
    }, [users, searchTerm]);

    const getRoleColor = (role: string) => {
        switch (role) {
            case "seller":
                return "bg-yellow-50 border-yellow-300 text-yellow-700";
            case "bidder":
                return "bg-gray-50 border-gray-200 text-gray-700";
            case "admin":
                return "bg-blue-50 border-blue-300 text-blue-700";
            default:
                return "bg-gray-50 border-gray-200 text-gray-700";
        }
    };

    const getRoleBadgeLabel = (role: string) => {
        switch (role) {
            case "seller":
                return "Seller";
            case "bidder":
                return "Bidder";
            case "admin":
                return "Admin";
            default:
                return role;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-50 border-green-200 text-green-700";
            case "locked":
                return "bg-red-50 border-red-200 text-red-700";
            case "unverified":
                return "bg-gray-50 border-gray-200 text-gray-700";
            default:
                return "bg-gray-50 border-gray-200 text-gray-700";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "active":
                return "Đang hoạt động";
            case "locked":
                return "Đã khóa";
            case "unverified":
                return "Chưa xác thực";
            default:
                return status;
        }
    };

    const renderStars = (rating: number = 0) => {
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <svg
                        key={i}
                        className={`w-4 h-4 ${
                            i < Math.round(rating / 20)
                                ? "text-yellow-400"
                                : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
                <span className="text-sm text-gray-600 ml-1">
                    {rating.toFixed(1)}
                </span>
            </div>
        );
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setEditRole(user.role);
        setEditStatus(user.status);
        setOpenDropdown(null);
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        try {
            const response = await fetch(
                apiUrl(`/api/users/${editingUser._id}`),
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        role: editRole,
                        status: editStatus,
                    }),
                }
            );

            if (response.ok) {
                fetchUsers();
                setEditingUser(null);
            }
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                        Quản lý Người dùng
                    </h1>
                    <p className="text-gray-600">
                        Quản lý Bidder và Seller, xử lý vi phạm
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
                    <div className="flex gap-4 items-center">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm theo tên hoặc email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-2 rounded-2xl bg-neutral-50 border border-gray-200 focus:outline-none focus:border-yellow-500"
                            />
                        </div>

                        {/* Role Filter */}
                        <div className="relative">
                            <button className="bg-neutral-50 border border-gray-200 px-4 py-2 rounded-2xl text-sm font-medium text-gray-800 hover:bg-gray-100 flex items-center gap-2">
                                <span>Tất cả vai trò</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <button className="bg-neutral-50 border border-gray-200 px-4 py-2 rounded-2xl text-sm font-medium text-gray-800 hover:bg-gray-100 flex items-center gap-2">
                                <span>Tất cả trạng thái</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="mb-4">
                    <p className="text-sm text-gray-600">
                        Tìm thấy {filteredUsers.length} người dùng
                    </p>
                </div>

                {/* Table */}
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Người dùng
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Đánh giá
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Vai trò
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Ngày tham gia
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="flex justify-center items-center h-40">
                                                <div className="w-8 h-8 border-4 border-gray-200 border-t-yellow-600 rounded-full animate-spin"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="text-center text-gray-500">
                                                Không tìm thấy người dùng
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr
                                            key={user._id}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                                                        <svg
                                                            className="w-6 h-6 text-gray-600"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {user.full_name}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {renderStars(
                                                    user.rating_percentage || 0
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium ${getRoleColor(
                                                        user.role
                                                    )}`}
                                                >
                                                    {getRoleBadgeLabel(
                                                        user.role
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(
                                                        user.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(
                                                        user.status
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 relative">
                                                <button
                                                    onClick={() =>
                                                        setOpenDropdown(
                                                            openDropdown ===
                                                                user._id
                                                                ? null
                                                                : user._id
                                                        )
                                                    }
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="More options"
                                                >
                                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                                </button>

                                                {openDropdown === user._id && (
                                                    <div className="absolute right-[-5] mt-0 w-24 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                                        <button
                                                            onClick={() =>
                                                                handleEditClick(
                                                                    user
                                                                )
                                                            }
                                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 font-medium border-b border-gray-100 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full mx-4">
                        <div className="flex items-center justify-center mb-6 ">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Edit User
                            </h2>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 font-medium mb-2">
                                {editingUser.full_name}
                            </p>
                            <p className="text-sm text-gray-500">
                                {editingUser.email}
                            </p>
                        </div>

                        {/* Role Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Role
                            </label>
                            <div className="space-y-2">
                                {(["bidder", "seller", "admin"] as const).map(
                                    (role) => (
                                        <label
                                            key={role}
                                            className="flex items-center cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="role"
                                                value={role}
                                                checked={editRole === role}
                                                onChange={(e) =>
                                                    setEditRole(
                                                        e.target.value as
                                                            | "bidder"
                                                            | "seller"
                                                            | "admin"
                                                    )
                                                }
                                                className="w-4 h-4 text-yellow-600 cursor-pointer"
                                            />
                                            <span className="ml-3 text-gray-700 capitalize">
                                                {role}
                                            </span>
                                        </label>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Status Selection */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Status
                            </label>
                            <div className="space-y-2">
                                {(
                                    ["unverified", "active", "locked"] as const
                                ).map((status) => (
                                    <label
                                        key={status}
                                        className="flex items-center cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={status}
                                            checked={editStatus === status}
                                            onChange={(e) =>
                                                setEditStatus(
                                                    e.target.value as
                                                        | "unverified"
                                                        | "active"
                                                        | "locked"
                                                )
                                            }
                                            className="w-4 h-4 text-yellow-600 cursor-pointer"
                                        />
                                        <span className="ml-3 text-gray-700 capitalize">
                                            {status === "unverified"
                                                ? "Chưa xác thực"
                                                : status === "active"
                                                ? "Đang hoạt động"
                                                : "Khóa"}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 px-4 py-3 rounded-2xl bg-yellow-600 text-white font-medium hover:bg-yellow-700 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUser;
