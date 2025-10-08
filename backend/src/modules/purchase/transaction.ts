import { DataSource, DeepPartial, In, InsertResult } from "typeorm";
import Boom from "@hapi/boom";
import { CreateOrChangePurchaseDTO, GetCompanyPurchasesDTO } from "./types";
import { Purchase } from "../../entities/Purchase";

export interface IPurchaseTransaction {
    createOrUpdatePurchase(payload: CreateOrChangePurchaseDTO): Promise<Purchase[]>;
    getPurchase(id: string): Promise<Purchase>;
    getPurchasesForCompany(payload: GetCompanyPurchasesDTO): Promise<Purchase[]>;
}

export class PurchaseTransaction implements IPurchaseTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createOrUpdatePurchase(payload: CreateOrChangePurchaseDTO): Promise<Purchase[]> {
        const normalizePayload = payload.map((element) => ({
            ...element,
            id: element.purchaseId,
        }));

        const dbEntries = await this.db.manager.save(Purchase, normalizePayload);

        const newPurchaseIds = dbEntries.map((entry) => entry.id);
        return await this.db.manager.find(Purchase, {
            where: {
                id: In(newPurchaseIds),
            },
        });
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
        const { companyId, pageNumber, resultsPerPage } = payload;

        const numToSkip = resultsPerPage * pageNumber;
        return await this.db.manager.find(Purchase, {
            where: { companyId: companyId },
            skip: numToSkip,
            take: resultsPerPage,
        });
    }
}
