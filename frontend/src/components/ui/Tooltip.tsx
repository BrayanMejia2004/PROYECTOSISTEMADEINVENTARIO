interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip = ({ content, children }: TooltipProps) => (
  <div className="relative inline-flex group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
    </div>
  </div>
);
