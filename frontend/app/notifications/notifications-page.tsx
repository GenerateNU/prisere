"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, updateNotificationStatus, markAllNotificationsAsRead } from "@/api/notifications";
import { useState } from "react";
import type { DisasterNotificationWithRealtionsType } from "../../../backend/src/types/DisasterNotification";
import Link from "next/link";
import { PaginationStatus } from "@/types/notifications";

type NotificationStatus = "unread" | "read";
type SortOption = "most-recent" | "oldest-first";

export default function NotificationsPage({ userId }: { userId: string }) {
  // State management
  const [filters, setFilters] = useState({
    status: "all" as NotificationStatus | "all",
    sort: "most-recent" as SortOption,
  });

  const [dropdowns, setDropdowns] = useState({
    openDropdown: null as string | null,
    showStatusFilter: false,
    showSortFilter: false,
  });

  const [pagination, setPagination] = useState<PaginationStatus>({
    currentPage: 1,
    itemsPerPage: 15
  });

  const [modal, setModal] = useState({
    selectedNotification: null as DisasterNotificationWithRealtionsType | null,
    showDetails: false,
  });

  const queryClient = useQueryClient();

  // Queries and mutations
  const { data, isPending, error } = useQuery({
    queryKey: ["notifications", userId, { 
      page: pagination.currentPage, 
      limit: pagination.itemsPerPage,
      status: filters.status !== "all" ? filters.status : undefined 
    }],
    queryFn: () => getNotifications(userId, { 
      page: pagination.currentPage, 
      limit: pagination.itemsPerPage,
      status: filters.status !== "all" ? filters.status : undefined,
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

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(userId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      console.log(`Marked ${result.updatedCount} notifications as read`);
    },
    onError: (error) => {
      console.error("Failed to mark all as read:", error);
    },
  });

  // Helper functions
  const updateFilter = (key: keyof typeof filters, value: NotificationStatus | SortOption) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'status') {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }
  };

  const toggleDropdown = (type: 'status' | 'sort') => {
    setDropdowns(prev => ({
      ...prev,
      showStatusFilter: type === 'status' ? !prev.showStatusFilter : false,
      showSortFilter: type === 'sort' ? !prev.showSortFilter : false,
    }));
  };

  const closeAllDropdowns = () => {
    setDropdowns({
      openDropdown: null,
      showStatusFilter: false,
      showSortFilter: false,
    });
  };

  const openModal = (notification: DisasterNotificationWithRealtionsType) => {
    setModal({
      selectedNotification: notification,
      showDetails: true,
    });
  };

  const closeModal = () => {
    setModal({
      selectedNotification: null,
      showDetails: false,
    });
  };

  // Event handlers
  const handleStatusChange = (notificationId: string, newStatus: NotificationStatus) => {
    updateStatusMutation.mutate({ notificationId, status: newStatus });
    setDropdowns(prev => ({ ...prev, openDropdown: null }));
  };

  const handleStatusFilterChange = (status: NotificationStatus | "all") => {
    updateFilter('status', status as NotificationStatus);
    closeAllDropdowns();
  };

  const handleSortChange = (sort: SortOption) => {
    updateFilter('sort', sort);
    closeAllDropdowns();
  };

  const handleViewDetails = (notification: DisasterNotificationWithRealtionsType) => {
    openModal(notification);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
    closeAllDropdowns();
  };

  const handleNextPage = () => {
    setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
  };

  const handlePreviousPage = () => {
    setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
  };

  const handleClickOutside = () => {
    closeAllDropdowns();
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

  const sortedData = data?.sort((a: { createdAt: Date; femaDisaster: { declarationDate: Date; }; }, b: { createdAt: Date; femaDisaster: { declarationDate: Date; }; }) => {
    const createdAtA = new Date(a.createdAt || 0).getTime();
    const createdAtB = new Date(b.createdAt || 0).getTime();
    
    const createdAtComparison = filters.sort === "most-recent" ? createdAtB - createdAtA : createdAtA - createdAtB;
    
    if (createdAtComparison === 0) {
      const dateA = new Date(a.femaDisaster?.declarationDate || 0).getTime();
      const dateB = new Date(b.femaDisaster?.declarationDate || 0).getTime();
      return filters.sort === "most-recent" ? dateB - dateA : dateA - dateB;
    }
    
    return createdAtComparison;
  });

  if (isPending) return <div className="p-8">Loading notifications...</div>;
  if (error) return <div className="p-8">Error loading notifications</div>;

  const hasNextPage = data && data.length === pagination.itemsPerPage;
  const hasPreviousPage = pagination.currentPage > 1;

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
              onClick={() => toggleDropdown('status')}
              className="px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-50 text-sm font-medium"
            >
              {filters.status === "all" ? "All Statuses" : filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
              <span className="ml-2">▼</span>
            </button>

            {dropdowns.showStatusFilter && (
              <div className="absolute left-0 mt-1 w-48 bg-white border rounded shadow-lg z-20">
                <button
                  onClick={() => handleStatusFilterChange("all")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    filters.status === "all" ? "bg-gray-100 font-semibold" : ""
                  }`}
                >
                  All Statuses
                </button>
                <button
                  onClick={() => handleStatusFilterChange("unread")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-800 ${
                    filters.status === "unread" ? "bg-blue-100 font-semibold" : ""
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => handleStatusFilterChange("read")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-800 ${
                    filters.status === "read" ? "bg-gray-100 font-semibold" : ""
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
              onClick={() => toggleDropdown('sort')}
              className="px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-50 text-sm font-medium"
            >
              {filters.sort === "most-recent" ? "Most Recent" : "Oldest First"}
              <span className="ml-2">▼</span>
            </button>

            {dropdowns.showSortFilter && (
              <div className="absolute left-0 mt-1 w-48 bg-white border rounded shadow-lg z-20">
                <button
                  onClick={() => handleSortChange("most-recent")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    filters.sort === "most-recent" ? "bg-gray-100 font-semibold" : ""
                  }`}
                >
                  Most Recent
                </button>
                <button
                  onClick={() => handleSortChange("oldest-first")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    filters.sort === "oldest-first" ? "bg-gray-100 font-semibold" : ""
                  }`}
                >
                  Oldest First
                </button>
              </div>
            )}
          </div>

          {/* Results count and Mark All as Read */}
          <div className="ml-auto flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} • Showing {sortedData?.length || 0} notification(s)
            </div>
            <button 
              className="px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-50 text-sm font-medium"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              {markAllAsReadMutation.isPending ? "Marking..." : "Mark all as read"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedData?.map((notification: DisasterNotificationWithRealtionsType) => (
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
                    setDropdowns(prev => ({
                      ...prev,
                      openDropdown: prev.openDropdown === notification.id ? null : notification.id
                    }))
                  }
                  disabled={updateStatusMutation.isPending}
                  className={`px-3 py-1 text-xs rounded font-medium cursor-pointer hover:opacity-80 transition ${getStatusStyle(
                    notification.notificationStatus
                  )} ${updateStatusMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {notification.notificationStatus || "unread"}
                  <span className="ml-1">▼</span>
                </button>

                {dropdowns.openDropdown === notification.id && (
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
              <button 
                onClick={() => handleViewDetails(notification)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                View Details
              </button>
            </div>
          </div>
        ))}

        {/* Details Modal */}
        {modal.showDetails && modal.selectedNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Notification Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Disaster Information */}
                <div>
                  <h3 className="font-semibold text-lg text-red-600 mb-2">
                    {modal.selectedNotification.femaDisaster?.incidentType}
                  </h3>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Disaster Number:</span>
                      <p>{modal.selectedNotification.femaDisaster?.disasterNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium">Declaration Date:</span>
                      <p>
                        {modal.selectedNotification.femaDisaster?.declarationDate
                          ? new Date(modal.selectedNotification.femaDisaster.declarationDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Declaration Type:</span>
                      <p>{modal.selectedNotification.femaDisaster?.declarationType}</p>
                    </div>
                    <div>
                      <span className="font-medium">Designated Incident Types:</span>
                      <p>{modal.selectedNotification.femaDisaster?.designatedIncidentTypes}</p>
                    </div>
                    <div>
                      <span className="font-medium">FIPS State/County Code:</span>
                      <p>{modal.selectedNotification.femaDisaster?.fipsStateCode} {modal.selectedNotification.femaDisaster?.fipsCountyCode}</p>
                    </div>
                    <div>
                      <span className="font-medium">Designated Area:</span>
                      <p>{modal.selectedNotification.femaDisaster?.designatedArea}</p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <p>{modal.selectedNotification.notificationStatus || "unread"}</p>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                {modal.selectedNotification.locationAddress && (
                  <div>
                    <h4 className="font-semibold mb-2">Affected Location</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      <p>{modal.selectedNotification.locationAddress.streetAddress}</p>
                      <p>
                        {modal.selectedNotification.locationAddress.city}, {modal.selectedNotification.locationAddress.stateProvince} {modal.selectedNotification.locationAddress.postalCode}
                      </p>
                      {modal.selectedNotification.locationAddress.company && (
                        <p className="mt-2">
                          <span className="font-medium">Company:</span> {modal.selectedNotification.locationAddress.company.name}
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
                      <span className="font-medium">ID:</span> {modal.selectedNotification.id}
                    </p>
                    <p>
                      <span className="font-medium">Created:</span>{" "}
                      {modal.selectedNotification.createdAt
                        ? new Date(modal.selectedNotification.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
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
          Page {pagination.currentPage}
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
      {(dropdowns.openDropdown || dropdowns.showStatusFilter || dropdowns.showSortFilter) && (
        <div
          className="fixed inset-0 z-0"
          onClick={handleClickOutside}
        />
      )}
    </div>
  );
}