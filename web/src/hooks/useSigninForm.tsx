import { useState, useRef } from "react";
import { useUser } from "../context/useUser";
import ReCAPTCHA from "react-google-recaptcha";

export const useLoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; recaptcha?: string }>({});
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const { login } = useUser();

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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!emailRegex.test(formData.email)) {
            setErrors({ email: "Vui lòng nhập email hợp lệ!" });
            return;
        }

        setErrors({});

        try {
            let recaptchaToken: string | undefined;
            if (recaptchaSiteKey) {
                // Get reCAPTCHA token
                recaptchaToken = await recaptchaRef.current?.executeAsync();
                if (!recaptchaToken) {
                    setErrors({ recaptcha: "Không thể xác minh reCAPTCHA" });
                    return;
                }
            }

            await login({
                email: formData.email,
                password: formData.password,
                ...(recaptchaToken && { recaptchaToken }),
            });
            window.location.href = "/";
        } catch (err) {
            console.error("Login error:", err);
            const message = err instanceof Error ? err.message : "Lỗi đăng nhập";
            alert(message);
            // Reset reCAPTCHA on error
            recaptchaRef.current?.reset();
        }
    };

    return {
        formData,
        errors,
        showPassword,
        setShowPassword,
        handleInputChange,
        handleSubmit,
        recaptchaRef,
        recaptchaSiteKey,
    };
};
