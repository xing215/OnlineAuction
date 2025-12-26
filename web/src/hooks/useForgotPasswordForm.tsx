import { useState } from "react";
import { apiUrl } from "../config/api";
import toast from "react-hot-toast";

interface ForgotPasswordErrors {
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
}

export const useForgotPasswordForm = () => {
    const [step, setStep] = useState<"email" | "verify">("email");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<ForgotPasswordErrors>({});
    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        
        if (errors[name as keyof ForgotPasswordErrors]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name as keyof ForgotPasswordErrors];
                return next;
            });
        }
    };

    const requestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validate email
        if (!formData.email) {
            setErrors({ email: "Vui lòng nhập email" });
            return;
        }

        if (!emailRegex.test(formData.email)) {
            setErrors({ email: "Email không hợp lệ" });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(apiUrl("/api/auth/forgot-password"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({ general: data.message || "Có lỗi xảy ra" });
                return;
            }

            // Success - move to OTP verification step
            setStep("verify");
            toast.success(data.message || "Mã OTP đã được gửi đến email của bạn");
        } catch (error) {
            setErrors({ general: "Không thể kết nối đến máy chủ" });
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const newErrors: ForgotPasswordErrors = {};

        // Validate OTP
        const otp = formData.otp?.trim();
        if (!otp) {
            newErrors.otp = "Vui lòng nhập mã OTP";
        } else if (!/^\d{6}$/.test(otp)) {
            newErrors.otp = "Mã OTP phải có 6 chữ số";
        }

        // Validate Password
        const pwd = formData.newPassword ?? "";
        if (!pwd) {
            newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else if (pwd.length < 8) {
            newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
        }

        // Validate Confirm Password
        const confirm = formData.confirmPassword ?? "";
        if (pwd !== confirm) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        // Set errors if any
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(apiUrl("/api/auth/reset-password"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({ general: data.message || "Có lỗi xảy ra" });
                return;
            }

            // Success
            toast.success(data.message || "Đặt lại mật khẩu thành công");
            window.location.href = "/signin";
        } catch (error) {
            setErrors({ general: "Không thể kết nối đến máy chủ" });
        } finally {
            setLoading(false);
        }
    };

    const goBackToEmail = () => {
        setStep("email");
        setFormData((prev) => ({
            ...prev,
            otp: "",
            newPassword: "",
            confirmPassword: "",
        }));
        setErrors({});
    };

    return {
        step,
        loading,
        errors,
        formData,
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        handleInputChange,
        requestOTP,
        resetPassword,
        goBackToEmail,
    };
};
