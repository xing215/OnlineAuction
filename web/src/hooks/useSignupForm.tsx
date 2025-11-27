import { useState } from "react";

export const useRegisterForm = () => {
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showRegConfirm, setShowRegConfirm] = useState(false);
    const [regErrors, setRegErrors] = useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
        agreeToTerms?: string;
    }>({});

    const [registerData, setRegisterData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
    });

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
                const { email: _removed, ...rest } = prev;
                return rest;
            });
        }
        if (
            (name === "password" || name === "confirmPassword") &&
            (regErrors.password || regErrors.confirmPassword)
        ) {
            setRegErrors((prev) => {
                const { password: _passwordRemoved, confirmPassword: _confirmRemoved, ...rest } = prev;
                return rest;
            });
        }
        if (name === "agreeToTerms" && regErrors.agreeToTerms) {
            setRegErrors((prev) => {
                const { agreeToTerms: _removed, ...rest } = prev;
                return rest;
            });
        }
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
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

        if (!registerData.agreeToTerms) {
            newErrors.agreeToTerms = "Bạn phải đồng ý với điều khoản";
        }

        setRegErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            console.log("Register submitted:", registerData);
            // Add registration logic here
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
    };
};
