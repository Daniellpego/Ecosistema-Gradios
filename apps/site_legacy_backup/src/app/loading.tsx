export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero skeleton */}
      <section className="pt-24 pb-8 lg:pt-28 lg:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-16 animate-pulse">
            <div className="h-7 w-64 bg-card-border rounded-pill mx-auto mb-6" />
            <div className="h-14 w-full max-w-xl bg-card-border rounded-lg mx-auto mb-3" />
            <div className="h-14 w-full max-w-md bg-card-border rounded-lg mx-auto mb-6" />
            <div className="h-5 w-full max-w-lg bg-card-border rounded-lg mx-auto mb-8" />
            <div className="flex gap-4 justify-center">
              <div className="h-12 w-48 bg-card-border rounded-pill" />
              <div className="h-12 w-40 bg-card-border rounded-pill" />
            </div>
          </div>

          {/* Dashboard skeleton */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-[#0f172a] rounded-2xl lg:rounded-3xl overflow-hidden animate-pulse">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white/[0.04] rounded-xl p-4 h-20" />
                  ))}
                </div>
                <div className="h-32 bg-white/[0.04] rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
