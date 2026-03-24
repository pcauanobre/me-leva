import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UserShell from "./UserShell";
import type { Profile } from "@/lib/supabase/types";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Use is_admin() which is security definer (bypasses RLS)
  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (isAdmin) {
    redirect("/admin");
  }

  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const profile = data as { full_name: string } | null;

  return (
    <UserShell userName={profile?.full_name ?? user.email ?? ""}>
      {children}
    </UserShell>
  );
}
