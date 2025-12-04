import { withServiceErrorHandling } from "../../utilities/error";
import { IFemaRiskIndexTransaction } from "./transaction";
import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";
import { FemaRiskIndexDataResult, InsertFemaRiskIndexDataInput } from "./types";
import AdmZip from "adm-zip";

export interface IFemaRiskIndexService {
    updateFemaRiskIndexData(): Promise<void>;
    getFemaRiskIndexData(): Promise<FemaRiskIndexDataResult>;
}

export class FemaRiskIndexService implements IFemaRiskIndexService {
    private femaRiskIndexTransaction: IFemaRiskIndexTransaction;
    private localDownloadPath: string = "./tmp/download.zip";

    constructor(transaction: IFemaRiskIndexTransaction) {
        this.femaRiskIndexTransaction = transaction;
    }

    async getFemaRiskIndexData(): Promise<FemaRiskIndexDataResult> {
        return await this.femaRiskIndexTransaction.fetchFemaIndexData();
    }

    updateFemaRiskIndexData = withServiceErrorHandling(async (): Promise<void> => {
        const unzipedPath = "./tmp/unziped";
        await this.downloadFemaCSV();
        this.unzipFile(this.localDownloadPath, unzipedPath);

        const payload = await this.parseFemaCSV(unzipedPath + "/NRI_Table_Counties.csv");

        await this.femaRiskIndexTransaction.dropFemaRiskIndexData();
        await this.femaRiskIndexTransaction.insertFemaRiskIndexData(payload);
        await this.deleteAllFilesInFolder("./tmp");
    });

    private async parseFemaCSV(filePath: string): Promise<InsertFemaRiskIndexDataInput> {
        try {
            // Read the file from the filesystem
            const file = Bun.file(filePath);
            const fileContent = await file.text();

            // Parse the CSV content using PapaParse
            const results = Papa.parse<{
                STCOFIPS: string;
                RISK_RATNG: string;
                EAL_RATNG: string;
                SOVI_RATNG: string;
                RESL_RATNG: string;
                CFLD_RISKR: string;
                DRGT_RISKR: string;
                WFIR_RISKR: string;
            }>(fileContent, {
                header: true,
                dynamicTyping: false,
                skipEmptyLines: true,
            });

            if (results.errors.length > 0) {
                console.error("Parse errors:", results.errors);
            }

            return results.data.map((row) => {
                return {
                    countyFipsCode: row.STCOFIPS,
                    riskRating: row.RISK_RATNG,
                    ealRating: row.EAL_RATNG,
                    socialVuln: row.SOVI_RATNG,
                    communityResilience: row.RESL_RATNG,
                    coastalFlooding: row.CFLD_RISKR,
                    drought: row.DRGT_RISKR,
                    wildFire: row.WFIR_RISKR,
                };
            });
        } catch (error) {
            console.error("Error reading or parsing file:", error);
            throw error;
        }
    }

    private async deleteAllFilesInFolder(folderPath: string): Promise<void> {
        try {
            if (!fs.existsSync(folderPath)) {
                return;
            }

            const files = fs.readdirSync(folderPath);

            //For each file in the directory, delete the file
            for (const file of files) {
                const filePath = path.join(folderPath, file);
                const stat = fs.statSync(filePath);

                if (stat.isFile()) {
                    fs.unlinkSync(filePath);
                } else if (stat.isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true });
                }
            }
        } catch (error) {
            console.error("Error deleting files:", error);
            throw error;
        }
    }

    private async unzipFile(zipPath: string, outputDir: string): Promise<void> {
        try {
            if (!fs.existsSync(zipPath)) {
                throw new Error(`Zip file not found at: ${zipPath}`);
            }

            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const zip = new AdmZip(zipPath);

            zip.extractAllTo(outputDir, true);
        } catch (error) {
            console.error("Error unzipping file:", error);
            throw error;
        }
    }

    private async downloadFemaCSV(): Promise<void> {
        const url =
            "https://hazards.fema.gov/nri/Content/StaticDocuments/DataDownload//NRI_Table_Counties/NRI_Table_Counties.zip";

        try {
            // Create directory if it doesn't exist
            const dir = path.dirname(this.localDownloadPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();

            await Bun.write(this.localDownloadPath, arrayBuffer);
        } catch (error) {
            if (fs.existsSync(this.localDownloadPath)) {
                fs.unlinkSync(this.localDownloadPath);
            }
            console.error("Error downloading file:", error);
            throw error;
        }
    }
}
