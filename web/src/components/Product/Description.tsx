import { useState, useEffect } from "react";
import { formatDate } from "../../utilities/FormatDate";
import type { Product } from "../../types";
import { apiUrl } from "../../config/api";
import { useUser } from "../../context/useUser";

interface DescriptionProps {
  product: Product;
  onDescriptionUpdate?: (updatedProduct: Product) => void;
}

export const Description: React.FC<DescriptionProps> = ({
  product,
  onDescriptionUpdate,
}) => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSeller =
    user &&
    product?.seller &&
    (typeof product.seller === "object"
      ? (product.seller as any)?._id === user.id ||
        (product.seller as any)?.id === user.id
      : product.seller === user.id);

  const handleUpdateDescription = async () => {
    if (!newDescription.trim()) {
      setError("Vui lòng nhập mô tả mới");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        apiUrl(`/api/products/${product.id}/description`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            content: newDescription.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật mô tả");
      }

      const data = await response.json();
      
      // Update the product with new description update
      const updatedProduct = {
        ...product,
        description_updates: [
          ...(product.description_updates || []),
          {
            content: newDescription.trim(),
            created_at: new Date(),
          },
        ],
      };

      if (onDescriptionUpdate) {
        onDescriptionUpdate(updatedProduct);
      }

      setNewDescription("");
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!product?.id) return;

    const updateDescription = async () => {
      if (!newDescription.trim() || !isSubmitting) return;
    };

    updateDescription();
  }, [isSubmitting, newDescription, product?.id]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Thông tin chi tiết
        </h3>
        {isSeller && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
          >
            Cập nhật mô tả
          </button>
        )}
      </div>

      <p className="text-gray-600 leading-relaxed mb-4">
        {product.description || "Chưa có mô tả chi tiết."}
      </p>

      {/* Update Form */}
      {isEditing && isSeller && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-base font-semibold mb-3 text-gray-800">
            Thêm cập nhật mô tả
          </h4>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Nhập nội dung cập nhật mô tả..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 min-h-[120px] text-gray-700"
            disabled={isSubmitting}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleUpdateDescription}
              disabled={isSubmitting}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? "Đang lưu..." : "Xác nhận"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setNewDescription("");
                setError(null);
              }}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 font-medium"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Description Updates History */}
      {product.description_updates && product.description_updates.length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-200">
          <h4 className="text-base font-semibold mb-4 text-gray-800">
            Lịch sử cập nhật mô tả:
          </h4>
          <div className="space-y-3">
            {product.description_updates
              .slice()
              .reverse()
              .map((update, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <p className="mb-2 text-gray-700 leading-relaxed">
                    {update.content}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatDate(
                        typeof update.created_at === "string"
                          ? update.created_at
                          : update.created_at.toISOString
                          ? update.created_at.toISOString()
                          : String(update.created_at)
                      )}
                    </span>
                    {index === 0 && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                        Mới nhất
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Description;
