import { paths } from "@/schema";

export type DocumentResponse =
    paths["/s3/getAllDocuments"]["get"]["responses"][200]["content"]["application/json"][number]; // Get single item from array

export type UploadedFileResponse = paths["/s3/confirmUpload"]["post"]["responses"][200]["content"]["application/json"];

export type PresignedUploadResponse =
    paths["/s3/getUploadUrl"]["post"]["responses"][200]["content"]["application/json"];

export type GetAllDocumentsResponse =
    paths["/s3/getAllDocuments"]["get"]["responses"][200]["content"]["application/json"];

export type ConfirmUploadRequest = NonNullable<paths["/claims"]["post"]["requestBody"]>["content"]["application/json"];

export type GetUploadUrlRequest = NonNullable<paths["/claims"]["post"]["requestBody"]>["content"]["application/json"];

export type UpdateDocumentCategoryRequest = NonNullable<
    paths["/claims"]["post"]["requestBody"]
>["content"]["application/json"];

export type DeleteDocumentRequest = NonNullable<paths["/claims"]["post"]["requestBody"]>["content"]["application/json"];

export enum DocumentTypes {
    CLAIM = "CLAIM",
    GENERAL_BUSINESS = "GENERAL_BUSINESS",
    IMAGES = "IMAGES",
}

export enum DocumentCategories {
    Expenses = "Expenses",
    Revenues = "Revenues",
    Insurance = "Insurance",
    Other = "Other",
}

export type BusinessDocument = {
    title: string;
    fileType: string;
    category: DocumentCategories | "" | null;
    date: Date;
    documentId: string;
    key: string;
    url: string;
    size: number;
};

export type DocumentWithDates = Omit<DocumentResponse, "createdAt" | "lastModified"> & {
    createdAt?: Date;
    lastModified?: Date | null;
};
