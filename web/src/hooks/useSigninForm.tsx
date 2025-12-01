import { useState } from "react";
import { useUser } from "../context/useUser";

export const useLoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string }>({});
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });
    const { login } = useUser();

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
            await login({
                email: formData.email,
                password: formData.password,
                rememberMe: formData.rememberMe,
            });
            window.location.href = "/";
        } catch (err) {
            console.error("Login error:", err);
            const message = err instanceof Error ? err.message : "Lỗi đăng nhập";
            alert(message);
        }
    };

    return {
        formData,
        errors,
        showPassword,
        setShowPassword,
        handleInputChange,
        handleSubmit,
    };
};
