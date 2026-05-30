"use client";

export function PrintControls() {
  return (
    <div className="mb-6 flex items-center justify-end gap-2 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white"
      >
        Download / Print PDF
      </button>
    </div>
  );
}
