// middleware.js
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl

        // Si está en "/" redirigir a "/login"
        if (pathname === "/") {
            return NextResponse.redirect(new URL("/login", req.url))
        }

        // Con `withAuth`, si no hay token, automáticamente redirige al signin de NextAuth
        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token, // True si hay sesión
        },
    }
)

// Rutas donde aplica el middleware
export const config = {
    matcher: ["/dashboard/:path*", "/"], // aplica a /dashboard y subrutas + "/"
}
