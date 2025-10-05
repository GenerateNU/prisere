import { CronJob } from "cron";
export class FemaFetching {
    femaService;
    constructor(femaService) {
        this.femaService = femaService;
    }
    initializeCron() {
        const lastRefreshDate = new Date();
        lastRefreshDate.setDate(lastRefreshDate.getDate() - 1);
        return CronJob.from({
            cronTime: "0 2 * * *",
            onTick: async () => {
                await this.femaService.fetchFemaDisasters({ lastRefreshDate: lastRefreshDate });
            },
            start: true,
            timeZone: "America/New_York",
            runOnInit: true,
        });
    }
}
