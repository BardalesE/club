import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El middleware ya protege /admin, pero la página de login vive fuera de este layout.
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      <AdminNav email={user.email || ""} />
      <main className="flex-1 p-8 max-w-4xl">{children}</main>
    </div>
  );
}
