import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import Credentials from "next-auth/providers/credentials";

const prisma = new PrismaClient();

export const authOptions = {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (creds) => {
                if (!creds?.email || !creds?.password) return null;
                const user = await prisma.doctor.findUnique({ where: { email: creds.email } });
                if (!user) return null;
                const ok = await compare(creds.password, user.password);
                if (!ok) return null;
                return { id: user.id, email: user.email, name: user.name };
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
    trustHost: true,
    callbacks: {
        async jwt({ token, user }) {
            // cuando el usuario se loguea, agrega el id al token
            if (user) token.id = user.id;
            return token;
        },
        async session({ session, token }) {
            // pasa el id del token a la sesión
            if (session.user) {
                session.user.id = token.id;
            }
            return session;
        },
    },
};