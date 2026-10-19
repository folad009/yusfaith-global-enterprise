export function ClerkSetupNotice() {
  return (
    <section className="border border-line bg-base-100 px-6 py-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
        Authentication setup
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink">Clerk is not configured</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/70">
        Sign-in cannot run until Clerk credentials are present. Protected portal routes refuse records and changes while this configuration is missing.
      </p>
      <ol className="mt-6 grid gap-3 text-sm leading-6 text-ink">
        <li>1. Create a Clerk application and copy the publishable key and secret key.</li>
        <li>2. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY.</li>
        <li>3. Set NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in and NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up.</li>
        <li>4. Set NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/portal and NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/portal.</li>
        <li>5. Restart the app after saving the keys.</li>
        <li>
          6. Provision a UserProfile for the Clerk user id. The role lives on that row, not in a field the user can edit. A wholesale profile also stores customerId.
        </li>
      </ol>
    </section>
  );
}
