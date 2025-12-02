"use client";

import { createClaim, getClaimById, updateClaimStatus, uploadAndConfirmDocumentRelation } from "@/api/claim";
import { createClaimLocationLink } from "@/api/claim-location";
import { createSelfDisaster, updateSelfDisaster } from "@/api/self-disaster";
import { getUser, updateUserInfo } from "@/api/user";
import {
    BusinessInfo,
    ClaimStatusType,
    ClaimStepData,
    ClaimStepNumber,
    DisasterInfo,
    InsurerInfo,
    isStep,
    PersonalInfo,
    SaveStatus,
    UploadClaimRelatedDocumentsRequest,
} from "@/types/claim";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
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

export function useClaimProgress(
    initialDisasterInfo: DisasterInfo,
    initialPersonalInfo: PersonalInfo,
    initialBusinessInfo: BusinessInfo,
    initialInsurerInfo: InsurerInfo
): UseClaimProgressReturn {
    const queryClient = useQueryClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { data: userInfoData } = useQuery({
        queryKey: ["userInfo"],
        queryFn: getUser,
    });

    // Get claimId and step from URL
    const urlClaimId = searchParams.get("claimId");
    const urlStep = parseInt(searchParams.get("step") || "-2", 10);

    const [claimId, setClaimId] = useState(urlClaimId);
    const [status, setStatus] = useState<ClaimStatusType | null>(null);
    const [step, setStepState] = useState<ClaimStepNumber>(urlStep as ClaimStepNumber);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

    // Form state
    const [disasterInfo, setDisasterInfoState] = useState<DisasterInfo>(initialDisasterInfo);
    const [personalInfo, setPersonalInfoState] = useState<PersonalInfo>(initialPersonalInfo);
    const [businessInfo, setBusinessInfoState] = useState<BusinessInfo>(initialBusinessInfo);
    const [insurerInfo, setInsurerInfoState] = useState<InsurerInfo>(initialInsurerInfo);

    // Refs for debouncing
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const selfDisasterIdRef = useRef<string | null>(null);

    // Clean expired temp data on mount
    useEffect(() => {
        cleanExpiredTempData();
    }, []);

    // Load existing claim if claimId in URL
    useEffect(() => {
        if (urlClaimId) {
            loadExistingClaim(urlClaimId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlClaimId]);

    // Load existing claim from backend
    const loadExistingClaim = async (id: string) => {
        try {
            const claim = await getClaimById(id);
            setClaimId(claim.id);
            setStatus(claim.status);

            if (claim.selfDisaster) {
                selfDisasterIdRef.current = claim.selfDisaster.id;
                setDisasterInfoState((prev) => ({
                    ...prev,
                    name: claim.selfDisaster?.name || "",
                    description: claim.selfDisaster?.description || "",
                    startDate: claim.selfDisaster?.startDate ? new Date(claim.selfDisaster.startDate) : null,
                    endDate: claim.selfDisaster?.endDate ? new Date(claim.selfDisaster.endDate) : null,
                    // Restore location from claimLocations if exists
                    location:
                        claim.claimLocations && claim.claimLocations.length > 0
                            ? claim.claimLocations[0].id
                            : prev.location,
                }));
            }

            // Load temp data if exists
            if (step >= 0 && step <= 3) {
                const tempData = loadTempData(id, step);
                if (tempData) {
                    // Apply temp data, but ensure dates are Date objects if they come from disaster info
                    if (isStep(step, 0, tempData)) {
                        const processedTempData = {
                            ...tempData,
                            disasterInfo: {
                                ...tempData.disasterInfo,
                                startDate: tempData.disasterInfo.startDate
                                    ? tempData.disasterInfo.startDate instanceof Date
                                        ? tempData.disasterInfo.startDate
                                        : new Date(tempData.disasterInfo.startDate)
                                    : null,
                                endDate: tempData.disasterInfo.endDate
                                    ? tempData.disasterInfo.endDate instanceof Date
                                        ? tempData.disasterInfo.endDate
                                        : new Date(tempData.disasterInfo.endDate)
                                    : null,
                            },
                        };
                        applyTempData(step, processedTempData);
                    } else {
                        applyTempData(step, tempData);
                    }
                }
            }
        } catch (error) {
            console.error("Error loading claim:", error);
            setSaveStatus("error");
        }
    };

    // Apply temp data to form state
    const applyTempData = <T extends ClaimStepNumber>(step: T, tempData: ClaimStepData<T>) => {
        if (isStep(step, 0, tempData)) {
            setDisasterInfoState((prev) => ({ ...prev, ...tempData.disasterInfo }));
        } else if (isStep(step, 1, tempData)) {
            setPersonalInfoState((prev) => ({ ...prev, ...tempData.personalInfo }));
        } else if (isStep(step, 2, tempData)) {
            setBusinessInfoState((prev) => ({ ...prev, ...tempData.businessInfo }));
        } else if (isStep(step, 3, tempData)) {
            setInsurerInfoState((prev) => ({ ...prev, ...tempData.insurerInfo }));
        }
    };

    // Update URL with current state
    const updateURL = useCallback(
        (newClaimId: string | null, newStep: number) => {
            const params = new URLSearchParams();
            if (newClaimId) {
                params.set("claimId", newClaimId);
            }
            params.set("step", newStep.toString());
            router.push(`/claims/declare?${params.toString()}`, { scroll: false });
        },
        [router]
    );

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
        [claimId, step]
    );

    // Setters with auto-save
    const setDisasterInfo = useCallback(
        (info: Partial<DisasterInfo>) => {
            setDisasterInfoState((prev) => {
                const updated = { ...prev, ...info };
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

    const setStep = useCallback(
        (newStep: ClaimStepNumber) => {
            setStepState(newStep);
            updateURL(claimId, newStep);
        },
        [claimId, updateURL]
    );

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
            const dataToUse = data ? { ...disasterInfo, ...data } : disasterInfo;

            // Create or update self disaster
            if (selfDisasterIdRef.current) {
                // Update existing
                await updateSelfDisaster(selfDisasterIdRef.current, {
                    name: dataToUse.name,
                    description: dataToUse.description,
                    startDate: dataToUse.startDate?.toISOString().split("T")[0],
                    endDate: dataToUse.endDate?.toISOString().split("T")[0],
                });

                if (dataToUse.additionalDocumets.length > 0) {
                    await saveAdditionalDocumentsToS3(dataToUse.additionalDocumets, selfDisasterIdRef.current);
                }
            } else {
                // Create new
                const selfDisaster = await createSelfDisaster({
                    name: dataToUse.name,
                    description: dataToUse.description,
                    startDate:
                        dataToUse.startDate?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
                    endDate: dataToUse.endDate?.toISOString().split("T")[0],
                });
                selfDisasterIdRef.current = selfDisaster.id;

                if (dataToUse.additionalDocumets.length > 0) {
                    await saveAdditionalDocumentsToS3(dataToUse.additionalDocumets, selfDisaster.id);
                }

                // Create claim
                const newClaim = await createClaim({
                    selfDisasterId: selfDisaster.id,
                    status: "IN_PROGRESS_DISASTER",
                });
                setClaimId(newClaim.id);
                setStatus(newClaim.status);

                // Link location if provided
                if (dataToUse.location) {
                    await createClaimLocationLink({
                        claimId: newClaim.id,
                        locationAddressId: dataToUse.location,
                    });
                }

                // Update URL with new claimId
                updateURL(newClaim.id, step + 1);
            }

            // Update state with committed data
            if (data) {
                setDisasterInfoState((prev) => ({ ...prev, ...data }));
            }

            // Clear temp data for this step
            if (claimId) {
                clearTempData(claimId);
            }

            // Update claim status to next step
            if (claimId) {
                await updateClaimStatus(claimId, {
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

            // Update claim with insurance policy if provided
            await updateClaimStatus(claimId, {
                status: "IN_PROGRESS_EXPORT",
                // insurancePolicyId can be added here if we have it
            });
            setStatus("IN_PROGRESS_EXPORT");

            // Clear temp data
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
        setStepState(-2);
        setDisasterInfoState(initialDisasterInfo);
        setPersonalInfoState(initialPersonalInfo);
        setBusinessInfoState(initialBusinessInfo);
        setInsurerInfoState(initialInsurerInfo);
        selfDisasterIdRef.current = null;
        router.push("/claims/declare");
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
