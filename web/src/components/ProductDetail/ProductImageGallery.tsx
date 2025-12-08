import React, { useState } from "react";

interface ProductImageGalleryProps {
    images: string[];
    productName: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
    images,
    productName,
}) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const mainImage =
        images && images.length > 0 ? images[selectedImageIndex] : "";

    return (
        <div className="flex flex-col gap-4">
            <div className="w-full aspect-4/3 bg-gray-100 rounded-lg overflow-hidden">
                {mainImage && (
                    <img
                        src={mainImage}
                        alt={productName}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>
            {images && images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className={`w-20 h-15 rounded border-2 overflow-hidden cursor-pointer transition-colors ${
                                index === selectedImageIndex
                                    ? "border-blue-600"
                                    : "border-transparent hover:border-blue-600"
                            }`}
                            onClick={() => setSelectedImageIndex(index)}
                        >
                            <img
                                src={image}
                                alt={`${productName} ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
