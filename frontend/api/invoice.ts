"use server";
import { authHeader, authWrapper, getClient } from "./client";
import { CreateInvoiceRequest, Invoice, TotalInvoiceSum } from "../types/invoice";
import { ServerActionResult } from "./types";

export const getAllInvoicesForCompany = async (
    pageNumber: number,
    resultsPerPage: number
): Promise<ServerActionResult<Invoice>> => {
    const req = async (token: string): Promise<ServerActionResult<Invoice>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/invoice", {
            params: {
                query: {
                    pageNumber: pageNumber,
                    resultsPerPage: resultsPerPage,
                },
            },
            headers: authHeader(token),
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to get invoices" };
        }
    };
    return authWrapper<ServerActionResult<Invoice>>()(req);
};

export const sumInvoicesByCompanyAndDateRange = async (
    startDate: Date,
    endDate: Date
): Promise<ServerActionResult<TotalInvoiceSum>> => {
    const req = async (token: string): Promise<ServerActionResult<TotalInvoiceSum>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/invoice/bulk/totalIncome", {
            headers: authHeader(token),
            params: {
                query: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                },
            },
        });

        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to sum invoices" };
        }
    };

    return authWrapper<ServerActionResult<TotalInvoiceSum>>()(req);
};

export const createInvoice = async (newLineItems: CreateInvoiceRequest): Promise<ServerActionResult<Invoice>> => {
    const req = async (token: string): Promise<ServerActionResult<Invoice>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/invoice/bulk", {
            body: newLineItems,
            headers: authHeader(token),
        });

        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to create invoice" };
        }
    };

    return authWrapper<ServerActionResult<Invoice>>()(req);
};
