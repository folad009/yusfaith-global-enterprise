"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { categoryLabel, productCategories, units } from "@/lib/validation/product";
import { createProduct, updateProduct, type ProductActionResult } from "@/server/product-actions";

const initial: ProductActionResult | null = null;

export function ProductForm({
  product,
}: {
  product?: {
    id: string;
    name: string;
    sku: string;
    slug: string;
    category: string;
    brand: string;
    description: string;
    imageUrl: string;
    unit: string;
    sellingPrice: { toString(): string };
    active: boolean;
  };
}) {
  const action = product
    ? updateProduct.bind(null, product.id)
    : createProduct;
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, formAction] = useActionState(
    async (_previous: ProductActionResult | null, formData: FormData) => action(formData),
    initial,
  );
  const errors = state?.fieldErrors ?? {};

  return (
    <>
    <form
      ref={formRef}
      className="grid max-w-2xl gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setOpen(true);
      }}
    >
      {state && !state.ok ? (
        <p role="alert" className="border border-error/30 bg-base-100 px-4 py-3 text-sm text-error">
          {state.message}
        </p>
      ) : null}
      <Field label="Name" error={errors.name}>
        <TextInput name="name" defaultValue={product?.name} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="SKU" error={errors.sku}>
          <TextInput name="sku" defaultValue={product?.sku} required />
        </Field>
        <Field label="Slug" error={errors.slug}>
          <TextInput name="slug" defaultValue={product?.slug} required />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" error={errors.category}>
          <SelectInput name="category" defaultValue={product?.category ?? "OTHER"}>
            {productCategories.map((category) => (
              <option key={category} value={category}>
                {categoryLabel(category)}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Brand" error={errors.brand}>
          <TextInput name="brand" defaultValue={product?.brand} required />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Unit" error={errors.unit}>
          <SelectInput name="unit" defaultValue={product?.unit ?? "BAG"}>
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unit.charAt(0) + unit.slice(1).toLowerCase()}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Selling price (NGN)" error={errors.sellingPrice} hint="Catalogue price. Existing order lines keep their own prices.">
          <TextInput name="sellingPrice" inputMode="decimal" defaultValue={product?.sellingPrice.toString()} required />
        </Field>
      </div>
      <Field label="Image address" error={errors.imageUrl} hint="Optional. A path such as /images/blocks.jpg or an https address.">
        <TextInput name="imageUrl" defaultValue={product?.imageUrl ?? ""} />
      </Field>
      <Field label="Description" error={errors.description}>
        <TextArea name="description" defaultValue={product?.description} required />
      </Field>
      <Field label="Status" error={errors.active}>
        <SelectInput name="active" defaultValue={product ? String(product.active) : "true"}>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </SelectInput>
      </Field>
      <button type="submit" className="btn btn-primary h-11 min-h-11 w-fit rounded-sm px-5" disabled={pending}>
        {pending ? "Saving…" : product ? "Save product" : "Create product"}
      </button>
    </form>
    <ConfirmDialog
      open={open}
      title={product ? "Save these product changes?" : "Create this product?"}
      description="The catalogue record is updated. Existing orders keep the prices already stored on their lines, and stock quantities stay as they are."
      confirmLabel={pending ? "Saving…" : "Confirm"}
      onClose={() => setOpen(false)}
      onConfirm={() => {
        const form = formRef.current;
        if (!form) return;
        startTransition(() => {
          formAction(new FormData(form));
        });
      }}
    />
    </>
  );
}
