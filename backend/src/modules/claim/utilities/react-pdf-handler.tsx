/** @jsxImportSource react */

import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    renderToFile,
    Svg,
    Path,
    Line,
    renderToBuffer,
} from "@react-pdf/renderer";
import { PDFDocument } from "pdf-lib";
import { ClaimData } from "../types";
import { getIncidentTypeMeanings } from "../../../utilities/incident_code_meanings";
import { FinancialChart } from "./render-chart";

const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 50,
        paddingTop: 50,
    },
    section: {
        flexDirection: "column",
        columnGap: "18px",
    },
    svgHeader: {
        position: "absolute",
        top: 0,
        left: 0,
    },
    headerText: {
        position: "absolute",
        top: 60,
        left: 50,
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        width: "200px",
    },
    sectionHead: {
        fontSize: "12px",
        fontWeight: "bold",
        marginBottom: "18px",
        color: "#2E2F2D",
    },
    insuranceName: {
        fontSize: "10px",
        fontWeight: "bold",
    },
    dataTable: {
        flexDirection: "column",
        rowGap: "14px",
    },
    dataRow: {
        flexDirection: "row",
        columnGap: "18px",
    },
    dataLabel: {
        width: "100px",
        fontSize: "10px",
        color: "#8E8E8E",
    },
    dataValue: {
        fontSize: "10px",
        textAlign: "left",
        alignSelf: "flex-start",
        color: "#2E2F2D",
    },
    lineBreak: {
        marginVertical: "30px",
    },
    insuranceInfo: {
        marginBottom: "18px",
        flexDirection: "column",
        rowGap: "14px",
    },
    location: {
        flexDirection: "column",
        rowGap: "10px",
    },
    locationHead: {
        fontSize: "9px",
        fontWeight: "bold",
        color: "#2E2F2D",
    },
    locationsDisplay: {
        flexDirection: "row",
        columnGap: "16px",
    },
});

function ClaimPDF({ data }: { data: ClaimData }) {
    const personalInfo = [
        { label: "First Name", value: data.user.firstName },
        { label: "Last Name", value: data.user.lastName },
        { label: "Phone Number", value: "N/A" },
        { label: "Phone Type", value: "N/A" },
        { label: "Email", value: data.user.email || "N/A" },
    ];

    const businessInfo = [
        { label: "Business Name", value: data.company.name },
        { label: "Business Owner", value: data.company.businessOwnerFullName },
        { label: "Business Type", value: data.company.companyType },
        { label: "Seasonal", value: "No" },
        { label: "Months of\nBusiness Activity", value: "N/A" },
    ];

    const insuranceInfo = [
        {
            name: "Health Policy",
            info: [
                { label: "Insurance\nCompany", value: "Blue Cross Blue Sheild" },
                { label: "Insurance Type", value: "Health Insurance" },
                { label: "Insured Name", value: "Johnny Apple Seed" },
                { label: "Policy Number", value: "28348-2340123" },
            ],
        },
        {
            name: "Auto Policy",
            info: [
                { label: "Insurance\nCompany", value: "Geico" },
                { label: "Insurance Type", value: "Auto Insurance" },
                { label: "Insured Name", value: "Johnny Apple Seed" },
                { label: "Policy Number", value: "22771-83269917" },
            ],
        },
    ];

    const disasterInfo = data.femaDisaster
        ? [
              { label: "Type of Claim", value: getIncidentTypeMeanings(data.femaDisaster.designatedIncidentTypes) },
              { label: "Incident\nDeclaration Date", value: data.femaDisaster.declarationDate.toLocaleDateString() },
              {
                  label: "Incident\nBegin Date",
                  value: data.femaDisaster.incidentBeginDate
                      ? data.femaDisaster.incidentBeginDate.toLocaleDateString()
                      : "N/A",
              },
              {
                  label: "Incident\nEnd Date",
                  value: data.femaDisaster.incidentEndDate
                      ? data.femaDisaster.incidentEndDate.toLocaleDateString()
                      : "N/A",
              },
          ]
        : [
              { label: "Disaster Type", value: "Self-declared" },
              { label: "Description", value: data.selfDisaster ? data.selfDisaster.description : "N/A" },
              {
                  label: "Incident\nBegin Date",
                  value: data.selfDisaster ? data.selfDisaster.startDate.toLocaleDateString() : "N/A",
              },
              {
                  label: "Incident\nEnd Date",
                  value:
                      data.selfDisaster && data.selfDisaster.endDate
                          ? data.selfDisaster.endDate.toLocaleDateString()
                          : "N/A",
              },
          ];

    const relatedLocations = data.impactedLocations.map((loc, index) => (
        <View key={index} style={styles.location}>
            <Text style={styles.locationHead}>{loc.alias}</Text>
            <Text style={styles.dataValue}>
                {`${loc.streetAddress},\n${loc.city}, ${loc.stateProvince},\n${loc.postalCode}, ${loc.country}${loc.county ? ` (${loc.county} County)` : ""}`}
            </Text>
        </View>
    ));

    const lineBreak = (
        <Svg height="2px" width="500" style={styles.lineBreak}>
            <Line x1="550" y1="0" x2="0" y2="0" strokeWidth={1} stroke="#8E8E8E" />
        </Svg>
    );

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Svg style={styles.svgHeader} width="437" height="110" viewBox="0 0 437 110">
                    <Path d="M0 0H437L372 110H0V0Z" fill="#9E2450" />
                </Svg>
                <Text style={styles.headerText}>Insurance Claim Report</Text>
                <View style={styles.section}>
                    <Text style={{ ...styles.sectionHead, paddingTop: "100px" }}>Personal Information</Text>
                    <View style={styles.dataTable}>
                        {personalInfo.map((item, index) => (
                            <View key={index} style={styles.dataRow}>
                                <Text style={styles.dataLabel}>{item.label}</Text>
                                <Text style={styles.dataValue}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                {lineBreak}
                <View style={styles.section}>
                    <Text style={styles.sectionHead}>Business Information</Text>
                    <View style={styles.dataTable}>
                        {businessInfo.map((item, index) => (
                            <View key={index} style={styles.dataRow}>
                                <Text style={styles.dataLabel}>{item.label}</Text>
                                <Text style={styles.dataValue}>{item.value}</Text>
                            </View>
                        ))}
                        <View style={styles.dataRow}>
                            <Text style={styles.dataLabel}>{"Average Business\nRevenue"}</Text>
                            <View style={{ flexDirection: "column", rowGap: "8px" }}>
                                <Text style={styles.insuranceName}>{"Average Revenue (Last 3 Years)"}</Text>
                                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                                    <Text
                                        style={{ fontSize: "17px" }}
                                    >{`$${Math.round(data.averageIncome * 100) / 100} `}</Text>
                                    <Text style={{ fontSize: "10px" }}>per year</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: "4px",
                        }}
                    >
                        <FinancialChart revenues={data.pastRevenues} purchases={data.pastPurchases} />
                    </View>
                </View>
                {lineBreak}
                <View style={styles.section} wrap={false}>
                    <Text style={styles.sectionHead}>Insurance Information</Text>
                    <View style={styles.dataTable}>
                        {insuranceInfo.map((item, index) => (
                            <View key={index} style={styles.insuranceInfo}>
                                <Text style={styles.insuranceName}>{item.name}</Text>
                                {item.info.map((info, subIndex) => (
                                    <View key={subIndex} style={styles.dataRow}>
                                        <Text style={styles.dataLabel}>{info.label}</Text>
                                        <Text style={styles.dataValue}>{info.value}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                </View>
                {lineBreak}
                <View style={styles.section} wrap={false}>
                    <Text style={styles.sectionHead}>Disaster Specific Information</Text>
                    <View style={styles.dataTable}>
                        {disasterInfo.map((item, index) => (
                            <View key={index} style={styles.dataRow}>
                                <Text style={styles.dataLabel}>{item.label}</Text>
                                <Text style={styles.dataValue}>{item.value}</Text>
                            </View>
                        ))}
                        <View style={styles.dataRow}>
                            <Text style={styles.dataLabel}>{"Affected Business\nLocations"}</Text>
                            <View style={styles.locationsDisplay}>{relatedLocations}</View>
                        </View>
                    </View>
                </View>
                {lineBreak}
                <View style={styles.section} wrap={false}>
                    <Text style={styles.sectionHead}>Extraneous Expenses</Text>
                    <View style={styles.dataTable}>
                        <View style={styles.dataRow}>
                            <Text style={{ ...styles.dataValue, fontWeight: "bold" }}>Expense Type</Text>
                            <Text style={{ ...styles.dataValue, fontWeight: "bold" }}>Amount</Text>
                            <Text style={{ ...styles.dataValue, fontWeight: "bold" }}>Category</Text>
                            <Text style={{ ...styles.dataValue, fontWeight: "bold" }}>Date</Text>
                        </View>
                        {data.relevantExpenses.map((expense, index) => (
                            <View key={index} style={styles.dataRow}>
                                <Text style={styles.dataValue}>{expense.description}</Text>
                                <Text style={styles.dataValue}>{`$${(expense.amountCents / 100).toFixed(2)}`}</Text>
                                <Text style={styles.dataValue}>Category</Text>
                                <Text style={styles.dataValue}>02/26/25</Text>
                            </View>
                        ))}
                        {data.relevantExpenses.length === 0 && (
                            <Text style={{ ...styles.dataValue, fontStyle: "italic" }}>
                                No relevant expenses reported.
                            </Text>
                        )}
                    </View>
                </View>
            </Page>
        </Document>
    );
}

export async function generatePdfToFile(claimData: ClaimData): Promise<void> {
    await renderToFile(<ClaimPDF data={claimData} />, `test.pdf`);
}

export async function generatePdfToBuffer(claimData: ClaimData): Promise<Buffer> {
    const pdfBuffer = await renderToBuffer(<ClaimPDF data={claimData} />);
    return Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
}

async function fetchPdfFromUrl(url: string): Promise<Uint8Array> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch PDF from ${url}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}

export async function generatePdfWithAttachments(claimData: ClaimData, presignedURLs: string[]): Promise<Buffer> {
    // Generate your main PDF
    const mainPdfBuffer = await generatePdfToBuffer(claimData);

    // Load the main PDF with pdf-lib
    const mainPdfDoc = await PDFDocument.load(mainPdfBuffer);

    // Fetch and append each PDF from S3
    for (const url of presignedURLs) {
        const attachmentBuffer = await fetchPdfFromUrl(url);
        const attachmentPdfDoc = await PDFDocument.load(attachmentBuffer);

        // Copy all pages from the attachment
        const copiedPages = await mainPdfDoc.copyPages(attachmentPdfDoc, attachmentPdfDoc.getPageIndices());

        // Add each page to the main document
        copiedPages.forEach((page) => {
            mainPdfDoc.addPage(page);
        });
    }

    // Save the merged PDF
    const mergedPdfBytes = await mainPdfDoc.save();
    return Buffer.from(mergedPdfBytes);
}
