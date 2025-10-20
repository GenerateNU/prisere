import { Claim } from "../../entities/Claim";
import { CreateClaimDTO, DeleteClaimDTO, DeleteClaimResponse, GetClaimsByCompanyIdResponse } from "../../types/Claim";
import { withServiceErrorHandling } from "../../utilities/error";
import { IClaimTransaction } from "./transaction";

export interface IClaimService {
    createClaim(payload: CreateClaimDTO, companyId: string): Promise<Claim>;
    getClaimsByCompanyId(companyId: string): Promise<GetClaimsByCompanyIdResponse>;
    deleteClaim(payload: DeleteClaimDTO): Promise<DeleteClaimResponse>;
}

export class ClaimService implements IClaimService {
    private claimTransaction: IClaimTransaction;

    constructor(claimTransaction: IClaimTransaction) {
        this.claimTransaction = claimTransaction;
    }

    createClaim = withServiceErrorHandling(async (payload: CreateClaimDTO, companyId: string): Promise<Claim> => {
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
    });

    getClaimsByCompanyId = withServiceErrorHandling(
        async (companyId: string): Promise<GetClaimsByCompanyIdResponse> => {
            const claim = await this.claimTransaction.getClaimsByCompanyId(companyId);
            if (!claim) {
                throw new Error("Claim not found");
            }
            return claim;
        }
    );

    deleteClaim = withServiceErrorHandling(async (payload: DeleteClaimDTO): Promise<DeleteClaimResponse> => {
        const claim = await this.claimTransaction.deleteClaim({
            ...payload,
        });
        if (!claim) {
            throw new Error("Failed to delete claim");
        }
        return claim;
    });
}
