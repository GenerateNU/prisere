"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, updateNotificationStatus, markAllNotificationsAsRead } from "@/api/notifications";
import { useState } from "react";
import type { DisasterNotificationType } from "../../../backend/src/types/DisasterNotification";
import Link from "next/link";
type NotificationStatus = "unread" | "read";
type SortOption = "most-recent" | "oldest-first";

export default function NotificationsPage({ userId }: { userId: string }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | "all">("all");
  const [sortOption, setSortOption] = useState<SortOption>("most-recent");
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showSortFilter, setShowSortFilter] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  const queryClient = useQueryClient();

  const { data, isPending, error } = useQuery({
    queryKey: ["notifications", userId, { 
      page: currentPage, 
      limit: itemsPerPage,
      status: statusFilter !== "all" ? statusFilter : undefined 
    }],
    queryFn: () => getNotifications(userId, { 
      page: currentPage, 
      limit: itemsPerPage,
      status: statusFilter !== "all" ? statusFilter : undefined,
    }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ notificationId, status }: { notificationId: string; status: NotificationStatus }) =>
      updateNotificationStatus(notificationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
    onError: (error) => {
      console.error("Failed to update notification status:", error);
    },
  });

  const handleStatusChange = (notificationId: string, newStatus: NotificationStatus) => {
    updateStatusMutation.mutate({ notificationId, status: newStatus });
    setOpenDropdown(null);
  };

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "unread":
        return "bg-blue-100 text-blue-800";
      case "read":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Client-side sorting (since backend returns paginated data)
  const sortedData = data?.sort((a, b) => {
    // First, sort by createdAt date
    const createdAtA = new Date(a.createdAt || 0).getTime();
    const createdAtB = new Date(b.createdAt || 0).getTime();
    
    const createdAtComparison = sortOption === "most-recent" ? createdAtB - createdAtA : createdAtA - createdAtB;
    
    // Break ties sorting with declarationDate
    if (createdAtComparison === 0) {
        const dateA = new Date(a.femaDisaster?.declarationDate || 0).getTime();
        const dateB = new Date(b.femaDisaster?.declarationDate || 0).getTime();
        return sortOption === "most-recent" ? dateB - dateA : dateA - dateB;
    }
    
    return createdAtComparison;
    });

  // Pagination handlers
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  // Reset to page 1 when filter changes
  const handleStatusFilterChange = (status: NotificationStatus | "all") => {
    setStatusFilter(status);
    setCurrentPage(1);
    setShowStatusFilter(false);
  };

  // View extra details handlers
  const handleViewDetails = (notification: any) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedNotification(null);
    };

// Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(userId),
    onSuccess: (result) => {
        // Refetch notifications to show updated status
        queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
        console.log(`Marked ${result.updatedCount} notifications as read`);
    },
    onError: (error) => {
        console.error("Failed to mark all as read:", error);
    },
});
const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
    setOpenDropdown(null);
  };

  if (isPending) return <div className="p-8">Loading notifications...</div>;
  if (error) return <div className="p-8">Error loading notifications</div>;

  const hasNextPage = data && data.length === itemsPerPage;
  const hasPreviousPage = currentPage > 1;

  

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="mt-3 flex gap-2">
              <Link
                href="/"
                className="text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                Prisere Home 🪷
              </Link>
            </div>
        <h1 className="text-2xl font-bold mb-4">Disaster Notifications</h1>
        
        {/* Filter Controls */}
        <div className="flex gap-4 items-center">
          {/* Status Filter Dropdown */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mr-2">
              Filter by Status:
            </label>
            <button
              onClick={() => {
                setShowStatusFilter(!showStatusFilter);
                setShowSortFilter(false);
              }}
              className="px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-50 text-sm font-medium"
            >
              {statusFilter === "all" ? "All Statuses" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              <span className="ml-2">▼</span>
            </button>

            {showStatusFilter && (
              <div className="absolute left-0 mt-1 w-48 bg-white border rounded shadow-lg z-20">
                <button
                  onClick={() => handleStatusFilterChange("all")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    statusFilter === "all" ? "bg-gray-100 font-semibold" : ""
                  }`}
                >
                  All Statuses
                </button>
                <button
                  onClick={() => handleStatusFilterChange("unread")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-800 ${
                    statusFilter === "unread" ? "bg-blue-100 font-semibold" : ""
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => handleStatusFilterChange("read")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-800 ${
                    statusFilter === "read" ? "bg-gray-100 font-semibold" : ""
                  }`}
                >
                  Read
                </button>
                
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mr-2">
              Sort by:
            </label>
            <button
              onClick={() => {
                setShowSortFilter(!showSortFilter);
                setShowStatusFilter(false);
              }}
              className="px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-50 text-sm font-medium"
            >
              {sortOption === "most-recent" ? "Most Recent" : "Oldest First"}
              <span className="ml-2">▼</span>
            </button>

            {showSortFilter && (
              <div className="absolute left-0 mt-1 w-48 bg-white border rounded shadow-lg z-20">
                <button
                  onClick={() => {
                    setSortOption("most-recent");
                    setShowSortFilter(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    sortOption === "most-recent" ? "bg-gray-100 font-semibold" : ""
                  }`}
                >
                  Most Recent
                </button>
                <button
                  onClick={() => {
                    setSortOption("oldest-first");
                    setShowSortFilter(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    sortOption === "oldest-first" ? "bg-gray-100 font-semibold" : ""
                  }`}
                >
                  Oldest First
                </button>
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="ml-auto text-sm text-gray-600">
            Page {currentPage} • Showing {sortedData?.length || 0} notification(s)
            <button className="px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-50 text-sm font-medium"
                onClick={() => {
                    handleMarkAllAsRead();
                }}>
                Mark all as read
                
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedData?.map((notification: DisasterNotificationType) => (
          <div
            key={notification.id}
            className="p-4 bg-white border rounded shadow hover:shadow-md transition"
          >
            {/* Disaster Info */}
            <div className="flex justify-between items-start mb-3">
              <div>
                
                <p className="text-sm text-gray-600">
                  Disaster #{notification.femaDisaster?.disasterNumber}
                </p>
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === notification.id ? null : notification.id
                    )
                  }
                  disabled={updateStatusMutation.isPending}
                  className={`px-3 py-1 text-xs rounded font-medium cursor-pointer hover:opacity-80 transition ${getStatusStyle(
                    notification.notificationStatus
                  )} ${updateStatusMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {notification.notificationStatus || "unread"}
                  <span className="ml-1">▼</span>
                </button>

                {openDropdown === notification.id && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border rounded shadow-lg z-10">
                    <button
                      onClick={() => handleStatusChange(notification.id, "unread")}
                      disabled={updateStatusMutation.isPending}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-800 disabled:opacity-50"
                    >
                      Unread
                    </button>
                    <button
                      onClick={() => handleStatusChange(notification.id, "read")}
                      disabled={updateStatusMutation.isPending}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-800 disabled:opacity-50"
                    >
                      Read
                    </button>
                    
                  </div>
                )}
              </div>
            </div>

            {/* Affected Location */}
            {notification.locationAddress && (
              <div className="mb-3 p-3 bg-gray-50 rounded">
                <p className="font-semibold text-sm text-gray-700 mb-1">
                  Affected Business Location:
                </p>
                <p className="text-sm">
                  {notification.locationAddress.streetAddress}
                </p>
                <p className="text-sm">
                  {notification.locationAddress.city},{" "}
                  {notification.locationAddress.stateProvince}{" "}
                  {notification.locationAddress.postalCode}
                </p>
                {notification.locationAddress.company && (
                  <p className="text-sm text-gray-600 mt-1">
                    Company: {notification.locationAddress.company.name}
                  </p>
                )}
              </div>
            )}

            {/* Disaster Details */}
            <div className="text-sm text-gray-700">
              <p>
                <span className="font-medium">FEMA Area:</span>{" "}
                {notification.femaDisaster?.designatedArea}
              </p>
              <p>
                <span className="font-medium">Declared:</span>{" "}
                {notification.femaDisaster?.declarationDate
                  ? new Date(
                      notification.femaDisaster.declarationDate
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button onClick={() => handleViewDetails(notification)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                View Details
              </button>
            </div>
          </div>
        ))}

        {/* Details Modal */}
        {showDetailsModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Notification Details</h2>
                <button
                onClick={closeDetailsModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
                >
                ×
                </button>
            </div>
            
            <div className="space-y-4">
                {/* Disaster Information */}
                <div>
                <h3 className="font-semibold text-lg text-red-600 mb-2">
                    {selectedNotification.femaDisaster?.incidentType}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                    <span className="font-medium">Disaster Number:</span>
                    <p>{selectedNotification.femaDisaster?.disasterNumber}</p>
                    </div>
                    <div>
                    <span className="font-medium">Declaration Date:</span>
                    <p>
                        {selectedNotification.femaDisaster?.declarationDate
                        ? new Date(selectedNotification.femaDisaster.declarationDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p>
                        Declaration Type: {selectedNotification.femaDisaster?.declarationType}
                    </p>
                    <h3>
                    Designated Incident Types: {selectedNotification.femaDisaster?.designatedIncidentTypes}
                    </h3>
                    <h3>
                    FIPS state and country code: {selectedNotification.femaDisaster?.fipsStateCode} {selectedNotification.femaDisaster?.fipsCountyCode}
                    </h3>
                    <h3>Designated Area: {selectedNotification.femaDisaster?.designatedArea}</h3>
                    <h3>Declaration Date: {selectedNotification.femaDisaster?.declarationDate
                    ? new Date(selectedNotification.femaDisaster.declarationDate).toLocaleDateString()
                    : "N/A"}</h3>
                    </div>
                    <div>
                    <span className="font-medium">FEMA Area:</span>
                    <p>{selectedNotification.femaDisaster?.designatedArea}</p>
                    </div>
                    <div>
                    <span className="font-medium">Status:</span>
                    <p>{selectedNotification.notificationStatus || "unread"}</p>
                    </div>
                </div>
                </div>

                {/* Location Details */}
                {selectedNotification.locationAddress && (
                <div>
                    <h4 className="font-semibold mb-2">Affected Location</h4>
                    <div className="bg-gray-50 p-3 rounded">
                    <p>{selectedNotification.locationAddress.streetAddress}</p>
                    <p>
                        {selectedNotification.locationAddress.city}, {selectedNotification.locationAddress.stateProvince} {selectedNotification.locationAddress.postalCode}
                    </p>
                    {selectedNotification.locationAddress.company && (
                        <p className="mt-2">
                        <span className="font-medium">Company:</span> {selectedNotification.locationAddress.company.name}
                        </p>
                    )}
                    </div>
                </div>
                )}

                {/* Additional details */}
                <div>
                <h4 className="font-semibold mb-2">Notification Details</h4>
                <div className="text-sm space-y-1">
                    <p>
                    <span className="font-medium">ID:</span> {selectedNotification.id}
                    </p>
                    <p>
                    <span className="font-medium">Created:</span>{" "}
                    {selectedNotification.createdAt
                        ? new Date(selectedNotification.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                Close
                </button>
            </div>
            </div>
        </div>
        )}

        {/* Empty state */}
        {sortedData?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No notifications found.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mt-8 flex items-center justify-between border-t pt-4">
        <div className="text-sm text-gray-600">
          Page {currentPage}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage || isPending}
            className="px-4 py-2 bg-white border rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          <button
            onClick={handleNextPage}
            disabled={!hasNextPage || isPending}
            className="px-4 py-2 bg-white border rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(openDropdown || showStatusFilter || showSortFilter) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setOpenDropdown(null);
            setShowStatusFilter(false);
            setShowSortFilter(false);
          }}
        />
      )}
    </div>
  );
}