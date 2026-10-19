"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { products } from "@/lib/catalog";
import { quoteSchema, type QuoteInput } from "@/lib/validation/enquiry";
import { submitQuote } from "@/server/enquiries";
import { SubmitButton } from "@/components/marketing/submit-button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/field";

export function QuoteForm({ initialProduct }: { initialProduct?: string }) {
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      customerName: "",
      businessName: "",
      phone: "",
      email: "",
      location: "",
      productSlug: initialProduct ?? "",
      quantity: "",
      notes: "",
    },
  });

  if (done) {
    return (
      <div className="border border-line bg-base-100 p-6" role="status">
        <h2 className="font-display text-3xl text-ink">Quotation request received</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-base-content/75">
          The sales team can review this enquiry from the database. A quotation is issued after the yard confirms product and quantity. This page does not confirm stock or a price.
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
        const result = await submitQuote(values);
        if (result.ok) {
          setDone(true);
          return;
        }
        setFormError(result.message);
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            setError(field as keyof QuoteInput, { message });
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
        <Field label="Location" error={errors.location?.message} hint="Town or area for collection or delivery.">
          <TextInput {...register("location")} autoComplete="address-level2" />
        </Field>
        <Field label="Product" error={errors.productSlug?.message}>
          <SelectInput {...register("productSlug")}>
            <option value="">Select</option>
            {products.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Quantity" error={errors.quantity?.message} hint="Bags, pieces, or loads.">
          <TextInput {...register("quantity")} />
        </Field>
      </div>
      <Field label="Notes" error={errors.notes?.message}>
        <TextArea {...register("notes")} />
      </Field>
      <SubmitButton pending={isSubmitting} label="Request a quote" pendingLabel="Sending enquiry…" />
    </form>
  );
}
