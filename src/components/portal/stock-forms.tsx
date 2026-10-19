"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import { recordStockMovement, type StockActionResult } from "@/server/inventory-actions";

const initial: StockActionResult | null = null;

export function StockForms({
  inventoryId,
  version,
  onHand,
}: {
  inventoryId: string;
  version: string;
  onHand: string;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <StockForm
        inventoryId={inventoryId}
        version={version}
        kind="RECEIPT"
        title="Receive stock"
        detail={`Adds to the on-hand quantity of ${onHand}. This is not a purchase order.`}
        confirm="Record receipt"
      />
      <AdjustmentForm inventoryId={inventoryId} version={version} onHand={onHand} />
    </div>
  );
}

function AdjustmentForm({
  inventoryId,
  version,
  onHand,
}: {
  inventoryId: string;
  version: string;
  onHand: string;
}) {
  const [kind, setKind] = useState<"INCREASE" | "DECREASE">("INCREASE");
  return (
    <div className="border border-line bg-base-100 p-5">
      <h2 className="font-display text-2xl text-ink">Adjust stock</h2>
      <p className="mt-1 text-sm leading-6 text-base-content/70">
        Manual increase or decrease from the on-hand quantity of {onHand}. A decrease cannot go below zero. Orders do not change this quantity.
      </p>
      <label className="mt-4 grid gap-2 text-sm">
        <span className="font-medium text-ink">Direction</span>
        <select
          className="select h-11 min-h-11 rounded-sm border-base-300"
          value={kind}
          onChange={(event) => setKind(event.target.value as "INCREASE" | "DECREASE")}
        >
          <option value="INCREASE">Increase on hand</option>
          <option value="DECREASE">Decrease on hand</option>
        </select>
      </label>
      <StockForm
        inventoryId={inventoryId}
        version={version}
        kind={kind}
        title=""
        detail=""
        confirm={kind === "DECREASE" ? "Record decrease" : "Record increase"}
        embedded
      />
    </div>
  );
}

function StockForm({
  inventoryId,
  version,
  kind,
  title,
  detail,
  confirm,
  embedded = false,
}: {
  inventoryId: string;
  version: string;
  kind: "RECEIPT" | "INCREASE" | "DECREASE";
  title: string;
  detail: string;
  confirm: string;
  embedded?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, formAction] = useActionState(
    async (_previous: StockActionResult | null, formData: FormData) => recordStockMovement(formData),
    initial,
  );

  const fields = (
    <>
      {state && !state.ok ? (
        <p role="alert" className="text-sm text-error">
          {state.message}
        </p>
      ) : null}
      <input type="hidden" name="inventoryId" value={inventoryId} />
      <input type="hidden" name="version" value={version} />
      <input type="hidden" name="kind" value={kind} />
      <Field label="Quantity" error={state?.fieldErrors?.quantity}>
        <TextInput name="quantity" inputMode="decimal" required />
      </Field>
      <Field label="Reference" error={state?.fieldErrors?.reference} hint="A receipt or adjustment number.">
        <TextInput name="reference" required />
      </Field>
      <Field label="Reason" error={state?.fieldErrors?.reason}>
        <TextArea name="reason" required />
      </Field>
      <button type="button" className="btn btn-primary h-11 min-h-11 w-fit rounded-sm px-5" onClick={() => setOpen(true)}>
        {confirm}
      </button>
    </>
  );

  const dialog = (
    <ConfirmDialog
      open={open}
      title="Confirm stock change"
      description="This writes a stock movement and updates the on-hand quantity. It does not create a purchase order."
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
  );

  if (embedded) {
    return (
      <>
        <form ref={formRef} className="mt-4 grid gap-4" onSubmit={(event) => event.preventDefault()}>
          {fields}
        </form>
        {dialog}
      </>
    );
  }

  return (
    <>
      <form ref={formRef} className="grid gap-4 border border-line bg-base-100 p-5" onSubmit={(event) => event.preventDefault()}>
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        <p className="text-sm leading-6 text-base-content/70">{detail}</p>
        {fields}
      </form>
      {dialog}
    </>
  );
}
