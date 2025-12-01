import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { formatDate, capitalizeFirstLetter } from "../utilities";
import { useUser } from "../context/useUser";
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
    role: z.string().optional(),
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
            role: "",
        },
    });
    const { user, token, loading, refreshUser } = useUser();

    // Load profile 
    useEffect(() => {
        let mounted = true;

        const setDefaultsFromProfile = (profile: AuthUser | null) => {
            if (!profile || !mounted) {
                return;
            }

            const values: Partial<ProfileFormData> = {
                fullName: profile.full_name || profile.fullName || "",
                email: profile.email || "",
                phone: profile.phone || "",
                address: profile.address || "",
                dob: formatDate(profile.dob) || "",
                role: capitalizeFirstLetter(profile.role) || "",
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
        // Giả lập gọi API (đợi 1s)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log("Dữ liệu đã chuẩn hóa:", data);
        alert("Cập nhật thành công!");
    };

    return {
        register,
        handleSubmit,
        errors,
        isSubmitting,
        onSubmit,
    };
};
