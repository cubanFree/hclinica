import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function requireUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    return session.user;
}