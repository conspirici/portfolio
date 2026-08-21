export default function ArticleLoading() {
  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#F5F7F4' }}>
      <article>
        <div className="max-w-3xl mx-auto px-6 sm:px-10 pt-10">
          {/* Hero banner skeleton */}
          <div className="relative w-full aspect-[16/7] min-h-[260px] max-h-[420px] bg-gray-200 animate-pulse rounded-sm overflow-hidden">
            {/* Text overlaid on image skeleton */}
            <div className="absolute inset-0 flex flex-col justify-end px-5 sm:px-8 pb-6">
              <div className="w-48 h-4 bg-white/40 animate-pulse rounded-sm mb-3" />
              <div className="w-3/4 h-10 sm:h-12 md:h-14 bg-white/40 animate-pulse rounded-sm mb-4" />
              <div className="flex gap-2">
                <div className="w-16 h-5 bg-white/40 animate-pulse rounded-sm" />
                <div className="w-20 h-5 bg-white/40 animate-pulse rounded-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Article body skeleton */}
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14">
          {/* Teaser subtitle */}
          <div className="mb-10 pl-4 border-l-2 border-gray-300">
            <div className="w-full h-6 bg-gray-200 animate-pulse rounded-sm mb-3" />
            <div className="w-5/6 h-6 bg-gray-200 animate-pulse rounded-sm" />
          </div>

          <div className="flex flex-col gap-5 max-w-none">
            <div className="w-full h-5 bg-gray-200 animate-pulse rounded-sm" />
            <div className="w-11/12 h-5 bg-gray-200 animate-pulse rounded-sm" />
            <div className="w-full h-5 bg-gray-200 animate-pulse rounded-sm" />
            <div className="w-4/5 h-5 bg-gray-200 animate-pulse rounded-sm" />
            
            <div className="w-full h-5 bg-gray-200 animate-pulse rounded-sm mt-6" />
            <div className="w-10/12 h-5 bg-gray-200 animate-pulse rounded-sm" />
            <div className="w-9/12 h-5 bg-gray-200 animate-pulse rounded-sm" />
            <div className="w-11/12 h-5 bg-gray-200 animate-pulse rounded-sm" />
            <div className="w-full h-5 bg-gray-200 animate-pulse rounded-sm" />
          </div>
        </div>
      </article>
    </div>
  );
}
