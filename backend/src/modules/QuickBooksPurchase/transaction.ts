import { Company } from "../../entities/Company";
import { CreateCompanyDTO, GetCompanyByIdDTO, UpdateQuickBooksImportTimeDTO } from "../../types/Company";
import { DataSource, InsertResult } from "typeorm";
import Boom, { paymentRequired } from "@hapi/boom";
import { logMessageToFile } from "../../utilities/logger";
import { validate } from "uuid";
import {
    CreateQuickBooksPurchaseDTO,
    CreateQuickBooksPurchaseResponse,
    GetCompanyQuickBooksPurchasesDTO,
    GetCompanyQuickBooksPurchasesResponse,
    GetQuickBooksPurchaseResponse,
    PatchQuickBooksPurchaseDTO,
    PatchQuickBooksPurchasesResponse,
} from "./types";
import { TypedResponse } from "hono/types";
import { QuickBooksPurchase } from "../../entities/QuickBooksPurchase";
import { plainToClass } from "class-transformer";

export interface IQuickBooksPurchaseTransaction {
    updateQuickBooksPurchase(id: string, payload: PatchQuickBooksPurchaseDTO): Promise<QuickBooksPurchase>;
    createQuickBooksPurchase(payload: CreateQuickBooksPurchaseDTO): Promise<QuickBooksPurchase>;
    getQuickBooksPurchase(id: string): Promise<QuickBooksPurchase>;
    getQuickBooksPurchasesForCompany(payload: GetCompanyQuickBooksPurchasesDTO): Promise<QuickBooksPurchase[]>;
}

export class QuickBooksPurchaseTransaction implements IQuickBooksPurchaseTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async updateQuickBooksPurchase(id: string, payload: PatchQuickBooksPurchaseDTO): Promise<QuickBooksPurchase> {
        const existingQBPurchase = await this.getQuickBooksPurchase(id);

        const newQBPurchase = {
            ...existingQBPurchase,
            ...payload,
        };

        const dbEntry: QuickBooksPurchase = await this.db.manager.save(QuickBooksPurchase, newQBPurchase);

        return dbEntry;
    }

    async createQuickBooksPurchase(payload: CreateQuickBooksPurchaseDTO): Promise<QuickBooksPurchase> {
        const newQBPurchase = plainToClass(QuickBooksPurchase, payload);
        const purchaseEntity = await this.db.manager.save(QuickBooksPurchase, newQBPurchase);

        return purchaseEntity;
    }

    async getQuickBooksPurchase(id: string): Promise<QuickBooksPurchase> {
        const existingQBPurchase = await this.db.manager.findOne(QuickBooksPurchase, {
            where: {
                id: id,
            },
        });

        if (!existingQBPurchase) {
            throw Boom.notFound(`There does not exist any Quick Books Purchases with the ID: ${id}`);
        }

        return existingQBPurchase;
    }
    async getQuickBooksPurchasesForCompany(payload: GetCompanyQuickBooksPurchasesDTO): Promise<QuickBooksPurchase[]> {
        const { pageNumber, resultsPerPage } = payload;
        const numToSkip = resultsPerPage * pageNumber;
        return await this.db.manager.find(QuickBooksPurchase, {
            skip: numToSkip,
            take: resultsPerPage,
        });
    }
}
