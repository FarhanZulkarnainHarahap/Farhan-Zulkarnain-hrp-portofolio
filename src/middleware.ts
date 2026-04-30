import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const { pathname } = req.nextUrl;

  // 1. Daftar Halaman Publik (Bisa diakses tanpa login)
  const publicUserPaths = [
    "/dashboard/user/product",
    "/dashboard/user/product-store",
    "/dashboard/user/best-deals",
    "/dashboard/user/contact-us",
    "/dashboard/user/about",
  ];

  // 2. Cek apakah path saat ini termasuk halaman publik
  const isPublicPath = publicUserPaths.some((path) => pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 3. Bypass untuk halaman Auth agar tidak looping
  if (pathname.startsWith("/auth")) {
    // Jika sudah login tapi mau ke /auth/login, lempar ke dashboard
    if (accessToken) return NextResponse.redirect(new URL("/admin/home", req.url));
    return NextResponse.next();
  }

  // 4. Proteksi: Jika TIDAK ada token
  if (!accessToken) {
    // Semua yang mencoba akses checkout atau area dashboard/admin lainnya wajib login
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  // 5. Verifikasi Token & Role (Untuk halaman terproteksi)
  const secret = process.env.JWT_SECRET;
  if (!secret) return new NextResponse("Secret Code missing", { status: 500 });

  try {
    const verified = await jwtVerify(accessToken, new TextEncoder().encode(secret));
    const role = (verified.payload as { role: string }).role;

    // Logika Role-Based Access Control (RBAC)
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return new NextResponse("Forbidden: Admin Only", { status: 403 });
    }

    if (pathname.startsWith("/dashboard/user/checkout") && !role) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    // Jika token tidak valid/expired, hapus cookie dan arahkan ke login
    const response = NextResponse.redirect(new URL("/auth/login", req.url));
    response.cookies.delete("accessToken");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
