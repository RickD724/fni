import { NextRequest, NextResponse } from "next/server";

// Real protection for /admin using HTTP Basic Auth at the Edge.
// Configure in Vercel Environment Variables:
//   ADMIN_USER
//   ADMIN_PASS
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  // Secure-by-default: if not configured, block.
  if (!user || !pass) {
    return new NextResponse(
      "Admin auth not configured. Set ADMIN_USER and ADMIN_PASS in Vercel env vars.",
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) return unauthorized();

  const base64 = authHeader.replace("Basic ", "");
  let decoded = "";
  try {
    decoded = atob(base64);
  } catch {
    return unauthorized();
  }

  const [u, p] = decoded.split(":");
  if (u === user && p === pass) return NextResponse.next();

  return unauthorized();
}

function unauthorized() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
