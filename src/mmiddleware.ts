// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(req: NextRequest) {
//   const url = req.nextUrl;
//   if (url.pathname.startsWith("/pages/")) {
//     return NextResponse.redirect(new URL(url.pathname.replace("/pages", ""), req.url));
//   }

//   return NextResponse.next();
// }

// // // Define las rutas a las que se aplica el middleware
// // export const config = {
// //   matcher: ['/pages/*']  // Esto aplica solo a las rutas que empiezan con '/pages'
// // };
