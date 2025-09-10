import { Hono } from "hono";
import { DataSource } from "typeorm";
import { userRoutes } from "./modules/user/route";
import { openApiRoutes } from "./modules/openapi/user-route";
import { swaggerUI } from '@hono/swagger-ui';

export const setUpRoutes = (
    app: Hono,
    db: DataSource,
) => {
    app.route("/users", userRoutes(db));

    const openApiApp = openApiRoutes(db);
    
    openApiApp.doc('/spec.json', {
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'User API',
        },
    });

    // Add Swagger UI
    openApiApp.get('/docs', swaggerUI({ url: '/openapi/spec.json' }));

    // Mount it
    app.route('/openapi', openApiApp);
};

