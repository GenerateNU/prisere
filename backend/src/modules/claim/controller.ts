import { Context, TypedResponse } from "hono";
import { ControllerResponse } from "../../utilities/response";
import {
    GetClaimsByCompanyIdResponse,
    CreateClaimResponse,
    CreateClaimDTOSchema,
    DeleteClaimResponse,
    LinkClaimToLineItemResponse,
    LinkClaimToLineItemDTOSchema,
    LinkClaimToPurchaseResponse,
    LinkClaimToPurchaseDTOSchema,
    GetPurchaseLineItemsForClaimResponse,
    DeletePurchaseLineItemResponse,
} from "../../types/Claim";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import { IClaimService } from "./service";
import { ClaimPDFGenerationResponse } from "./types";

export interface IClaimController {
    getClaimByCompanyId(_ctx: Context): ControllerResponse<TypedResponse<GetClaimsByCompanyIdResponse, 200>>;
    createClaim(_ctx: Context): ControllerResponse<TypedResponse<CreateClaimResponse, 201>>;
    deleteClaim(_ctx: Context): ControllerResponse<TypedResponse<DeleteClaimResponse, 200>>;
    linkClaimToLineItem(_ctx: Context): ControllerResponse<TypedResponse<LinkClaimToLineItemResponse, 201>>;
    linkClaimToPurchaseItems(_ctx: Context): ControllerResponse<TypedResponse<LinkClaimToPurchaseResponse, 201>>;
    getLinkedPurchaseLineItems(
        _ctx: Context
    ): ControllerResponse<TypedResponse<GetPurchaseLineItemsForClaimResponse, 200>>;
    deletePurchaseLineItem(_ctx: Context): ControllerResponse<TypedResponse<DeletePurchaseLineItemResponse, 200>>;
    createClaimPDF(_ctx: Context): ControllerResponse<TypedResponse<ClaimPDFGenerationResponse, 200>>;
}

export class ClaimController {
    private claimService: IClaimService;

    constructor(service: IClaimService) {
        this.claimService = service;
    }

    getClaimByCompanyId = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetClaimsByCompanyIdResponse, 200>> => {
            const id = ctx.get("companyId");
            if (!validate(id)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }

            const claimResponse = await this.claimService.getClaimsByCompanyId(id);

            return ctx.json(claimResponse, 200);
        }
    );

    createClaim = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateClaimResponse, 201>> => {
            const json = await ctx.req.json();
            const payload = CreateClaimDTOSchema.parse(json);
            const id = ctx.get("companyId");
            if (!validate(id)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }
            const claim = await this.claimService.createClaim(payload, id);
            return ctx.json(claim, 201);
        }
    );

    deleteClaim = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<DeleteClaimResponse, 200>> => {
            const id = ctx.req.param("id");
            const companyId = ctx.get("companyId");

            if (!validate(id)) {
                return ctx.json({ error: "Invalid claim ID format" }, 400);
            }
            const claim = await this.claimService.deleteClaim({ id: id }, companyId);
            return ctx.json(claim, 200);
        }
    );

    linkClaimToLineItem = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<LinkClaimToLineItemResponse, 201>> => {
            const json = await ctx.req.json();
            const payload = LinkClaimToLineItemDTOSchema.parse(json);

            if (!validate(payload.claimId) || !validate(payload.purchaseLineItemId)) {
                return ctx.json({ error: "Invalid claim or purchase line item Id format" }, 400);
            }

            const linkedSuccess = await this.claimService.linkClaimToLineItem(payload);

            return ctx.json(linkedSuccess, 201);
        }
    );

    linkClaimToPurchaseItems = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<LinkClaimToPurchaseResponse, 201>> => {
            const json = await ctx.req.json();
            const payload = LinkClaimToPurchaseDTOSchema.parse(json);

            if (!validate(payload.claimId) || !validate(payload.purchaseId)) {
                return ctx.json({ error: "Invalid claim or purchase Id format" }, 400);
            }

            const linkedSuccess = await this.claimService.linkClaimToPurchaseItems(payload);

            return ctx.json(linkedSuccess, 201);
        }
    );

    getLinkedPurchaseLineItems = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetPurchaseLineItemsForClaimResponse, 200>> => {
            const claimId = ctx.req.param("id");

            if (!validate(claimId)) {
                return ctx.json({ error: "Invalid claim Id format" }, 400);
            }

            const purchaseLineItems = await this.claimService.getLinkedPurchaseLineItems(claimId);

            return ctx.json(purchaseLineItems, 200);
        }
    );

    deletePurchaseLineItem = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<DeletePurchaseLineItemResponse, 200>> => {
            const claimId = ctx.req.param("claimId");
            const lineItemId = ctx.req.param("lineItemId");

            if (!validate(claimId) || !validate(lineItemId)) {
                return ctx.json({ error: "Invalid claim or line item Id format" }, 400);
            }

            const deletedLinks = await this.claimService.deletePurchaseLineItem(claimId, lineItemId);

            return ctx.json(deletedLinks, 200);
        }
    );

    createClaimPDF = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<ClaimPDFGenerationResponse, 200>> => {
            const userId = ctx.get("userId");
            const claimId = ctx.req.param("id");
            const companyId = ctx.req.param("companyId");

            if (!validate(claimId)) {
                return ctx.json({ error: "Invalid claim Id format" }, 400);
            }

            const pdfUrl = await this.claimService.createClaimPDF(claimId, userId, companyId);

            return ctx.json(pdfUrl, 200);
        }
    );
}
