"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckExpirationJob = void 0;
const config_1 = require("../config");
const KubeAdm_1 = require("../core/KubeAdm");
async function CheckExpirationJob() {
    const config = await (0, config_1.getConfig)();
    const kubeadm = new KubeAdm_1.KubeAdm();
    const currentVersion = await kubeadm.Version();
    const objectExpires = await kubeadm.Certificate.CheckExpiration();
    if (Array.isArray(objectExpires)) {
        const apiServerExpire = objectExpires.find(x => x.app === 'apiserver');
        if (apiServerExpire) {
            const apiServerExpireDays = (apiServerExpire.expireDate.valueOf() - new Date().valueOf()) / 1000 / 60 / 60 / 24;
            if (apiServerExpireDays <= config.KA_CHECK_DELTA_DAY_BEFORE_EXPIRE || 14) {
                console.log(`api server certificate will expire in ${apiServerExpireDays} days`);
                await kubeadm.Certificate.RenewAll();
                await kubeadm.Restart();
            }
            else {
                console.log(`api server certificate is valid`);
            }
        }
    }
    console.log(currentVersion);
    console.log('app is done');
}
exports.CheckExpirationJob = CheckExpirationJob;
//# sourceMappingURL=CheckExpirationJob.js.map