"use client";

import {
    createClaim,
    getClaimById,
    getPurchaseLineItemsFromClaim,
    linkLineItemToClaim,
    linkPurchaseToClaim,
    updateClaimStatus,
    uploadAndConfirmDocumentRelation,
} from "@/api/claim";
import { createClaimLocationLink } from "@/api/claim-location";
import { fetchPurchases } from "@/api/purchase";
import { createSelfDisaster, updateSelfDisaster } from "@/api/self-disaster";
import { getUser, updateUserInfo } from "@/api/user";
import {
    BusinessInfo,
    CLAIM_STEPS,
    ClaimStatusType,
    ClaimStepData,
    ClaimStepNumber,
    DisasterInfo,
    incrementStep,
    InsurerInfo,
    isStep,
    PersonalInfo,
    PurchaseSelections,
    SaveStatus,
    UploadClaimRelatedDocumentsRequest,
} from "@/types/claim";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsNumberLiteral, useQueryState } from "nuqs";
import { useCallback, useEffect, useRef, useState } from "react";
import { cleanExpiredTempData, clearTempData, loadTempData, saveTempData } from "../utils/tempStorage";

interface UseClaimProgressReturn {
    claimId: string | null;
    status: ClaimStatusType | null;
    step: ClaimStepNumber;
    saveStatus: SaveStatus;
    disasterInfo: DisasterInfo;
    personalInfo: PersonalInfo;
    businessInfo: BusinessInfo;
    insurerInfo: InsurerInfo;
    setDisasterInfo: (info: Partial<DisasterInfo>) => void;
    setPersonalInfo: (info: Partial<PersonalInfo>) => void;
    setBusinessInfo: (info: Partial<BusinessInfo>) => void;
    setInsurerInfo: (info: Partial<InsurerInfo>) => void;
    setStep: (step: ClaimStepNumber) => void;
    commitDisasterStep: (data?: Partial<DisasterInfo>) => Promise<void>;
    commitPersonalStep: (data?: Partial<PersonalInfo>) => Promise<void>;
    commitBusinessStep: (data?: Partial<BusinessInfo>) => Promise<void>;
    commitInsurerStep: (data?: Partial<InsurerInfo>) => Promise<void>;
    finalizeClaimSubmission: () => Promise<void>;
    clearClaimDraft: () => void;
}

const DEBOUNCE_DELAY = 500; // ms

async function rehydratePurchaseSelections(
    linkedLineItems: Array<{ id: string; purchaseId: string }>
): Promise<PurchaseSelections> {
    if (linkedLineItems.length === 0) {
        return { fullPurchaseIds: [], partialLineItemIds: [] };
    }

    const lineItemsByPurchase = new Map<string, string[]>();
    for (const item of linkedLineItems) {
        const existing = lineItemsByPurchase.get(item.purchaseId) || [];
        existing.push(item.id);
        lineItemsByPurchase.set(item.purchaseId, existing);
    }

    const purchaseIds = Array.from(lineItemsByPurchase.keys());

    const purchasesResponse = await fetchPurchases({
        pageNumber: 0,
        resultsPerPage: 1000,
    });

    const purchaseToAllLineItems = new Map<string, string[]>();
    for (const purchase of purchasesResponse.purchases) {
        purchaseToAllLineItems.set(
            purchase.id,
            purchase.lineItems.map((li) => li.id)
        );
    }

    const fullPurchaseIds: string[] = [];
    const partialLineItemIds: string[] = [];

    for (const purchaseId of purchaseIds) {
        const selectedLineItemIds = lineItemsByPurchase.get(purchaseId) || [];
        const allLineItemIds = purchaseToAllLineItems.get(purchaseId);

        if (!allLineItemIds || allLineItemIds.length === 0) {
            partialLineItemIds.push(...selectedLineItemIds);
            continue;
        }

        if (
            allLineItemIds.length === selectedLineItemIds.length &&
            allLineItemIds.every((id) => selectedLineItemIds.includes(id))
        ) {
            fullPurchaseIds.push(purchaseId);
        } else {
            partialLineItemIds.push(...selectedLineItemIds);
        }
    }

    return {
        fullPurchaseIds,
        partialLineItemIds,
    };
}

export function useClaimProgress(
    initialDisasterInfo: DisasterInfo,
    initialPersonalInfo: PersonalInfo,
    initialBusinessInfo: BusinessInfo,
    initialInsurerInfo: InsurerInfo
): UseClaimProgressReturn {
    const queryClient = useQueryClient();

    const { data: userInfoData } = useQuery({
        queryKey: ["userInfo"],
        queryFn: getUser,
    });

    // Get claimId and step from URL
    const [claimId, setClaimId] = useQueryState("claimId");
    const [step, setStep] = useQueryState("step", parseAsNumberLiteral(CLAIM_STEPS).withDefault(-2));

    const [status, setStatus] = useState<ClaimStatusType | null>(null);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

    // Form state
    const [disasterInfo, setDisasterInfoState] = useState(initialDisasterInfo);
    const [personalInfo, setPersonalInfoState] = useState(initialPersonalInfo);
    const [businessInfo, setBusinessInfoState] = useState(initialBusinessInfo);
    const [insurerInfo, setInsurerInfoState] = useState(initialInsurerInfo);

    // Refs for debouncing
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const selfDisasterRef = useRef<string | null>(null);

    // Clean expired temp data on mount
    useEffect(() => {
        cleanExpiredTempData();
    }, []);

    // Load existing claim if claimId in URL
    useEffect(() => {
        if (claimId) {
            loadExistingClaim(claimId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [claimId]);

    // Load existing claim from backend
    const loadExistingClaim = async (id: string) => {
        try {
            const claim = await getClaimById(id);
            setClaimId(claim.id);
            setStatus(claim.status);

            if (claim.selfDisaster) {
                selfDisasterRef.current = claim.selfDisaster.id;
            }

            // Fetch linked purchase line items to rehydrate selections
            let purchaseSelections: PurchaseSelections = { fullPurchaseIds: [], partialLineItemIds: [] };
            try {
                const linkedLineItems = await getPurchaseLineItemsFromClaim({ claimId: id });
                if (linkedLineItems && linkedLineItems.length > 0) {
                    purchaseSelections = await rehydratePurchaseSelections(linkedLineItems);
                }
            } catch (error) {
                console.error("Error rehydrating purchase selections:", error);
                // Fallback to using purchaseLineItemIds if rehydration fails
                purchaseSelections = {
                    fullPurchaseIds: [],
                    partialLineItemIds: claim.purchaseLineItemIds ?? [],
                };
            }

            setDisasterInfoState((prev) => {
                const startDate = claim.femaDisaster
                    ? // TODO: [future] move these to the claim entity rather than disaster (self or fema)
                      claim.femaDisaster.incidentBeginDate
                    : claim.selfDisaster?.startDate;

                const endDate = claim.femaDisaster ? claim.femaDisaster.incidentEndDate : claim.selfDisaster?.endDate;

                return {
                    name: claim.name || "",
                    description: claim.selfDisaster?.description || "",
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    location:
                        claim.claimLocations && claim.claimLocations.length > 0
                            ? claim.claimLocations[0].id
                            : prev.location,
                    ...(claim.femaDisaster
                        ? { isFema: true, femaDisasterId: claim.femaDisaster.id }
                        : { isFema: false, femaDisasterId: undefined }),
                    additionalDocuments: [],
                    purchaseSelections,
                };
            });

            // Merge temp data with server data if it exists
            if (step >= 0 && step <= 3) {
                const tempData = loadTempData(id, step);
                if (tempData) {
                    if (isStep(step, 0, tempData)) {
                        // Merge disaster info intelligently
                        setDisasterInfoState((prev) => {
                            const temp = tempData.disasterInfo;
                            const merged: DisasterInfo = { ...prev };

                            // Prefer non-empty temp values for user-editable fields
                            if (temp.name !== undefined && temp.name.trim() !== "") {
                                merged.name = temp.name;
                            }
                            if (temp.description !== undefined && temp.description.trim() !== "") {
                                merged.description = temp.description;
                            }

                            // Dates: prefer temp if provided
                            if (temp.startDate !== undefined) {
                                merged.startDate =
                                    temp.startDate instanceof Date
                                        ? temp.startDate
                                        : temp.startDate
                                          ? new Date(temp.startDate)
                                          : null;
                            }
                            if (temp.endDate !== undefined) {
                                merged.endDate =
                                    temp.endDate instanceof Date
                                        ? temp.endDate
                                        : temp.endDate
                                          ? new Date(temp.endDate)
                                          : null;
                            }

                            // Location: prefer temp if set
                            if (temp.location !== undefined && temp.location !== "") {
                                merged.location = temp.location;
                            }

                            // Purchase selections: merge arrays (union)
                            if (temp.purchaseSelections) {
                                merged.purchaseSelections = {
                                    fullPurchaseIds: Array.from(
                                        new Set([
                                            ...prev.purchaseSelections.fullPurchaseIds,
                                            ...temp.purchaseSelections.fullPurchaseIds,
                                        ])
                                    ),
                                    partialLineItemIds: Array.from(
                                        new Set([
                                            ...prev.purchaseSelections.partialLineItemIds,
                                            ...temp.purchaseSelections.partialLineItemIds,
                                        ])
                                    ),
                                };
                            }

                            return merged;
                        });
                    } else if (isStep(step, 1, tempData)) {
                        // Merge personal info
                        setPersonalInfoState((prev) => {
                            const temp = tempData.personalInfo;
                            return {
                                firstName:
                                    temp.firstName && temp.firstName.trim() !== "" ? temp.firstName : prev.firstName,
                                lastName: temp.lastName && temp.lastName.trim() !== "" ? temp.lastName : prev.lastName,
                                email: temp.email && temp.email.trim() !== "" ? temp.email : prev.email,
                                phone: temp.phone && temp.phone.trim() !== "" ? temp.phone : prev.phone,
                            };
                        });
                    } else if (isStep(step, 2, tempData)) {
                        // Merge business info
                        setBusinessInfoState((prev) => {
                            const temp = tempData.businessInfo;
                            return {
                                businessName:
                                    temp.businessName && temp.businessName.trim() !== ""
                                        ? temp.businessName
                                        : prev.businessName,
                                businessOwner:
                                    temp.businessOwner && temp.businessOwner.trim() !== ""
                                        ? temp.businessOwner
                                        : prev.businessOwner,
                                businessType:
                                    temp.businessType && temp.businessType.trim() !== ""
                                        ? temp.businessType
                                        : prev.businessType,
                            };
                        });
                    } else if (isStep(step, 3, tempData)) {
                        // Merge insurer info
                        setInsurerInfoState((prev) => {
                            const temp = tempData.insurerInfo;
                            return {
                                id: temp.id ? temp.id : prev.id,
                            };
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error loading claim:", error);
            setSaveStatus("error");
        }
    };

    // Debounced save to localStorage
    const debouncedSave = useCallback(
        <T extends ClaimStepNumber>(step: T, data: ClaimStepData<T>) => {
            if (!claimId) return;

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            setSaveStatus("saving");

            debounceTimerRef.current = setTimeout(() => {
                saveTempData(claimId, step, data);
                setSaveStatus("saved");

                // Reset to idle after 2 seconds
                setTimeout(() => {
                    setSaveStatus("idle");
                }, 2000);
            }, DEBOUNCE_DELAY);
        },
        [claimId]
    );

    // Setters with auto-save
    const setDisasterInfo = useCallback(
        (info: Partial<DisasterInfo>) => {
            setDisasterInfoState((prev) => {
                const updated = { ...prev, ...info } as DisasterInfo;
                if (claimId && step === 0) {
                    debouncedSave(step, { disasterInfo: updated });
                }
                return updated;
            });
        },
        [claimId, step, debouncedSave]
    );

    const setPersonalInfo = useCallback(
        (info: Partial<PersonalInfo>) => {
            setPersonalInfoState((prev) => {
                const updated = { ...prev, ...info };
                if (claimId && step === 1) {
                    debouncedSave(step, { personalInfo: updated });
                }
                return updated;
            });
        },
        [claimId, step, debouncedSave]
    );

    const setBusinessInfo = useCallback(
        (info: Partial<BusinessInfo>) => {
            setBusinessInfoState((prev) => {
                const updated = { ...prev, ...info };
                if (claimId && step === 2) {
                    debouncedSave(step, { businessInfo: updated });
                }
                return updated;
            });
        },
        [claimId, step, debouncedSave]
    );

    const setInsurerInfo = useCallback(
        (info: Partial<InsurerInfo>) => {
            setInsurerInfoState((prev) => {
                const updated = { ...prev, ...info };
                if (claimId && step === 3) {
                    debouncedSave(step, { insurerInfo: updated });
                }
                return updated;
            });
        },
        [claimId, step, debouncedSave]
    );

    // Helper to upload additional documents to S3
    const saveAdditionalDocumentsToS3 = async (files: File[], claimId: string) => {
        const transformedPayloads: Omit<UploadClaimRelatedDocumentsRequest, "claimId" | "documentType">[] = files.map(
            (file) => ({ fileName: file.name, fileType: file.type })
        );

        for (let payloadIdx = 0; payloadIdx < transformedPayloads.length; payloadIdx++) {
            const payload = transformedPayloads[payloadIdx];
            await uploadAndConfirmDocumentRelation(claimId, payload, files[payloadIdx]);
        }
    };

    // Commit disaster step (creates SelfDisaster + Claim)
    const commitDisasterStep = async (data?: Partial<DisasterInfo>) => {
        try {
            setSaveStatus("saving");

            // Merge provided data with existing state
            const dataToUse = (data ? { ...disasterInfo, ...data } : disasterInfo) as DisasterInfo;

            let currentClaimId = claimId;

            // Create or update self disaster
            if (selfDisasterRef.current) {
                // Update existing self disaster
                await updateSelfDisaster(selfDisasterRef.current, {
                    // name: dataToUse.name,
                    description: dataToUse.description,
                    startDate: dataToUse.startDate?.toISOString().split("T")[0],
                    endDate: dataToUse.endDate?.toISOString().split("T")[0],
                });

                // Upload additional documents if any
                if (dataToUse.additionalDocuments?.length > 0) {
                    await saveAdditionalDocumentsToS3(dataToUse.additionalDocuments, selfDisasterRef.current);
                }
            } else {
                if (dataToUse.isFema) {
                    const newClaim = await createClaim({
                        femaDisasterId: dataToUse.femaDisasterId,
                        status: "IN_PROGRESS_DISASTER",
                        name: dataToUse.name,
                    });

                    setClaimId(newClaim.id);
                    currentClaimId = newClaim.id;
                    selfDisasterRef.current = null;
                    setStatus(newClaim.status);

                    await createClaimLocationLink({
                        claimId: newClaim.id,
                        locationAddressId: dataToUse.location,
                    });
                } else {
                    const selfDisaster = await createSelfDisaster({
                        // name: dataToUse.name,
                        description: dataToUse.description,
                        startDate:
                            dataToUse.startDate?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
                        endDate: dataToUse.endDate?.toISOString().split("T")[0],
                    });
                    selfDisasterRef.current = selfDisaster.id;

                    const newClaim = await createClaim({
                        selfDisasterId: selfDisaster.id,
                        status: "IN_PROGRESS_DISASTER",
                        name: dataToUse.name,
                    });

                    setClaimId(newClaim.id);
                    currentClaimId = newClaim.id;
                    setStatus(newClaim.status);

                    // Upload additional documents if any
                    if (dataToUse.additionalDocuments?.length > 0) {
                        await saveAdditionalDocumentsToS3(dataToUse.additionalDocuments, selfDisaster.id);
                    }

                    // Link location if provided
                    if (dataToUse.location) {
                        await createClaimLocationLink({
                            claimId: newClaim.id,
                            locationAddressId: dataToUse.location,
                        });
                    }
                }

                // Update URL with new claimId
                setStep(incrementStep(step));
            }

            // Link selected purchases and line items to claim
            if (
                currentClaimId &&
                (dataToUse.purchaseSelections.fullPurchaseIds.length > 0 ||
                    dataToUse.purchaseSelections.partialLineItemIds.length > 0)
            ) {
                const { fullPurchaseIds, partialLineItemIds } = dataToUse.purchaseSelections;

                // Link full purchases
                const purchasePromises = fullPurchaseIds.map((purchaseId) =>
                    linkPurchaseToClaim(currentClaimId!, purchaseId)
                );

                // Link individual line items
                const lineItemPromises = partialLineItemIds
                    .filter((element) => element !== null)
                    .map((lineItemId) => linkLineItemToClaim(currentClaimId!, lineItemId));

                // Execute all API calls in parallel
                await Promise.all([...purchasePromises, ...lineItemPromises]);
            }

            // Update state with committed data
            if (data) {
                setDisasterInfoState((prev) => ({ ...prev, ...data }) as DisasterInfo);
            }

            // Clear temp data for this step
            if (currentClaimId) {
                clearTempData(currentClaimId);
            }

            // Update claim status to next step
            if (currentClaimId) {
                await updateClaimStatus(currentClaimId, {
                    status: "IN_PROGRESS_PERSONAL",
                });
                setStatus("IN_PROGRESS_PERSONAL");
            }

            setSaveStatus("saved");
        } catch (error) {
            console.error("Error committing disaster step:", error);
            setSaveStatus("error");
            throw error;
        }
    };

    // Commit personal step
    const commitPersonalStep = async (data?: Partial<PersonalInfo>) => {
        try {
            if (!claimId) return;

            setSaveStatus("saving");

            // Update state with committed data if provided
            if (data) {
                setPersonalInfoState((prev) => ({ ...prev, ...data }));
            }

            await updateUserInfo({
                email: personalInfo.email,
                firstName: personalInfo.firstName,
                lastName: personalInfo.lastName,
                phoneNumber: personalInfo.phone,
                id: userInfoData?.id ?? "",
            });

            await queryClient.invalidateQueries({ queryKey: ["userInfo"] });

            // Personal info comes from User entity, no backend update needed for this step
            // Just update claim status
            await updateClaimStatus(claimId, {
                status: "IN_PROGRESS_BUSINESS",
            });
            setStatus("IN_PROGRESS_BUSINESS");

            // Clear temp data
            clearTempData(claimId);

            setSaveStatus("saved");
        } catch (error) {
            console.error("Error committing personal step:", error);
            setSaveStatus("error");
            throw error;
        }
    };

    // Commit business step
    const commitBusinessStep = async (data?: Partial<BusinessInfo>) => {
        try {
            if (!claimId) return;

            setSaveStatus("saving");

            // Update state with committed data if provided
            if (data) {
                setBusinessInfoState((prev) => ({ ...prev, ...data }));
            }

            // Business info comes from Company entity, no backend update needed for this step
            // Just update claim status
            await updateClaimStatus(claimId, {
                status: "IN_PROGRESS_INSURANCE",
            });
            setStatus("IN_PROGRESS_INSURANCE");

            // Clear temp data
            clearTempData(claimId);

            setSaveStatus("saved");
        } catch (error) {
            console.error("Error committing business step:", error);
            setSaveStatus("error");
            throw error;
        }
    };

    // Commit insurer step
    const commitInsurerStep = async (data?: Partial<InsurerInfo>) => {
        try {
            if (!claimId) return;

            setSaveStatus("saving");

            // Update state with committed data if provided
            if (data) {
                setInsurerInfoState((prev) => ({ ...prev, ...data }));
            }

            if (insurerInfo.id) {
                // Update claim with insurance policy if provided
                await updateClaimStatus(claimId, {
                    status: "IN_PROGRESS_EXPORT",
                    insurancePolicyId: insurerInfo.id,
                });
            }

            setStatus("IN_PROGRESS_EXPORT");
            clearTempData(claimId);

            setSaveStatus("saved");
        } catch (error) {
            console.error("Error committing insurer step:", error);
            setSaveStatus("error");
            throw error;
        }
    };

    // Finalize claim submission
    const finalizeClaimSubmission = async () => {
        try {
            if (!claimId) return;
            setSaveStatus("saving");

            // Update claim status to FILED
            await updateClaimStatus(claimId, {
                status: "FILED",
            });
            setStatus("FILED");

            // Clear all temp data
            clearTempData(claimId);

            setSaveStatus("saved");
        } catch (error) {
            console.error("Error finalizing claim:", error);
            setSaveStatus("error");
            throw error;
        }
    };

    // Clear claim draft and start fresh
    const clearClaimDraft = () => {
        if (claimId) {
            clearTempData(claimId);
        }
        setClaimId(null);
        setStatus(null);
        setStep(-2);
        setDisasterInfoState(initialDisasterInfo);
        setPersonalInfoState(initialPersonalInfo);
        setBusinessInfoState(initialBusinessInfo);
        setInsurerInfoState(initialInsurerInfo);
        selfDisasterRef.current = null;
    };

    return {
        claimId,
        status,
        step,
        saveStatus,
        disasterInfo,
        personalInfo,
        businessInfo,
        insurerInfo,
        setDisasterInfo,
        setPersonalInfo,
        setBusinessInfo,
        setInsurerInfo,
        setStep,
        commitDisasterStep,
        commitPersonalStep,
        commitBusinessStep,
        commitInsurerStep,
        finalizeClaimSubmission,
        clearClaimDraft,
    };
}
