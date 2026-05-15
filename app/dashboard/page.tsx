import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/enums";
import { AppUser } from "@/types/types.d";
import UserDashboard from "./_components/UserDashboard";
import AdminDashboard from "./_components/AdminDashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as AppUser | null;

  if (!user) redirect("/login");

  if (user.role_id === UserRole.ADMIN) {
    return <AdminDashboard user={user} />;
  }

  return <UserDashboard user={user} />;
}
