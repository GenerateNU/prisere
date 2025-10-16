import {
    CreateSelfDisasterDTO,
    CreateSelfDisasterResponse,
    GetDisastersForCompanyDTO,
    GetDisastersForCompanyResponse,
} from "./types";

import { withServiceErrorHandling } from "../../utilities/error";
import Boom from "@hapi/boom";
import { ISelfDisasterTransaction } from "./transaction";

export interface ISelfDisasterService {
    createSelfDisaster(payload: CreateSelfDisasterDTO): Promise<CreateSelfDisasterResponse>;
    deleteSelfDisaster(params: string): Promise<void>;
}

export class SelfDisasterService implements ISelfDisasterService {
    private disasterTransaction: ISelfDisasterTransaction;

    constructor(disasterTransaction: ISelfDisasterTransaction) {
        this.disasterTransaction = disasterTransaction;
    }

    createSelfDisaster = withServiceErrorHandling(
        async (payload: CreateSelfDisasterDTO): Promise<CreateSelfDisasterResponse> => {
            const newDisaster = await this.disasterTransaction.createSelfDisaster(payload);

            if (!newDisaster) {
                throw Boom.internal("Creating Disaster failed");
            }

            return {
                ...newDisaster,
                startDate: newDisaster.startDate.toISOString(),
                endDate: newDisaster.endDate?.toISOString(),
                updatedAt: newDisaster.updatedAt.toISOString(),
                createdAt: newDisaster.createdAt.toISOString(),
            };
        }
    );

    deleteSelfDisaster = withServiceErrorHandling(async (params: string): Promise<void> => {
        const deletedDisaster = await this.disasterTransaction.deleteSelfDisaster(params);

        if (!deletedDisaster) {
            throw Boom.internal("Deleting self disaster failed");
        }
    });
}
