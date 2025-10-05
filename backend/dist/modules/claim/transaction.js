import { Claim } from "../../entities/Claim";
import { logMessageToFile } from "../../utilities/logger";
import { plainToClass } from "class-transformer";
export class ClaimTransaction {
    db;
    constructor(db) {
        this.db = db;
    }
    async createClaim(payload) {
        try {
            const claim = plainToClass(Claim, payload);
            const result = await this.db.getRepository(Claim).save(claim);
            return result;
        }
        catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }
    async getClaim(payload) {
        try {
            const result = await this.db.getRepository(Claim).findOneBy({ id: payload.id });
            return result;
        }
        catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }
    async deleteClaim(payload) {
        try {
            const result = await this.db.getRepository(Claim).delete({ id: payload.id });
            if (result.affected == 1) {
                return { id: payload.id };
            }
            else {
                // TypeORM does not throw an error if the enity to be deleted is not found
                logMessageToFile(`Transaction error: claim not found`);
                return null;
            }
        }
        catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }
}
