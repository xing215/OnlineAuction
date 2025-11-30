import { useProfileForm } from "../../hooks/useProfileForm";

export default function ProfileForm() {
    const { register, handleSubmit, errors, isSubmitting, onSubmit } =
        useProfileForm();

    return (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-700 mb-6">
                Cập nhật thông tin
            </h3>

            {/* handleSubmit bọc lấy onSubmit của mình */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup
                        label="Họ và tên"
                        error={errors.fullName?.message} // Lấy lỗi trực tiếp
                        {...register("fullName")} // Spread props của react-hook-form
                    />
                    <InputGroup
                        label="Email"
                        error={errors.email?.message}
                        {...register("email")}
                        disabled // Email thường ko cho sửa
                    />
                </div>

                {/* Row 2 */}
                <InputGroup
                    label="Số điện thoại"
                    error={errors.phone?.message}
                    {...register("phone")}
                />

                {/* Row 3 */}
                <InputGroup
                    label="Địa chỉ"
                    placeholder="Nhập địa chỉ của bạn"
                    error={errors.address?.message}
                    {...register("address")}
                />

                {/* Row 4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup
                        label="Date of birth"
                        error={errors.dob?.message}
                        {...register("dob")}
                    />
                    <InputGroup
                        label="Role"
                        error={errors.role?.message}
                        {...register("role")}
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#D5AD41] text-white px-10 py-3.5 rounded-2xl font-semibold hover:bg-[#c29d3b] transition-all shadow-md active:scale-95 disabled:opacity-70 flex items-center gap-2"
                    >
                        {isSubmitting && (
                            // Icon loading quay quay (Spinner)
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        )}
                        {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </form>
        </div>
    );
}

// Input Component (Cần dùng forwardRef để tương thích với react-hook-form)
import { forwardRef } from "react";

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

// Bắt buộc phải có forwardRef khi tách Component Input ra riêng dùng với React Hook Form
const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(
    ({ label, error, className, ...props }, ref) => {
        return (
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                    {label}
                </label>
                <input
                    ref={ref} // Truyền ref vào đây
                    className={`w-full px-5 py-3.5 bg-gray-50 border rounded-2xl text-gray-700 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[#D5AD41]/50 ${
                        error
                            ? "border-red-400 ring-1 ring-red-400 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                    } ${className}`}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-500 mt-1 ml-1">{error}</p>
                )}
            </div>
        );
    }
);
