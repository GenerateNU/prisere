import Boom from "@hapi/boom";
import { plainToInstance } from "class-transformer";
import { Brackets, DataSource } from "typeorm";
import { Purchase } from "../../entities/Purchase";
import {
    CreateOrChangePurchaseDTO,
    GetCompanyPurchasesByDateDTO,
    GetCompanyPurchasesDTO,
    GetCompanyPurchasesInMonthBinsResponse,
} from "./types";

export interface IPurchaseTransaction {
    createOrUpdatePurchase(payload: CreateOrChangePurchaseDTO): Promise<Purchase[]>;
    getPurchase(id: string): Promise<Purchase>;
    getPurchasesForCompany(payload: GetCompanyPurchasesDTO): Promise<Purchase[]>;
    sumPurchasesByCompanyAndDateRange(payload: GetCompanyPurchasesByDateDTO): Promise<number>;
    sumPurchasesByCompanyInMonthBins(
        payload: GetCompanyPurchasesByDateDTO
    ): Promise<GetCompanyPurchasesInMonthBinsResponse>;
    getPurchaseCategoriesForCompany(companyId: string): Promise<string[]>;
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
                .orUpdate(
                    ["totalAmountCents", "isRefund", "quickbooksDateCreated", "vendor"],
                    ["quickBooksId", "companyId"]
                )
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
        const { companyId, pageNumber, resultsPerPage, categories, type, dateFrom, dateTo, search, sortBy, sortOrder } =
            payload;

        const numToSkip = resultsPerPage * pageNumber;
        const sortColumnMap: Record<string, string> = {
            date: "p.dateCreated",
            totalAmountCents: "p.totalAmountCents",
        };

        const queryBuilder = this.db.manager.createQueryBuilder(Purchase, "p");
        queryBuilder.where("p.companyId = :companyId", { companyId });

        if (categories && categories.length > 0) {
            queryBuilder.andWhere((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select("li_sub.purchaseId")
                    .from("purchase_line_item", "li_sub")
                    .where("li_sub.category IN (:...categories)", { categories })
                    .getQuery();
                return `p.id IN ${subQuery}`;
            });
        }

        if (type !== undefined) {
            queryBuilder.andWhere((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select("li_sub.purchaseId")
                    .from("purchase_line_item", "li_sub")
                    .where("li_sub.type = :type", { type })
                    .getQuery();
                return `p.id IN ${subQuery}`;
            });
        }

        if (dateFrom && dateTo) {
            queryBuilder.andWhere("p.dateCreated BETWEEN :dateFrom AND :dateTo", { dateFrom, dateTo });
        }

        if (search) {
            queryBuilder.andWhere((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select("li_sub.purchaseId")
                    .from("purchase_line_item", "li_sub")
                    .where("(li_sub.description ILIKE :search OR li_sub.category ILIKE :search)", {
                        search: `%${search}%`,
                    })
                    .getQuery();
                return `(p.id IN ${subQuery} OR p.vendor ILIKE :search)`;
            });
        }

        if (sortBy && sortOrder && sortColumnMap[sortBy]) {
            queryBuilder.orderBy(sortColumnMap[sortBy], sortOrder);
        }

        const idRows = await queryBuilder.skip(numToSkip).take(resultsPerPage).getMany();
        const ids = idRows.map((row) => row.id);
        if (ids.length === 0) {
            return [];
        }

        const queryBuilderForIds = this.db.manager
            .createQueryBuilder(Purchase, "p")
            .leftJoinAndSelect("p.lineItems", "li")
            .where("p.id IN (:...ids)", { ids });

        if (sortBy && sortOrder && sortColumnMap[sortBy]) {
            queryBuilderForIds.orderBy(sortColumnMap[sortBy], sortOrder);
        }
        // to guarantee that line items do not move in the table rows
        queryBuilderForIds.addOrderBy("li.dateCreated", "ASC");
        return await queryBuilderForIds.getMany();
    }

    async sumPurchasesByCompanyAndDateRange(payload: GetCompanyPurchasesByDateDTO): Promise<number> {
        const { companyId, startDate, endDate } = payload;

        const summation = await this.db
            .createQueryBuilder(Purchase, "purchase")
            .select("SUM(purchase.totalAmountCents)", "total")
            .where("purchase.companyId = :companyId", { companyId })
            .andWhere(
                new Brackets((qb) => {
                    qb.where("purchase.quickbooksDateCreated BETWEEN :startDate AND :endDate", {
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                    }).orWhere(
                        "purchase.quickbooksDateCreated IS NULL AND purchase.dateCreated BETWEEN :startDate AND :endDate",
                        {
                            startDate: new Date(startDate),
                            endDate: new Date(endDate),
                        }
                    );
                })
            )
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

    async getPurchaseCategoriesForCompany(companyId: string): Promise<string[]> {
        const categories = await this.db
            .createQueryBuilder(Purchase, "purchase")
            .where("purchase.companyId = :companyId", { companyId })
            .leftJoinAndSelect("purchase.lineItems", "lineItems")
            .getMany()
            .then((purchases) =>
                purchases.flatMap((p) => p.lineItems?.map((lineItem) => lineItem.category ?? null) ?? [])
            );

        return [...new Set(categories.filter((cat): cat is string => cat !== null))];
    }
}
