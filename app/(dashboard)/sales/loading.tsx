export default function Loading() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-pulse">
      <div className="h-8 w-56 bg-muted rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="h-96 bg-muted rounded-xl" />
    </div>
  );
}
