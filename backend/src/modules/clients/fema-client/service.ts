import { DataSource } from "typeorm";
import { DisasterTransaction } from "../../disaster/transaction";
import { CreateDisasterDTOSchema } from "../../../types/fema-disaster";
import { fetch } from "bun";
import { FemaDisaster } from "../../../entities/FemaDisaster";
import { logMessageToFile } from "../../../utilities/logger";

const FEMA_API = "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries";

export interface IFemaService {
    fetchFemaDisasters({ lastRefreshDate }: { lastRefreshDate: Date }): Promise<FemaDisaster[]>;
    preloadDisasters(): Promise<void>;
}

export class FemaService implements IFemaService {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    fetchFemaDisasters = async ({ lastRefreshDate }: { lastRefreshDate: Date }) => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const response = await fetch(
            FEMA_API +
                `?$filter=declarationDate ge ${threeMonthsAgo.toISOString()} and lastRefresh gt ${lastRefreshDate.toISOString()}`
        );
        const { DisasterDeclarationsSummaries } = await response.json();
        const disasterTransaction = new DisasterTransaction(this.db);
        const newDisasters: FemaDisaster[] = [];
        let errorCount = 0;

        // Return only newly created disasters (not updated ones)
        for (const disaster of DisasterDeclarationsSummaries) {
            try {
                const parsedDisaster = CreateDisasterDTOSchema.parse(disaster);
                const { disaster: savedDisaster, isNew } = await disasterTransaction.upsertDisaster(parsedDisaster);

                if (isNew) {
                    newDisasters.push(savedDisaster);
                }
            } catch (error) {
                errorCount++;
                logMessageToFile(
                    `Failed to process disaster ${disaster.id || "unknown"}: ${error instanceof Error ? error.message : "Unknown error"}`
                );
                continue; // gracefully move on
            }
        }

        logMessageToFile(
            `Processed ${DisasterDeclarationsSummaries.length} disasters, ${newDisasters.length} were new, ${errorCount} failed to process.`
        );
        return newDisasters;
    };

    async preloadDisasters() {
        const threeMonths = new Date();
        threeMonths.setMonth(threeMonths.getMonth() - 3);
        await this.fetchFemaDisasters({ lastRefreshDate: threeMonths });
    }
}
