import clsx from "clsx";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={clsx("rounded-lg bg-white/[0.04] animate-pulse", className)} />
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 mb-5">
      <Skeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-[60%]" />
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-3 p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 px-3 py-2.5">
          <Skeleton className="w-4 h-4 flex-shrink-0" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="w-10 h-3" />
        </div>
      ))}
    </div>
  );
}
