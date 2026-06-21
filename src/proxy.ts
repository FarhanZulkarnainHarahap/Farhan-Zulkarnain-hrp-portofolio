import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/auth")) {
    if (accessToken) {
      return NextResponse.redirect(new URL("/admin/home", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("Proxy Error: JWT_SECRET is not defined in environment variables");
      return new NextResponse("Server Configuration Error", { status: 500 });
    }

    try {
      const { payload } = await jwtVerify(accessToken, new TextEncoder().encode(secret));

      if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
        return new NextResponse("Forbidden: Admin Only", { status: 403 });
      }

      return NextResponse.next();
    } catch (err) {
      console.error("JWT Verification Failed:", err);

      const response = NextResponse.redirect(new URL("/auth/login", req.url));
      response.cookies.delete("accessToken");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*).*)"],
};
