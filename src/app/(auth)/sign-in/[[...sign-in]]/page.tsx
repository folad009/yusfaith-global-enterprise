import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/portal/clerk";

export default function SignInPage() {
  if (!isClerkConfigured()) return null;
  return <SignIn />;
}
