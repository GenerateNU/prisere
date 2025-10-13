import { Hono } from "hono";
import { DataSource } from "typeorm";
import { ClaimLocationTransaction, IClaimLocationTransaction } from "./transaction";
import { ClaimLocationService, IClaimLocationService } from "./service";
import { IClaimLocationController, ClaimLocationController } from "./controller";

export const claimLocationRoutes = (db: DataSource): Hono => {
    const claimLocation = new Hono();

    const claimLocationTransaction: IClaimLocationTransaction = new ClaimLocationTransaction(db);
    const claimLocationService: IClaimLocationService = new ClaimLocationService(claimLocationTransaction);
    const claimLocationController: IClaimLocationController = new ClaimLocationController(claimLocationService);

    claimLocation.post("/", (ctx) => claimLocationController.createClaimLocation(ctx));
    claimLocation.get("/company/:id", (ctx) => claimLocationController.getLocationsByCompanyId(ctx));
    claimLocation.delete("claim/:cid/location-address/:lid", (ctx) =>
        claimLocationController.deleteClaimLocationById(ctx)
    );

    return claimLocation;
};
