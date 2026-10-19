"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { setProductActive } from "@/server/product-actions";

export function ProductStatusControl({ id, active }: { id: string; active: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const next = !active;

  return (
    <>
      <button type="button" className="btn btn-secondary h-11 min-h-11 rounded-sm px-5" onClick={() => setOpen(true)}>
        {active ? "Deactivate" : "Activate"}
      </button>
      <ConfirmDialog
        open={open}
        title={next ? "Activate this product?" : "Deactivate this product?"}
        description={
          next
            ? "The product returns to the active catalogue. Stock quantities are left unchanged."
            : "The product leaves the active catalogue. Stored stock and past orders stay in place."
        }
        confirmLabel={pending ? "Saving…" : next ? "Activate" : "Deactivate"}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          startTransition(() => {
            void setProductActive(id, next);
          });
        }}
      />
    </>
  );
}
