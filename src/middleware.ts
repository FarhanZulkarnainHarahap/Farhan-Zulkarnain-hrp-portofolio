import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const { pathname } = req.nextUrl;

  // 1. Bypass Halaman Auth
  if (pathname.startsWith("/auth")) {
    if (accessToken) {
      return NextResponse.redirect(new URL("/admin/home", req.url));
    }
    return NextResponse.next();
  }

  // 2. Proteksi Halaman Terlarang (Admin/Dashboard)
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("Middleware Error: JWT_SECRET tidak terdefinisi di Environment Variables");
      return new NextResponse("Server Configuration Error", { status: 500 });
    }

    try {
      // Verifikasi Token
      const { payload } = await jwtVerify(
        accessToken, 
        new TextEncoder().encode(secret)
      );

      // RBAC: Cek Role Admin
      if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
        return new NextResponse("Forbidden: Admin Only", { status: 403 });
      }

      return NextResponse.next();
    } catch (err) {
      // DEBUG: Cek di log hosting/Vercel kenapa gagal (expired atau invalid secret)
      console.error("JWT Verification Failed:", err);

      // Gagal verifikasi -> Hapus cookie dan balik ke login
      const response = NextResponse.redirect(new URL("/auth/login", req.url));
      response.cookies.delete("accessToken"); 
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Matcher yang lebih aman untuk mengabaikan file statis & folder public
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*).*)",
  ],
};
