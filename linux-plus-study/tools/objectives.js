// Official CompTIA Linux+ XK0-006 (v5.0) objectives, transcribed from the exam objectives PDF.
// Each objective lists the keywords that must appear somewhere in its study content.
// Used by tools/validate.js to prove full coverage.
module.exports = {
  "1.1": { title: "Explain basic Linux concepts.", keywords: [
    "boot process", "bootloader", "configuration file", "kernel", "parameter", "initrd", "PXE",
    "Filesystem Hierarchy Standard", "/bin", "/boot", "/dev", "/etc", "/home", "/lib", "/proc", "/sbin", "/tmp", "/usr", "/var",
    "AArch64", "RISC-V", "x86", "x86_64", "AMD64",
    "RPM", "dpkg", "display manager", "window manager", "X Server", "Wayland",
    "open source", "free software", "proprietary", "copyleft"] },
  "1.2": { title: "Summarize Linux device management concepts and tools.", keywords: [
    "kernel module", "depmod", "insmod", "lsmod", "modinfo", "modprobe", "rmmod",
    "dmesg", "dmidecode", "ipmitool", "lm_sensors", "lscpu", "lshw", "lsmem", "lspci", "lsusb",
    "dracut", "mkinitrd", "embedded", "GPU", "nvtop"] },
  "1.3": { title: "Given a scenario, manage storage in a Linux system.", keywords: [
    "Logical Volume Manager", "lvchange", "lvcreate", "lvdisplay", "lvremove", "lvresize", "lvextend", "lvs",
    "vgchange", "vgcreate", "vgdisplay", "vgexport", "vgextend", "vgimport", "vgremove", "vgs", "vgscan",
    "pvcreate", "pvdisplay", "pvmove", "pvremove", "pvresize", "pvs", "pvscan",
    "blkid", "fdisk", "gdisk", "growpart", "lsblk", "parted",
    "xfs", "ext4", "btrfs", "tmpfs", "df", "du", "fio", "fsck", "mkfs", "resize2fs", "xfs_growfs", "xfs_repair",
    "RAID", "/proc/mdstat", "mdadm",
    "/etc/fstab", "/etc/mtab", "/proc/mounts", "autofs", "mount", "umount",
    "noatime", "nodev", "nodiratime", "noexec", "nofail", "nosuid", "remount", "ro", "rw",
    "NFS", "SMB", "Samba", "inode"] },
  "1.4": { title: "Given a scenario, manage network services and configurations on a Linux server.", keywords: [
    "/etc/hosts", "/etc/resolv.conf", "/etc/nsswitch.conf", "NetworkManager", "nmcli", "nmconnect",
    "netplan apply", "netplan status", "netplan try", "/etc/netplan",
    "arp", "curl", "dig", "ethtool", "hostname", "ip address", "ip link", "ip route", "iperf3", "mtr", "nc",
    "nmap", "nslookup", "ping", "ping6", "ss", "tcpdump", "tracepath", "traceroute"] },
  "1.5": { title: "Given a scenario, manage a Linux system using common shell operations.", keywords: [
    "DISPLAY", "HOME", "PATH", "PS1", "SHELL", "USER", "absolute", "relative", "~",
    ".bashrc", ".bash_profile", ".profile",
    "standard output", "standard error", "standard input", "here doc", "<<<", ">>", "|",
    "!!", "alias", "awk", "bc", "cat", "cut", "echo", "grep", "head", "history", "less", "more", "printf",
    "sed", "sort", "source", "tail", "tee", "tr", "uname", "uniq", "wc", "xargs", "vim", "nano"] },
  "1.6": { title: "Given a scenario, perform backup and restore operations for a Linux server.", keywords: [
    "cpio", "tar", "7-Zip", "bzip2", "gzip", "unzip", "xz", "dd", "ddrescue", "rsync", "zcat", "zgrep", "zless"] },
  "1.7": { title: "Summarize virtualization on Linux systems.", keywords: [
    "QEMU", "KVM", "paravirtualized", "VirtIO", "convert", "resize", "image properties", "VM states", "nested virtualization",
    "storage", "RAM", "CPU", "network", "baseline image", "template", "cloning", "migration", "snapshot",
    "bare metal", "bridged", "NAT", "host-only", "isolated", "routed", "open",
    "libvirt", "virsh", "virt-manager"] },
  "2.1": { title: "Given a scenario, manage files and directories on a Linux system.", keywords: [
    "cd", "cp", "diff", "file", "find", "ln", "locate", "ls", "lsof", "mkdir", "mv", "pwd", "rm", "rmdir",
    "sdiff", "stat", "touch", "symbolic link", "hard link", "block device", "character device", "special character device"] },
  "2.2": { title: "Given a scenario, perform local account management in a Linux environment.", keywords: [
    "adduser", "groupadd", "useradd", "deluser", "groupdel", "userdel", "chsh", "groupmod", "passwd", "usermod",
    "chage", "lock", "expiration", "getent passwd", "groups", "id", "last", "lastlog", "w", "who", "whoami",
    "/etc/profile", "/etc/skel", "/etc/group", "/etc/passwd", "/etc/shadow",
    "UID", "GID", "EUID", "EGID", "system account", "service account", "UID range"] },
  "2.3": { title: "Given a scenario, manage processes and jobs in a Linux environment.", keywords: [
    "/proc/", "atop", "htop", "lsof", "mpstat", "pidstat", "ps", "pstree", "strace", "top",
    "PPID", "PID", "running", "blocked", "sleeping", "stopped", "zombie", "nice", "renice", "process limits", "ulimit",
    "&", "bg", "Ctrl+C", "Ctrl+D", "Ctrl+Z", "exec", "fg", "jobs", "kill", "killall", "nohup", "pkill",
    "HUP", "KILL", "TERM", "anacron", "at", "crontab"] },
  "2.4": { title: "Given a scenario, configure and manage software in a Linux environment.", keywords: [
    "repository", "source", "dependenc", "conflict", "package manager", "pip", "cargo", "npm",
    "enabl", "disabl", "third-party", "GPG", "exclu", "alternatives", "sandbox",
    "DNS", "NTP", "PTP", "DHCP", "HTTP", "httpd", "nginx", "SMTP", "IMAP"] },
  "2.5": { title: "Given a scenario, manage Linux using systemd.", keywords: [
    "service", "timer", "mount", "target",
    "hostnamectl", "resolvectl", "sysctl", "systemctl", "systemd-analyze", "blame", "systemd-resolved", "timedatectl",
    "daemon-reload", "disable", "edit", "enable", "mask", "reload", "restart", "start", "status", "stop", "unmask"] },
  "2.6": { title: "Given a scenario, manage applications in a container on a Linux server.", keywords: [
    "runC", "Podman", "containerd", "Docker", "pull", "build", "Dockerfile", "ENTRYPOINT", "CMD", "USER", "FROM",
    "prune", "tag", "layer", "logs", "volume", "start", "stop", "inspect", "rm", "run", "exec", "environment variable",
    "SELinux", ":Z", "overlay", "network create", "port", "macvlan", "ipvlan", "host", "bridge", "none",
    "privileged", "unprivileged"] },
  "3.1": { title: "Summarize authorization, authentication, and accounting methods.", keywords: [
    "Polkit", "PAM", "SSSD", "Winbind", "LDAP", "Kerberos", "Samba",
    "journalctl", "rsyslog", "logrotate", "/var/log", "audit.rules", "auditd"] },
  "3.2": { title: "Given a scenario, configure and implement firewalls on a Linux system.", keywords: [
    "firewalld", "firewall-cmd", "runtime", "permanent", "rich rule", "zone", "port", "service",
    "ufw", "nftables", "iptables", "ipset", "netfilter", "NAT", "PAT", "DNAT", "SNAT",
    "stateful", "stateless", "IP forwarding", "net.ipv4.ip_forward"] },
  "3.3": { title: "Given a scenario, apply operating system (OS) hardening techniques on a Linux system.", keywords: [
    "sudo", "/etc/sudoers", "NOEXEC", "NOPASSWD", "/etc/sudoers.d", "visudo", "sudo -i", "wheel", "sudo group", "su -",
    "chattr", "lsattr", "immutable", "append only", "chgrp", "chmod", "octal", "symbolic", "chown",
    "sticky bit", "setuid", "setgid", "umask", "ACL", "setfacl", "getfacl",
    "SELinux", "restorecon", "semanage", "chcon", "ls -Z", "getenforce", "setenforce", "getsebool", "setsebool",
    "audit2allow", "sealert", "enforcing", "permissive", "disabled",
    "sshd", "key", "tunnel", "PermitRootLogin", "X11Forwarding", "AllowUsers", "AllowGroups", "ssh-agent", "SFTP",
    "chroot", "fail2ban", "Telnet", "FTP", "TFTP", "unused file system", "SUID", "Secure Boot", "UEFI"] },
  "3.4": { title: "Explain account hardening techniques and best practices.", keywords: [
    "complexity", "length", "expiration", "reuse", "history", "MFA", "breach",
    "restricted shell", "/sbin/nologin", "/bin/rbash", "pam_tally2", "root"] },
  "3.5": { title: "Explain cryptographic concepts and technologies in a Linux environment.", keywords: [
    "data at rest", "GPG", "LUKS2", "Argon2", "data in transit", "OpenSSL", "WireGuard", "LibreSSL", "TLS",
    "SHA-256", "HMAC", "weak algorithm", "certificate", "trusted root", "no-cost", "commercial", "self-signed"] },
  "3.6": { title: "Explain the importance of compliance and audit procedures.", keywords: [
    "anti-malware", "indicators of compromise", "vulnerability scan", "CVE", "CVSS", "backport", "misconfiguration",
    "port scanner", "protocol analyzer", "OpenSCAP", "CIS", "AIDE", "rkhunter", "signed package", "rpm -V",
    "shred", "badblocks -w", "dd if=/dev/urandom", "cryptographic", "supply chain",
    "/etc/issue", "/etc/issue.net", "/etc/motd"] },
  "4.1": { title: "Summarize the use cases and techniques of automation and orchestration in a Linux environment.", keywords: [
    "infrastructure as code", "Ansible", "playbook", "inventory", "module", "ad hoc", "collection", "fact", "agentless",
    "Puppet", "class", "certificate", "agent", "OpenTofu", "provider", "resource", "state", "API",
    "Kickstart", "cloud-init", "CI/CD", "version control", "shift left", "GitOps", "pipeline", "DevSecOps",
    "Kubernetes", "ConfigMap", "Secret", "Pod", "Deployment", "volume", "service", "variable",
    "Docker Swarm", "node", "task", "network", "scale", "Compose", "compose file", "up", "down", "logs"] },
  "4.2": { title: "Given a scenario, perform automated tasks using shell scripting.", keywords: [
    "parameter expansion", "${", "command substitution", "$(", "`", "subshell", "function", "IFS", "OFS",
    "if", "case", "until", "for", "while", "#!",
    "-eq", "-ge", "-gt", "-le", "-lt", "-ne", "==", "=~", "!=", "<=", ">=",
    "regular expression", "[[", "test", "-d", "-f", "-n", "-z",
    "environment", "argument", "alias", "export", "local", "set", "unalias", "unset", "return code", "$?"] },
  "4.3": { title: "Summarize Python basics used for Linux system administration.", keywords: [
    "virtual environment", "venv", "built-in module", "pip install", "dependenc", "indentation", "Python 3",
    "boolean", "dictionary", "float", "integer", "list", "string", "module", "package", "PEP 8"] },
  "4.4": { title: "Given a scenario, implement version control using Git.", keywords: [
    ".gitignore", "git add", "git branch", "git checkout", "git clone", "git commit", "git config", "git diff",
    "git fetch", "git init", "git log", "git merge", "squash", "git pull", "git push", "git rebase", "git reset",
    "git stash", "git tag"] },
  "4.5": { title: "Summarize best practices and responsible uses of artificial intelligence (AI).", keywords: [
    "generat", "code", "regular expression", "infrastructure as code", "document", "compliance", "security review",
    "optimiz", "lint", "review", "verify", "data governance", "LLM", "training", "human review", "local model",
    "private", "public", "corporate policy", "prompt engineering"] },
  "5.1": { title: "Summarize monitoring concepts and configurations in a Linux system.", keywords: [
    "SLA", "SLI", "SLO", "SNMP", "trap", "MIB", "agent", "agentless", "webhook", "health check", "log aggregation",
    "threshold", "alert", "event", "notification", "logging"] },
  "5.2": { title: "Given a scenario, analyze and troubleshoot hardware, storage, and Linux OS issues.", keywords: [
    "kernel panic", "data corruption", "kernel corruption", "package dependency", "will not mount", "not turning on",
    "filesystem full", "inaccessible", "device failure", "inode exhaustion", "not writable", "segmentation fault",
    "GRUB", "killed process", "PATH", "unit failure", "driver", "unresponsive", "quota", "memory leak"] },
  "5.3": { title: "Given a scenario, analyze and troubleshoot networking issues on a Linux system.", keywords: [
    "firewall", "DHCP", "DNS", "interface", "MTU", "bonding", "MAC spoofing", "subnet", "ping", "routing", "gateway",
    "unreachable", "IP conflict", "dual stack", "IPv6", "link down", "link negotiation"] },
  "5.4": { title: "Given a scenario, analyze and troubleshoot security issues on a Linux system.", keywords: [
    "SELinux", "policy", "context", "boolean", "permission", "ACL", "attribute", "account access", "unpatched",
    "exposed", "remote access", "certificate", "repository", "obsolete", "insecure", "cipher"] },
  "5.5": { title: "Given a scenario, analyze and troubleshoot performance issues.", keywords: [
    "swapping", "out of memory", "slow application", "unresponsive", "high CPU", "load average", "context switch",
    "failed log-in", "slow startup", "I/O wait", "packet drop", "jitter", "random disconnect", "timeout", "latency",
    "slow response", "disk latency", "throughput", "blocked process", "hardware error", "sluggish terminal",
    "baseline", "remote storage", "CPU bottleneck"] }
};
