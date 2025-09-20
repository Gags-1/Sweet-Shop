import type { Route } from "./+types/login";
import { LoginForm } from "~/components/login-form"
import { Form, redirect, useSearchParams } from "react-router";
import { login as apiLogin, isAdmin as checkAdmin, saveToken } from "~/lib/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "description", content: "Login to your account" },
  ];
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  const success = searchParams.get("success");
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        {success && (
          <div
            role="status"
            className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            {success}
          </div>
        )}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  )
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  if (!email || !password) {
    return redirect(
      "/login?error=" + encodeURIComponent("Please enter email and password")
    );
  }
  try {
    const token = await apiLogin(email, password);
    saveToken(token);
    const admin = await checkAdmin(token);
    const cookie = `token=${token}; Path=/; SameSite=Lax`;
    return redirect(admin ? "/admin" : "/", {
      headers: {
        "Set-Cookie": cookie,
      },
    });
  } catch (e: any) {
    const msg = e?.status === 401
      ? "Invalid email or password"
      : (e?.message || "Login failed");
    return redirect("/login?error=" + encodeURIComponent(msg));
  }
}
