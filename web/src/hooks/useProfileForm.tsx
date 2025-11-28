import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. Định nghĩa Schema (Giữ nguyên)
const profileSchema = z.object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    phone: z
        .string()
        .regex(/^[0-9+\s]+$/, "Số điện thoại không hợp lệ")
        .min(10, "SĐT quá ngắn"),
    address: z.string().min(1, "Địa chỉ không được để trống"), // Bắt buộc nhập
    city: z.string().optional(),
    zipCode: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const useProfileForm = () => {
    // 2. Khởi tạo useForm
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: "Nguyễn Văn A",
            email: "nguyenvana@email.com",
            phone: "+84 123 456 789",
            address: "",
            city: "Hà Nội",
            zipCode: "100000",
        },
    });

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
