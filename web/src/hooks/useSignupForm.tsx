import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { apiUrl } from "../config/api";
import toast from "react-hot-toast";

export const useRegisterForm = () => {
    const [step, setStep] = useState<"form" | "otp">("form");
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showRegConfirm, setShowRegConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [regErrors, setRegErrors] = useState<{
        email?: string;
        otp?: string;
        password?: string;
        confirmPassword?: string;
        full_name?: string;
        agreeToTerms?: string;
        recaptcha?: string;
        general?: string;
    }>({});

    const [registerData, setRegisterData] = useState({
        email: "",
        otp: "",
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

    const requestOTP = async (e: React.FormEvent) => {
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
            setIsLoading(true);
            try {
                const response = await fetch(apiUrl("/api/auth/register"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: registerData.email,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    toast.error(data.message || "Có lỗi xảy ra");
                    setIsLoading(false);
                    return;
                }

                // Success - move to OTP step
                setStep("otp");
                toast.success(data.message || "Mã OTP đã được gửi đến email của bạn");
                setIsLoading(false);
            } catch {
                setRegErrors({ general: "Không thể kết nối đến máy chủ" });
                setIsLoading(false);
            }
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: typeof regErrors = {};

        // Validate OTP
        const otp = registerData.otp?.trim();
        if (!otp) {
            newErrors.otp = "Vui lòng nhập mã OTP";
        } else if (!/^\d{6}$/.test(otp)) {
            newErrors.otp = "Mã OTP phải có 6 chữ số";
        }

        setRegErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true);
            try {
                let recaptchaToken: string | undefined = undefined;
                if (recaptchaSiteKey) {
                    // Get reCAPTCHA token
                    recaptchaToken = await recaptchaRef.current?.executeAsync() ?? undefined;
                    if (!recaptchaToken) {
                        setRegErrors({ recaptcha: "Không thể xác minh reCAPTCHA" });
                        setIsLoading(false);
                        return;
                    }
                }

                const response = await fetch(apiUrl("/api/auth/register-verify"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: registerData.email,
                        otp: registerData.otp,
                        password: registerData.password,
                        full_name: registerData.full_name,
                        ...(recaptchaToken && { recaptchaToken }),
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    toast.error(data.message || "Có lỗi xảy ra");
                    // Reset reCAPTCHA on error
                    recaptchaRef.current?.reset();
                    setIsLoading(false);
                    return;
                }

                // Success - redirect to login or home
                toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
                setIsLoading(false);
                setTimeout(() => {
                    window.location.href = "/signin";
                }, 1000);
            } catch {
                setRegErrors({ general: "Không thể kết nối đến máy chủ" });
                // Reset reCAPTCHA on error
                recaptchaRef.current?.reset();
                setIsLoading(false);
            }
        }
    };

    const goBackToForm = () => {
        setStep("form");
        setRegErrors({});
    };

    return {
        step,
        registerData,
        regErrors,
        showRegPassword,
        setShowRegPassword,
        showRegConfirm,
        setShowRegConfirm,
        isLoading,
        handleRegisterInputChange,
        requestOTP,
        handleRegisterSubmit,
        goBackToForm,
        recaptchaRef,
        recaptchaSiteKey,
    };
};
