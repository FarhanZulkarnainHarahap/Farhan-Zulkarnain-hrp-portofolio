import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const { pathname } = req.nextUrl;

  // 1. Bypass auth pages
  if (pathname.startsWith("/auth")) {
    if (accessToken) {
      return NextResponse.redirect(new URL("/admin/home", req.url));
    }
    return NextResponse.next();
  }

  // 2. Protect restricted pages (Admin/Dashboard)
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("Middleware Error: JWT_SECRET is not defined in environment variables");
      return new NextResponse("Server Configuration Error", { status: 500 });
    }

    try {
      // Verifikasi Token
      const { payload } = await jwtVerify(
        accessToken, 
        new TextEncoder().encode(secret)
      );

      // RBAC: Check admin role
      if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
        return new NextResponse("Forbidden: Admin Only", { status: 403 });
      }

      return NextResponse.next();
    } catch (err) {
      // DEBUG: Check hosting/Vercel logs for verification failures.
      console.error("JWT Verification Failed:", err);

      // Verification failed -> clear cookie and return to login
      const response = NextResponse.redirect(new URL("/auth/login", req.url));
      response.cookies.delete("accessToken"); 
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Safer matcher to ignore static files and public folder
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*).*)",
  ],
};
