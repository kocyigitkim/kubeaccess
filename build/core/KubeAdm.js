"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KubeAdmCertificate = exports.KubeAdm = void 0;
const cmd_execute_1 = require("cmd-execute");
const stdout = console.log;
class KubeAdm {
    constructor() {
        if (process.env.IS_CLUSTER) {
            this.commandPath = "/usr/bin/nsenter";
            this.initialArgs = ["-m/proc/1/ns/mnt", "/usr/bin/kubeadm"];
            this.kubeletCommandPath = "/usr/bin/nsenter";
            this.kubeletInitialArgs = ["-m/proc/1/ns/mnt", "/usr/bin/kubelet"];
            this.kubectlCommandPath = "/usr/bin/nsenter";
            this.kubectlInitialArgs = ["-m/proc/1/ns/mnt", "/usr/bin/kubectl"];
            this.systemctlCommandPath = "/usr/bin/nsenter";
            this.systemctlInitialArgs = ["-m/proc/1/ns/mnt", "/usr/bin/systemctl"];
        }
        else {
            this.commandPath = "/usr/bin/kubeadm";
            this.initialArgs = [];
            this.kubeletCommandPath = "/usr/bin/kubelet";
            this.kubeletInitialArgs = [];
            this.kubectlCommandPath = "/usr/bin/kubectl";
            this.kubectlInitialArgs = [];
            this.systemctlCommandPath = "/usr/bin/systemctl";
            this.systemctlInitialArgs = [];
        }
    }
    get Certificate() {
        return new KubeAdmCertificate(this, this.commandPath, this.initialArgs);
    }
    async Version() {
        const args = ["version", "-oshort"];
        const shell = new cmd_execute_1.ShellProcess({
            path: this.commandPath,
            args: this.initialArgs.concat(args),
        });
        var versionText = "";
        shell.processText((text) => {
            if (text) {
                versionText = text.trim();
            }
        });
        await shell.run(null, stdout).catch(console.error);
        var versionNumber = parseInt(versionText.replace("v", "").split(".").join(""));
        return versionNumber;
    }
    async Restart() {
        const args = ["restart", "kubelet"];
        const shell = new cmd_execute_1.ShellProcess({
            path: this.systemctlCommandPath,
            args: this.systemctlInitialArgs.concat(args),
        });
        await shell.run(null, stdout).catch(console.error);
    }
    async WaitUntilReady() {
        const args = ["get", "node"];
        const shell = new cmd_execute_1.ShellProcess({
            path: this.kubectlCommandPath,
            args: this.kubectlInitialArgs.concat(args),
        });
        var isReady = false;
        shell.processHeaderList((match, line) => {
            if (!isReady) {
                isReady = JSON.stringify(match).toLowerCase().includes("node");
            }
        });
        await shell.run(null, stdout).catch(console.error);
    }
}
exports.KubeAdm = KubeAdm;
class KubeAdmCertificate {
    constructor(kubeadm, commandPath, initialArgs) {
        this.kubeadm = kubeadm;
        this.commandPath = commandPath;
        this.initialArgs = initialArgs;
    }
    async RenewAll() {
        var currentVersion = await this.kubeadm.Version();
        var args = ["certs", "renew", "all"];
        if (currentVersion < 1200) {
            args.splice(0, 0, "alpha");
        }
        const shell = new cmd_execute_1.ShellProcess({
            path: this.commandPath,
            args: this.initialArgs.concat(args),
        });
        await shell.run(null, stdout).catch(console.error);
    }
    async CheckExpiration() {
        var args = ["certs", "check-expiration"];
        var list = [];
        const shell = new cmd_execute_1.ShellProcess({
            path: this.commandPath,
            args: this.initialArgs.concat(args)
        });
        shell.processHeaderList((match, line) => {
            if (Array.isArray(match) && match.length > 2) {
                if (match[0].toLowerCase() !== 'certificate') {
                    list.push({
                        app: match[0],
                        expireDate: new Date(match[1]),
                        residualTime: match[2],
                        managed: match[3] !== 'no'
                    });
                }
            }
        });
        await shell.run(null, stdout).catch(console.error);
        return list;
    }
}
exports.KubeAdmCertificate = KubeAdmCertificate;
//# sourceMappingURL=KubeAdm.js.map