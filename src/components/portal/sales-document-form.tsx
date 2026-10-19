"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { LineEditor, type LineChoice, type LineValue } from "@/components/portal/line-editor";
import type { OrderActionResult } from "@/server/order-actions";
import type { QuoteActionResult } from "@/server/quote-actions";

type Result = QuoteActionResult | OrderActionResult;

export function SalesDocumentForm({
  kind,
  action,
  customers,
  products,
  initial,
}: {
  kind: "quote" | "order";
  action: (formData: FormData) => Promise<Result>;
  customers: Array<{ id: string; businessName: string }>;
  products: LineChoice[];
  initial?: {
    customerId: string;
    date: string;
    notes: string;
    lines: LineValue[];
  };
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, formAction] = useActionState(async (_previous: Result | null, formData: FormData) => action(formData), null);
  const dateName = kind === "quote" ? "expiryDate" : "orderDate";
  const dateLabel = kind === "quote" ? "Expiry date" : "Order date";

  return (
    <>
      <form
        ref={formRef}
        className="grid gap-6"
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
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Customer" error={state?.fieldErrors?.customerId}>
            <SelectInput name="customerId" defaultValue={initial?.customerId ?? customers[0]?.id}>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.businessName}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={dateLabel} error={state?.fieldErrors?.[dateName]}>
            <TextInput name={dateName} type="date" defaultValue={initial?.date} required />
          </Field>
        </div>
        <LineEditor products={products} initial={initial?.lines} />
        <Field label="Notes" error={state?.fieldErrors?.notes}>
          <TextArea name="notes" defaultValue={initial?.notes ?? ""} />
        </Field>
        <p className="text-sm text-base-content/70">
          Line totals are calculated on the server from the quantity and unit price. Saving does not reserve or reduce on-hand stock.
        </p>
        <button type="submit" className="btn btn-primary h-11 min-h-11 w-fit rounded-sm px-5" disabled={pending || customers.length === 0}>
          {pending ? "Saving…" : kind === "quote" ? "Save quotation" : "Save order"}
        </button>
      </form>
      <ConfirmDialog
        open={open}
        title={kind === "quote" ? "Save this quotation?" : "Save this order?"}
        description="The stored total is calculated again on the server. A browser total is not used."
        confirmLabel={pending ? "Saving…" : "Confirm"}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          const form = formRef.current;
          if (!form) return;
          startTransition(() => formAction(new FormData(form)));
        }}
      />
    </>
  );
}
