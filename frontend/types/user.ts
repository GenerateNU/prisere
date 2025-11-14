import type { paths } from "../schema";
import { CreateClaimResponse } from "./claim";
import { FemaDisaster } from "./disaster";

export type CreateUserRequest = paths["/users"]["post"]["requestBody"]["content"]["application/json"];

export type CreateUserResponse = paths["/users"]["post"]["responses"];

export type User = paths["/users"]["post"]["responses"][201]["content"]["application/json"];

export type loginInitialState = {
    success: boolean;
    message: string;
};

export type signupInitialState = {
    success: boolean;
    message: string;
    email?: string;
};

export enum requiredOnboardingProgress {
    USER = "user",
    COMPANY = "company",
    FINISHED = "finished",
}

export const progressToNumber: Record<requiredOnboardingProgress, number> = {
    [requiredOnboardingProgress.USER]: 0,
    [requiredOnboardingProgress.COMPANY]: 1,
    [requiredOnboardingProgress.FINISHED]: 2,
};

export type BannerData =
    | { status: "no-disaster" }
    | { status: "no-claim"; disaster: FemaDisaster }
    | { status: "has-claim"; disaster: FemaDisaster; claim: CreateClaimResponse };
