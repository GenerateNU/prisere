import { Claim } from "../../entities/Claim";
import { CreateClaimDTO, DeleteClaimDTO, DeleteClaimResponse, GetClaimsByCompanyIdDTO, GetClaimsByCompanyIdResponse } from "../../types/Claim";
import { withServiceErrorHandling } from "../../utilities/error";
import { IClaimTransaction } from "./transaction";

export interface IClaimService {
    createClaim(payload: CreateClaimDTO): Promise<Claim>;
    getClaimsByCompanyId(payload: GetClaimsByCompanyIdDTO): Promise<GetClaimsByCompanyIdResponse>;
    deleteClaim(payload: DeleteClaimDTO): Promise<DeleteClaimResponse>;
}

export class ClaimService implements IClaimService {
    private claimTransaction: IClaimTransaction;

    constructor(claimTransaction: IClaimTransaction) {
        this.claimTransaction = claimTransaction;
    }

    createClaim = withServiceErrorHandling(async (payload: CreateClaimDTO): Promise<Claim> => {
        const claim = await this.claimTransaction.createClaim({
            ...payload,
        });
        if (!claim) {
            throw new Error("Failed to create claim");
        }
        return claim;
    })

    getClaimsByCompanyId = withServiceErrorHandling(async (payload: GetClaimsByCompanyIdDTO): Promise<GetClaimsByCompanyIdResponse> => {
        const claim = await this.claimTransaction.getClaimsByCompanyId({
            ...payload,
        })
        if (!claim) {
            throw new Error("Claim not found");
        }
        return claim;
    })

    deleteClaim = withServiceErrorHandling(async (payload: DeleteClaimDTO): Promise<DeleteClaimResponse> => {
        const claim = await this.claimTransaction.deleteClaim({
            ...payload,
        })
        if (!claim) {
            throw new Error("Failed to delete claim");
        }
        return claim;
    })
}

