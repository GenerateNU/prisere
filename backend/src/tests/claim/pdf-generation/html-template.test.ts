import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { ClaimData } from "../../../modules/claim/types";
import { buildClaimPdfHtml } from "../../../modules/claim/utilities/claim-pdf-html";

function normalizeHtml(html: string): string {
    return html
        .replace(/<!doctype/gi, "<!DOCTYPE")
        .replace(/\s*\/>/g, ">")
        .replace(/\s+/g, " ")
        .trim();
}

describe("buildClaimPdfHtml", () => {
    const mockClaimData: ClaimData = {
        user: {
            firstName: "John",
            lastName: "Doe",
            email: "john@test.com",
        },
        company: {
            name: "Test Company Inc.",
        },
        femaDisaster: {
            id: "fema-123",
            designatedIncidentTypes: "flooding,hurricane",
            declarationDate: new Date("2024-01-15"),
            incidentBeginDate: new Date("2024-01-10"),
            incidentEndDate: new Date("2024-01-20"),
        },
        impactedLocations: [
            {
                streetAddress: "123 Main St",
                city: "Boston",
                stateProvince: "MA",
                postalCode: "02101",
                country: "USA",
                county: "Suffolk",
            },
        ],
        relevantExpenses: [
            { description: "Emergency supplies", amountCents: 500.0 },
            { description: "Temporary housing", amountCents: 2000.0 },
        ],
        averageIncome: 75000.0,
        dateGenerated: new Date("2024-11-12"),
    };

    it("should match the expected FEMA disaster HTML", () => {
        const html = buildClaimPdfHtml(mockClaimData);
        const expectedHtml = readFileSync(join(__dirname, "__fixtures__", "fema-disaster-claim.html"), "utf-8");

        expect(normalizeHtml(html)).toBe(normalizeHtml(expectedHtml));
    });

    it("should match the expected self-declared disaster HTML", () => {
        const dataWithSelfDisaster: ClaimData = {
            ...mockClaimData,
            femaDisaster: undefined,
            selfDisaster: {
                description: "Office fire",
                startDate: new Date("2024-02-01"),
                endDate: new Date("2024-02-02"),
            },
        };

        const html = buildClaimPdfHtml(dataWithSelfDisaster);
        const expectedHtml = readFileSync(
            join(__dirname, "__fixtures__", "self-declared-disaster-claim.html"),
            "utf-8"
        );

        expect(normalizeHtml(html)).toBe(normalizeHtml(expectedHtml));
    });

    it("should match the expected missing email HTML", () => {
        const dataNoEmail: ClaimData = {
            ...mockClaimData,
            user: {
                ...mockClaimData.user,
                email: undefined,
            },
        };

        const html = buildClaimPdfHtml(dataNoEmail);
        const expectedHtml = readFileSync(join(__dirname, "__fixtures__", "missing-email-claim.html"), "utf-8");

        expect(normalizeHtml(html)).toBe(normalizeHtml(expectedHtml));
    });

    it("should match the expected missing FEMA dates HTML", () => {
        const dataWithMissingDates: ClaimData = {
            ...mockClaimData,
            femaDisaster: {
                id: "fema-456",
                designatedIncidentTypes: "tornado",
                declarationDate: new Date("2024-03-01"),
                incidentBeginDate: undefined,
                incidentEndDate: undefined,
            },
        };

        const html = buildClaimPdfHtml(dataWithMissingDates);
        const expectedHtml = readFileSync(join(__dirname, "__fixtures__", "missing-fema-dates-claim.html"), "utf-8");

        expect(normalizeHtml(html)).toBe(normalizeHtml(expectedHtml));
    });

    it("should match the expected multiple disasters HTML", () => {
        const dataWithMultipleDisasters: ClaimData = {
            ...mockClaimData,
            femaDisaster: {
                id: "fema-123",
                designatedIncidentTypes: "flooding",
                declarationDate: new Date("2024-01-15"),
                incidentBeginDate: new Date("2024-01-10"),
                incidentEndDate: new Date("2024-01-20"),
            },
            selfDisaster: {
                description: "Office fire",
                startDate: new Date("2024-02-01"),
                endDate: new Date("2024-02-02"),
            },
        };

        const html = buildClaimPdfHtml(dataWithMultipleDisasters);
        const expectedHtml = readFileSync(join(__dirname, "__fixtures__", "multiple-disasters-claim.html"), "utf-8");

        expect(normalizeHtml(html)).toBe(normalizeHtml(expectedHtml));
    });
});
