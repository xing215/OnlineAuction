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

        // Call API
        (async () => {
            try {
                const res = await fetch('http://127.0.0.1:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email, password: formData.password })
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Đăng nhập thất bại');
                }

                // Store token
                if (data.token) {
                    if (formData.rememberMe) {
                        localStorage.setItem('token', data.token);
                    } else {
                        sessionStorage.setItem('token', data.token);
                    }
                }

                // Fetch latest profile
                try {
                    const token = data.token;
                    const resMe = await fetch('http://127.0.0.1:3000/api/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (resMe.ok) {
                        const payload = await resMe.json();
                        if (payload && payload.user) {
                            try { localStorage.setItem('user', JSON.stringify(payload.user)); } catch(e) {}
                        }
                    } else {
                        // fallback to server-returned user if fails
                        if (data.user) {
                            try { localStorage.setItem('user', JSON.stringify(data.user)); } catch(e) {}
                        }
                    }
                } catch (e) {
                    if (data.user) {
                        try { localStorage.setItem('user', JSON.stringify(data.user)); } catch(e) {}
                    }
                }

                // Redirect to home
                window.location.href = '/';
            } catch (err: any) {
                console.error('Login error:', err);
                alert(err.message || 'Lỗi đăng nhập');
            }
        })();
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
