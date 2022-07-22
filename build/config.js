"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.IConfig = void 0;
class IConfig {
    constructor() {
        this.KA_CHECK_CRON = "*/30 * * * *";
        this.KA_CHECK_DELTA_DAY_BEFORE_EXPIRE = 14;
    }
}
exports.IConfig = IConfig;
async function getConfig() {
    var ret = new IConfig();
    for (var key in process.env) {
        ret[key] = process.env[key];
    }
    return ret;
}
exports.getConfig = getConfig;
//# sourceMappingURL=config.js.map