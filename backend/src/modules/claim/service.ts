import Boom from "@hapi/boom";
import { DataSource } from "typeorm";
import {
    CreateClaimDTO,
    CreateClaimResponse,
    DeleteClaimDTO,
    DeleteClaimResponse,
    DeletePurchaseLineItemResponse,
    GetClaimByIdResponse,
    GetClaimsByCompanyIdResponse,
    GetPurchaseLineItemsForClaimResponse,
    LinkClaimToLineItemDTO,
    LinkClaimToLineItemResponse,
    LinkClaimToPurchaseDTO,
    LinkClaimToPurchaseResponse,
    UpdateClaimStatusDTO,
    UpdateClaimStatusResponse,
} from "../../types/Claim";
import { DocumentTypes } from "../../types/S3Types";
import { withServiceErrorHandling } from "../../utilities/error";
import { ICompanyTransaction } from "../company/transaction";
import { IDocumentTransaction } from "../documents/transaction";
import { S3Service } from "../s3/service";
import { IClaimTransaction } from "./transaction";
import { ClaimData, ClaimDataForPDF, ClaimPDFGenerationResponse, GetClaimsByCompanyInput } from "./types";
import { restructureClaimDataForPdf } from "./utilities/pdf-mapper";
import { generatePdfToBuffer } from "./utilities/react-pdf-handler";

export interface IClaimService {
    createClaim(payload: CreateClaimDTO, companyId: string): Promise<CreateClaimResponse>;
    getClaimsByCompanyId(companyId: string, input: GetClaimsByCompanyInput): Promise<GetClaimsByCompanyIdResponse>;
    deleteClaim(payload: DeleteClaimDTO, companyId: string): Promise<DeleteClaimResponse>;
    linkClaimToLineItem(payload: LinkClaimToLineItemDTO): Promise<LinkClaimToLineItemResponse>;
    linkClaimToPurchaseItems(payload: LinkClaimToPurchaseDTO): Promise<LinkClaimToPurchaseResponse>;
    getLinkedPurchaseLineItems(claimId: string): Promise<GetPurchaseLineItemsForClaimResponse>;
    deletePurchaseLineItem(claimId: string, lineItemId: string): Promise<DeletePurchaseLineItemResponse>;
    createClaimPDF(claimId: string, userId: string, companyId: string): Promise<ClaimPDFGenerationResponse>;
    getClaimById(claimId: string, companyId: string): Promise<GetClaimByIdResponse>;
    updateClaimStatus(
        claimId: string,
        payload: UpdateClaimStatusDTO,
        companyId: string
    ): Promise<UpdateClaimStatusResponse>;
}

export class ClaimService implements IClaimService {
    private claimTransaction: IClaimTransaction;
    private documentTransaction: IDocumentTransaction;
    private companyTransaction: ICompanyTransaction;
    private db: DataSource;

    constructor(
        claimTransaction: IClaimTransaction,
        documentTransaction: IDocumentTransaction,
        companyTransaction: ICompanyTransaction,
        db: DataSource
    ) {
        this.claimTransaction = claimTransaction;
        this.documentTransaction = documentTransaction;
        this.companyTransaction = companyTransaction;
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
        async (companyId: string, input: GetClaimsByCompanyInput): Promise<GetClaimsByCompanyIdResponse> => {
            const claims = await this.claimTransaction.getClaimsByCompanyId(companyId, input);
            if (!claims) {
                throw new Error("Claim not found");
            }
            return claims;
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
            // Uncomment to Generate PDF in a test file locally to see file output
            // await generatePdfToFile(claimData);
            // return { url: "test" };

            const pdfBuffer = await generatePdfToBuffer(claimData);

            const company = await this.companyTransaction.getCompanyById({ id: companyId });

            const s3 = new S3Service(this.db, this.documentTransaction);
            const timestamp = new Date().toISOString().split("T")[0];
            const documentId = `${company?.name}-Claim_Export-${timestamp}.pdf`;
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

    getClaimById = withServiceErrorHandling(
        async (claimId: string, companyId: string): Promise<GetClaimByIdResponse> => {
            const claim = await this.claimTransaction.getClaimById(claimId, companyId);
            if (!claim) {
                throw Boom.notFound("Claim not found");
            }
            return claim;
        }
    );

    updateClaimStatus = withServiceErrorHandling(
        async (
            claimId: string,
            payload: UpdateClaimStatusDTO,
            companyId: string
        ): Promise<UpdateClaimStatusResponse> => {
            const claim = await this.claimTransaction.updateClaimStatus(claimId, payload, companyId);
            if (!claim) {
                throw Boom.notFound("Claim not found or update failed");
            }
            return claim;
        }
    );
}
