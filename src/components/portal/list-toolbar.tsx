"use client";

import { SearchField } from "@/components/ui/search-field";

const filters = ["All statuses", "Confirmed", "Picking", "Ready", "Dispatched"] as const;

export function ListToolbar({
  searchPlaceholder,
}: {
  searchPlaceholder: string;
}) {
  return (
    <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => event.preventDefault()}>
      <SearchField name="q" placeholder={searchPlaceholder} />
      <label className="sr-only" htmlFor="portal-filter">
        Filter
      </label>
      <select id="portal-filter" className="select h-11 min-h-11 w-full rounded-sm border-base-300 sm:w-48" defaultValue="All statuses">
        {filters.map((filter) => (
          <option key={filter}>{filter}</option>
        ))}
      </select>
    </form>
  );
}
