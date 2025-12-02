import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { capitalizeFirstLetter } from "../utilities";
import { useUser } from "../context/useUser";
import { apiUrl } from "../config/api";
import type { AuthUser } from "../context/UserContext.types";

// 1. Định nghĩa Schema (Giữ nguyên)
const profileSchema = z.object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    phone: z
        .string()
        .regex(/^[0-9+\s]+$/, "Số điện thoại không hợp lệ")
        .min(10, "SĐT quá ngắn"),
    address: z.string().min(1, "Địa chỉ không được để trống"), // Bắt buộc nhập
    dob: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const useProfileForm = () => {
    // 2. Khởi tạo useForm
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            address: "",
            dob: "",
        },
    });
    const { user, token, loading, refreshUser } = useUser();
    const [isEditMode, setIsEditMode] = useState(false);
    const [role, setRole] = useState("");

    // Load profile
    useEffect(() => {
        let mounted = true;

        const setDefaultsFromProfile = (profile: AuthUser | null) => {
            if (!profile || !mounted) {
                return;
            }

            setRole(capitalizeFirstLetter(profile.role) || "");

            // Convert dob to YYYY-MM-DD format for HTML date input
            let dobValue = "";
            if (profile.dob) {
                try {
                    const dobDate = new Date(
                        typeof profile.dob === "string"
                            ? profile.dob
                            : (profile.dob as any)?.toISOString()
                    );
                    if (!isNaN(dobDate.getTime())) {
                        // Format as YYYY-MM-DD for HTML date input
                        dobValue = dobDate.toISOString().split("T")[0];
                    }
                } catch (error) {
                    console.warn("Failed to parse dob:", error);
                }
            }

            const values: Partial<ProfileFormData> = {
                fullName: profile.full_name || profile.fullName || "",
                email: profile.email || "",
                phone: profile.phone || "",
                address: profile.address || "",
                dob: dobValue,
            };

            Object.keys(values).forEach((k) => {
                const key = k as keyof ProfileFormData;
                if (typeof values[key] !== "string") values[key] = "";
            });

            reset(values as ProfileFormData);
        };

        if (user) {
            setDefaultsFromProfile(user);
        } else if (!loading && token) {
            refreshUser()
                .then((profile) => {
                    if (profile) {
                        setDefaultsFromProfile(profile);
                    }
                })
                .catch((error) => {
                    console.warn("Failed to refresh profile defaults", error);
                });
        }

        return () => {
            mounted = false;
        };
    }, [loading, refreshUser, reset, token, user]);

    // 3. Hàm xử lý Submit
    const onSubmit = async (data: ProfileFormData) => {
        try {
            if (!token) {
                throw new Error("Không tìm thấy token xác thực");
            }

            const response = await fetch(apiUrl("/api/auth/me"), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    full_name: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    dob: data.dob ? new Date(data.dob).toISOString() : null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    typeof errorData?.message === "string"
                        ? errorData.message
                        : "Cập nhật thông tin thất bại"
                );
            }

            const result = await response.json();

            // Refresh user data from server to ensure sync
            await refreshUser();

            console.log("Cập nhật thành công:", result);
            alert(result.message || "Cập nhật thông tin thành công!");
            setIsEditMode(false);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Có lỗi xảy ra";
            console.error("Lỗi cập nhật:", message);
            alert(`Lỗi: ${message}`);
        }
    };

    return {
        register,
        handleSubmit,
        errors,
        isSubmitting,
        onSubmit,
        isEditMode,
        setIsEditMode,
        role,
    };
};
