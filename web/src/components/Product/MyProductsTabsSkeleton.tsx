import { Skeleton, Box } from "@mui/material";

export const MyProductsTabsSkeleton = () => {
  return (
    <div className="rounded-2xl bg-[#F7F7F7] p-1">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            width={100}
            height={36}
            sx={{ borderRadius: 16 }}
          />
        ))}
      </Box>
    </div>
  );
};