import { getCurrentUser } from "@/actions/auth";
import NotificationsPage from "./notifications-page";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <NotificationsPage userId={user.id} />;
}