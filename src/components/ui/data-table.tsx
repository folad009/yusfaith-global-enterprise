import type { ReactNode } from "react";

export type Column<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  empty: ReactNode;
}) {
  if (rows.length === 0) return <>{empty}</>;

  return (
    <div className="overflow-x-auto border border-line bg-base-100">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead className="bg-base-200 text-xs uppercase tracking-[0.14em] text-base-content/60">
          <tr>
            {columns.map((column) => (
              <th key={column.id} className="px-4 py-3 font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="border-t border-line">
              {columns.map((column) => (
                <td key={column.id} className={`px-4 py-3 ${column.className ?? ""}`}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
