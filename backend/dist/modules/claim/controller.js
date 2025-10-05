import { CreateClaimDTOSchema } from "../../types/Claim";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
export class ClaimController {
    claimService;
    constructor(service) {
        this.claimService = service;
    }
    getClaim = withControllerErrorHandling(async (ctx) => {
        const id = ctx.req.param("id");
        if (!validate(id)) {
            return ctx.json({ error: "Invalid claim ID format" }, 400);
        }
        const claimResponse = await this.claimService.getClaim({ id: id });
        return ctx.json(claimResponse, 200);
    });
    createClaim = withControllerErrorHandling(async (ctx) => {
        const json = await ctx.req.json();
        const payload = CreateClaimDTOSchema.parse(json);
        const claim = await this.claimService.createClaim(payload);
        return ctx.json(claim, 201);
    });
    deleteClaim = withControllerErrorHandling(async (ctx) => {
        const id = ctx.req.param("id");
        if (!validate(id)) {
            return ctx.json({ error: "Invalid claim ID format" }, 400);
        }
        const claim = await this.claimService.deleteClaim({ id: id });
        return ctx.json(claim, 200);
    });
}
