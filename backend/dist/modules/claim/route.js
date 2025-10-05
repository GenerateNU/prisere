import { Hono } from "hono";
import { ClaimTransaction } from "./transaction";
import { ClaimService } from "./service";
import { ClaimController } from "./controller";
export const claimRoutes = (db) => {
    const claim = new Hono();
    const claimTransaction = new ClaimTransaction(db);
    const claimService = new ClaimService(claimTransaction);
    const claimController = new ClaimController(claimService);
    claim.get("/:id", (ctx) => claimController.getClaim(ctx));
    claim.post("/", (ctx) => claimController.createClaim(ctx));
    claim.delete("/:id", (ctx) => claimController.deleteClaim(ctx));
    return claim;
};
