"use client";

import { useMemo, useState } from "react";
import { Field, SelectInput, TextInput } from "@/components/ui/field";
import { formatNgn } from "@/lib/commerce/workflow-labels";

export type LineChoice = { id: string; name: string; sku: string; unit: string; price: string };
export type LineValue = { productId: string; quantity: string; unitPrice: string };

export function LineEditor({ products, initial }: { products: LineChoice[]; initial?: LineValue[] }) {
  const [lines, setLines] = useState<LineValue[]>(
    initial?.length ? initial : [{ productId: products[0]?.id ?? "", quantity: "1", unitPrice: products[0]?.price ?? "" }],
  );
  const preview = useMemo(() => {
    return lines.reduce((sum, line) => {
      const qty = Number(line.quantity);
      const price = Number(line.unitPrice);
      if (!Number.isFinite(qty) || !Number.isFinite(price)) return sum;
      return sum + qty * price;
    }, 0);
  }, [lines]);

  function update(index: number, patch: Partial<LineValue>) {
    setLines((current) => current.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)));
  }

  return (
    <div className="grid gap-4">
      {lines.map((line, index) => (
        <div key={index} className="grid gap-3 border border-line bg-base-100 p-4 md:grid-cols-[1.4fr_0.6fr_0.7fr_auto]">
          <Field label="Product">
            <SelectInput
              name="productId"
              value={line.productId}
              onChange={(event) => {
                const product = products.find((item) => item.id === event.target.value);
                update(index, { productId: event.target.value, unitPrice: product?.price ?? line.unitPrice });
              }}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} · {product.sku}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Quantity">
            <TextInput
              name="quantity"
              inputMode="decimal"
              value={line.quantity}
              onChange={(event) => update(index, { quantity: event.target.value })}
              required
            />
          </Field>
          <Field label="Unit price (NGN)">
            <TextInput
              name="unitPrice"
              inputMode="decimal"
              value={line.unitPrice}
              onChange={(event) => update(index, { unitPrice: event.target.value })}
              required
            />
          </Field>
          <button
            type="button"
            className="btn btn-ghost h-11 min-h-11 self-end rounded-sm px-3"
            onClick={() => setLines((current) => current.filter((_, lineIndex) => lineIndex !== index))}
            disabled={lines.length === 1}
          >
            Remove
          </button>
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="btn btn-secondary h-11 min-h-11 rounded-sm px-4"
          onClick={() =>
            setLines((current) => [
              ...current,
              { productId: products[0]?.id ?? "", quantity: "1", unitPrice: products[0]?.price ?? "" },
            ])
          }
        >
          Add product
        </button>
        <p className="text-sm text-base-content/70">Preview subtotal {formatNgn(preview.toFixed(2))}. The server recalculates the saved total.</p>
      </div>
    </div>
  );
}
