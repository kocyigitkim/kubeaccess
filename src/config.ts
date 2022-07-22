export class IConfig {
    public KA_CHECK_CRON?: string = "*/30 * * * *";
    public KA_CHECK_DELTA_DAY_BEFORE_EXPIRE?: number = 14;
    public 
}

export async function getConfig(): Promise<IConfig> {
    var ret = new IConfig();
    for (var key in process.env) {
        ret[key] = process.env[key];
    }
    return ret;
}