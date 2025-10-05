import { Company } from "../../entities/Company";
import { CreateCompanyDTO, GetCompanyByIdDTO, UpdateQuickBooksImportTimeDTO } from "../../types/Company";
import { DataSource, InsertResult } from "typeorm";
import Boom, { paymentRequired } from "@hapi/boom";
import { logMessageToFile } from "../../utilities/logger";
import { validate } from "uuid";
import {
    CreatePurchaseDTO,
    CreatePurchaseResponse,
    GetCompanyPurchasesDTO,
    GetCompanyPurchasesResponse,
    GetPurchaseResponse,
    PatchPurchaseDTO,
    PatchPurchasesResponse,
} from "./types";
import { TypedResponse } from "hono/types";
import { Purchase } from "../../entities/Purchase";
import { plainToClass } from "class-transformer";

export interface IPurchaseTransaction {
    updatePurchase(id: string, payload: PatchPurchaseDTO): Promise<Purchase>;
    createPurchase(payload: CreatePurchaseDTO): Promise<Purchase>;
    getPurchase(id: string): Promise<Purchase>;
    getPurchasesForCompany(payload: GetCompanyPurchasesDTO): Promise<Purchase[]>;
}

export class PurchaseTransaction implements IPurchaseTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async updatePurchase(id: string, payload: PatchPurchaseDTO): Promise<Purchase> {
        const existingQBPurchase = await this.getPurchase(id);

        const newQBPurchase = {
            ...existingQBPurchase,
            ...payload,
        };

        const dbEntry: Purchase = await this.db.manager.save(Purchase, newQBPurchase);

        return dbEntry;
    }

    async createPurchase(payload: CreatePurchaseDTO): Promise<Purchase> {
        const newQBPurchase = plainToClass(Purchase, payload);
        const purchaseEntity = await this.db.manager.save(Purchase, newQBPurchase);

        return purchaseEntity;
    }

    async getPurchase(id: string): Promise<Purchase> {
        const existingQBPurchase = await this.db.manager.findOne(Purchase, {
            where: {
                id: id,
            },
        });

        if (!existingQBPurchase) {
            throw Boom.notFound(`There does not exist any Quick Books Purchases with the ID: ${id}`);
        }

        return existingQBPurchase;
    }
    async getPurchasesForCompany(payload: GetCompanyPurchasesDTO): Promise<Purchase[]> {
        const { pageNumber, resultsPerPage } = payload;
        const numToSkip = resultsPerPage * pageNumber;
        return await this.db.manager.find(Purchase, {
            skip: numToSkip,
            take: resultsPerPage,
        });
    }
}
