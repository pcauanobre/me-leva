import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Box } from "@mui/material";
import { createServerClient } from "@/lib/supabase/server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let authUser: { name: string; isAdmin: boolean } | null = null;

  if (user) {
    const [{ data: isAdmin }, { data: profile }] = await Promise.all([
      supabase.rpc("is_admin"),
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single(),
    ]);

    authUser = {
      name: (profile as { full_name: string } | null)?.full_name ?? user.email ?? "Usuário",
      isAdmin: !!isAdmin,
    };
  }

  return (
    <>
      <PublicHeader user={authUser} />
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <PublicFooter />
    </>
  );
}
