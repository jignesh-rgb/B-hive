import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";

export async function requireAdmin() {
  const session = await getServerSession(authOptions as any);

  if (!session) {
    redirect("/login");
  }

  if ((session as any)?.user?.role !== "admin") {
    redirect("/");
  }

  return session;
}

