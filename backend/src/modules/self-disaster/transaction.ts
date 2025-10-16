import { DataSource } from "typeorm";
import { CreateSelfDisasterDTO } from "./types";
import { SelfDeclaredDisaster } from "../../entities/SelfDisaster";
import { plainToClass } from "class-transformer";
import Boom from "@hapi/boom";

export interface ISelfDisasterTransaction {
    createSelfDisaster(payload: CreateSelfDisasterDTO): Promise<SelfDeclaredDisaster | null>;
    deleteSelfDisaster(params: string): Promise<SelfDeclaredDisaster | null>;
}

export class SelfDisasterTransaction implements ISelfDisasterTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createSelfDisaster(payload: CreateSelfDisasterDTO) {
        const result = await this.db.manager.save(SelfDeclaredDisaster, plainToClass(SelfDeclaredDisaster, payload));

        return await this.db.manager.findOneBy(SelfDeclaredDisaster, { id: result.id });
    }

    async deleteSelfDisaster(params: string) {
        const givenDisaster = await this.db.manager.findOneBy(SelfDeclaredDisaster, { id: params });

        //Check if exists first
        if (!givenDisaster) {
            throw Boom.notFound("The given disaster must exist");
        }

        return await this.db.manager.remove(givenDisaster);
    }
}
