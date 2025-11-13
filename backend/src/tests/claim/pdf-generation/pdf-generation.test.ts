import { describe, it, expect } from "bun:test";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { PDFParse } from "pdf-parse";
import { buildClaimPdfHtml } from "../../../modules/claim/utilities/claim-pdf-html";
import { ClaimData } from "../../../modules/claim/types";
import { generatePDFfromHTML } from "../../../modules/claim/utilities/puppeteer-handler";

describe('generatePDFfromHTML', () => {

    it('should generate a viewable PDF: it is in test-outputs dir', async () => {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Test PDF</title>
            </head>
            <body>
                <h1>Test Claim Report</h1>
                <h2>Company Information</h2>
                <p>Name: Test Company Inc.</p>
                
                <h2>User Information</h2>
                <p>First Name: John</p>
                <p>Last Name: Doe</p>
                
                <h2>Expenses</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Emergency supplies</td>
                            <td>$500.00</td>
                        </tr>
                        <tr>
                            <td>Temporary housing</td>
                            <td>$2000.00</td>
                        </tr>
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const pdfBuffer = await generatePDFfromHTML(html);

        const outputDir = join(__dirname, 'test-outputs');
        mkdirSync(outputDir, { recursive: true });

        const filePath = join(outputDir, 'test-generated.pdf');
        writeFileSync(filePath, pdfBuffer);

        expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
        expect(pdfBuffer.length).toBeGreaterThan(0);
    }, 10000);


    describe('Content Verification', () => {

        it('should contain the text from HTML in the PDF', async () => {
            const html = `
                <!DOCTYPE html>
                <html>
                <body>
                    <h1>Claim Report</h1>
                    <p>Test Company Inc.</p>
                    <p>Emergency supplies: $500.00</p>
                </body>
                </html>
            `;

            const pdfBuffer = await generatePDFfromHTML(html);
            const uint8Array = new Uint8Array(pdfBuffer);
            const pdfData = await new PDFParse(uint8Array).getText();

            expect(pdfData.text).toContain('Claim Report');
            expect(pdfData.text).toContain('Test Company Inc.');
            expect(pdfData.text).toContain('Emergency supplies');
            expect(pdfData.text).toContain('$500.00');
        }, 10000);

        it('should handle HTML with special characters', async () => {
            const htmlWithSpecialChars = `
                <!DOCTYPE html>
                <html>
                <body>
                    <p>Special chars: & < > " ' é ñ</p>
                    <p>Currency: $500.00 €200.00</p>
                </body>
                </html>
            `;

            const pdfBuffer = await generatePDFfromHTML(htmlWithSpecialChars);
            const uint8Array = new Uint8Array(pdfBuffer);
            const pdfData = await new PDFParse(uint8Array).getText();

            expect(pdfData.text).toContain('$500.00');
            expect(pdfData.text).toContain('200.00');
        }, 10000);

        it('should contain table data in PDF', async () => {
            const htmlWithTable = `
                <!DOCTYPE html>
                <html>
                <body>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Item 1</td>
                                <td>$100</td>
                            </tr>
                            <tr>
                                <td>Item 2</td>
                                <td>$200</td>
                            </tr>
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            const pdfBuffer = await generatePDFfromHTML(htmlWithTable);
            const uint8Array = new Uint8Array(pdfBuffer);
            const pdfData = await new PDFParse(uint8Array).getText();

            expect(pdfData.text).toContain('Item 1');
            expect(pdfData.text).toContain('Item 2');
            expect(pdfData.text).toContain('$100');
            expect(pdfData.text).toContain('$200');
        }, 10000);
    });

    describe('Integration with Claim HTML Generation', () => {

        const mockClaimData: ClaimData = {
            user: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@test.com'
            },
            company: {
                name: 'Test Company Inc.'
            },
            disaster: [{
                id: 'fema-123',
                designatedIncidentTypes: 'flooding,hurricane',
                declarationDate: new Date('2024-01-15'),
                incidentBeginDate: new Date('2024-01-10'),
                incidentEndDate: new Date('2024-01-20')
            }],
            impactedLocations: [{
                streetAddress: '123 Main St',
                city: 'Boston',
                stateProvince: 'MA',
                postalCode: '02101',
                country: 'USA',
                county: 'Suffolk'
            }],
            relevantExpenses: [
                { description: 'Emergency supplies', amountCents: 500.00 },
                { description: 'Temporary housing', amountCents: 2000.00 }
            ],
            averageIncome: 75000.00,
            dateGenerated: new Date('2024-11-12')
        };

        it('should generate PDF from actual claim HTML with FEMA disaster', async () => {
            const html = buildClaimPdfHtml(mockClaimData);
            const pdfBuffer = await generatePDFfromHTML(html);
            const uint8Array = new Uint8Array(pdfBuffer);
            const pdfData = await new PDFParse(uint8Array).getText();

            // Verify company info
            expect(pdfData.text).toContain('Test Company Inc.');

            // Verify user info
            expect(pdfData.text).toContain('John');
            expect(pdfData.text).toContain('Doe');
            expect(pdfData.text).toContain('john@test.com');

            // Verify disaster info
            expect(pdfData.text).toContain('FEMA');
            expect(pdfData.text).toContain('fema-123');

            // Verify location info
            expect(pdfData.text).toContain('123 Main St');
            expect(pdfData.text).toContain('Boston');

            // Verify expenses
            expect(pdfData.text).toContain('Emergency supplies');
            expect(pdfData.text).toContain('$5.00');
            expect(pdfData.text).toContain('Temporary housing');
            expect(pdfData.text).toContain('$20.00');

            // Verify average income
            expect(pdfData.text).toContain('$75000.00');
        }, 10000);

        it('should generate PDF from claim HTML with self-declared disaster', async () => {
            const dataWithSelfDisaster: ClaimData = {
                ...mockClaimData,
                disaster: [{
                    description: 'Office fire',
                    startDate: new Date('2024-02-01'),
                    endDate: new Date('2024-02-02')
                }]
            };

            const html = buildClaimPdfHtml(dataWithSelfDisaster);
            const pdfBuffer = await generatePDFfromHTML(html);
            const uint8Array = new Uint8Array(pdfBuffer);
            const pdfData = await new PDFParse(uint8Array).getText();

            expect(pdfData.text).toContain('Self-declared');
            expect(pdfData.text).toContain('Office fire');
            expect(pdfData.text).toContain('2/1/2024');
            expect(pdfData.text).toContain('2/2/2024');
        }, 10000);

        it('should generate PDF with multiple disasters', async () => {
            const dataWithMultipleDisasters: ClaimData = {
                ...mockClaimData,
                disaster: [
                    {
                        id: 'fema-123',
                        designatedIncidentTypes: 'flooding',
                        declarationDate: new Date('2024-01-15'),
                        incidentBeginDate: new Date('2024-01-10'),
                        incidentEndDate: new Date('2024-01-20')
                    },
                    {
                        description: 'Office fire',
                        startDate: new Date('2024-02-01'),
                        endDate: new Date('2024-02-02')
                    }
                ]
            };

            const html = buildClaimPdfHtml(dataWithMultipleDisasters);
            const pdfBuffer = await generatePDFfromHTML(html);
            const uint8Array = new Uint8Array(pdfBuffer);
            const pdfData = await new PDFParse(uint8Array).getText();

            expect(pdfData.text).toContain('Disaster 1');
            expect(pdfData.text).toContain('Disaster 2');
            expect(pdfData.text).toContain('FEMA');
            expect(pdfData.text).toContain('Self-declared');
        }, 10000);

        it('should handle missing email in PDF generation', async () => {
            const dataNoEmail: ClaimData = {
                ...mockClaimData,
                user: {
                    ...mockClaimData.user,
                    email: undefined
                }
            };

            const html = buildClaimPdfHtml(dataNoEmail);
            const pdfBuffer = await generatePDFfromHTML(html);
            const uint8Array = new Uint8Array(pdfBuffer);
            const pdfData = await new PDFParse(uint8Array).getText();

            expect(pdfData.text).toContain('Email not on file');
        }, 10000);

        it('should generate a complete PDF with all sections', async () => {
            const html = buildClaimPdfHtml(mockClaimData);
            const pdfBuffer = await generatePDFfromHTML(html);
            const uint8Array = new Uint8Array(pdfBuffer);
            const pdfData = await new PDFParse(uint8Array).getText();

            expect(pdfData.text).toContain('Claim Report');
            expect(pdfData.text).toContain('Company Information');
            expect(pdfData.text).toContain('User Information');
            expect(pdfData.text).toContain('Disaster Information');
            expect(pdfData.text).toContain('Impacted Locations');
            expect(pdfData.text).toContain('Relevant Expenses');
            expect(pdfData.text).toContain('Average Income');
        }, 10000);
    });
});