import Link from "next/link";

export function PageLinks({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  return (
    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
      <p className="text-base-content/70">
        Page {page} of {pageCount}
      </p>
      <div className="flex gap-3">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className="text-ink hover:text-primary">
            Previous
          </Link>
        ) : (
          <span className="text-base-content/40">Previous</span>
        )}
        {page < pageCount ? (
          <Link href={hrefFor(page + 1)} className="text-ink hover:text-primary">
            Next
          </Link>
        ) : (
          <span className="text-base-content/40">Next</span>
        )}
      </div>
    </div>
  );
}

export function queryHref(path: string, params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}
