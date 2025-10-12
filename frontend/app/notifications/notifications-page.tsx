"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/api/notifications";

export default function NotificationsPage({ userId }: { userId: string }) {
  const { data, isPending, error } = useQuery({
    queryKey: ["notifications", userId, { page: 1, limit: 20 }],
    queryFn: () => getNotifications(userId, { 
      page: 1, 
      limit: 20,
      // type: "web" // optional filter
    }),
  });

  if (isPending) return <div>Loading notifications...</div>;
  
  if (error) return <div>Error loading notification</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="space-y-4">
        {data?.map((notification) => (
          <div key={notification.id} className="p-4 bg-white border rounded">
            <p>{notification.femaDisasterId}</p>
            <p className="text-sm text-gray-500">
              {notification.notificationStatus}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}