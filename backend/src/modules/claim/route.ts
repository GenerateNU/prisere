import { DataSource } from "typeorm";
import { Hono } from "hono";
import { ClaimTransaction, IClaimTransaction } from "./transaction";
import { ClaimService, IClaimService } from "./service";
import { ClaimController, IClaimController } from "./controller";

export const claimRoutes = (db: DataSource): Hono => {
    const claim = new Hono();

    const claimTransaction: IClaimTransaction = new ClaimTransaction(db);
    const claimService: IClaimService = new ClaimService(claimTransaction);
    const claimController: IClaimController = new ClaimController(claimService);

    claim.get("/company", (ctx) => claimController.getClaimByCompanyId(ctx));
    claim.post("/", (ctx) => claimController.createClaim(ctx));
    claim.delete("/:id", (ctx) => claimController.deleteClaim(ctx));

    return claim;
};
