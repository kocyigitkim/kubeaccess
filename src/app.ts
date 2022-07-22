import { KubeAdm } from "./core/KubeAdm";
import nodeSchedule from "node-schedule";
import { CheckExpirationJob } from "./jobs/CheckExpirationJob";
async function main() {
    // check every minute
    nodeSchedule.scheduleJob("*/1 * * * *", async () => {
        CheckExpirationJob();
    });
    console.log('Kube access is ready');
}

main();