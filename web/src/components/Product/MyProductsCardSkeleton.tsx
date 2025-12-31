import { Skeleton, Box } from "@mui/material";

export const MyProductsCardSkeleton = () => {
  return (
    <article className="my-products-page__product-card rounded-3xl border border-[#3E3C31]/15 bg-white shadow-sm">
      {/* Image skeleton */}
      <Box sx={{ height: 96, width: 96, borderRadius: 16, backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>

      {/* Content skeleton */}
      <div className="flex-1 space-y-3">
        {/* Title skeleton */}
        <Skeleton variant="text" height={20} width="80%" />

        {/* Meta info skeleton */}
        <div className="my-products-page__product-meta text-sm">
          <Skeleton variant="text" height={16} width="70%" />
          <Skeleton variant="text" height={16} width="60%" />
          <Skeleton variant="text" height={16} width="75%" />
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="my-products-page__product-actions">
        {/* Status badge skeleton */}
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 12 }} />

        {/* Buttons skeleton */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 2 }}>
          <Skeleton variant="rectangular" width={60} height={32} sx={{ borderRadius: 16 }} />
          <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 16 }} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </div>
    </article>
  );
};