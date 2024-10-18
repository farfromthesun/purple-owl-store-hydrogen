export function ProductTileSkeleton() {
  return (
    <div>
      <div className="rounded-lg bg-main-purple/15 aspect-square animate-pulse"></div>
      <span className="block mt-4 h-5 rounded-md bg-main-purple/30 w-1/2 animate-pulse"></span>
      <div className="mt-1 h-7 rounded-md bg-main-purple/40 w-1/4 animate-pulse"></div>
    </div>
  );
}
