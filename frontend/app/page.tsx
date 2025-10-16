import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import NotificationBanner from "../components/NotificationBanner";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      {/* Notification Banner */}
      <NotificationBanner userId={user.id} />

      {/* Main Content */}
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 text-3xl">
        <label> Welcome to Prisere 🪷 </label>
      </div>
    </div>
  );
}
