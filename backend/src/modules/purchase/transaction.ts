import { DataSource } from "typeorm";
import Boom from "@hapi/boom";
import { CreateOrChangePurchaseDTO, GetCompanyPurchasesByDateDTO, GetCompanyPurchasesDTO } from "./types";
import { Purchase } from "../../entities/Purchase";
import { plainToInstance } from "class-transformer";

export interface IPurchaseTransaction {
    createOrUpdatePurchase(payload: CreateOrChangePurchaseDTO): Promise<Purchase[]>;
    getPurchase(id: string): Promise<Purchase>;
    getPurchasesForCompany(payload: GetCompanyPurchasesDTO): Promise<Purchase[]>;
    sumPurchasesByCompanyAndDateRange(payload: GetCompanyPurchasesByDateDTO): Promise<number>;
}

export class PurchaseTransaction implements IPurchaseTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createOrUpdatePurchase(payload: CreateOrChangePurchaseDTO): Promise<Purchase[]> {
        const normalizedPayload = payload.map((element) => plainToInstance(Purchase, element));

        return (
            await this.db
                .createQueryBuilder()
                .insert()
                .into(Purchase)
                .values(normalizedPayload)
                .orUpdate(["totalAmountCents", "isRefund", "quickbooksDateCreated"], ["quickBooksId", "companyId"])
                .returning("*")
                .execute()
        ).raw;
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

    async sumPurchasesByCompanyAndDateRange(payload: GetCompanyPurchasesByDateDTO): Promise<number> {
        const { companyId, startDate, endDate } = payload;

        const summation = await this.db
            .createQueryBuilder(Purchase, "purchase")
            .select("SUM(purchase.totalAmountCents)", "total")
            .where("purchase.companyId = :companyId", { companyId })
            .andWhere("purchase.dateCreated BETWEEN :startDate AND :endDate", {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            })
            .getRawOne();

        const totalCents: number = summation?.total || 0;

        return totalCents;
    }
}
