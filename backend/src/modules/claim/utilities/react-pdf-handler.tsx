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
    imageContainer: {
        marginVertical: 10,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    attachmentImage: {
        width: 200,
        height: 150,
        objectFit: "contain",
    },
    fullPageImage: {
        width: "100%",
        height: "auto",
        maxHeight: 700,
        objectFit: "contain",
    },
});

function ClaimPDF({ data }: { data: ClaimData }) {
    const personalInfo = [
        { label: "First Name", value: data.user.firstName },
        { label: "Last Name", value: data.user.lastName },
        { label: "Phone Number", value: data.user.phoneNumber },
        { label: "Email", value: data.user.email || "N/A" },
    ];

    const businessInfo = [
        { label: "Business Name", value: data.company.name },
        { label: "Business Owner", value: data.company.businessOwnerFullName },
        { label: "Business Type", value: data.company.companyType },
        // { label: "Seasonal", value: "No" },
        // { label: "Months of\nBusiness Activity", value: "N/A" },
    ];

    const insuranceInfo = {
        name: data.insuranceInfo?.policyName,
        info: [
            { label: "Insurance\nCompany", value: data.insuranceInfo?.insuranceCompanyName },
            { label: "Insurance Type", value: data.insuranceInfo?.insuranceType },
            {
                label: "Insured Name",
                value: data.insuranceInfo?.policyHolderFirstName + " " + data.insuranceInfo?.policyHolderLastName,
            },
            { label: "Policy Number", value: data.insuranceInfo?.policyNumber },
        ],
    };

    const disasterInfo = data.femaDisaster
        ? [
              { label: "Incident Type", value: getIncidentTypeMeanings(data.femaDisaster.designatedIncidentTypes) },
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
                {data.insuranceInfo && (
                    <>
                        <View style={styles.section} wrap={false}>
                            <Text style={styles.sectionHead}>Insurance Information</Text>
                            <View style={styles.dataTable}>
                                <View key={1} style={styles.insuranceInfo}>
                                    <Text style={styles.insuranceName}>{insuranceInfo.name}</Text>
                                    {insuranceInfo.info.map((info, subIndex) => (
                                        <View key={subIndex} style={styles.dataRow}>
                                            <Text style={styles.dataLabel}>{info.label}</Text>
                                            <Text style={styles.dataValue}>{info.value}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                        {lineBreak}
                    </>
                )}
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
                            <Text style={{ ...styles.dataValue, fontWeight: "bold", width: "80px" }}>Description</Text>
                            <Text style={{ ...styles.dataValue, fontWeight: "bold", width: "80px" }}>Amount</Text>
                            <Text style={{ ...styles.dataValue, fontWeight: "bold", width: "80px" }}>Category</Text>
                            <Text style={{ ...styles.dataValue, fontWeight: "bold", width: "200px" }}>Date</Text>
                        </View>
                        {data.relevantExpenses.map((expense, index) => (
                            <View key={index} style={styles.dataRow}>
                                <Text style={{ ...styles.dataValue, width: "80px" }}>{expense.description}</Text>
                                <Text
                                    style={{ ...styles.dataValue, width: "80px" }}
                                >{`$${(expense.amountCents / 100).toFixed(2)}`}</Text>
                                <Text style={{ ...styles.dataValue, width: "80px" }}>{expense.category}</Text>
                                <Text style={{ ...styles.dataValue, width: "200px" }}>
                                    {expense.quickbooksDateCreated || expense.dateCreated}
                                </Text>
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

export async function generatePdfWithAttachments(claimData: ClaimData, presignedURLs: string[]): Promise<Buffer> {
    const mainPdfBuffer = await generatePdfToBuffer(claimData);
    const mainPdfDoc = await PDFDocument.load(mainPdfBuffer);

    for (const url of presignedURLs) {
        try {
            const { data, type } = await fetchAttachment(url);

            if (type === "pdf") {
                const attachmentPdfDoc = await PDFDocument.load(data);
                const copiedPages = await mainPdfDoc.copyPages(attachmentPdfDoc, attachmentPdfDoc.getPageIndices());
                copiedPages.forEach((page) => {
                    mainPdfDoc.addPage(page);
                });
            } else if (type === "image") {
                await embedImageAsPdfPage(mainPdfDoc, data, url);
            }
        } catch (error) {
            console.error(`Failed to process attachment ${url}:`, error);
        }
    }

    // Save the merged PDF
    const mergedPdfBytes = await mainPdfDoc.save();
    return Buffer.from(mergedPdfBytes);
}

function getFileTypeFromUrl(url: string): "pdf" | "image" | "unknown" {
    const urlLower = url.toLowerCase();

    // Check common image extensions
    if (/\.(jpg|jpeg|png|gif|webp|bmp|tiff?)(\?|$)/i.test(urlLower)) {
        return "image";
    }

    // Check for PDF extension
    if (/\.pdf(\?|$)/i.test(urlLower)) {
        return "pdf";
    }

    return "unknown";
}

async function fetchAttachment(url: string): Promise<{ data: Uint8Array; type: "pdf" | "image" }> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch attachment from ${url}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    let additionalDocumentType: "pdf" | "image";

    if (contentType.includes("application/pdf")) {
        additionalDocumentType = "pdf";
    } else if (contentType.startsWith("image/")) {
        additionalDocumentType = "image";
    } else {
        const urlType = getFileTypeFromUrl(url);
        additionalDocumentType = urlType === "unknown" ? "pdf" : urlType;
    }

    return { data, type: additionalDocumentType };
}

async function embedImageAsPdfPage(mainPdfDoc: PDFDocument, imageData: Uint8Array, url: string): Promise<void> {
    const urlLower = url.toLowerCase();
    let image;

    if (/\.(png)(\?|$)/i.test(urlLower)) {
        image = await mainPdfDoc.embedPng(imageData);
    } else if (/\.(jpg|jpeg)(\?|$)/i.test(urlLower)) {
        image = await mainPdfDoc.embedJpg(imageData);
    } else {
        // Try to detect from magic bytes
        if (imageData[0] === 0x89 && imageData[1] === 0x50) {
            // PNG magic bytes
            image = await mainPdfDoc.embedPng(imageData);
        } else if (imageData[0] === 0xff && imageData[1] === 0xd8) {
            // JPEG magic bytes
            image = await mainPdfDoc.embedJpg(imageData);
        } else {
            throw new Error(`Unsupported image format for URL: ${url}`);
        }
    }

    // Calculate dimensions to fit on A4 page with margins
    const margin = 50;
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;

    const imgDims = image.scale(1);
    let width = imgDims.width;
    let height = imgDims.height;

    // Scale down if necessary to fit within margins
    if (width > maxWidth) {
        const scale = maxWidth / width;
        width = maxWidth;
        height = height * scale;
    }
    if (height > maxHeight) {
        const scale = maxHeight / height;
        height = maxHeight;
        width = width * scale;
    }

    // Create a new page and draw the image centered
    const page = mainPdfDoc.addPage([pageWidth, pageHeight]);
    const x = (pageWidth - width) / 2;
    const y = (pageHeight - height) / 2;

    page.drawImage(image, {
        x,
        y,
        width,
        height,
    });
}
