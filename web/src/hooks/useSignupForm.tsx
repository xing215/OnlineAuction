import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { apiUrl } from "../config/api";
import toast from "react-hot-toast";

export const useRegisterForm = () => {
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showRegConfirm, setShowRegConfirm] = useState(false);
    const [regErrors, setRegErrors] = useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
        full_name?: string;
        agreeToTerms?: string;
        recaptcha?: string;
    }>({});

    const [registerData, setRegisterData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        full_name: "",
        agreeToTerms: false,
    });

    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const handleRegisterInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value, type, checked } = e.target;
        setRegisterData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (name === "email" && regErrors.email) {
            setRegErrors((prev) => {
                const next = { ...prev };
                delete next.email;
                return next;
            });
        }
        if (
            (name === "password" || name === "confirmPassword") &&
            (regErrors.password || regErrors.confirmPassword)
        ) {
            setRegErrors((prev) => {
                const next = { ...prev };
                delete next.password;
                delete next.confirmPassword;
                return next;
            });
        }
        if (name === "agreeToTerms" && regErrors.agreeToTerms) {
            setRegErrors((prev) => {
                const next = { ...prev };
                delete next.agreeToTerms;
                return next;
            });
        }
        if (name === "full_name" && regErrors.full_name) {
            setRegErrors((prev) => {
                const next = { ...prev };
                delete next.full_name;
                return next;
            });
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: typeof regErrors = {};

        if (!emailRegex.test(registerData.email)) {
            newErrors.email = "Vui lòng nhập email hợp lệ!";
        }

        if (registerData.password.length < 8) {
            newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
        }

        if (registerData.confirmPassword !== registerData.password) {
            newErrors.confirmPassword = "Mật khẩu không khớp";
        }

        if (!registerData.full_name.trim()) {
            newErrors.full_name = "Họ tên là bắt buộc";
        }

        if (!registerData.agreeToTerms) {
            newErrors.agreeToTerms = "Bạn phải đồng ý với điều khoản";
        }

        setRegErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                let recaptchaToken: string | undefined = undefined;
                if (recaptchaSiteKey) {
                    // Get reCAPTCHA token
                    recaptchaToken = await recaptchaRef.current?.executeAsync() ?? undefined;
                    if (!recaptchaToken) {
                        setRegErrors({ recaptcha: "Không thể xác minh reCAPTCHA" });
                        return;
                    }
                }

                const response = await fetch(apiUrl("/api/auth/register"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: registerData.email,
                        password: registerData.password,
                        full_name: registerData.full_name,
                        ...(recaptchaToken && { recaptchaToken }),
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    const message = data.message || "Đăng ký thất bại";
                    toast.error(message);
                    // Reset reCAPTCHA on error
                    recaptchaRef.current?.reset();
                    return;
                }

                // Success - redirect to login or home
                toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
                window.location.href = "/signin";
            } catch (error) {
                toast.error("Lỗi đăng ký. Vui lòng thử lại.");
                // Reset reCAPTCHA on error
                recaptchaRef.current?.reset();
            }
        }
    };

    return {
        registerData,
        regErrors,
        showRegPassword,
        setShowRegPassword,
        showRegConfirm,
        setShowRegConfirm,
        handleRegisterInputChange,
        handleRegisterSubmit,
        recaptchaRef,
        recaptchaSiteKey,
    };
};
