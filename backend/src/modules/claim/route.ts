import { Hono } from "hono";
import { DataSource } from "typeorm";
import { ClaimController, IClaimController } from "./controller";
import { DocumentTransaction, IDocumentTransaction } from "../documents/transaction";
import { ClaimService, IClaimService } from "./service";
import { ClaimTransaction, IClaimTransaction } from "./transaction";
import { CompanyTransaction, ICompanyTransaction } from "../company/transaction";

export const claimRoutes = (db: DataSource): Hono => {
    const claim = new Hono();

    const claimTransaction: IClaimTransaction = new ClaimTransaction(db);
    const documentTransaction: IDocumentTransaction = new DocumentTransaction(db);
    const companyTransaction: ICompanyTransaction = new CompanyTransaction(db);
    const claimService: IClaimService = new ClaimService(claimTransaction, documentTransaction, companyTransaction, db);
    const claimController: IClaimController = new ClaimController(claimService);

    claim.get("/company", (ctx) => claimController.getClaimByCompanyId(ctx));
    claim.post("/", (ctx) => claimController.createClaim(ctx));
    claim.get("/:id", (ctx) => claimController.getClaimById(ctx));
    claim.patch("/:id/status", (ctx) => claimController.updateClaimStatus(ctx));
    claim.delete("/:id", (ctx) => claimController.deleteClaim(ctx));
    claim.post("/line-item", (ctx) => claimController.linkClaimToLineItem(ctx));
    claim.post("/purchase", (ctx) => claimController.linkClaimToPurchaseItems(ctx));
    claim.get("/:id/line-item", (ctx) => claimController.getLinkedPurchaseLineItems(ctx));
    claim.delete("/:claimId/line-item/:lineItemId", (ctx) => claimController.deletePurchaseLineItem(ctx));
    claim.get("/:id/pdf", (ctx) => claimController.createClaimPDF(ctx));
    claim.post("/document", (ctx) => claimController.linkClaimToBusinessDocument(ctx));

    return claim;
};
