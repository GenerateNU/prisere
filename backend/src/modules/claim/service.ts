import Boom from "@hapi/boom";
import {
    CreateClaimDTO,
    CreateClaimResponse,
    DeleteClaimDTO,
    DeleteClaimResponse,
    GetClaimsByCompanyIdResponse,
} from "../../types/Claim";
import { Claim } from "../../entities/Claim";
import { withServiceErrorHandling } from "../../utilities/error";
import { IClaimTransaction } from "./transaction";

export interface IClaimService {
    createClaim(payload: CreateClaimDTO, companyId: string): Promise<CreateClaimResponse>;
    getClaimsByCompanyId(companyId: string): Promise<GetClaimsByCompanyIdResponse>;
    deleteClaim(payload: DeleteClaimDTO, companyId: string): Promise<DeleteClaimResponse>;
}

export class ClaimService implements IClaimService {
    private claimTransaction: IClaimTransaction;

    constructor(claimTransaction: IClaimTransaction) {
        this.claimTransaction = claimTransaction;
    }

    createClaim = withServiceErrorHandling(
        async (payload: CreateClaimDTO, companyId: string): Promise<CreateClaimResponse> => {
            if (!payload.selfDisasterId && !payload.femaDisasterId) {
                throw Boom.badRequest("There must be a fema or self disaster");
            }

            const claim = await this.claimTransaction.createClaim(
                {
                    ...payload,
                },
                companyId
            );
            if (!claim) {
                throw new Error("Failed to create claim");
            }
            return claim;
        }
    );

    getClaimsByCompanyId = withServiceErrorHandling(
        async (companyId: string): Promise<GetClaimsByCompanyIdResponse> => {
            const claim = await this.claimTransaction.getClaimsByCompanyId(companyId);
            if (!claim) {
                throw new Error("Claim not found");
            }
            return claim;
        }
    );

    deleteClaim = withServiceErrorHandling(
        async (payload: DeleteClaimDTO, companyId: string): Promise<DeleteClaimResponse> => {
            const claim = await this.claimTransaction.deleteClaim(
                {
                    ...payload,
                },
                companyId
            );
            console.log(claim);
            if (!claim) {
                throw new Error("Failed to delete claim");
            }
            return claim;
        }
    );
}
