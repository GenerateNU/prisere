import { redirect } from "next/navigation";
import NotificationBanner from "../components/NotificationBanner";

export default async function Home() {


  return (
    <div className="min-h-screen">
      {/* Notification Banner */}
      {/* <NotificationBanner /> */}

      {/* Main Content */}
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 text-3xl">
        <label> Welcome to Prisere 🪷 </label>
      </div>
    </div>
  );
}
