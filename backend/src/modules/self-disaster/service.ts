import {
    CreateSelfDisasterDTO,
    CreateSelfDisasterResponse,
    UpdateSelfDisasterDTO,
    UpdateSelfDisasterResponse,
} from "./types";

import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
import { ISelfDisasterTransaction } from "./transaction";

export interface ISelfDisasterService {
    createSelfDisaster(payload: CreateSelfDisasterDTO, companyId: string): Promise<CreateSelfDisasterResponse>;
    deleteSelfDisaster(params: string, companyId: string): Promise<void>;
    updateSelfDisaster(
        id: string,
        payload: UpdateSelfDisasterDTO,
        companyId: string
    ): Promise<UpdateSelfDisasterResponse>;
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

    updateSelfDisaster = withServiceErrorHandling(
        async (id: string, payload: UpdateSelfDisasterDTO, companyId: string): Promise<UpdateSelfDisasterResponse> => {
            const updatedDisaster = await this.disasterTransaction.updateSelfDisaster(id, payload, companyId);

            if (!updatedDisaster) {
                throw Boom.internal("Updating disaster failed");
            }

            return {
                ...updatedDisaster,
                startDate: updatedDisaster.startDate.toISOString(),
                endDate: updatedDisaster.endDate?.toISOString(),
                updatedAt: updatedDisaster.updatedAt.toISOString(),
                createdAt: updatedDisaster.createdAt.toISOString(),
            };
        }
    );
}
