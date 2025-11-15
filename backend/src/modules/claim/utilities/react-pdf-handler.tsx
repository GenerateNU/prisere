/** @jsxImportSource react */

import React from 'react';
import { Page, Text, View, Document, StyleSheet, renderToFile, Svg, Path, Line } from '@react-pdf/renderer';
import { ClaimData } from '../types';
import { getIncidentTypeMeanings } from '../../../utilities/incident_code_meanings';


const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 50,
        paddingTop: 50,
    },
    section: {
        flexDirection: 'column',
        columnGap: "18px"
    },
    svgHeader: {
        position: 'absolute',
        top: 0,
        left: 0
    },
    headerText: {
        position: 'absolute',
        top: 60,
        left: 50,
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        width: "200px"
    },
    sectionHead: {
        fontSize: "12px",
        fontWeight: 'bold',
        marginBottom: "18px",
        color: "#2E2F2D"

    },
    insuranceName: {
        fontSize: "10px",
        fontWeight: 'bold',
    },
    dataTable: {
        flexDirection: 'column',
        rowGap: "14px",
    },
    dataRow: {
        flexDirection: 'row',
        columnGap: "18px"
    },
    dataLabel: {
        width: '100px',
        fontSize: '10px',
        color: '#8E8E8E'
    },
    dataValue: {
        fontSize: '10px',
        textAlign: 'left',
        alignSelf: 'flex-start',
        color: "#2E2F2D"
    },
    lineBreak: {
        marginVertical: "30px",
    },
    insuranceInfo: {
        marginBottom: "18px",
        flexDirection: 'column',
        rowGap: "14px",
    },
    location: {
        flexDirection: 'column',
        rowGap: "14px",
    }
});

function ClaimPDF({ data }: { data: ClaimData }) {

    const personalInfo = [
        { label: "First Name", value: data.user.firstName },
        { label: "Last Name", value: data.user.lastName },
        { label: "Phone Number", value: "No Phone Number on file." },
        { label: "Phone Type", value: "N/A" },
        { label: "Email", value: data.user.email || "No Email on file." },
    ];

    const businessInfo = [
        { label: "Business Name", value: data.company.name },
        { label: "Business Owner", value: data.user.firstName + " " + data.user.firstName },
        { label: "Business Type", value: "Sole Proprietorship" },
        { label: "Seasonal", value: "No" },
        { label: "Months of\nBusiness Activity", value: "N/A" },
    ]

    const insuranceInfo = [
        {
            name: "Health Policy",
            info: [
                { label: "Insurance\nCompany", value: "Blue Cross Blue Sheild" },
                { label: "Insurance Type", value: "Health Insurance" },
                { label: "Insured Name", value: "Johnny Apple Seed" },
                { label: "Policy Number", value: "28348-2340123" },
            ]
        },
        {
            name: "Auto Policy",
            info: [
                { label: "Insurance\nCompany", value: "Geico" },
                { label: "Insurance Type", value: "Auto Insurance" },
                { label: "Insured Name", value: "Johnny Apple Seed" },
                { label: "Policy Number", value: "22771-83269917" },
            ]
        }
    ]

    const disasterInfo = data.femaDisaster ? [
        { label: "Type of Claim", value: getIncidentTypeMeanings(data.femaDisaster.designatedIncidentTypes) },
        { label: "Incident\nDeclaration Date", value: data.femaDisaster.declarationDate.toLocaleDateString() },
        { label: "Incident\nBegin Date", value: data.femaDisaster.incidentBeginDate ? data.femaDisaster.incidentBeginDate.toLocaleDateString() : "N/A" },
        { label: "Incident\nEnd Date", value: data.femaDisaster.incidentEndDate ? data.femaDisaster.incidentEndDate.toLocaleDateString() : "N/A" },
    ] : [
        { label: "Disaster Type", value: "Self-declared" },
        { label: "Description", value: data.selfDisaster ? data.selfDisaster.description : "N/A" },
        { label: "Incident\nBegin Date", value: data.selfDisaster ? data.selfDisaster.startDate.toLocaleDateString() : "N/A" },
        { label: "Incident\nEnd Date", value: data.selfDisaster && data.selfDisaster.endDate ? data.selfDisaster.endDate.toLocaleDateString() : "N/A" },
    ]

    const relatedLocations = data.impactedLocations.map((loc, index) => (
        <View key={index} style={styles.location}>
            <Text style={styles.dataLabel}>{loc.alias}</Text>
            <Text style={styles.dataValue}>
                {`${loc.streetAddress}, ${loc.city}, ${loc.stateProvince}, ${loc.postalCode}, ${loc.country}${loc.county ? ` (${loc.county} County)` : ""}`}
            </Text>
        </View>
    ));

    const lineBreak = (
        <Svg height="2px" width="500" style={styles.lineBreak}>
            <Line
                x1="550"
                y1="0"
                x2="0"
                y2="0"
                strokeWidth={1}
                stroke='#8E8E8E'
            />
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
                    <View style={styles.dataTable} >
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
                    <View style={styles.dataTable} >
                        {businessInfo.map((item, index) => (
                            <View key={index} style={styles.dataRow}>
                                <Text style={styles.dataLabel}>{item.label}</Text>
                                <Text style={styles.dataValue}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                {lineBreak}
                <View style={styles.section} wrap={false} >
                    <Text style={styles.sectionHead}>Insurance Information</Text>
                    <View style={styles.dataTable}>
                        {insuranceInfo.map((item, index) => (
                            <View style={styles.insuranceInfo}>
                                <Text key={index} style={styles.insuranceName} >{item.name}</Text>
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
                    <View style={styles.dataTable} >
                        {disasterInfo.map((item, index) => (
                            <View key={index} style={styles.dataRow}>
                                <Text style={styles.dataLabel}>{item.label}</Text>
                                <Text style={styles.dataValue}>{item.value}</Text>
                            </View>
                        ))}
                        <View style={styles.dataRow}>
                            <Text style={styles.dataLabel}>Affected Business Locations</Text>
                            <View>
                                {relatedLocations}
                            </View>
                        </View>
                    </View>
                </View>

            </Page>
        </Document>
    );
}

export async function generatePdfToFile(claimData: ClaimData): Promise<void> {
    await renderToFile(
        <ClaimPDF data={claimData} />,
        `test.pdf`
    );
}