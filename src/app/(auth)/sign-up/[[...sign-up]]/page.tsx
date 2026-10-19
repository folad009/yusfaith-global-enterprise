import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/portal/clerk";
import {Suspense} from "react";

export default function SignUpPage() {
  if (!isClerkConfigured()) return null;
  return <Suspense fallback={<div>Loading...</div>}>
    <SignUp />
  </Suspense>;
}
