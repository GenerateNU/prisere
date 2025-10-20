import { FemaDisaster } from "../../entities/FemaDisaster";
import { IDisasterTransaction } from "./transaction";
import { withServiceErrorHandling } from "../../utilities/error";
import { CreateDisasterDTO } from "../../types/disaster";
import Boom from "@hapi/boom";

export interface IDisasterService {
    createDisaster(payload: CreateDisasterDTO): Promise<FemaDisaster>;
    getAllDisasters(): Promise<FemaDisaster[]>;
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
            throw Boom.internal("Creating Disaster failed");
        }

        return disaster;
    });

    getAllDisasters = withServiceErrorHandling(async (): Promise<FemaDisaster[]> => {
        const disasters = await this.disasterTransaction.getAllDisasters();
        return disasters;
    });
}
