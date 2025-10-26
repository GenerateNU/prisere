import { z } from "zod";
import { ClaimStatusType } from "./ClaimStatusType";
import { GetAllDisastersResponseSchema } from "./fema-disaster";
import { GetSelfDisasterForCompanyResponseSchema } from "../modules/self-disaster/types";
import { GetPurchaseLineItemResponseSchema } from "../modules/purchase-line-item/types";
/* Zod schemas for OpenAPI docs */

/* Claim Schema */

export const ClaimSchema = z.object({
    id: z.string().nonempty(),
    status: z.nativeEnum(ClaimStatusType).default(ClaimStatusType.ACTIVE),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime().optional(),
    femaDisaster: GetAllDisastersResponseSchema.element.optional(), // .element extracts the item schema
    selfDisaster: GetSelfDisasterForCompanyResponseSchema.optional(),
});

const stringClaimSchema = z.object({
    id: z.string().nonempty(),
    status: z.nativeEnum(ClaimStatusType).default(ClaimStatusType.ACTIVE),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime().optional(),
    femaDisaster: GetAllDisastersResponseSchema.element.optional(),
    selfDisaster: GetSelfDisasterForCompanyResponseSchema.optional(),
});

/* POST */
export const CreateClaimDTOSchema = z.object({
    femaDisasterId: z.string().optional(),
    selfDisasterId: z.string().optional(),
});

export const CreateClaimResponseSchema = stringClaimSchema;

/* GET */

export const GetClaimsByCompanyIdResponseSchema = z.array(ClaimSchema);

/* DELETE */
export const DeleteClaimDTOSchema = z.object({
    id: z.string().nonempty(),
});

export const DeleteClaimResponseSchema = z.object({
    id: z.string().nonempty(),
});

/* LINKING TO PURCHASE LINE ITEMS */

export const LinkClaimToLineItemDTOSchema = z.object({
    claimId: z.uuid(),
    purchaseLineItemId: z.uuid(),
});

export const LinkClaimToLineItemResponseSchema = LinkClaimToLineItemDTOSchema;

/* LINKING TO ALL OF A PURCHASE'S LINE ITEMS */

export const LinkClaimToPurchaseDTOSchema = z.object({
    claimId: z.uuid(),
    purchaseId: z.uuid(),
});

export const LinkClaimToPurchaseResponseSchema = z.array(LinkClaimToLineItemResponseSchema);

/* Getting all purchase line items linked to a claim */

export const GetPurchaseLineItemsForClaimResponseSchema = z.array(GetPurchaseLineItemResponseSchema);

/* Delete the link between a claim and line item */

export const DeletePurchaseLineItemResponseSchema = LinkClaimToLineItemDTOSchema;

/* Zod types for payload validation */
export type Claim = z.infer<typeof ClaimSchema>;
export type ClaimWithRelations = z.infer<typeof ClaimSchema>;

export type CreateClaimDTO = z.infer<typeof CreateClaimDTOSchema>;
export type CreateClaimResponse = z.infer<typeof CreateClaimResponseSchema>;

export type GetClaimsByCompanyIdResponse = z.infer<typeof GetClaimsByCompanyIdResponseSchema>;

export type DeleteClaimDTO = z.infer<typeof DeleteClaimDTOSchema>;
export type DeleteClaimResponse = z.infer<typeof DeleteClaimResponseSchema>;

export type LinkClaimToLineItemDTO = z.infer<typeof LinkClaimToLineItemDTOSchema>;
export type LinkClaimToLineItemResponse = z.infer<typeof LinkClaimToLineItemResponseSchema>;

export type LinkClaimToPurchaseDTO = z.infer<typeof LinkClaimToPurchaseDTOSchema>;
export type LinkClaimToPurchaseResponse = z.infer<typeof LinkClaimToPurchaseResponseSchema>;

export type GetPurchaseLineItemsForClaimResponse = z.infer<typeof GetPurchaseLineItemsForClaimResponseSchema>;
export type DeletePurchaseLineItemResponse = z.infer<typeof DeletePurchaseLineItemResponseSchema>;
