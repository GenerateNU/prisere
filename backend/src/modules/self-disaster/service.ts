import { CreateSelfDisasterDTO, CreateSelfDisasterResponse } from "./types";

import { withServiceErrorHandling } from "../../utilities/error";
import Boom from "@hapi/boom";
import { ISelfDisasterTransaction } from "./transaction";

export interface ISelfDisasterService {
    createSelfDisaster(payload: CreateSelfDisasterDTO, companyId: string): Promise<CreateSelfDisasterResponse>;
    deleteSelfDisaster(params: string, companyId: string): Promise<void>;
}

export class SelfDisasterService implements ISelfDisasterService {
    private disasterTransaction: ISelfDisasterTransaction;

    constructor(disasterTransaction: ISelfDisasterTransaction) {
        this.disasterTransaction = disasterTransaction;
    }

    createSelfDisaster = withServiceErrorHandling(
        async (payload: CreateSelfDisasterDTO, companyId: string): Promise<CreateSelfDisasterResponse> => {
            const newDisaster = await this.disasterTransaction.createSelfDisaster(payload, companyId);

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

    deleteSelfDisaster = withServiceErrorHandling(async (params: string, companyId: string): Promise<void> => {
        const deletedDisaster = await this.disasterTransaction.deleteSelfDisaster(params, companyId);

        if (!deletedDisaster) {
            throw Boom.internal("Deleting self disaster failed");
        }
    });
}
