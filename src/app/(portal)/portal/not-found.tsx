import Link from "next/link";

export default function PortalNotFound() {
  return (
    <section className="border border-line bg-base-100 px-6 py-12">
      <h1 className="font-display text-3xl text-ink">Page not found</h1>
      <p className="mt-3 text-sm text-base-content/70">That portal address is not part of this layout.</p>
      <Link href="/portal" className="btn btn-primary mt-6 h-11 min-h-11 rounded-sm px-5">
        Back to overview
      </Link>
    </section>
  );
}
