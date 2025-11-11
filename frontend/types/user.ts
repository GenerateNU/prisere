import type { paths } from "../schema";

export type CreateUserRequest = paths["/users"]["post"]["requestBody"]["content"]["application/json"];

export type CreateUserResponse = paths["/users"]["post"]["responses"];

export type User = paths["/users"]["post"]["responses"][201]["content"]["application/json"];

export type GetDisastersAffectingUseResponse = paths["/users/getDisastersAffectingUser"]["get"]["responses"][200]["content"]["application/json"]

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
  | { status: "no-claim"; disaster: any }
  | { status: "has-claim"; disaster: any; claim: any };
