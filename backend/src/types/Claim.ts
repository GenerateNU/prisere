import { z } from "zod";
import {
    SingleInsurancePolicyDocumentResponseSchema,
    SingleInsurancePolicyResponseSchema,
} from "../modules/insurance-policy/types";
import { GetPurchaseLineItemResponseSchema } from "../modules/purchase-line-item/types";
import {
    GetSelfDisasterForCompanyResponseSchema,
    GetSelfDisasterForDocumentResponseSchema,
} from "../modules/self-disaster/types";
import { ClaimStatusType } from "./ClaimStatusType";
import { GetAllDisastersDocumentResponseSchema, GetAllDisastersResponseSchema } from "./fema-disaster";
import { LocationAddressSchema } from "./Location";

export const ClaimSchema = z.object({
    id: z.string().nonempty(),
    name: z.string().max(250).min(1),
    status: z.nativeEnum(ClaimStatusType).default(ClaimStatusType.ACTIVE),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime().optional(),
    femaDisaster: GetAllDisastersResponseSchema.element.optional(), // .element extracts the item schema
    selfDisaster: GetSelfDisasterForCompanyResponseSchema.optional(),
    insurancePolicy: SingleInsurancePolicyResponseSchema.optional(),
    claimLocations: z.array(LocationAddressSchema).optional(),
    purchaseLineItemIds: z.array(z.string()),
});

export const ClaimSchemaResponse = ClaimSchema.extend({
    femaDisaster: GetAllDisastersDocumentResponseSchema.element.optional(),
    selfDisaster: GetSelfDisasterForDocumentResponseSchema.optional(),
    insurancePolicy: SingleInsurancePolicyDocumentResponseSchema.optional(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime().optional(),
});

// A company might not have a claim in progress
export const GetClaimInProgressForCompanySchema = ClaimSchema.nullable();

const stringClaimSchema = z.object({
    id: z.string().nonempty(),
    status: z.nativeEnum(ClaimStatusType).default(ClaimStatusType.ACTIVE),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
    femaDisaster: GetAllDisastersResponseSchema.element.optional(),
    selfDisaster: GetSelfDisasterForCompanyResponseSchema.optional(),
    insurancePolicy: SingleInsurancePolicyResponseSchema.optional(),
    claimLocations: z.array(LocationAddressSchema).optional(),
});

/* POST */
export const CreateClaimDTOSchema = z.object({
    femaDisasterId: z.string().optional(),
    selfDisasterId: z.string().optional(),
    insurancePolicyId: z.string().optional(),
    status: z.enum(ClaimStatusType).default(ClaimStatusType.ACTIVE),
    name: z.string().max(250).min(1),
});

export const CreateClaimResponseSchema = stringClaimSchema;

/* GET */

export const GetClaimsByCompanyIdResponseSchema = z.object({
    data: z.array(ClaimSchema),
    totalCount: z.number(),
    hasMore: z.boolean(),
    hasPrevious: z.boolean(),
});

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

/* Update Claim Status and Partial Data */

export const UpdateClaimStatusDTOSchema = z.object({
    status: z.enum(ClaimStatusType),
    insurancePolicyId: z.string().optional(),
});

export const UpdateClaimStatusResponseSchema = ClaimSchema;

/* Get Single Claim by ID */

export const GetClaimByIdResponseSchema = ClaimSchema;

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

export type GetClaimInProgressForCompanyResponse = z.infer<typeof GetClaimInProgressForCompanySchema>;

export type UpdateClaimStatusDTO = z.infer<typeof UpdateClaimStatusDTOSchema>;
export type UpdateClaimStatusResponse = z.infer<typeof UpdateClaimStatusResponseSchema>;

export type GetClaimByIdResponse = z.infer<typeof GetClaimByIdResponseSchema>;
