import { withServiceErrorHandling } from "../../utilities/error";
export class ClaimService {
    claimTransaction;
    constructor(claimTransaction) {
        this.claimTransaction = claimTransaction;
    }
    createClaim = withServiceErrorHandling(async (payload) => {
        const claim = await this.claimTransaction.createClaim({
            ...payload,
        });
        if (!claim) {
            throw new Error("Failed to create claim");
        }
        return claim;
    });
    getClaim = withServiceErrorHandling(async (payload) => {
        const claim = await this.claimTransaction.getClaim({
            ...payload,
        });
        if (!claim) {
            throw new Error("Claim not found");
        }
        return claim;
    });
    deleteClaim = withServiceErrorHandling(async (payload) => {
        const claim = await this.claimTransaction.deleteClaim({
            ...payload,
        });
        if (!claim) {
            throw new Error("Failed to delete claim");
        }
        return claim;
    });
}
