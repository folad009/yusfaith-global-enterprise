"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, SelectInput, TextInput } from "@/components/ui/field";
import { customerStatuses, customerTypeLabel, customerTypes } from "@/lib/validation/customer";
import { createCustomer, updateCustomer, type CustomerActionResult } from "@/server/customer-actions";

const initial: CustomerActionResult | null = null;

export function CustomerForm({
  customer,
}: {
  customer?: {
    id: string;
    businessName: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    customerType: string;
    status: string;
  };
}) {
  const action = customer ? updateCustomer.bind(null, customer.id) : createCustomer;
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, formAction] = useActionState(
    async (_previous: CustomerActionResult | null, formData: FormData) => action(formData),
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
        <Field label="Business name" error={errors.businessName}>
          <TextInput name="businessName" defaultValue={customer?.businessName} required />
        </Field>
        <Field label="Contact person" error={errors.contactPerson}>
          <TextInput name="contactPerson" defaultValue={customer?.contactPerson} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" error={errors.phone}>
            <TextInput name="phone" defaultValue={customer?.phone} required />
          </Field>
          <Field label="Email" error={errors.email}>
            <TextInput name="email" type="email" defaultValue={customer?.email} required />
          </Field>
        </div>
        <Field label="Location" error={errors.location}>
          <TextInput name="location" defaultValue={customer?.address} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer type" error={errors.customerType}>
            <SelectInput name="customerType" defaultValue={customer?.customerType ?? "WHOLESALE"}>
              {customerTypes.map((type) => (
                <option key={type} value={type}>
                  {customerTypeLabel(type)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Status" error={errors.status}>
            <SelectInput name="status" defaultValue={customer?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE"}>
              {customerStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === "ACTIVE" ? "Active" : "Inactive"}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
        <button type="submit" className="btn btn-primary h-11 min-h-11 w-fit rounded-sm px-5" disabled={pending}>
          {pending ? "Saving…" : customer ? "Save customer" : "Create customer"}
        </button>
      </form>
      <ConfirmDialog
        open={open}
        title={customer ? "Save this customer?" : "Create this customer?"}
        description="The profile is stored for quotations and orders. Customer type does not grant portal access."
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
