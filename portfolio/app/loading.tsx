export default function HomeLoading() {
  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative w-full pt-8 pb-0 flex flex-col items-start justify-start overflow-hidden min-h-[90vh] md:min-h-screen" style={{ backgroundColor: '#F5F7F4' }}>
        <div className="z-30 relative px-6 md:px-16 mt-0 w-full max-w-7xl mx-auto">
          <div className="max-w-[800px] flex flex-col items-start gap-4 mt-8">
            {/* Big Headline */}
            <div className="w-3/4 h-16 sm:h-20 bg-gray-200 animate-pulse rounded-sm" />
            <div className="w-1/2 h-16 sm:h-20 bg-gray-200 animate-pulse rounded-sm mb-4" />
            
            {/* Subheadline */}
            <div className="w-full max-w-[400px] h-6 bg-gray-200 animate-pulse rounded-sm mb-8" />
            
            {/* Button */}
            <div className="w-32 h-12 bg-gray-200 animate-pulse rounded-sm" />
          </div>
        </div>

        {/* Hero Portrait Skeleton */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-[90%] sm:w-[600px] md:w-[700px] lg:w-[850px] flex justify-center items-end">
          <div className="w-full h-[60vh] bg-gray-200 animate-pulse rounded-t-lg" />
        </div>
      </section>

      {/* Selected Work Skeleton */}
      <section className="relative overflow-hidden py-20 sm:py-28" style={{ background: '#123024' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex items-baseline justify-between mb-10">
            <div>
              <div className="w-32 h-4 bg-white/20 animate-pulse mb-3 rounded-sm" />
              <div className="w-64 h-5 bg-white/20 animate-pulse rounded-sm" />
            </div>
            <div className="w-24 h-4 bg-white/20 animate-pulse hidden sm:block rounded-sm" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {[1, 2].map(i => (
              <div key={i} className="flex flex-col p-4 bg-white/5 border border-white/10">
                <div className="w-full aspect-[4/3] bg-white/10 animate-pulse mb-6 rounded-sm" />
                <div className="w-3/4 h-8 bg-white/10 animate-pulse mb-3 rounded-sm" />
                <div className="w-full h-4 bg-white/10 animate-pulse mb-2 rounded-sm" />
                <div className="w-5/6 h-4 bg-white/10 animate-pulse mb-5 rounded-sm" />
                <div className="flex gap-2">
                  <div className="w-16 h-6 bg-white/10 animate-pulse rounded-sm" />
                  <div className="w-20 h-6 bg-white/10 animate-pulse rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Writing Preview Skeleton */}
      <section className="relative overflow-hidden py-16 sm:py-20" style={{ background: '#288760' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex items-baseline justify-between mb-8">
            <div className="w-32 h-4 bg-white/20 animate-pulse rounded-sm" />
            <div className="w-32 h-4 bg-white/20 animate-pulse hidden sm:block rounded-sm" />
          </div>
          <div className="w-80 h-5 bg-white/20 animate-pulse mb-10 rounded-sm" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="flex flex-col p-5 bg-white/5 border border-white/10">
                <div className="w-24 h-3 bg-white/20 animate-pulse mb-3 rounded-sm" />
                <div className="w-3/4 h-8 bg-white/20 animate-pulse mb-2 rounded-sm" />
                <div className="w-full h-4 bg-white/20 animate-pulse mb-2 rounded-sm" />
                <div className="w-5/6 h-4 bg-white/20 animate-pulse mb-5 rounded-sm" />
                <div className="flex gap-2">
                  <div className="w-16 h-5 bg-white/20 animate-pulse rounded-sm" />
                  <div className="w-20 h-5 bg-white/20 animate-pulse rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
