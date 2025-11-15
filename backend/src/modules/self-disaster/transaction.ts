import Boom from "@hapi/boom";
import { plainToClass } from "class-transformer";
import { DataSource } from "typeorm";
import { SelfDeclaredDisaster } from "../../entities/SelfDisaster";
import { CreateSelfDisasterDTO, UpdateSelfDisasterDTO } from "./types";

export interface ISelfDisasterTransaction {
    createSelfDisaster(payload: CreateSelfDisasterDTO, companyId: string): Promise<SelfDeclaredDisaster | null>;
    deleteSelfDisaster(params: string, companyId: string): Promise<SelfDeclaredDisaster | null>;
    updateSelfDisaster(
        id: string,
        payload: UpdateSelfDisasterDTO,
        companyId: string
    ): Promise<SelfDeclaredDisaster | null>;
}

export class SelfDisasterTransaction implements ISelfDisasterTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createSelfDisaster(payload: CreateSelfDisasterDTO, companyId: string) {
        const result = await this.db.manager.save(
            SelfDeclaredDisaster,
            plainToClass(SelfDeclaredDisaster, { ...payload, companyId: companyId })
        );

        return await this.db.manager.findOneBy(SelfDeclaredDisaster, { id: result.id });
    }

    async deleteSelfDisaster(params: string, companyId: string) {
        const givenDisaster = await this.db.manager.findOneBy(SelfDeclaredDisaster, {
            id: params,
            companyId: companyId,
        });

        //Check if exists first
        if (!givenDisaster) {
            throw Boom.notFound("The given disaster must exist");
        }

        return await this.db.manager.remove(givenDisaster);
    }

    async updateSelfDisaster(id: string, payload: UpdateSelfDisasterDTO, companyId: string) {
        const disaster = await this.db.manager.findOneBy(SelfDeclaredDisaster, {
            id: id,
            companyId: companyId,
        });

        if (!disaster) {
            throw Boom.notFound("The given disaster does not exist");
        }

        // Update only provided fields
        if (payload.name !== undefined) {
            disaster.name = payload.name;
        }
        if (payload.description !== undefined) {
            disaster.description = payload.description;
        }
        if (payload.startDate !== undefined) {
            disaster.startDate = new Date(payload.startDate);
        }
        if (payload.endDate !== undefined) {
            disaster.endDate = new Date(payload.endDate);
        }

        const result = await this.db.manager.save(SelfDeclaredDisaster, disaster);

        return await this.db.manager.findOneBy(SelfDeclaredDisaster, { id: result.id });
    }
}
