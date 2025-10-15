import { getCurrentUser } from "@/actions/auth";
import NotificationsPage from "./notifications-page";

export default async function Page() {
  const user = await getCurrentUser();

  // Middleware would redirect to /login page
  if (!user) {
    throw new Error("User not found");
  }

  return <NotificationsPage userId={user.id} />;
}