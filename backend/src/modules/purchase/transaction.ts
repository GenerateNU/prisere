import { DataSource } from "typeorm";
import Boom from "@hapi/boom";
import { CreatePurchaseDTO, GetCompanyPurchasesDTO, PatchPurchaseDTO } from "./types";
import { Purchase } from "../../entities/Purchase";
import { plainToClass } from "class-transformer";
import { Company } from "../../entities/Company";

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
        const newPurchase = plainToClass(Purchase, payload);

        const existingCompany = await this.db.manager.findOne(Company, {
            where: {
                id: payload.companyId,
            },
        });

        if (!existingCompany) {
            Boom.notFound("Unable to find the given company!");
        }

        const purchaseEntity = await this.db.manager.save(Purchase, newPurchase);

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
