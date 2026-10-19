import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/portal/clerk";

export default function SignUpPage() {
  if (!isClerkConfigured()) return null;
  return <SignUp />;
}
