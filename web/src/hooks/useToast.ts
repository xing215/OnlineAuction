import toast from "react-hot-toast";

/**
 * Custom hook for toast notifications
 * Provides convenient methods for showing success, error, loading, and info toasts
 */
export const useToast = () => {
    const showSuccess = (message: string) => {
        toast.success(message);
    };

    const showError = (message: string) => {
        toast.error(message);
    };

    const showLoading = (message: string) => {
        return toast.loading(message);
    };

    const showInfo = (message: string) => {
        toast(message, {
            icon: "ℹ️",
        });
    };

    const showWarning = (message: string) => {
        toast(message, {
            icon: "⚠️",
            style: {
                background: "#f59e0b",
                color: "#fff",
            },
        });
    };

    const dismiss = (toastId?: string) => {
        if (toastId) {
            toast.dismiss(toastId);
        } else {
            toast.dismiss();
        }
    };

    const promise = <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        return toast.promise(promise, {
            loading: messages.loading,
            success: messages.success,
            error: messages.error,
        });
    };

    return {
        showSuccess,
        showError,
        showLoading,
        showInfo,
        showWarning,
        dismiss,
        promise,
    };
};
