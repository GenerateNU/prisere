import { paths } from "@/schema";

export type CreateClaimRequest = NonNullable<paths["/claims"]["post"]["requestBody"]>["content"]["application/json"];
export type CreateClaimResponse = paths["/claims"]["post"]["responses"][201]["content"]["application/json"];
export type GetCompanyClaimResponse = paths["/claims/company"]["get"]["responses"][200]["content"]["application/json"];
export type GetClaimLineItemsResponse =
    paths["/claims/{id}/line-item"]["get"]["responses"][200]["content"]["application/json"];
export type GetCompanyClaimRequest = paths["/claims/company"]["get"]["parameters"]["query"];
export type GetClaimLineItemsRequest = paths["/claims/{id}/line-item"]["get"]["parameters"]["query"];

export type ClaimStatusType =
    paths["/claims/{id}/status"]["patch"]["responses"][200]["content"]["application/json"]["status"];

export const ClaimInProgressIndexMapping = {
    IN_PROGRESS_DISASTER: 1,
    IN_PROGRESS_PERSONAL: 2,
    IN_PROGRESS_BUSINESS: 3,
    IN_PROGRESS_INSURANCE: 4,
    IN_PROGRESS_EXPORT: 5,
} as const satisfies Partial<Record<ClaimStatusType, number>>;

export type GetClaimByIdResponse = paths["/claims/{id}"]["get"]["responses"][200]["content"]["application/json"];
export type UpdateClaimStatusRequest = NonNullable<
    paths["/claims/{id}/status"]["patch"]["requestBody"]
>["content"]["application/json"];
export type UpdateClaimStatusResponse =
    paths["/claims/{id}/status"]["patch"]["responses"][200]["content"]["application/json"];

/**
 * Save status for indicating to user
 */
export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Disaster info for step 0
 */
export interface DisasterInfo {
    name: string;
    startDate: Date | null;
    endDate: Date | null;
    location: string; // locationId
    description: string;
}

/**
 * Personal info for step 1
 */
export interface PersonalInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

/**
 * Business info for step 2
 */
export interface BusinessInfo {
    businessName: string;
    businessOwner: string;
    businessType: string;
}

/**
 * Insurer info for step 3
 */
export interface InsurerInfo {
    name: string;
}

const MIN_STEP = -2;
const MAX_STEP = 5;

/**
 * Map of claim step numbers to their corresponding data types
 */
export interface ClaimStepDataMap {
    [MIN_STEP]: null;
    [-1]: null;
    0: { disasterInfo: Partial<DisasterInfo> };
    1: { personalInfo: Partial<PersonalInfo> };
    2: { businessInfo: Partial<BusinessInfo> };
    3: { insurerInfo: Partial<InsurerInfo> };
    4: null;
    [MAX_STEP]: null;
}

/**
 * Valid step numbers
 */
export type ClaimStepNumber = keyof ClaimStepDataMap;

export function decrementStep(step: ClaimStepNumber): ClaimStepNumber {
    if (step > MIN_STEP) {
        return (step - 1) as ClaimStepNumber;
    }

    return step;
}
export function incrementStep(step: ClaimStepNumber): ClaimStepNumber {
    if (step < MAX_STEP) {
        return (step + 1) as ClaimStepNumber;
    }

    return step;
}

export function isStep<T extends ClaimStepNumber, U extends ClaimStepNumber>(step: T, target: U): boolean;
export function isStep<T extends ClaimStepNumber, U extends ClaimStepNumber>(
    step: T,
    target: U,
    _data: AnyClaimStepData
): _data is ClaimStepData<U>;
export function isStep<T extends ClaimStepNumber, U extends ClaimStepNumber>(
    step: T,
    target: U,
    _data?: AnyClaimStepData
): _data is ClaimStepData<U> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return step === (target as any);
}

/**
 * Get the data type for a specific step
 */
export type ClaimStepData<T extends ClaimStepNumber> = ClaimStepDataMap[T];

/**
 * Union of all possible step data types
 */
export type AnyClaimStepData = ClaimStepDataMap[ClaimStepNumber];
