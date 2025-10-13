import { writeFileSync } from "fs";
import { join } from "path";
import { AppDataSource } from "../typeorm-config";
import { setUpOpenApiRoutes } from "../modules/openapi/all-routes";

async function generateSpec() {
    const openApiApp = setUpOpenApiRoutes(AppDataSource);

    const spec = openApiApp.getOpenAPIDocument({
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "Prisere API",
        },
        servers: [
            {
                url: "/api",
            },
        ],
    });

    writeFileSync(join(process.cwd(), "./spec.json"), JSON.stringify(spec, null, 2));

    console.log("OpenAPI spec generated successfully!");
    process.exit(0);
}

generateSpec();
