"use client";

export type ToastMessage = {
  id: string;
  title: string;
  body: string;
};

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 grid w-[min(22rem,calc(100%-2rem))] gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="border border-line bg-neutral px-4 py-3 text-neutral-content shadow-rest"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium">{toast.title}</p>
            <button
              type="button"
              className="text-xs tracking-wide text-neutral-content/70"
              onClick={() => onDismiss(toast.id)}
            >
              Close
            </button>
          </div>
          <p className="mt-1 text-sm text-neutral-content/80">{toast.body}</p>
        </div>
      ))}
    </div>
  );
}
