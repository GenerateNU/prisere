import Boom from "@hapi/boom";
import {
    CreateClaimDTO,
    CreateClaimResponse,
    DeleteClaimDTO,
    DeleteClaimResponse,
    DeletePurchaseLineItemResponse,
    GetClaimsByCompanyIdResponse,
    GetPurchaseLineItemsForClaimResponse,
    LinkClaimToLineItemDTO,
    LinkClaimToLineItemResponse,
    LinkClaimToPurchaseDTO,
    LinkClaimToPurchaseResponse,
} from "../../types/Claim";
import { withServiceErrorHandling } from "../../utilities/error";
import { IClaimTransaction } from "./transaction";
import { ClaimData, ClaimDataForPDF, ClaimPDFGenerationResponse } from "./types";
import { restructureClaimDataForPdf } from "./utilities/pdf-mapper";
import { buildClaimPdfHtml } from "./utilities/claim-pdf-html";
import { generatePDFfromHTML } from "./utilities/puppeteer-handler";
import { S3Service } from "../s3/service";
import { DataSource } from "typeorm";
import { DocumentTypes } from "../../types/S3Types";
import { IDocumentTransaction } from "../documents/transaction";

export interface IClaimService {
    createClaim(payload: CreateClaimDTO, companyId: string): Promise<CreateClaimResponse>;
    getClaimsByCompanyId(companyId: string): Promise<GetClaimsByCompanyIdResponse>;
    deleteClaim(payload: DeleteClaimDTO, companyId: string): Promise<DeleteClaimResponse>;
    linkClaimToLineItem(payload: LinkClaimToLineItemDTO): Promise<LinkClaimToLineItemResponse>;
    linkClaimToPurchaseItems(payload: LinkClaimToPurchaseDTO): Promise<LinkClaimToPurchaseResponse>;
    getLinkedPurchaseLineItems(claimId: string): Promise<GetPurchaseLineItemsForClaimResponse>;
    deletePurchaseLineItem(claimId: string, lineItemId: string): Promise<DeletePurchaseLineItemResponse>;
    createClaimPDF(claimId: string, userId: string, companyId: string): Promise<ClaimPDFGenerationResponse>;
}

export class ClaimService implements IClaimService {
    private claimTransaction: IClaimTransaction;
    private documentTransaction: IDocumentTransaction;
    private db: DataSource;

    constructor(claimTransaction: IClaimTransaction, documentTransaction: IDocumentTransaction, db: DataSource) {
        this.claimTransaction = claimTransaction;
        this.documentTransaction = documentTransaction;
        this.db = db;
    }

    createClaim = withServiceErrorHandling(
        async (payload: CreateClaimDTO, companyId: string): Promise<CreateClaimResponse> => {
            if (!payload.selfDisasterId && !payload.femaDisasterId) {
                throw Boom.badRequest("There must be a fema or self disaster");
            }

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
        }
    );

    getClaimsByCompanyId = withServiceErrorHandling(
        async (companyId: string): Promise<GetClaimsByCompanyIdResponse> => {
            const claim = await this.claimTransaction.getClaimsByCompanyId(companyId);
            if (!claim) {
                throw new Error("Claim not found");
            }
            return claim;
        }
    );

    deleteClaim = withServiceErrorHandling(
        async (payload: DeleteClaimDTO, companyId: string): Promise<DeleteClaimResponse> => {
            const claim = await this.claimTransaction.deleteClaim(
                {
                    ...payload,
                },
                companyId
            );
            if (!claim) {
                throw new Error("Failed to delete claim");
            }
            return claim;
        }
    );

    linkClaimToLineItem = withServiceErrorHandling(
        async (payload: LinkClaimToLineItemDTO): Promise<LinkClaimToLineItemResponse> => {
            const response = await this.claimTransaction.linkClaimToLineItem(payload);

            if (!response) {
                throw Boom.notFound("Failed to link claim and purchase line item");
            }
            return response;
        }
    );

    linkClaimToPurchaseItems = withServiceErrorHandling(
        async (payload: LinkClaimToPurchaseDTO): Promise<LinkClaimToPurchaseResponse> => {
            const response = await this.claimTransaction.linkClaimToPurchaseItems(payload);

            if (!response) {
                throw Boom.notFound("Failed to link claim and purchase's line items");
            }
            return response;
        }
    );

    getLinkedPurchaseLineItems = withServiceErrorHandling(
        async (claimId: string): Promise<GetPurchaseLineItemsForClaimResponse> => {
            const response = await this.claimTransaction.getLinkedPurchaseLineItems(claimId);

            if (!response) {
                throw Boom.notFound("Failed to retrieve purchase line items for claim");
            }
            return response;
        }
    );

    deletePurchaseLineItem = withServiceErrorHandling(
        async (claimId: string, lineItemId: string): Promise<DeletePurchaseLineItemResponse> => {
            const response = await this.claimTransaction.deletePurchaseLineItem(claimId, lineItemId);

            if (!response) {
                throw Boom.notFound("Failed to delete purchase line link to claim");
            }
            return response;
        }
    );

    createClaimPDF = withServiceErrorHandling(
        async (claimId: string, userId: string, companyId: string): Promise<ClaimPDFGenerationResponse> => {
            const pdfData: ClaimDataForPDF = await this.claimTransaction.retrieveDataForPDF(claimId, userId);
            if (!pdfData.company) {
                throw Boom.notFound("Claim does not have an associated company");
            }
            const claimData: ClaimData = restructureClaimDataForPdf(pdfData);
            const claimHtml = buildClaimPdfHtml(claimData);
            const pdfBuffer = await generatePDFfromHTML(claimHtml);
            const s3 = new S3Service(this.db, this.documentTransaction);
            const timestamp = new Date().toISOString();
            const documentId = `${claimId}-${timestamp}`;
            const key = `claims/${companyId}/${claimId}/${documentId}`;
            const uploadResponseUrl = await s3.getPresignedUploadUrl(key);
            await s3.uploadBufferToS3(uploadResponseUrl, pdfBuffer);
            const confirmUploadResponse = await s3.confirmUpload({
                key: key,
                documentId: documentId,
                documentType: DocumentTypes.CLAIM,
                claimId: claimId,
                userId: userId,
                companyId: companyId,
            });
            return { url: confirmUploadResponse.url };
        }
    );
}
