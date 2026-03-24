import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes: redirect to login if not authenticated
  if ((pathname.startsWith("/admin") || pathname.startsWith("/minha-conta")) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based routing for authenticated users
  if (user) {
    // Use is_admin() function which is security definer (bypasses RLS)
    const { data: isAdmin } = await supabase.rpc("is_admin");

    // Admin trying to access user pages or login → redirect to admin
    if (isAdmin && !pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Non-admin trying to access admin pages → redirect to user area
    if (!isAdmin && pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/minha-conta", request.url));
    }

    // Logged in non-admin on login/registro → redirect to user area
    if (!isAdmin && (pathname === "/login" || pathname === "/registro")) {
      return NextResponse.redirect(new URL("/minha-conta", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/minha-conta/:path*", "/registro"],
};
