import { ShellProcess } from 'cmd-execute'

const stdout = console.log;

export interface KubeObjectExpirationResult {
    app: string;
    expireDate: Date;
    residualTime: string;
    managed: boolean;
}

export class KubeAdm {
    private commandPath: string;
    private initialArgs: string[];
    private kubeletCommandPath: string;
    private kubeletInitialArgs: string[];
    private kubectlCommandPath: string;
    private kubectlInitialArgs: string[];
    private systemctlCommandPath: string;
    private systemctlInitialArgs: string[];

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
    public get Certificate(): KubeAdmCertificate {
        return new KubeAdmCertificate(this, this.commandPath, this.initialArgs);
    }
    public async Version() {
        const args = ["version", "-oshort"];
        const shell = new ShellProcess({
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
    public async Restart() {
        const args = ["restart", "kubelet"];
        const shell = new ShellProcess({
            path: this.systemctlCommandPath,
            args: this.systemctlInitialArgs.concat(args),
        });
        await shell.run(null, stdout).catch(console.error);
    }
    public async WaitUntilReady() {
        const args = ["get", "node"];
        const shell = new ShellProcess({
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

export class KubeAdmCertificate {
    constructor(public kubeadm: KubeAdm, private commandPath: string, private initialArgs: string[]) { }

    public async RenewAll() {
        var currentVersion = await this.kubeadm.Version();
        var args = ["certs", "renew", "all"];
        if (currentVersion < 1200) {
            args.splice(0, 0, "alpha");
        }
        const shell = new ShellProcess({
            path: this.commandPath,
            args: this.initialArgs.concat(args),
        });
        await shell.run(null, stdout).catch(console.error);
    }
    public async CheckExpiration(): Promise<KubeObjectExpirationResult[]> {
        var args = ["certs", "check-expiration"];
        var list = [];
        const shell = new ShellProcess({
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
        })
        await shell.run(null, stdout).catch(console.error);
        return list;
    }
}