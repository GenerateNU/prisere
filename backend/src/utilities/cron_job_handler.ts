import { CronJob } from "cron";
import { IFemaService } from "../modules/clients/fema-client/service";
import { DisasterNotificationService, IDisasterNotificationService } from "../modules/disasterNotifications/service";
import { DataSource } from "typeorm";
import {
    DisasterNotificationTransaction,
    IDisasterNotificationTransaction,
} from "../modules/disasterNotifications/transaction";
import { logMessageToFile } from "./logger";

export interface CronJobHandler {
    initializeCron(): CronJob;
}

export class FemaFetching implements CronJobHandler {
    private femaService: IFemaService;
    private disasterNotificationTransaction: IDisasterNotificationTransaction;
    private disasterNotificationService: IDisasterNotificationService;

    constructor(femaService: IFemaService, db: DataSource) {
        this.femaService = femaService;
        this.disasterNotificationTransaction = new DisasterNotificationTransaction(db);
        this.disasterNotificationService = new DisasterNotificationService(this.disasterNotificationTransaction, db);
    }

    initializeCron(): CronJob {
        const lastRefreshDate = new Date();
        lastRefreshDate.setDate(lastRefreshDate.getDate() - 1);
        return CronJob.from({
            cronTime: "0 2 * * *",
            onTick: async () => {
                const newDisasters = await this.femaService.fetchFemaDisasters({ lastRefreshDate: lastRefreshDate });
                logMessageToFile(`Going to process ${newDisasters.length} new FEMA Disasters.`);
                await this.disasterNotificationService.processNewDisasters(newDisasters);
            },
            start: true,
            timeZone: "America/New_York",
            runOnInit: true,
        });
    }
}
