import { CronJob } from "cron";

export interface CronJobHandler {
    initializeCron(): CronJob;
}
