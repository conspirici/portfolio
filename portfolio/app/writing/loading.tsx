export default function WritingLoading() {
  return (
    <div 
      className="relative min-h-screen"
      style={{ background: '#F5F7F4' }} // Simple light background
    >
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        
        <header className="mb-14">
          <div className="w-48 h-12 sm:h-14 bg-gray-200 animate-pulse rounded-sm mb-4" />
          <div className="w-full max-w-sm h-6 bg-gray-200 animate-pulse rounded-sm" />
        </header>

        <div className="flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="relative block overflow-hidden aspect-[16/9] sm:aspect-[2/1] bg-gray-200 animate-pulse rounded-sm"
            >
              {/* Overlay elements to give it internal structure mimicking text */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
                <div className="w-24 h-3 bg-white/40 animate-pulse mb-3 rounded-sm" />
                <div className="w-2/3 h-8 sm:h-10 bg-white/40 animate-pulse mb-3 rounded-sm" />
                <div className="w-full h-4 bg-white/40 animate-pulse mb-2 rounded-sm" />
                <div className="w-4/5 h-4 bg-white/40 animate-pulse mb-4 rounded-sm" />
                
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <div className="w-12 h-5 bg-white/40 animate-pulse rounded-sm" />
                    <div className="w-16 h-5 bg-white/40 animate-pulse rounded-sm" />
                  </div>
                  <div className="w-12 h-4 bg-white/40 animate-pulse rounded-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
