import { Skeleton, Box } from "@mui/material";

export const CategorySkeleton = () => {
  return (
    <Box sx={{ p: 2, minWidth: 200 }}>
      {/* "Xem tất cả sản phẩm" button skeleton */}
      <Skeleton
        variant="rectangular"
        height={48}
        sx={{ borderRadius: 3, mb: 2 }}
      />

      {/* Category title skeleton */}
      <Skeleton variant="text" height={28} width="60%" sx={{ mb: 2 }} />

      {/* Category list skeletons */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            height={24}
            width={`${Math.random() * 40 + 60}%`} // Random width between 60-100%
          />
        ))}
      </Box>
    </Box>
  );
};