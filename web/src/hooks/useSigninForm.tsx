import { useState, useRef } from "react";
import { useUser } from "../context/useUser";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import type { AuthUser } from "../context/UserContext.types";

export const useLoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [requiresVerification, setRequiresVerification] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState("");
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        otp?: string;
        recaptcha?: string;
    }>({});
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        otp: "",
    });
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const { login, loginVerify } = useUser();
    const navigate = useNavigate();

    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (name === "email" && errors.email) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next.email;
                return next;
            });
        }
        if (name === "otp" && errors.otp) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next.otp;
                return next;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!emailRegex.test(formData.email)) {
            setErrors({ email: "Vui lòng nhập email hợp lệ!" });
            return;
        }

        if (requiresVerification) {
            // OTP verification
            if (!formData.otp || formData.otp.length !== 6) {
                setErrors({ otp: "Vui lòng nhập mã OTP 6 chữ số!" });
                return;
            }
        } else {
            // Initial login
            if (!formData.password) {
                setErrors({ password: "Vui lòng nhập mật khẩu!" });
                return;
            }
        }

        setErrors({});
        setIsLoading(true);

        try {
            let recaptchaToken: string | undefined = undefined;
            if (recaptchaSiteKey) {
                // Get reCAPTCHA token
                recaptchaToken = await recaptchaRef.current?.executeAsync() ?? undefined;
                if (!recaptchaToken) {
                    setErrors({ recaptcha: "Không thể xác minh reCAPTCHA" });
                    return;
                }
            }

            if (requiresVerification) {
                // Complete login with OTP
                const user = await loginVerify({
                    email: verificationEmail,
                    otp: formData.otp,
                    ...(recaptchaToken && { recaptchaToken }),
                });

                // Navigate based on user role
                if (user?.role === "admin") {
                    navigate("/admin/manage-user");
                } else {
                    navigate("/");
                }
            } else {
                // Initial login attempt
                const result = await login({
                    email: formData.email,
                    password: formData.password,
                    ...(recaptchaToken && { recaptchaToken }),
                });

                if ('requires_verification' in result && result.requires_verification) {
                    // Account needs verification
                    setRequiresVerification(true);
                    setVerificationEmail(result.email);
                    toast.success("Mã OTP đã được gửi đến email của bạn!");
                } else {
                    // Direct login successful
                    const user = result as AuthUser;
                    // Navigate based on user role
                    if (user?.role === "admin") {
                        navigate("/admin/manage-user");
                    } else {
                        navigate("/");
                    }
                }
            }
            setIsLoading(false);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Lỗi đăng nhập";
            toast.error(message);
            // Reset reCAPTCHA on error
            recaptchaRef.current?.reset();
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setRequiresVerification(false);
        setVerificationEmail("");
        setFormData(prev => ({ ...prev, otp: "" }));
        setErrors({});
    };

    return {
        formData,
        errors,
        showPassword,
        setShowPassword,
        isLoading,
        requiresVerification,
        verificationEmail,
        handleInputChange,
        handleSubmit,
        handleBackToLogin,
        recaptchaRef,
        recaptchaSiteKey,
    };
};
