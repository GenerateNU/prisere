import { paths } from "@/schema";

export enum DocumentTypes {
    CLAIM = "CLAIM",
    GENERAL_BUSINESS = "GENERAL_BUSINESS",
    IMAGE = "IMAGE"
}

// export type UploadPdfOptions = paths["/companies"]["post"]["responses"][201]["content"]["application/json"];
export type UploadedFileResponse = paths["/s3/confirmUpload"]["post"]["responses"][200]["content"]["application/json"];
export type PresignedUploadResponse = paths["/s3/getUploadUrl"]["post"]["responses"][200]["content"]["application/json"];
export type PdfListItemResponse = paths["/s3/getAllDocuments"]["get"]["responses"][200]["content"]["application/json"];