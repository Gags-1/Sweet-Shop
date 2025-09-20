import { SignupForm } from "~/components/signup-form";
import type { Route } from "./+types/signup";
import { redirect } from "react-router";
import { register } from "~/lib/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Signup" },
    { name: "description", content: "Create a new account" },
  ];
}

export default function SignupPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const name = String(form.get("name") || "");
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  const confirm = String(form.get("confirm-password") || "");
  if (!name || !email || !password) {
    return redirect("/signup?error=" + encodeURIComponent("Please fill all fields"));
  }
  if (password !== confirm) {
    return redirect("/signup?error=" + encodeURIComponent("Passwords do not match"));
  }
  try {
    await register(name, email, password);
    return redirect("/login?success=" + encodeURIComponent("Account created. Please log in."));
  } catch (e: any) {
    const msg = e?.data?.detail || e?.message || "Signup failed";
    return redirect("/signup?error=" + encodeURIComponent(msg));
  }
}
