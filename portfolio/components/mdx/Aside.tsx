export function Aside({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-8 pl-6 border-l-2 border-teal-600 bg-teal-50/50 py-4 pr-4 italic font-display text-lg text-teal-900-r-sm shadow-sm">
      {children}
    </aside>
  );
}
