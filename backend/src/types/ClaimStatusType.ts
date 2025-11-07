export enum ClaimStatusType {
    ACTIVE = "ACTIVE",
    FILED = "FILED",
    IN_PROGRESS_DISASTER = "IN_PROGRESS_DISASTER",
    IN_PROGRESS_PERSONAL = "IN_PROGRESS_PERSONAL",
    IN_PROGRESS_BUSINESS = "IN_PROGRESS_BUSINESS",
    IN_PROGRESS_INSURANCE = "IN_PROGRESS_INSURANCE",
    IN_PROGRESS_EXPORT = "IN_PROGRESS_EXPORT",
}

export const ClaimStatusInProgressTypes = Object.values(ClaimStatusType).filter((status) =>
    status.startsWith("IN_PROGRESS_")
) as ClaimStatusType[];
