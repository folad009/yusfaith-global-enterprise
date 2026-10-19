"use client";

export default function PortalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="border border-line bg-base-100 px-6 py-12">
      <h1 className="font-display text-3xl text-ink">The portal could not load this page</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-base-content/70">
        Try the page again. If the problem continues, check the server logs for this request.
      </p>
      <button type="button" className="btn btn-primary mt-6 h-11 min-h-11 rounded-sm px-5" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
