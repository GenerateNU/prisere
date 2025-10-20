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

/**
 *
 * @param jwtSecretKey
 * @returns
 * CREDIT: Inspiration taken from https://github.com/GenerateNU/dearly/blob/main/backend/src/middlewares/auth.ts#L16
 */
export const isAuthorized = () => {
    return async (ctx: Context, next: Next) => {
        const header = ctx.req.header("Authorization");
        if (!header) {
            return ctx.json({ error: "User is not authenticated" }, 401);
        }
        const token = header.split(" ")[1];
        try {
            const publicKey = crypto.createPublicKey({
                key: jwk,
                format: "jwk",
            });
            const decrypted = jwt.verify(token, publicKey, { algorithms: ["ES256"] }) as DecodedToken;
            if (!decrypted.sub || !validate(decrypted.sub)) {
                return ctx.json({ error: "User is not authenticated" }, 401);
            }
            ctx.set("userId", decrypted.sub);
            ctx.set("companyId", decrypted.app_metadata?.company_id);
            await next();
        } catch {
            return ctx.json({ error: "Unauthorized" }, 401);
        }
    };
};
