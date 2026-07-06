interface CardSkeletonProps {
  lines?: number;
}

export const CardSkeleton = ({ lines = 2 }: CardSkeletonProps) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
    </div>
    <div className="space-y-2">
      <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  </div>
);
