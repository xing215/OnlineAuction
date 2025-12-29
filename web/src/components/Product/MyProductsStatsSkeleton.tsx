import { Skeleton, Box } from "@mui/material";

export const MyProductsStatsSkeleton = () => {
  return (
    <div className="my-products-page__stats">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-[#3E3C31]/10 bg-white px-6 py-5 shadow-sm"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48, width: 48, borderRadius: 16, backgroundColor: '#f3f4f6' }}>
            <Skeleton variant="circular" width={24} height={24} />
          </Box>
          <Skeleton variant="text" height={36} width={60} sx={{ mt: 4 }} />
          <Skeleton variant="text" height={16} width={80} sx={{ mt: 1 }} />
        </div>
      ))}
    </div>
  );
};