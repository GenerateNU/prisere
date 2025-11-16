import { Hono } from "hono";
import { S3Controller } from "./controller";
import { S3Service } from "./service";
import { DataSource } from "typeorm";

export function s3Routes(db: DataSource) {
    const router = new Hono();
    const s3Service = new S3Service(db);
    const s3Controller = new S3Controller(s3Service);

    router.post("/getUploadUrl", (ctx) => s3Controller.getUploadUrl(ctx));
    router.post("/confirmUpload", (ctx) => s3Controller.confirmUpload(ctx));
    router.get("/getAllDocuments", (ctx) => s3Controller.getAllDocuments(ctx));

    return router;
}