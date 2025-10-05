import { FemaDisaster } from "../../entities/FemaDisaster";
export class DisasterTransaction {
    db;
    constructor(db) {
        this.db = db;
    }
    async createDisaster(payload) {
        const disaster = payload;
        const result = await this.db.getRepository(FemaDisaster).save(disaster);
        return result;
    }
    async getAllDisasters() {
        const result = await this.db.getRepository(FemaDisaster).find();
        return result;
    }
}
