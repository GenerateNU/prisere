import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import { addOpenApiUserRoutes } from "./user-route";

export const setUpOpenApiRoutes = (db: DataSource) => {
    const openApiApp = openApiRoutes(db);
    
    openApiApp.doc('/spec.json', {
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Prisere API',
        },
    });

    openApiApp.get('/docs', swaggerUI({ url: '/openapi/spec.json' }));
    return openApiApp
}; 


const openApiRoutes = (db: DataSource): OpenAPIHono => {
    const openApi = new OpenAPIHono();

    addOpenApiUserRoutes(openApi, db)
  
    return openApi;
};