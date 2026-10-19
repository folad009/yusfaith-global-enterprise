"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { accountSchema, type AccountInput } from "@/lib/validation/enquiry";
import { submitAccountApplication } from "@/server/enquiries";
import { SubmitButton } from "@/components/marketing/submit-button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/field";

const buyerTypes = [
  { value: "contractor", label: "Contractor" },
  { value: "retailer", label: "Retailer" },
  { value: "developer", label: "Developer" },
  { value: "wholesale", label: "Wholesale buyer" },
] as const;

export function AccountForm() {
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AccountInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      customerName: "",
      businessName: "",
      phone: "",
      email: "",
      location: "",
      buyerType: "contractor",
      monthlyVolume: "",
      notes: "",
    },
  });

  if (done) {
    return (
      <div className="border border-line bg-base-100 p-6" role="status">
        <h2 className="font-display text-3xl text-ink">Application received</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-base-content/75">
          The application is stored for the sales team. Opening a wholesale account is a separate step and is not completed on this page.
        </p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-5 border border-line bg-base-100 p-6"
      method="post"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setFormError(null);
        const result = await submitAccountApplication(values);
        if (result.ok) {
          setDone(true);
          return;
        }
        setFormError(result.message);
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            setError(field as keyof AccountInput, { message });
          }
        }
      })}
    >
      {formError ? (
        <p className="border border-error/30 bg-error/5 px-4 py-3 text-sm text-error" role="alert">
          {formError}
        </p>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Your name" error={errors.customerName?.message}>
          <TextInput {...register("customerName")} autoComplete="name" />
        </Field>
        <Field label="Business name" error={errors.businessName?.message}>
          <TextInput {...register("businessName")} autoComplete="organization" />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <TextInput {...register("phone")} autoComplete="tel" inputMode="tel" />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <TextInput {...register("email")} autoComplete="email" inputMode="email" />
        </Field>
        <Field label="Location" error={errors.location?.message}>
          <TextInput {...register("location")} autoComplete="address-level2" />
        </Field>
        <Field label="Buyer type" error={errors.buyerType?.message}>
          <SelectInput {...register("buyerType")}>
            {buyerTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Approximate monthly volume" error={errors.monthlyVolume?.message}>
          <TextInput {...register("monthlyVolume")} />
        </Field>
      </div>
      <Field label="Notes" error={errors.notes?.message}>
        <TextArea {...register("notes")} />
      </Field>
      <SubmitButton pending={isSubmitting} label="Submit application" pendingLabel="Sending application…" />
    </form>
  );
}
