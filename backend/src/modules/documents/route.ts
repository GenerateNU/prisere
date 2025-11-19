import { DataSource } from "typeorm";
import { Hono } from "hono";
import { DocumentTransaction, IDocumentTransaction } from "./transaction";
import { DocumentService, IDocumentService } from "./service";
import { DocumentController, IDocumentController } from "./controller";

export const documentRoutes = (db: DataSource): Hono => {
    const documents = new Hono();

    const documentTransaction: IDocumentTransaction = new DocumentTransaction(db);
    const documentService: IDocumentService = new DocumentService(documentTransaction);
    const documentController: IDocumentController = new DocumentController(documentService);

    documents.post("/upsert", (ctx) => documentController.upsertDocument(ctx));

    return documents;
};