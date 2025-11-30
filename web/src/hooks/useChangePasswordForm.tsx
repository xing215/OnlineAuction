import { useState } from "react";
import { apiUrl } from "../config/api";
import { useUser } from "../context/useUser";

interface ChangePasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface FormErrors {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
}

export const useChangePasswordForm = () => {
    const { token } = useUser();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState<ChangePasswordFormData>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        
        // Clear specific field error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name as keyof FormErrors];
                return next;
            });
        }
        
        // Clear success message when user edits
        if (successMessage) {
            setSuccessMessage("");
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
        }

        if (!formData.newPassword) {
            newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
        } else if (formData.newPassword === formData.currentPassword) {
            newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
        } else if (formData.confirmPassword !== formData.newPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            if (!token) {
                throw new Error("Vui lòng đăng nhập lại");
            }

            const response = await fetch(apiUrl("/api/auth/change-password"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Đổi mật khẩu thất bại");
            }

            // Success
            setSuccessMessage(data.message || "Đổi mật khẩu thành công!");
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

        } catch (err) {
            console.error("Change password error:", err);
            const message = err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.";
            setErrors({ general: message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        errors,
        successMessage,
        isSubmitting,
        showCurrentPassword,
        showNewPassword,
        showConfirmPassword,
        setShowCurrentPassword,
        setShowNewPassword,
        setShowConfirmPassword,
        handleInputChange,
        handleSubmit,
    };
};
