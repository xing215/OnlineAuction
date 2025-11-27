import { useState } from "react";

export const useLoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string }>({});
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate email
        if (!emailRegex.test(formData.email)) {
            setErrors({ email: "Vui lòng nhập email hợp lệ!" });
            return;
        }

        setErrors({});
        console.log("Login submitted:", formData);
        // Add your login logic here
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
