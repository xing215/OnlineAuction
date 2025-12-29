import { Skeleton, Box } from "@mui/material";

export const ProductCardSkeleton = () => {
  return (
    <article className="group flex w-[200px] flex-col shrink-0 rounded-2xl bg-white transition-all duration-300 hover:shadow-sm sm:w-[280px]">
      {/* Image skeleton */}
      <div className="relative h-[200px] w-full shrink-0 overflow-hidden rounded-t-2xl bg-gray-200 sm:h-[280px]">
        <Skeleton variant="rectangular" width="100%" height="100%" />
        {/* Time remaining skeleton */}
        <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 12 }} />
        </Box>
        {/* Favorite button skeleton */}
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          <Skeleton variant="circular" width={36} height={36} />
        </Box>
        {/* Category skeleton */}
        <Box sx={{ position: 'absolute', bottom: 12, left: 12 }}>
          <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 4 }} />
        </Box>
      </div>

      <div className="flex flex-col gap-2 p-4">
        {/* Title skeleton */}
        <Skeleton variant="text" height={20} width="90%" />

        {/* Price and bid count skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="text" height={24} width={80} />
          <Skeleton variant="text" height={16} width={60} />
        </Box>

        {/* Highest bidder skeleton */}
        <Skeleton variant="text" height={14} width="70%" />

        {/* Status skeleton */}
        <Skeleton variant="text" height={14} width="80%" />

        {/* Date skeleton */}
        <Skeleton variant="text" height={14} width="75%" />

        {/* Buttons skeleton */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 18, flex: 1 }} />
        </Box>

        <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 18 }} />
      </div>
    </article>
  );
};