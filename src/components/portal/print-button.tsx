"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className="btn btn-secondary h-11 min-h-11 rounded-sm px-5 print:hidden" onClick={() => window.print()}>
      {label}
    </button>
  );
}
