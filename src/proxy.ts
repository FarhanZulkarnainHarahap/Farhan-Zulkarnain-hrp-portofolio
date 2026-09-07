import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authPage = pathname.startsWith("/auth");
  const protectedPage =
    pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
  if (!authPage && !protectedPage) return NextResponse.next();
  const token = req.cookies.get("accessToken")?.value;
  if (!token)
    return authPage
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/auth/login", req.url));
  const secret = process.env.JWT_SECRET;
  if (!secret)
    return authPage
      ? NextResponse.next()
      : new NextResponse("Authentication service is not configured.", {
          status: 503,
        });
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    const adminPage =
      pathname.startsWith("/admin") || pathname.startsWith("/dashboard/admin");
    if (adminPage && payload.role !== "ADMIN")
      return new NextResponse("Forbidden: administrator access required.", {
        status: 403,
      });
    if (authPage)
      return NextResponse.redirect(
        new URL(
          payload.role === "ADMIN" ? "/admin/home" : "/dashboard/user",
          req.url,
        ),
      );
    return NextResponse.next();
  } catch {
    const response = authPage
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/auth/login", req.url));
    response.cookies.delete("accessToken");
    return response;
  }
}
export const config = {
  matcher: ["/auth/:path*", "/admin/:path*", "/dashboard/:path*"],
};
