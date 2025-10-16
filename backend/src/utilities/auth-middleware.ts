import jwt from "jsonwebtoken";
import { Context, Next } from "hono";
import { config } from "dotenv";
import { validate } from "uuid";
import crypto from "crypto";
config({ path: ".env" });

interface DecodedToken extends jwt.JwtPayload {
    app_metadata?: {
        company_id?: string;
    };
}

const jwk = JSON.parse(
    process.env.NODE_ENV === "production"
        ? process.env.SUPABASE_PUBLIC_AUTH_KEY!
        : process.env.SUPABASE_PUBLIC_AUTH_KEY_DEV!
);

console.log(process.env.SUPABASE_PUBLIC_AUTH_KEY!)

export const isAuthorized = () => {
    return async (ctx: Context, next: Next) => {
        process.env.SUPABASE_JWT_SECRET="super-secret-jwt-token-with-at-least-32-characters-long"
        process.env.SUPABASE_JWT_SECRET_DEV="super-secret-jwt-token-with-at-least-32-characters-long"
        const header = ctx.req.header("Authorization");
        if (!header) {
            console.log("No header found")
            return ctx.json({ error: "User is not authenticated" }, 401);
        }
        const token = header.split(" ")[1];
        console.log("TOKEN : ", token);
        
        try {
            // decode the token to check its algorithm
            const decoded = jwt.decode(token, { complete: true });
            console.log("Token algorithm from header:", decoded?.header.alg);
            
            // Check if the token algorithm matches what we expect
            if (decoded?.header.alg === "HS256") {
                // Add debugging for environment variables
                console.log("NODE_ENV:", process.env.NODE_ENV);
                console.log("SUPABASE_JWT_SECRET exists:", !!process.env.SUPABASE_JWT_SECRET);
                console.log("SUPABASE_JWT_SECRET_DEV exists:", !!process.env.SUPABASE_JWT_SECRET_DEV);
                console.log("SUPABASE_JWT_SECRET length:", process.env.SUPABASE_JWT_SECRET?.length || 0);
                console.log("SUPABASE_JWT_SECRET_DEV length:", process.env.SUPABASE_JWT_SECRET_DEV?.length || 0);
                
                // For HS256, use the JWT secret directly (not JWK)
                const secret = process.env.NODE_ENV === "production"
                    ? process.env.SUPABASE_JWT_SECRET!
                    : process.env.SUPABASE_JWT_SECRET_DEV!;
                
                console.log("Selected secret exists:", !!secret);
                console.log("Selected secret length:", secret?.length || 0);
                
                if (!secret) {
                    console.error("No JWT secret found! Check your .env file");
                    return ctx.json({ error: "Server configuration error" }, 500);
                }
                    
                const verified = jwt.verify(token, secret, { algorithms: ["HS256"] }) as DecodedToken;
                console.log("Token verified with HS256");
                
                if (!verified.sub || !validate(verified.sub)) {
                    console.log("User not authenticated - invalid sub")
                    return ctx.json({ error: "User is not authenticated" }, 401);
                }
                ctx.set("userId", verified.sub);
                ctx.set("companyId", verified.app_metadata?.company_id);
                await next();
                
            } else if (decoded?.header.alg === "ES256") {
                // For ES256, use the JWK
                const publicKey = crypto.createPublicKey({
                    key: jwk,
                    format: "jwk",
                });
                const verified = jwt.verify(token, publicKey, { algorithms: ["ES256"] }) as DecodedToken;
                console.log("Token verified with ES256");
                
                if (!verified.sub || !validate(verified.sub)) {
                    console.log("User not authenticated - invalid sub")
                    return ctx.json({ error: "User is not authenticated" }, 401);
                }
                ctx.set("userId", verified.sub);
                ctx.set("companyId", verified.app_metadata?.company_id);
                await next();
                
            } else {
                console.error("Unsupported token algorithm:", decoded?.header.alg);
                return ctx.json({ error: "Unsupported token algorithm" }, 401);
            }
            
        } catch (error) {
            console.log("Caught error in JWT verification");
            console.error("=== JWT Verification Error ===");
            console.error("Error type:", error.constructor.name);
            console.error("Error message:", error.message);
            
            if (error instanceof jwt.JsonWebTokenError) {
                console.error("JWT Error details:", {
                    name: error.name,
                    message: error.message,
                });
            }
            
            if (error instanceof jwt.TokenExpiredError) {
                console.error("Token expired at:", error.expiredAt);
            }
            
            if (error instanceof jwt.NotBeforeError) {
                console.error("Token not active until:", error.date);
            }
            
            console.error("Full error stack:", error.stack);
            
            console.error("Environment:", process.env.NODE_ENV);
            console.error("Using production key:", process.env.NODE_ENV === "production");
            
            return ctx.json({ error: "Unauthorized" }, 401);
        }
    };
};

// import jwt from "jsonwebtoken";
// import { Context, Next } from "hono";
// import { config } from "dotenv";
// import { validate } from "uuid";
// import crypto from "crypto";
// config({ path: ".env" });

// interface DecodedToken extends jwt.JwtPayload {
//     app_metadata?: {
//         company_id?: string;
//     };
// }

// const jwk = JSON.parse(
//     process.env.NODE_ENV === "producion"
//         ? process.env.SUPABASE_PUBLIC_AUTH_KEY!
//         : process.env.SUPABASE_PUBLIC_AUTH_KEY_DEV!
// );

// /**
//  *
//  * @param jwtSecretKey
//  * @returns
//  * CREDIT: Inspiration taken from https://github.com/GenerateNU/dearly/blob/main/backend/src/middlewares/auth.ts#L16
//  */
// export const isAuthorized = () => {
//     return async (ctx: Context, next: Next) => {
//         const header = ctx.req.header("Authorization");
//         if (!header) {
//             return ctx.json({ error: "User is not authenticated" }, 401);
//         }
//         const token = header.split(" ")[1];
//         try {
//             const publicKey = crypto.createPublicKey({
//                 key: jwk,
//                 format: "jwk",
//             });
//             const decrypted = jwt.verify(token, publicKey, { algorithms: ["ES256"] }) as DecodedToken;
//             if (!decrypted.sub || !validate(decrypted.sub)) {
//                 return ctx.json({ error: "User is not authenticated" }, 401);
//             }
//             ctx.set("userId", decrypted.sub);
//             ctx.set("companyId", decrypted.app_metadata?.company_id);
//             await next();
//         } catch {
//             return ctx.json({ error: "Unauthorized" }, 401);
//         }
//     };
// };
