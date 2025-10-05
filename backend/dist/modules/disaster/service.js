import { withServiceErrorHandling } from "../../utilities/error";
import Boom from "@hapi/boom";
export class DisasterService {
    disasterTransaction;
    constructor(disasterTransaction) {
        this.disasterTransaction = disasterTransaction;
    }
    createDisaster = withServiceErrorHandling(async (payload) => {
        const disaster = await this.disasterTransaction.createDisaster({
            ...payload,
        });
        if (!disaster) {
            throw Boom.internal("Creating Disaster failed");
        }
        return disaster;
    });
    getAllDisasters = withServiceErrorHandling(async () => {
        const disasters = await this.disasterTransaction.getAllDisasters();
        return disasters;
    });
}
