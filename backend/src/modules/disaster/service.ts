import { CreateDisasterDTO } from "../../types/FemaDisaster";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { IDisasterTransaction} from "./transaction";
import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";

export interface IDisasterService {
    createDisaster(payload: CreateDisasterDTO): Promise<FemaDisaster>;
}


export class DisasterService implements IDisasterService {
    private disasterTransaction: IDisasterTransaction;

    constructor(disasterTransaction: IDisasterTransaction) {
        this.disasterTransaction = disasterTransaction;
    }

    createDisaster = withServiceErrorHandling(async (payload: CreateDisasterDTO): Promise<FemaDisaster> => {
        const disaster = await this.disasterTransaction.createDisaster({
            ...payload,
        });
        if (!disaster) {
            throw Boom.internal("Creating Disaster Failed")
        }
        return disaster;
    });
}
