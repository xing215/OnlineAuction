import { Skeleton, Box } from "@mui/material";

export const CategorySkeleton = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-2">
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
      </div>

      {/* Fixed button at bottom */}
      <div className="p-2 border-t border-gray-200 bg-white">
        <Skeleton
          variant="rectangular"
          height={48}
          sx={{ borderRadius: 3 }}
        />
      </div>
    </div>
  );
};