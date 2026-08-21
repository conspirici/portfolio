export default function ProjectLoading() {
  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#F5F7F4' }}>
      <article className="max-w-4xl mx-auto px-6 sm:px-10 py-24">
        <header className="mb-16">
          {/* Back button */}
          <div className="mb-8">
            <div className="w-32 h-4 bg-gray-200 animate-pulse rounded-sm" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Title and summary */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="w-full h-12 sm:h-14 bg-gray-200 animate-pulse rounded-sm" />
              <div className="w-4/5 h-12 sm:h-14 bg-gray-200 animate-pulse rounded-sm mb-4" />
              
              <div className="w-full h-6 bg-gray-200 animate-pulse rounded-sm" />
              <div className="w-11/12 h-6 bg-gray-200 animate-pulse rounded-sm" />
              <div className="w-3/4 h-6 bg-gray-200 animate-pulse rounded-sm" />
            </div>
            
            {/* Details card */}
            <div className="bg-gray-200/50 p-6 border border-gray-200">
              <div className="w-24 h-4 bg-gray-300 animate-pulse rounded-sm mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <div className="w-16 h-3 bg-gray-300 animate-pulse rounded-sm mb-2" />
                    <div className="w-32 h-5 bg-gray-300 animate-pulse rounded-sm" />
                  </div>
                ))}
                <div className="pt-2">
                  <div className="w-20 h-3 bg-gray-300 animate-pulse rounded-sm mb-2" />
                  <div className="flex flex-wrap gap-2">
                    <div className="w-16 h-6 bg-gray-300 animate-pulse rounded-sm" />
                    <div className="w-24 h-6 bg-gray-300 animate-pulse rounded-sm" />
                    <div className="w-20 h-6 bg-gray-300 animate-pulse rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Big thumbnail */}
        <div className="mb-16 w-full h-[500px] relative overflow-hidden bg-gray-200 animate-pulse rounded-sm" />

        {/* Prose body */}
        <div className="flex flex-col gap-4 max-w-none">
          <div className="w-full h-5 bg-gray-200 animate-pulse rounded-sm" />
          <div className="w-11/12 h-5 bg-gray-200 animate-pulse rounded-sm" />
          <div className="w-full h-5 bg-gray-200 animate-pulse rounded-sm" />
          <div className="w-4/5 h-5 bg-gray-200 animate-pulse rounded-sm" />
          <div className="w-full h-5 bg-gray-200 animate-pulse rounded-sm mt-4" />
          <div className="w-10/12 h-5 bg-gray-200 animate-pulse rounded-sm" />
          <div className="w-9/12 h-5 bg-gray-200 animate-pulse rounded-sm" />
        </div>
      </article>
    </div>
  );
}
