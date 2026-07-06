interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton = ({ rows = 5, columns = 4 }: TableSkeletonProps) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100">
      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-brand-bg">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx} className="px-6 py-4">
                  <div
                    className={`h-4 bg-gray-200 rounded animate-pulse ${colIdx === 0 ? 'w-3/4' : 'w-1/2'}`}
                    style={{ animationDelay: `${rowIdx * 50}ms` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
