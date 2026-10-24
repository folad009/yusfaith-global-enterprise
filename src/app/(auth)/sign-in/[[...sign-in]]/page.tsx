import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/portal/clerk";
import {Suspense} from "react";

export default function SignInPage() {
  if (!isClerkConfigured()) return null;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignIn />
    </Suspense>
  );
}