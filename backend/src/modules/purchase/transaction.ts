import { DataSource } from "typeorm";
import Boom from "@hapi/boom";
import {
    CreateOrChangePurchaseDTO,
    GetCompanyPurchasesByDateDTO,
    GetCompanyPurchasesDTO,
    GetCompanyPurchasesInMonthBinsResponse,
} from "./types";
import { Purchase } from "../../entities/Purchase";
import { plainToInstance } from "class-transformer";

export interface IPurchaseTransaction {
    createOrUpdatePurchase(payload: CreateOrChangePurchaseDTO): Promise<Purchase[]>;
    getPurchase(id: string): Promise<Purchase>;
    getPurchasesForCompany(payload: GetCompanyPurchasesDTO): Promise<Purchase[]>;
    sumPurchasesByCompanyAndDateRange(payload: GetCompanyPurchasesByDateDTO): Promise<number>;
    sumPurchasesByCompanyInMonthBins(
        payload: GetCompanyPurchasesByDateDTO
    ): Promise<GetCompanyPurchasesInMonthBinsResponse>;
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
            .andWhere("purchase.quickbooksDateCreated BETWEEN :startDate AND :endDate", {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            })
            .andWhere("purchase.isRefund = FALSE")
            .getRawOne();

        const totalCents: number = summation?.total || 0;

        return totalCents;
    }

    async sumPurchasesByCompanyInMonthBins(
        payload: GetCompanyPurchasesByDateDTO
    ): Promise<GetCompanyPurchasesInMonthBinsResponse> {
        const { companyId, startDate, endDate } = payload;

        const results = await this.db
            .createQueryBuilder(Purchase, "purchase")
            .select([
                // used EXTRACT here rather than TO_CHAR because pg-mem does not support TO_CHAR
                "EXTRACT(YEAR FROM purchase.quickbooksDateCreated) as year",
                "EXTRACT(MONTH FROM purchase.quickbooksDateCreated) as month",
                "SUM(purchase.totalAmountCents) as total",
            ])
            .where({ companyId: companyId })
            .andWhere("purchase.quickbooksDateCreated BETWEEN :startDate AND :endDate", {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            })
            .andWhere("purchase.isRefund = FALSE")
            .groupBy(
                "EXTRACT(YEAR FROM purchase.quickbooksDateCreated), EXTRACT(MONTH FROM purchase.quickbooksDateCreated)"
            )
            .orderBy("year", "ASC")
            .addOrderBy("month", "ASC")
            .getRawMany();

        return results.map((row) => ({
            month: `${row.year}-${String(row.month).padStart(2, "0")}`,
            total: parseInt(row.total) || 0,
        }));
    }
}
