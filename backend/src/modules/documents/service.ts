import Boom from "@hapi/boom";
import { Document } from "../../entities/Document";
import { UpsertDocumentDTO } from "../../types/DocumentType";
import { withServiceErrorHandling } from "../../utilities/error";
import { IDocumentTransaction } from "./transaction";

export interface IDocumentService {
    upsertDocument(payload: UpsertDocumentDTO): Promise<Document>;
}

export class DocumentService implements IDocumentService {
    private documentTransaction: IDocumentTransaction;

    constructor(documentTransaction: IDocumentTransaction) {
        this.documentTransaction = documentTransaction;
    }

    upsertDocument = withServiceErrorHandling(async (payload: UpsertDocumentDTO): Promise<Document> => {
        const document = await this.documentTransaction.upsertDocument(payload);
        if (!document) {
            throw Boom.notFound("Document could not be upserted");
        }
        return document;
    });
}
