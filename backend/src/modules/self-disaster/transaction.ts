import { DataSource } from "typeorm";
import { CreateSelfDisasterDTO } from "./types";
import { SelfDeclaredDisaster } from "../../entities/SelfDisaster";
import { plainToClass } from "class-transformer";
import Boom from "@hapi/boom";

export interface ISelfDisasterTransaction {
    createSelfDisaster(payload: CreateSelfDisasterDTO, companyId: string): Promise<SelfDeclaredDisaster | null>;
    deleteSelfDisaster(params: string, companyId: string): Promise<SelfDeclaredDisaster | null>;
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
}
