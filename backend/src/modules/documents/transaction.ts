import { DataSource } from "typeorm";
import { Document } from "../../entities/Document";
import { DocumentCategories, UpsertDocumentDTO } from "../../types/DocumentType";

export interface IDocumentTransaction {
    /**
     * Upset a document
     * @param payload Doc to be upserted into DB
     * @returns Promise of inserted Doc or null on failure
     */
    upsertDocument(payload: UpsertDocumentDTO): Promise<Document | null>;

    deleteDocumentRecord(documentId: string): Promise<void>;

    updateDocumentCategory(documentId: string, category: DocumentCategories): Promise<void>;
}

export class DocumentTransaction implements IDocumentTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async upsertDocument(payload: UpsertDocumentDTO): Promise<Document | null> {
        const repository = this.db.getRepository(Document);

        let document = await repository.findOne({ where: { s3DocumentId: payload.s3DocumentId } });

        if (document) {
            document.key = payload.key;
            document.downloadUrl = payload.downloadUrl;
            document.s3DocumentId = payload.s3DocumentId;
            document.category = payload.category || undefined;
            document.userId = payload.userId;
            document.companyId = payload.companyId;
            document.claimId = payload.claimId;
            document.lastModified = new Date();
        } else {
            document = repository.create({
                key: payload.key,
                downloadUrl: payload.downloadUrl,
                s3DocumentId: payload.s3DocumentId,
                category: payload.category || undefined,
                userId: payload.userId,
                companyId: payload.companyId,
                claimId: payload.claimId,
                createdAt: new Date(),
                lastModified: new Date(),
            });
        }

        return await repository.save(document);
    }

    async deleteDocumentRecord(documentId: string): Promise<void> {
        try {
            await this.db.manager.delete(Document, { id: documentId });
        } catch (error) {
            console.error(`Error deleting document record ${documentId}:`, error);
            throw error;
        }
    }

    async updateDocumentCategory(documentId: string, category: DocumentCategories): Promise<void> {
        try {
            const repository = this.db.getRepository(Document);
            await repository.update({ id: documentId }, { category: category });
        } catch (error) {
            console.error(`Error updating category for document ${documentId}:`, error);
            throw error;
        }
    }
}
