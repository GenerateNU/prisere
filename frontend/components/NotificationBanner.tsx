"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/api/notifications";
import { useState } from "react";
import Link from "next/link";

export default function NotificationBanner({ userId }: { userId: string }) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Fetch only unread notifications, limit to 1 (most recent)
  const { data, isPending } = useQuery({
    queryKey: ["banner-notification", userId],
    queryFn: () => getNotifications(userId, { 
      type: "web",
      page: 1, 
      limit: 1,
      status: "unread" // Only get unread notifications
    }),
    // Refetch every 24 hours to catch new disasters
    refetchInterval: 24 * 60 * 60 * 1000,
  });

  // Don't show banner if loading, no data, dismissed, or no unread notifications
  if (isPending || !data || data.length === 0 || isDismissed) {
    return null;
  }

  const notification = data[0]; // Most recent unread notification

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 shadow-md">
      <div className="flex items-start justify-between max-w-7xl mx-auto">
        <div className="flex items-start gap-3 flex-1">
          {/* Alert Icon */}
          <div className="flex-shrink-0">
            <svg 
              className="h-6 w-6 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">
              🚨 Disaster Alert: {notification.femaDisaster?.incidentType || "Disaster"} Declared
            </h3>
            <div className="mt-1 text-sm text-red-700">
              <p>
                <span className="font-medium">Location:</span> {notification.femaDisaster?.designatedArea || "Unknown"}
              </p>
              {notification.locationAddress && (
                <p className="mt-1">
                  <span className="font-medium">Your affected location:</span>{" "}
                  {notification.locationAddress.city}, {notification.locationAddress.stateProvince}
                </p>
              )}
              <p className="mt-1 text-xs text-red-600">
                Declared: {notification.femaDisaster?.declarationDate 
                  ? new Date(notification.femaDisaster.declarationDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-3 flex gap-2">
              <Link
                href="/notifications"
                className="text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                View All Notifications →
              </Link>
            </div>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="flex-shrink-0 ml-4 text-red-500 hover:text-red-700 transition"
          aria-label="Dismiss notification"
        >
          <svg 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}