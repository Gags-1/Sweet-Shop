import { redirect, useLoaderData, Link } from "react-router";
import { isAdmin, clearUserRole, setUserRole } from "~/lib/auth";

export async function loader() {
  // Client-side check. For SSR/prod, validate on the server.
  if (!isAdmin()) {
    throw redirect("/login");
  }
  return { role: "admin" as const };
}

export function meta() {
  return [
    { title: "Admin Dashboard" },
    { name: "description", content: "Admin-only dashboard" },
  ];
}

export default function AdminDashboard() {
  useLoaderData<typeof loader>();
  return (
    <main className="container mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Only admins can see this.</p>
      <div className="flex gap-3">
        <button
          onClick={() => {
            clearUserRole();
            location.href = "/login";
          }}
          className="border rounded px-3 py-1"
        >
          Log out
        </button>
        <button
          onClick={() => {
            setUserRole("user");
            location.href = "/";
          }}
          className="border rounded px-3 py-1"
        >
          Switch to user
        </button>
        <Link to="/" className="underline">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
