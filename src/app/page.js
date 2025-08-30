// src/app/page.tsx
import { requireUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
// requireUser: tu helper que devuelve user o null si no hay sesión

export default async function Home() {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  redirect("/dashboard");
}
