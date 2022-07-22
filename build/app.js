"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_schedule_1 = __importDefault(require("node-schedule"));
const CheckExpirationJob_1 = require("./jobs/CheckExpirationJob");
async function main() {
    // check every minute
    node_schedule_1.default.scheduleJob("*/1 * * * *", async () => {
        (0, CheckExpirationJob_1.CheckExpirationJob)();
    });
    console.log('Kube access is ready');
}
main();
//# sourceMappingURL=app.js.map