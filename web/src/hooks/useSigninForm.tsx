import { useState, useRef } from "react";
import { useUser } from "../context/useUser";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";

export const useLoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        recaptcha?: string;
    }>({});
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const { login } = useUser();
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!emailRegex.test(formData.email)) {
            setErrors({ email: "Vui lòng nhập email hợp lệ!" });
            return;
        }

        setErrors({});

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

            const user = await login({
                email: formData.email,
                password: formData.password,
                ...(recaptchaToken && { recaptchaToken }),
            });

            // Navigate based on user role
            if (user?.role === "admin") {
                navigate("/admin/manage-user");
            } else {
                navigate("/");
            }
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Lỗi đăng nhập";
            toast.error(message);
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
