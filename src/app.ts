import { KubeAdm } from "./core/KubeAdm";
import nodeSchedule from "node-schedule";
import { CheckExpirationJob } from "./jobs/CheckExpirationJob";
import { getConfig } from "./config";
async function main() {
    const config = await getConfig();
    // check every minute
    nodeSchedule.scheduleJob(config.KA_CHECK_CRON || "*/1 * * * *", async () => {
        CheckExpirationJob();
    });
    console.log('Kube access is ready');
}

main();