import { Context, TypedResponse } from "hono";
import { IDocumentService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { DocumentResponse, UpsertDocumentDTO } from "../../types/DocumentType";
import { Document } from "../../entities/Document";

export interface IDocumentController {
    upsertDocument(ctx: Context): Promise<TypedResponse<DocumentResponse | { error: string }> | Response>;
}

export class DocumentController implements IDocumentController {
    private documentService: IDocumentService;

    constructor(service: IDocumentService) {
        this.documentService = service;
    }

    upsertDocument = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<DocumentResponse | { error: string }>> => {
            const json = await ctx.req.json();

            try {
                const payload: UpsertDocumentDTO = json;

                const document = await this.documentService.upsertDocument(payload); 
                return ctx.json(document, 200);
            } catch (error) {
                return ctx.json({ error: "Failed to upsert document" }, 400);
            }
        }
    );
}