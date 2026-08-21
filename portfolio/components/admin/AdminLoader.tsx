import React from "react";

export function AdminPageLoader() {
  return (
    <div className="p-10 max-w-5xl w-full animate-in fade-in duration-500">
      <div className="w-48 h-8 bg-forest-800/30 animate-pulse mb-8" />
      <div className="flex flex-col gap-6">
        <div className="w-full h-16 bg-forest-800/20 animate-pulse" />
        <div className="w-full h-64 bg-forest-800/20 animate-pulse" />
      </div>
    </div>
  );
}

export function AdminTableLoader({ colSpan = 5 }: { colSpan?: number }) {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <tr key={i} className="border-b border-forest-800/30">
          <td colSpan={colSpan} className="px-6 py-4">
            <div className="w-full flex items-center justify-between gap-8">
              <div className="w-1/3 h-4 bg-forest-800/30 animate-pulse" />
              <div className="w-1/4 h-4 bg-forest-800/30 animate-pulse" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
