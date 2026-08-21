export default function AboutLoading() {
  return (
    <div className="w-full min-h-screen pt-16 pb-24" style={{ backgroundColor: '#F5F7F4' }}>
      {/* Scrapbook Canvas Skeleton */}
      <div 
        className="relative mx-auto w-full max-w-[1200px] bg-gray-200 border border-black/5"
        style={{ height: '70vh', minHeight: '600px' }}
      >
        {/* Headline Skeleton (Left Side) */}
        <div className="absolute left-4 md:left-12 top-1/3 md:top-1/2 -translate-y-1/2 z-20 w-[300px]">
          <div className="w-full h-12 md:h-16 bg-black/10 animate-pulse rounded-sm mb-3" />
          <div className="w-2/3 h-12 md:h-16 bg-black/10 animate-pulse rounded-sm" />
        </div>

        {/* Portrait Skeleton (Bottom Center) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-full max-w-[400px]">
          <div className="w-full h-[50vh] bg-black/10 animate-pulse rounded-t-lg" />
        </div>
      </div>

      {/* Bio Body Skeleton */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 mt-16">
        <div className="flex flex-col gap-4">
          <div className="w-full h-5 bg-gray-200 animate-pulse rounded-sm" />
          <div className="w-11/12 h-5 bg-gray-200 animate-pulse rounded-sm" />
          <div className="w-4/5 h-5 bg-gray-200 animate-pulse rounded-sm" />
          
          <div className="w-full h-5 bg-gray-200 animate-pulse rounded-sm mt-4" />
          <div className="w-10/12 h-5 bg-gray-200 animate-pulse rounded-sm" />
          <div className="w-9/12 h-5 bg-gray-200 animate-pulse rounded-sm" />
        </div>

        {/* Links Skeleton */}
        <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-black/10">
          <div className="w-20 h-10 bg-gray-200 animate-pulse rounded-sm" />
          <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-sm" />
          <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-sm" />
          <div className="w-28 h-10 bg-gray-200 animate-pulse rounded-sm" />
        </div>
      </div>
    </div>
  );
}
