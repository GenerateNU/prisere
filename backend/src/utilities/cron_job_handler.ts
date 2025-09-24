import { CronJob } from 'cron';
import { DataSource } from "typeorm";
import { FemaService } from "../modules/clients/fema-client/service";

export interface CronJobHander {
    initializeCron(): CronJob;

}

export class FemaFetching implements CronJobHander {
    private femaService: FemaService;

    constructor(femaService: FemaService){
        this.femaService = femaService;
    }

    initializeCron(): CronJob {
        const femaService = this.femaService;
        return CronJob.from({
            cronTime: '10 * * * *',
            onTick: async function() {
                await femaService.fetchFemaDisasters({ lastRefreshDate: new Date() });
            },
            start: true,
            timeZone: 'America/New_York',
            runOnInit: true
        });
    }

}