// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";

// export async function middleware(req) {
//   const authCheckUrl = new URL("/api/auth/validateSession", req.url);

//   const authResponse = await fetch(authCheckUrl, {
//     headers: {
//       cookie: (await cookies()).toString(),
//     },
//     cache: "force-cache",
//     next: { tags: ["auth-session"] },
//   });

//   const { authorized } = await authResponse.json();

//   if (!authorized) {
//     return NextResponse.redirect(new URL("/signin", req.nextUrl.origin));

//     return NextResponse.next();
//   }
// }

// export const config = {
//   matcher: ["/dashboard/:path*"],
// };

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/serverMethods/session/sessionMethods"; // function côté serveur

export async function middleware(req) {
  // Vérifie la session directement côté serveur
  const cookieHeader = (await cookies()).toString();
  const { authorized } = await validateSession(cookieHeader); // n’appelle pas /api

  if (!authorized) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
