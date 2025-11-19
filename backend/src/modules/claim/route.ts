import { DataSource } from "typeorm";
import { Hono } from "hono";
import { ClaimTransaction, IClaimTransaction } from "./transaction";
import { ClaimService, IClaimService } from "./service";
import { ClaimController, IClaimController } from "./controller";
import { DocumentTransaction, IDocumentTransaction } from "../documents/transaction";

export const claimRoutes = (db: DataSource): Hono => {
    const claim = new Hono();

    const claimTransaction: IClaimTransaction = new ClaimTransaction(db);
    const documentTransaction: IDocumentTransaction = new DocumentTransaction(db);
    const claimService: IClaimService = new ClaimService(claimTransaction, documentTransaction, db);
    const claimController: IClaimController = new ClaimController(claimService);

    claim.get("/company", (ctx) => claimController.getClaimByCompanyId(ctx));
    claim.post("/", (ctx) => claimController.createClaim(ctx));
    claim.delete("/:id", (ctx) => claimController.deleteClaim(ctx));
    claim.post("/line-item", (ctx) => claimController.linkClaimToLineItem(ctx));
    claim.post("/purchase", (ctx) => claimController.linkClaimToPurchaseItems(ctx));
    claim.get("/:id/line-item", (ctx) => claimController.getLinkedPurchaseLineItems(ctx));
    claim.delete("/:claimId/line-item/:lineItemId", (ctx) => claimController.deletePurchaseLineItem(ctx));
    claim.get("/:id/pdf", (ctx) => claimController.createClaimPDF(ctx));

    return claim;
};
