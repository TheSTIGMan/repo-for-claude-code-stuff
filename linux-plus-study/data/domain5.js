// Domain 5: Troubleshooting (objectives 5.1 - 5.5)
window.LINUX_PLUS_DATA.objectives.push(
  // ---------------------------------------------------------------- 5.1
  {
    id: "5.1", domain: 5,
    title: "Summarize monitoring concepts and configurations in a Linux system.",
    summary: "Monitoring is how you know a system is healthy before users tell you it is not. This objective covers how service quality is promised and measured (SLA, SLO, SLI), the ways monitoring tools collect data (SNMP, agents, webhooks, health checks, log aggregation), and how you turn raw data into useful action with thresholds, alerts, events, notifications, and logging.",
    topics: [
      {
        name: "Service monitoring: SLA, SLO, and SLI",
        explain: "An SLA (Service Level Agreement) is the formal promise to a customer, often with penalties, such as \"99.9% uptime per month\". An SLO (Service Level Objective) is the internal target the team aims for, usually a bit stricter than the SLA so there is a safety margin. An SLI (Service Level Indicator) is the actual measured number, such as the percentage of successful requests or the 95th-percentile response time. Think of it as: the SLI is the measurement, the SLO is the goal for that measurement, and the SLA is the contract built on top.",
        examples: [
          { cmd: "curl -o /dev/null -s -w '%{http_code} %{time_total}\\n' https://example.com/", what: "Measures one request's HTTP status and total time, the kind of raw data that feeds an SLI such as availability or latency." }
        ],
        tip: "Order from most concrete to most formal: SLI (Indicator = measured) -> SLO (Objective = target) -> SLA (Agreement = contract)."
      },
      {
        name: "SNMP: traps and MIBs",
        explain: "SNMP (Simple Network Management Protocol) is a classic way to monitor network devices and servers. A manager polls agents on UDP port 161 to read values, and agents can push unsolicited messages called traps to the manager on UDP port 162 when something happens (for example, a link goes down). The MIB (Management Information Base) is the dictionary that describes which values exist; each value has an OID (object identifier). SNMPv1/v2c use plain-text community strings, while SNMPv3 adds authentication and encryption.",
        examples: [
          { cmd: "snmpwalk -v2c -c public 192.168.1.10 system", what: "Walks the 'system' branch of the MIB on a device using SNMPv2c and the community string 'public'." },
          { cmd: "snmpget -v3 -u monitor -l authPriv -a SHA -A 'authpass' -x AES -X 'privpass' 192.168.1.10 sysUpTime.0", what: "Reads the uptime value securely using SNMPv3 with authentication and encryption." },
          { cmd: "systemctl enable --now snmpd", what: "Starts the net-snmp agent on a Linux server so a monitoring system can poll it." }
        ],
        tip: "Polling = manager asks (port 161). Trap = agent tells (port 162). MIB = the map of what can be asked."
      },
      {
        name: "Agent vs. agentless monitoring",
        explain: "Agent-based monitoring installs a small program on each host (for example node_exporter, Zabbix agent, or a Datadog agent) that collects detailed metrics and sends them in or exposes them. It gives rich data but must be installed, updated, and secured on every system. Agentless monitoring uses protocols that already exist, such as SSH, SNMP, ICMP ping, or HTTP checks, so nothing extra is installed, but data is usually less detailed.",
        examples: [
          { cmd: "systemctl status node_exporter", what: "Checks that a Prometheus monitoring agent is running on the host." },
          { cmd: "curl -s http://localhost:9100/metrics | head", what: "Shows the first few metrics that the agent exposes for a monitoring server to scrape." },
          { cmd: "ssh monitor@web01 'uptime; df -h /'", what: "An agentless style check: runs commands over SSH to collect load and disk usage." }
        ]
      },
      {
        name: "Webhooks and health checks",
        explain: "A webhook is an HTTP callback: when an event happens, one system sends an HTTP POST with details (usually JSON) to a URL on another system, such as a chat channel or ticketing tool. A health check is a simple, repeated test that a service is alive and working, such as hitting a /health URL, testing a TCP port, or running a command; load balancers and orchestrators use health checks to stop sending traffic to sick instances.",
        examples: [
          { cmd: "curl -X POST -H 'Content-Type: application/json' -d '{\"text\":\"disk 90% on web01\"}' https://hooks.example.com/alert", what: "Sends an alert to a webhook URL, the same way a monitoring tool would notify a chat channel." },
          { cmd: "curl -fsS http://localhost:8080/health || echo UNHEALTHY", what: "A basic HTTP health check: prints UNHEALTHY if the endpoint fails or returns an error code." },
          { cmd: "nc -zv db01 5432", what: "A TCP health check that only confirms the database port is accepting connections." }
        ]
      },
      {
        name: "Log aggregation",
        explain: "Log aggregation means collecting logs from many servers into one central place so you can search, correlate, and alert on them. On Linux this is often done with rsyslog forwarding to a central syslog server, or with shippers like Fluentd, Filebeat, or Promtail sending to stacks like ELK (Elasticsearch, Logstash, Kibana) or Loki. Centralizing logs also protects them if a server is compromised or crashes.",
        examples: [
          { cmd: "echo '*.* @@logserver.example.com:514' | sudo tee /etc/rsyslog.d/90-forward.conf", what: "Configures rsyslog to forward all logs to a central server over TCP (@@ = TCP, @ = UDP)." },
          { cmd: "sudo systemctl restart rsyslog", what: "Reloads rsyslog so the forwarding rule takes effect." },
          { cmd: "logger -p user.warning 'test message from web01'", what: "Writes a test message to syslog so you can confirm it shows up on the central server." }
        ]
      },
      {
        name: "Thresholds, alerts, events, and notifications",
        explain: "A threshold is the line that defines a problem, such as CPU above 90% for 5 minutes or disk above 85%. An event is anything notable that happened (a service restarted, a threshold was crossed). An alert is an event that someone needs to act on. A notification is how the alert is delivered: email, SMS, a pager, a chat message, or a webhook. Good monitoring uses warning and critical thresholds and a duration to avoid alert fatigue from brief spikes.",
        examples: [
          { cmd: "df -h / | awk 'NR==2 {gsub(\"%\",\"\",$5); if ($5 > 85) print \"ALERT: root at \" $5 \"%\"}'", what: "A tiny threshold check: prints an alert line when the root filesystem is over 85% full." },
          { cmd: "systemctl list-timers", what: "Lists scheduled systemd timers, often used to run custom check scripts on a schedule." }
        ],
        tip: "Event = something happened. Alert = someone should act. Notification = how they hear about it."
      },
      {
        name: "Logging configuration",
        explain: "Logging is the record that all monitoring depends on. On systemd systems, journald collects logs and rsyslog can write them to files in /var/log. Configure log levels (priority) so you capture enough detail without filling the disk, make the journal persistent so logs survive reboots, and use logrotate to compress and remove old logs.",
        examples: [
          { cmd: "journalctl -p err -b", what: "Shows only error-level (and worse) messages from the current boot." },
          { cmd: "sudo mkdir -p /var/log/journal && sudo systemctl restart systemd-journald", what: "Makes the journal persistent so logs are kept across reboots (with Storage=auto)." },
          { cmd: "sudo logrotate -d /etc/logrotate.conf", what: "Dry-runs log rotation to show what would be rotated without changing anything." }
        ]
      }
    ],
    cards: [
      { q: "Your contract promises customers 99.9% uptime. Is that an SLA, SLO, or SLI?", a: "An SLA (Service Level Agreement): the formal, customer-facing promise." },
      { q: "The measured percentage of HTTP requests that succeeded last week is called what?", a: "An SLI (Service Level Indicator): the actual measured value." },
      { q: "Your team internally targets 99.95% availability to stay safely inside the contract. What is this?", a: "An SLO (Service Level Objective): the internal goal for an SLI." },
      { q: "A switch should notify the monitoring server immediately when a port goes down instead of waiting to be polled. Which SNMP feature does this?", a: "An SNMP trap, sent from the agent to the manager on UDP port 162." },
      { q: "What is a MIB in SNMP?", a: "The Management Information Base: a structured definition of the values (OIDs) a device exposes for monitoring." },
      { q: "Which SNMP version adds authentication and encryption?", a: "SNMPv3. Versions 1 and 2c use plain-text community strings." },
      { q: "You cannot install software on some appliances but still want to monitor them. What approach do you use?", a: "Agentless monitoring, using existing protocols such as SNMP, SSH, ICMP, or HTTP checks." },
      { q: "A load balancer keeps sending traffic to a crashed backend. What should be configured?", a: "A health check (for example an HTTP /health probe) so unhealthy backends are removed from rotation." },
      { q: "How do you forward all rsyslog messages to a central log server over TCP?", a: "Add a rule like `*.* @@logserver:514` in /etc/rsyslog.d/ and restart rsyslog. A single @ means UDP." },
      { q: "Admins get paged every time CPU briefly spikes for 2 seconds. How do you reduce alert fatigue?", a: "Tune the threshold: raise it or require it to be exceeded for a duration (for example 5 minutes), and use separate warning and critical levels." }
    ]
  },

  // ---------------------------------------------------------------- 5.2
  {
    id: "5.2", domain: 5,
    title: "Given a scenario, analyze and troubleshoot hardware, storage, and Linux OS issues.",
    summary: "This objective is about the classic \"something is broken on this server\" problems: it will not boot, a disk is full or failing, a filesystem will not mount, a package will not install, or a process crashes or hangs. The key skill is reading the symptoms, checking the right logs and tools (journalctl, dmesg, df, systemctl, smartctl), and applying a safe fix.",
    topics: [
      {
        name: "Kernel panic and kernel corruption issues",
        explain: "A kernel panic is a fatal error where the kernel stops because it cannot safely continue; the screen shows \"Kernel panic - not syncing\". Common causes are a corrupted or mismatched kernel or initramfs, a missing root filesystem driver, bad RAM, faulty hardware, or a buggy kernel module. Kernel corruption issues (a damaged vmlinuz or initramfs, often after a failed update or full /boot) cause similar boot failures. Fix by booting an older kernel from the GRUB menu, then reinstalling the kernel or rebuilding the initramfs.",
        examples: [
          { cmd: "journalctl -k -b -1", what: "Shows kernel messages from the previous boot, where the panic or error happened (needs a persistent journal)." },
          { cmd: "sudo dracut -f /boot/initramfs-$(uname -r).img $(uname -r)", what: "Rebuilds the initramfs for the running kernel on RHEL-family systems." },
          { cmd: "sudo update-initramfs -u -k all", what: "Rebuilds the initramfs for all kernels on Debian/Ubuntu." },
          { cmd: "sudo dnf reinstall kernel-core", what: "Reinstalls the kernel package to replace corrupted kernel files." }
        ],
        tip: "\"VFS: Unable to mount root fs\" in a panic usually points to a bad initramfs or wrong root= parameter."
      },
      {
        name: "GRUB misconfiguration",
        explain: "If GRUB is misconfigured you may land at a `grub>` or `grub rescue>` prompt, see the wrong kernel, or get a root-not-found error. Causes include a typo in /etc/default/grub, a wrong root= UUID after disk changes, a deleted /boot partition, or a damaged boot loader. You can press `e` at the GRUB menu to edit kernel parameters for one boot, then fix permanently by regenerating the config or reinstalling GRUB from a rescue environment.",
        examples: [
          { cmd: "sudo grub2-mkconfig -o /boot/grub2/grub.cfg", what: "Regenerates the GRUB configuration on RHEL-family systems after editing /etc/default/grub." },
          { cmd: "sudo update-grub", what: "Regenerates the GRUB configuration on Debian/Ubuntu." },
          { cmd: "sudo grub2-install /dev/sda", what: "Reinstalls the GRUB boot loader to the disk (BIOS systems), for example from a rescue chroot." },
          { cmd: "blkid", what: "Lists filesystem UUIDs so you can confirm the root= value GRUB is passing is correct." }
        ]
      },
      {
        name: "Server not turning on or inaccessible",
        explain: "If a server is not turning on at all (no lights, fans, or POST), suspect power: cables, PSU, the PDU, or a tripped breaker, then check the out-of-band management (iDRAC, iLO, IPMI) event log. If it powers on but is inaccessible over the network, determine whether it is a boot problem, a network problem, or a service problem: use the remote console, ping it, and check whether sshd is running and the firewall allows it.",
        examples: [
          { cmd: "ipmitool -I lanplus -H 10.0.0.50 -U admin -P secret chassis status", what: "Asks the server's BMC over the network whether the chassis is powered on and if there are power faults." },
          { cmd: "ipmitool -I lanplus -H 10.0.0.50 -U admin -P secret sel list", what: "Reads the hardware System Event Log for PSU, fan, temperature, or memory errors." },
          { cmd: "ping -c 3 web01 && nc -zv web01 22", what: "Checks basic reachability and whether the SSH port is open, separating network from service problems." }
        ]
      },
      {
        name: "Filesystem will not mount and data corruption issues",
        explain: "When a filesystem will not mount, the cause is often a wrong device or UUID in /etc/fstab, a missing filesystem driver, a typo in mount options, or a corrupted filesystem. A bad fstab entry can drop the system into emergency mode at boot. Data corruption issues show up as I/O errors, read-only remounts, or files with garbage content, often after a power loss or failing disk. Check logs, verify the UUID, and run a filesystem check on the unmounted filesystem.",
        examples: [
          { cmd: "sudo mount -a", what: "Tries to mount everything in /etc/fstab, showing the error for any bad entry (test after editing fstab)." },
          { cmd: "dmesg | tail -30", what: "Shows recent kernel messages such as 'wrong fs type', 'bad superblock', or I/O errors." },
          { cmd: "sudo umount /dev/sdb1 && sudo fsck -y /dev/sdb1", what: "Checks and repairs an ext filesystem. Never run fsck on a mounted filesystem." },
          { cmd: "sudo xfs_repair /dev/sdb1", what: "Repairs an unmounted XFS filesystem (XFS uses xfs_repair, not fsck)." }
        ],
        tip: "Add `nofail` to non-critical fstab entries so a missing disk does not stop the boot."
      },
      {
        name: "OS filesystem full and inode exhaustion",
        explain: "When the OS filesystem is full, writes fail with \"No space left on device\", services crash, and logins may break. Find what is using space with du, and check for large logs or deleted files still held open by a process. Inode exhaustion gives the same error even when df -h shows free space, because every inode (one per file) is used up, usually by millions of tiny files such as session or cache files. Check inodes with df -i and remove the many small files.",
        examples: [
          { cmd: "df -h", what: "Shows how full each filesystem is in human-readable sizes." },
          { cmd: "df -i", what: "Shows inode usage; IUse% at 100% means inode exhaustion even if space remains." },
          { cmd: "sudo du -xh / --max-depth=1 | sort -h", what: "Shows which top-level directories on the root filesystem use the most space." },
          { cmd: "sudo lsof +L1", what: "Lists deleted files still held open; their space is freed only when the process is restarted." }
        ],
        tip: "\"No space left on device\" + free space in df -h = run df -i."
      },
      {
        name: "Partition not writable",
        explain: "If a partition is not writable, first see whether it is mounted read-only. The kernel often remounts a filesystem read-only (ro) after detecting errors to protect data, so check dmesg for the cause. Other causes are a ro option in fstab, wrong ownership or permissions, the immutable attribute, a full disk or inode exhaustion, or a hardware write-protect.",
        examples: [
          { cmd: "findmnt -no OPTIONS /data", what: "Shows mount options for /data; look for 'ro' instead of 'rw'." },
          { cmd: "sudo mount -o remount,rw /data", what: "Remounts the filesystem read-write once the underlying error is fixed." },
          { cmd: "lsattr -d /data", what: "Shows attributes; an 'i' (immutable) flag blocks all writes even for root." }
        ]
      },
      {
        name: "Device failure",
        explain: "A failing disk, controller, or other device shows up as I/O errors in dmesg, slow access, SMART warnings, or a degraded RAID array. Check the disk's SMART health, look at the RAID status, and replace the hardware. For software RAID, mark the bad disk failed, remove it, and add the replacement so the array rebuilds.",
        examples: [
          { cmd: "sudo smartctl -H /dev/sda", what: "Shows the overall SMART health verdict for the disk (PASSED or FAILED)." },
          { cmd: "cat /proc/mdstat", what: "Shows software RAID status; [U_] means one member of the mirror is missing or failed." },
          { cmd: "sudo mdadm /dev/md0 --fail /dev/sdb1 --remove /dev/sdb1", what: "Marks a failed disk as faulty and removes it from the array before replacement." },
          { cmd: "dmesg -T | grep -iE 'error|fail'", what: "Searches kernel messages, with readable timestamps, for device errors." }
        ]
      },
      {
        name: "Missing or disabled drivers",
        explain: "If hardware such as a NIC, storage controller, or GPU is not detected or not working, the kernel module (driver) may be missing, not loaded, or blacklisted. Check whether the kernel sees the device and which driver it uses, then load the module or remove the blacklist entry. After a kernel update, third-party modules (for example DKMS drivers) may need rebuilding.",
        examples: [
          { cmd: "lspci -k", what: "Lists PCI devices with the 'Kernel driver in use' line; a missing line means no driver is bound." },
          { cmd: "lsmod | grep e1000e", what: "Checks whether a specific module is currently loaded." },
          { cmd: "sudo modprobe e1000e", what: "Loads the module (and its dependencies)." },
          { cmd: "grep -r blacklist /etc/modprobe.d/", what: "Finds modules that have been disabled via blacklist entries." }
        ]
      },
      {
        name: "Package dependency issues",
        explain: "Package dependency issues happen when a package needs another package (or version) that is missing, conflicting, or from a disabled repository. Symptoms include install errors like \"nothing provides\" or \"unmet dependencies\", or a broken half-installed state after an interrupted update. Let the package manager resolve dependencies, refresh repository metadata, and check which repositories are enabled.",
        examples: [
          { cmd: "sudo apt --fix-broken install", what: "Asks apt to install missing dependencies and finish interrupted installs on Debian/Ubuntu." },
          { cmd: "sudo dnf clean all && sudo dnf makecache", what: "Clears cached repo data and downloads fresh metadata on RHEL-family systems." },
          { cmd: "dnf repoquery --requires nginx", what: "Lists what a package depends on." },
          { cmd: "rpm -Va", what: "Verifies installed packages, reporting changed or missing files." }
        ],
        tip: "Avoid `rpm -i --nodeps` and `dpkg --force-depends` as fixes; they hide the problem and break later updates."
      },
      {
        name: "Systemd unit failures",
        explain: "Systemd unit failures show up as a service in the failed state or one that keeps restarting. Common causes are a bad config file, a wrong ExecStart path, a missing dependency, a port already in use, permission or SELinux denials, or a typo in the unit file. Read the status and the unit's logs, fix the cause, then reload and restart.",
        examples: [
          { cmd: "systemctl --failed", what: "Lists every unit currently in the failed state." },
          { cmd: "systemctl status nginx", what: "Shows whether the service is running, its exit code, and the last few log lines." },
          { cmd: "journalctl -u nginx -b --no-pager", what: "Shows all log messages for the nginx unit from this boot." },
          { cmd: "sudo systemctl daemon-reload && sudo systemctl restart nginx", what: "Reloads edited unit files, then restarts the service." }
        ]
      },
      {
        name: "Segmentation fault, killed processes, and unresponsive process",
        explain: "A segmentation fault (segfault) means a program tried to access memory it is not allowed to, usually due to a bug, a library mismatch, or bad RAM; check dmesg and core dumps. Killed processes are often the work of the kernel's OOM killer when memory runs out, or of another user or script sending SIGKILL. An unresponsive process (hung) may be stuck waiting on I/O (D state) or in a loop; inspect its state, try SIGTERM first, and use SIGKILL only if needed.",
        examples: [
          { cmd: "dmesg | grep -i segfault", what: "Shows kernel log lines for programs that crashed with a segmentation fault." },
          { cmd: "coredumpctl list", what: "Lists captured core dumps so you can debug the crashed program." },
          { cmd: "journalctl -k | grep -i 'killed process'", what: "Finds processes the OOM killer terminated and how much memory they used." },
          { cmd: "ps -o pid,stat,wchan:20,cmd -p 1234 ; kill -15 1234", what: "Shows the process state and what it waits on, then asks it to exit politely with SIGTERM." }
        ],
        tip: "A process in D state (uninterruptible sleep) cannot be killed even with kill -9; fix the I/O it is waiting on."
      },
      {
        name: "Memory leaks",
        explain: "A memory leak is when a program keeps allocating memory and never frees it, so its memory use (RSS) grows steadily over hours or days until the system swaps or the OOM killer steps in. Watch a process's memory over time, restart the service as a short-term fix, and set limits or report the bug for a long-term fix.",
        examples: [
          { cmd: "ps aux --sort=-rss | head", what: "Lists processes using the most resident memory." },
          { cmd: "pidstat -r -p 1234 60", what: "Reports memory use for one process every 60 seconds so you can see if it keeps growing." },
          { cmd: "sudo systemctl set-property myapp.service MemoryMax=2G", what: "Caps the service's memory with a cgroup limit so a leak cannot take down the whole server." }
        ]
      },
      {
        name: "Quota issues",
        explain: "Disk quotas limit how much space or how many files a user or group can use. When a user hits their hard limit, writes fail with \"Disk quota exceeded\" even though the filesystem has free space. Check the user's usage against their soft and hard limits, then clean up files or raise the limit.",
        examples: [
          { cmd: "quota -u alice", what: "Shows alice's block and inode usage compared to her limits." },
          { cmd: "sudo repquota -a", what: "Reports quota usage for all users on all quota-enabled filesystems." },
          { cmd: "sudo edquota -u alice", what: "Opens an editor to change alice's soft and hard limits." },
          { cmd: "sudo xfs_quota -x -c 'report -h' /home", what: "Shows quota usage on an XFS filesystem." }
        ]
      },
      {
        name: "PATH misconfiguration issues",
        explain: "PATH is the list of directories the shell searches for commands. If it is misconfigured (overwritten instead of appended, or missing /usr/sbin), commands give \"command not found\" even though they are installed, or the wrong version runs. Check the variable and the startup files that set it, such as ~/.bashrc, ~/.bash_profile, and /etc/profile.d/.",
        examples: [
          { cmd: "echo $PATH", what: "Prints the current search path so you can see which directories are missing." },
          { cmd: "type -a python3", what: "Shows every location of a command on the PATH, in the order the shell would use them." },
          { cmd: "export PATH=\"$PATH:/opt/app/bin\"", what: "Appends a directory to PATH without erasing the existing entries." },
          { cmd: "grep -n PATH ~/.bashrc ~/.bash_profile /etc/profile /etc/profile.d/*.sh", what: "Finds where PATH is being set or overwritten." }
        ],
        tip: "`PATH=/opt/app/bin` (no $PATH) wipes the path and breaks almost everything."
      }
    ],
    cards: [
      { q: "A user gets \"No space left on device\" but df -h shows 40% free. What do you check?", a: "Inode exhaustion with `df -i`. If IUse% is 100%, find and remove the huge number of small files." },
      { q: "After editing /etc/fstab, the server boots into emergency mode. What is the likely cause and fix?", a: "A bad fstab entry (wrong UUID, device, or option). Log in to emergency mode, fix /etc/fstab (check UUIDs with `blkid`), then test with `mount -a`." },
      { q: "You deleted a 20 GB log file but df shows no space was freed. Why?", a: "A process still has the deleted file open. Find it with `lsof +L1` and restart that process to release the space." },
      { q: "After a kernel update the system panics with \"VFS: Unable to mount root fs\". What do you do?", a: "Boot the previous kernel from the GRUB menu, then rebuild the initramfs (dracut -f or update-initramfs -u) or reinstall the new kernel." },
      { q: "A filesystem suddenly became read-only and writes fail. What is the first thing to check?", a: "Check `dmesg` for filesystem or I/O errors; the kernel remounts read-only to protect data. Fix the error (fsck or replace disk), then remount rw." },
      { q: "A service shows \"failed\" after a config change. Which two commands show why?", a: "`systemctl status <unit>` for the summary and `journalctl -u <unit>` for the full logs." },
      { q: "A database process vanished overnight and dmesg mentions \"Out of memory: Killed process\". What happened?", a: "The kernel OOM killer terminated it because RAM and swap ran out. Find the memory hog or leak, add memory or swap, or set limits." },
      { q: "A user can type `ip` as root on one server but gets \"command not found\" on another. The package is installed. Likely cause?", a: "PATH misconfiguration, for example /usr/sbin is missing from PATH. Check with `echo $PATH` and fix the shell startup files." },
      { q: "A user gets \"Disk quota exceeded\" while the disk has plenty of space. What do you check?", a: "Their quota with `quota -u user` or `repquota -a`, then clean up or raise the limit with `edquota`." },
      { q: "A new network card is not working and `lspci -k` shows no \"Kernel driver in use\" line. What next?", a: "The driver is missing or disabled: check for a blacklist in /etc/modprobe.d/, load it with `modprobe`, or install the driver package." },
      { q: "Which command repairs an XFS filesystem?", a: "`xfs_repair` on the unmounted device. fsck is used for ext2/3/4." }
    ]
  },

  // ---------------------------------------------------------------- 5.3
  {
    id: "5.3", domain: 5,
    title: "Given a scenario, analyze and troubleshoot networking issues on a Linux system.",
    summary: "Network problems are best solved layer by layer: is the link up, does the interface have the right address, can it reach the gateway, does name resolution work, and is a firewall blocking the port? This objective covers the common failures at each step and the tools (ip, ethtool, ping, mtr, ss, dig, nmcli, firewall-cmd) used to find and fix them.",
    topics: [
      {
        name: "Link down and link negotiation issues",
        explain: "Link down means the physical connection is not working: the interface shows NO-CARRIER or state DOWN. Causes include an unplugged or bad cable, a disabled switch port, a disabled interface, or a missing driver. Link negotiation issues happen when the NIC and switch disagree on speed or duplex (for example one side forced to 100 Mb full duplex and the other on auto), causing a slow link, errors, and collisions. Check and fix with ethtool.",
        examples: [
          { cmd: "ip link show eth0", what: "Shows whether the interface is UP and whether it has a carrier (NO-CARRIER means no physical link)." },
          { cmd: "sudo ip link set eth0 up", what: "Brings an administratively disabled interface up." },
          { cmd: "ethtool eth0", what: "Shows link speed, duplex, auto-negotiation status, and 'Link detected: yes/no'." },
          { cmd: "sudo ethtool -s eth0 autoneg on", what: "Turns auto-negotiation back on so both sides agree on speed and duplex." }
        ],
        tip: "Duplex mismatch symptoms: link is up but slow, with many errors or late collisions in `ip -s link`."
      },
      {
        name: "Interface misconfiguration: IP and subnet",
        explain: "If the IP address or subnet mask (prefix) is wrong, the host may reach some systems but not others. A wrong prefix makes the host think remote hosts are local (or vice versa), so it ARPs instead of using the gateway. Compare the configured address and prefix with what the network should use, and fix it in NetworkManager or the network config so it persists.",
        examples: [
          { cmd: "ip -br addr", what: "Shows each interface's state and IP addresses with prefix length in a short table." },
          { cmd: "sudo nmcli con mod eth0 ipv4.addresses 192.168.10.25/24 ipv4.method manual && sudo nmcli con up eth0", what: "Sets a static IP with the correct /24 subnet and re-applies the connection." },
          { cmd: "ipcalc 192.168.10.25/26", what: "Shows the network, broadcast, and host range for an address and prefix to check the subnet math." }
        ]
      },
      {
        name: "Cannot ping server",
        explain: "When you cannot ping a server, work outward: ping your own loopback, your own IP, the default gateway, then the remote IP, then the remote name. Where it stops tells you the layer at fault. Remember that a failed ping does not always mean the host is down, since many firewalls block ICMP; test the actual service port too.",
        examples: [
          { cmd: "ping -c 4 192.168.10.1", what: "Tests reachability of the default gateway with four ICMP echo requests." },
          { cmd: "ping -c 4 10.20.0.5", what: "Tests the remote server by IP, which skips DNS." },
          { cmd: "nc -zv 10.20.0.5 443", what: "Checks whether TCP port 443 answers even if ICMP is blocked." }
        ],
        tip: "Ping by IP works but by name fails = DNS problem."
      },
      {
        name: "MTU mismatch",
        explain: "The MTU is the largest packet an interface sends (1500 bytes on standard Ethernet, up to 9000 with jumbo frames). An MTU mismatch along the path, often with VPNs, tunnels, or jumbo frames on only one side, causes a strange pattern: ping and small requests work, but large transfers, SSH sessions after login, or HTTPS pages hang. Test with large non-fragmenting pings and set a consistent MTU.",
        examples: [
          { cmd: "ping -M do -s 1472 10.20.0.5", what: "Sends a 1500-byte packet (1472 data + 28 header) with 'do not fragment'; failure means something on the path has a smaller MTU." },
          { cmd: "tracepath 10.20.0.5", what: "Discovers the path MTU hop by hop." },
          { cmd: "sudo ip link set dev eth0 mtu 1400", what: "Lowers the interface MTU to match the path (make it permanent in the connection profile)." }
        ]
      },
      {
        name: "Bonding issues",
        explain: "Bonding (teaming) combines NICs for redundancy or more bandwidth. Problems include a slave interface being down, the wrong mode (for example 802.3ad/LACP configured on the server but not on the switch), or mismatched settings that cause flapping and packet loss. Check the bond status file to see the mode and the state of each member.",
        examples: [
          { cmd: "cat /proc/net/bonding/bond0", what: "Shows bonding mode, the active slave, and the MII status of each member interface." },
          { cmd: "nmcli con show", what: "Lists connections, including the bond and its port (slave) connections, to see if any are inactive." },
          { cmd: "ip -d link show bond0", what: "Shows detailed bond settings such as mode and miimon." }
        ],
        tip: "Mode 4 (802.3ad/LACP) needs matching LACP config on the switch; mode 1 (active-backup) needs no switch support."
      },
      {
        name: "MAC spoofing and IP conflicts",
        explain: "An IP conflict happens when two hosts use the same IP address, causing intermittent connectivity as switches and neighbors flip between the two MAC addresses. MAC spoofing is when a device fakes another device's MAC address, either legitimately (some cloned-MAC setups, or NetworkManager's random MAC feature) or maliciously; it can cause conflicts or be blocked by switch port security. Use arping to detect duplicate addresses and compare MACs in the neighbor table.",
        examples: [
          { cmd: "sudo arping -D -I eth0 -c 3 192.168.10.25", what: "Duplicate address detection: any reply means another host already uses that IP." },
          { cmd: "ip neigh show", what: "Shows the ARP/neighbor table; a MAC that keeps changing for one IP suggests a conflict or spoofing." },
          { cmd: "ip link show eth0 | grep ether", what: "Shows the interface's current MAC address." },
          { cmd: "nmcli con show eth0 | grep -i cloned-mac", what: "Checks whether NetworkManager is cloning or randomizing the MAC address." }
        ]
      },
      {
        name: "DHCP issues",
        explain: "If a DHCP client gets no address, it may have no IP or a 169.254.x.x (APIPA/link-local) address. Causes include the DHCP server being down, an exhausted address pool, the client on the wrong VLAN, a firewall blocking UDP ports 67/68, or a missing DHCP relay. Release and renew the lease and watch the logs or capture traffic.",
        examples: [
          { cmd: "sudo nmcli con down eth0 && sudo nmcli con up eth0", what: "Restarts the connection so NetworkManager requests a new DHCP lease." },
          { cmd: "sudo dhclient -r eth0 && sudo dhclient -v eth0", what: "Releases and then requests a lease verbosely (on systems using dhclient)." },
          { cmd: "sudo tcpdump -ni eth0 port 67 or port 68", what: "Captures DHCP traffic to see whether DISCOVER messages get an OFFER back." },
          { cmd: "journalctl -u NetworkManager | grep -i dhcp", what: "Shows DHCP-related messages from NetworkManager." }
        ]
      },
      {
        name: "DNS issues",
        explain: "DNS issues show up when hosts can be reached by IP but not by name, or names resolve to the wrong address. Check which DNS servers are configured, test lookups directly, and look at /etc/hosts and /etc/nsswitch.conf, since a stale /etc/hosts entry overrides DNS. On systemd-resolved systems, /etc/resolv.conf points to a local stub at 127.0.0.53.",
        examples: [
          { cmd: "dig www.example.com", what: "Queries DNS and shows the answer, the server used, and the response status." },
          { cmd: "dig @8.8.8.8 www.example.com", what: "Queries a specific DNS server to see if the problem is your configured resolver." },
          { cmd: "resolvectl status", what: "Shows which DNS servers systemd-resolved uses for each interface." },
          { cmd: "getent hosts www.example.com", what: "Resolves the name the same way applications do, including /etc/hosts." }
        ]
      },
      {
        name: "Routing issues and gateway problems",
        explain: "If local hosts work but nothing on other networks does, suspect the default gateway: it may be missing, wrong, or unreachable. Other routing issues include missing static routes to specific networks, or asymmetric routing where replies take a different path and get dropped. Inspect the routing table and see which route the kernel picks for a destination.",
        examples: [
          { cmd: "ip route show", what: "Displays the routing table, including the 'default via' gateway line." },
          { cmd: "ip route get 8.8.8.8", what: "Shows exactly which route, interface, and gateway the kernel would use for that destination." },
          { cmd: "sudo ip route add default via 192.168.10.1", what: "Adds a default gateway (temporary; set ipv4.gateway with nmcli to persist)." },
          { cmd: "sudo ip route add 10.50.0.0/16 via 192.168.10.254", what: "Adds a static route to a specific network through another router." }
        ]
      },
      {
        name: "Server unreachable",
        explain: "When a server is unreachable, use path tools to find where traffic stops. traceroute and mtr show each hop; mtr adds live loss and latency per hop. \"Destination host unreachable\" from your own host or gateway usually means no route or no ARP reply, while timeouts often mean a firewall drop along the way. Then confirm the service is actually listening on the server.",
        examples: [
          { cmd: "mtr -rwc 50 10.20.0.5", what: "Sends 50 probes and prints a report of packet loss and latency per hop." },
          { cmd: "traceroute -T -p 443 10.20.0.5", what: "Traces the path using TCP to port 443, useful when ICMP/UDP is blocked." },
          { cmd: "ss -tlnp", what: "On the server, lists listening TCP ports and the processes that own them." }
        ],
        tip: "Service listening on 127.0.0.1 only = reachable locally but unreachable from the network."
      },
      {
        name: "Misconfigured firewalls",
        explain: "A misconfigured firewall typically shows as \"connection timed out\" (packets dropped) or \"connection refused\"/\"no route to host\" (rejected) for a service that is running. Check the active zone and allowed services or ports in firewalld, or the nftables/iptables rules directly, and remember changes made without --permanent are lost on reload or reboot.",
        examples: [
          { cmd: "sudo firewall-cmd --list-all", what: "Shows the active zone with its allowed services, ports, and rich rules." },
          { cmd: "sudo firewall-cmd --permanent --add-service=https && sudo firewall-cmd --reload", what: "Permanently allows HTTPS and applies the change." },
          { cmd: "sudo nft list ruleset", what: "Shows all nftables rules, the backend firewalld uses on modern systems." },
          { cmd: "sudo iptables -L -n -v", what: "Lists iptables rules with packet counters so you can see which rule is matching." }
        ]
      },
      {
        name: "Dual stack issues (IPv4 and IPv6)",
        explain: "On a dual stack host, both IPv4 and IPv6 are active, and many applications try IPv6 first when DNS returns an AAAA record. If IPv6 routing is broken, connections can be slow or fail while IPv4 works fine. Test each protocol separately, check that the service and firewall cover both, and fix IPv6 routing or, as a workaround, prefer IPv4.",
        examples: [
          { cmd: "ping -4 -c 3 www.example.com ; ping -6 -c 3 www.example.com", what: "Tests reachability over IPv4 and then IPv6 to see which one fails." },
          { cmd: "ip -6 route show", what: "Shows the IPv6 routing table, including the IPv6 default gateway." },
          { cmd: "curl -4 -I https://www.example.com ; curl -6 -I https://www.example.com", what: "Tests the web service separately over each protocol." },
          { cmd: "ss -tln | grep ':80'", what: "Shows whether the service listens on 0.0.0.0 (IPv4), [::] (IPv6), or both." }
        ]
      }
    ],
    cards: [
      { q: "You can ping 8.8.8.8 but `ping google.com` fails. What is the problem area?", a: "DNS. Check /etc/resolv.conf or `resolvectl status`, and test with `dig google.com`." },
      { q: "A server can reach hosts on its own subnet but nothing else. What do you check first?", a: "The default gateway with `ip route show` (look for a 'default via' line) and whether that gateway responds to ping." },
      { q: "SSH logins work, but large file copies over a VPN hang. Likely cause?", a: "An MTU mismatch. Test with `ping -M do -s 1472 host` and lower the MTU (or fix MSS clamping) on the path." },
      { q: "A client has a 169.254.x.x address. What does that mean?", a: "It failed to get a DHCP lease and self-assigned a link-local address. Check the DHCP server, VLAN, UDP 67/68, and renew the lease." },
      { q: "`ip link` shows eth0 with NO-CARRIER. What does that indicate?", a: "Link down at the physical layer: check the cable, switch port, and `ethtool eth0` for 'Link detected: no'." },
      { q: "A link is up but very slow with many errors, and ethtool shows half duplex. What is wrong?", a: "A link negotiation (duplex) mismatch. Set both the NIC and switch port to auto-negotiate, for example `ethtool -s eth0 autoneg on`." },
      { q: "Connectivity to a host drops in and out, and the MAC for its IP keeps changing in `ip neigh`. What do you suspect?", a: "An IP conflict (or MAC spoofing). Use `arping -D` to detect a duplicate address and find the other device." },
      { q: "A web server is running and `ss -tlnp` shows it on 0.0.0.0:443, but remote clients time out. Next step?", a: "Check the firewall: `firewall-cmd --list-all`, then `firewall-cmd --permanent --add-service=https` and `--reload`." },
      { q: "Websites load slowly with a long pause before connecting, but `curl -4` is instant. What is likely happening?", a: "A dual stack issue: the client tries IPv6 first and it is broken. Fix IPv6 routing or DNS, or prefer IPv4 as a workaround." },
      { q: "How do you check the state of each NIC in bond0?", a: "`cat /proc/net/bonding/bond0` shows the mode and the MII status of every member interface." },
      { q: "Which tool shows per-hop packet loss and latency continuously?", a: "`mtr` (for example `mtr -rwc 50 host` for a report)." }
    ]
  },

  // ---------------------------------------------------------------- 5.4
  {
    id: "5.4", domain: 5,
    title: "Given a scenario, analyze and troubleshoot security issues on a Linux system.",
    summary: "Security problems often look like simple \"access denied\" errors: SELinux blocks a service, an ACL or attribute blocks a file, or an account is locked. Other issues are risks you must find and fix, such as unpatched software, exposed services, expired certificates, bad repositories, and weak protocols or ciphers. This objective is about diagnosing each of these and fixing them safely without just turning security off.",
    topics: [
      {
        name: "SELinux issues: context",
        explain: "SELinux labels every file and process with a context (user:role:type:level). If a file has the wrong type, for example web content moved from a home directory keeps the user_home_t type instead of httpd_sys_content_t, the service gets \"Permission denied\" even when normal permissions are fine. Check the context and restore or set the correct one. Using `mv` keeps the old label, while `cp` gives the destination's label.",
        examples: [
          { cmd: "ls -Z /var/www/html", what: "Shows the SELinux context of each file." },
          { cmd: "sudo restorecon -Rv /var/www/html", what: "Resets files to the default contexts defined by policy, listing what changed." },
          { cmd: "sudo semanage fcontext -a -t httpd_sys_content_t '/srv/web(/.*)?' && sudo restorecon -Rv /srv/web", what: "Permanently defines the correct context for a custom web directory, then applies it." }
        ]
      },
      {
        name: "SELinux issues: booleans and policy",
        explain: "SELinux booleans are on/off switches for common policy options, such as letting httpd make network connections or read home directories. The policy also controls which ports a service may use, so running sshd or httpd on a non-standard port needs a port label. When something is denied, read the AVC denial in the audit log; sealert and audit2why explain the cause and suggest the fix. Avoid disabling SELinux; setenforce 0 (permissive) is only for a quick test.",
        examples: [
          { cmd: "sudo ausearch -m AVC -ts recent", what: "Shows recent SELinux access-denied (AVC) messages from the audit log." },
          { cmd: "sudo sealert -a /var/log/audit/audit.log", what: "Analyzes denials and suggests fixes in plain language (from setroubleshoot)." },
          { cmd: "getsebool -a | grep httpd ; sudo setsebool -P httpd_can_network_connect on", what: "Lists httpd booleans and permanently allows httpd to make outbound network connections." },
          { cmd: "sudo semanage port -a -t ssh_port_t -p tcp 2222", what: "Allows sshd to listen on port 2222 under SELinux policy." }
        ],
        tip: "`getenforce` shows the mode. If things work in permissive but not enforcing, it is an SELinux problem."
      },
      {
        name: "File and directory permission issues: ACLs and attributes",
        explain: "If a user is denied access, check the standard permissions on the file and every parent directory (directories need x to be entered). A plus sign in `ls -l` output means an ACL adds extra rules, and the ACL mask can silently limit them. File attributes can also block access: the immutable (i) attribute stops anyone, even root, from changing or deleting a file, and append-only (a) allows only appending.",
        examples: [
          { cmd: "namei -l /srv/share/report.txt", what: "Shows permissions for every directory along the path, revealing a parent that blocks access." },
          { cmd: "getfacl /srv/share/report.txt", what: "Displays the file's ACL entries and effective mask." },
          { cmd: "sudo setfacl -m u:bob:rw /srv/share/report.txt", what: "Grants bob read and write access with an ACL entry." },
          { cmd: "lsattr report.txt ; sudo chattr -i report.txt", what: "Shows attributes and removes the immutable flag so the file can be changed." }
        ]
      },
      {
        name: "Account access issues",
        explain: "A user who cannot log in may have a locked or expired account or password, a shell set to /sbin/nologin, too many failed attempts locked by pam_faillock, a wrong home directory, or restrictions in sshd_config (AllowUsers, DenyUsers). Check the account status and the authentication logs to see the exact reason.",
        examples: [
          { cmd: "sudo chage -l alice", what: "Shows password and account expiry dates for alice." },
          { cmd: "sudo passwd -S alice", what: "Shows whether the password is locked (L), usable (P), or empty (NP)." },
          { cmd: "sudo faillock --user alice --reset", what: "Clears failed login counters and unlocks an account locked by pam_faillock." },
          { cmd: "sudo usermod -U alice ; getent passwd alice", what: "Unlocks the password and shows the account's shell and home directory." }
        ]
      },
      {
        name: "Remote access issues",
        explain: "SSH problems include connection refused (sshd not running or wrong port), timeouts (firewall), \"Permission denied (publickey)\" (wrong key, or bad permissions on ~/.ssh or authorized_keys), host key warnings after a server rebuild, and settings like PermitRootLogin or PasswordAuthentication. Verbose client output and the server's auth log usually point to the cause.",
        examples: [
          { cmd: "ssh -vvv alice@server", what: "Connects with maximum debug output to show where authentication fails." },
          { cmd: "chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys", what: "Fixes key file permissions; sshd ignores keys if they are too open." },
          { cmd: "sudo sshd -t", what: "Tests sshd_config for syntax errors before restarting the service." },
          { cmd: "sudo journalctl -u sshd -f", what: "Follows SSH server logs live while a user tries to connect (the unit is 'ssh' on Debian/Ubuntu)." }
        ]
      },
      {
        name: "Certificate issues",
        explain: "TLS certificate issues cause browser warnings and client errors. Common causes are an expired certificate, a hostname that does not match the certificate's subject or SAN, a missing intermediate certificate in the chain, a self-signed or untrusted CA, or a wrong system clock. Inspect what the server presents and check the dates and names.",
        examples: [
          { cmd: "openssl s_client -connect www.example.com:443 -servername www.example.com", what: "Connects and shows the certificate chain the server presents and whether verification succeeded." },
          { cmd: "openssl x509 -in server.crt -noout -subject -issuer -dates -ext subjectAltName", what: "Shows who the certificate is for, who issued it, its valid dates, and its SANs." },
          { cmd: "sudo cp myca.crt /etc/pki/ca-trust/source/anchors/ && sudo update-ca-trust", what: "Adds an internal CA to the system trust store on RHEL-family systems (update-ca-certificates on Debian)." }
        ]
      },
      {
        name: "Misconfigured package repository",
        explain: "A misconfigured package repository causes update failures such as 404 errors, GPG signature failures, or packages installing from an untrusted source. Check the repo files for wrong URLs or versions, make sure gpgcheck is enabled and the right GPG key is imported, and remove unknown or unofficial repos.",
        examples: [
          { cmd: "dnf repolist -v", what: "Lists enabled repositories with their URLs." },
          { cmd: "grep -E 'baseurl|gpgcheck|enabled' /etc/yum.repos.d/*.repo", what: "Shows the URL and security settings of each repo file." },
          { cmd: "sudo rpm --import https://example.com/RPM-GPG-KEY-example", what: "Imports the repository's signing key so signatures can be verified." },
          { cmd: "cat /etc/apt/sources.list /etc/apt/sources.list.d/*", what: "Shows configured APT sources on Debian/Ubuntu." }
        ],
        tip: "Never fix a GPG error by setting gpgcheck=0; import the correct key instead."
      },
      {
        name: "Unpatched vulnerable systems",
        explain: "An unpatched system runs software with known vulnerabilities (CVEs) that attackers can exploit. Find pending security updates, apply them, and restart affected services or reboot for kernel updates. Vulnerability scanners and security advisories help prioritize what to fix first.",
        examples: [
          { cmd: "sudo dnf updateinfo list --security", what: "Lists available security updates (advisories) on RHEL-family systems." },
          { cmd: "sudo dnf upgrade --security", what: "Installs only the security-related updates." },
          { cmd: "sudo apt update && apt list --upgradable", what: "Refreshes package lists and shows packages with pending updates on Debian/Ubuntu." },
          { cmd: "sudo dnf needs-restarting -r", what: "Reports whether a reboot is needed to finish applying updates (for example a new kernel)." }
        ]
      },
      {
        name: "Exposed or misconfigured services",
        explain: "Exposed services are services listening on the network that do not need to be, such as a database bound to 0.0.0.0 instead of localhost, or leftover services like telnet or FTP. Misconfiguration includes default passwords, anonymous access, or debug mode in production. List what is listening, scan from outside, then disable, bind locally, or firewall what is not needed.",
        examples: [
          { cmd: "sudo ss -tulnp", what: "Lists all listening TCP and UDP ports with the owning process." },
          { cmd: "nmap -sV server.example.com", what: "Scans from another host to show open ports and service versions an attacker would see." },
          { cmd: "sudo systemctl disable --now telnet.socket", what: "Stops and disables an unneeded insecure service." }
        ]
      },
      {
        name: "Obsolete or insecure protocols and ciphers, and cipher negotiation issues",
        explain: "Obsolete or insecure protocols include telnet, FTP, rsh, SNMPv1/v2c, SSLv3, and TLS 1.0/1.1, and weak ciphers include RC4, DES/3DES, and MD5-based options; replace them with SSH, SFTP, SNMPv3, and TLS 1.2/1.3. Cipher negotiation issues happen when a client and server share no common protocol version or cipher, for example an old client against a hardened server, giving errors like \"no matching cipher found\" or \"handshake failure\". Test what is offered and adjust the system crypto policy or service config.",
        examples: [
          { cmd: "openssl s_client -connect server:443 -tls1_1", what: "Tests whether the server still accepts TLS 1.1; a handshake failure means it is disabled." },
          { cmd: "nmap --script ssl-enum-ciphers -p 443 server", what: "Lists the TLS versions and ciphers the server offers and grades them." },
          { cmd: "ssh -Q cipher ; ssh -vv user@server 2>&1 | grep -i 'kex\\|cipher'", what: "Lists the ciphers your SSH client supports and shows what was negotiated or why it failed." },
          { cmd: "update-crypto-policies --show", what: "Shows the system-wide crypto policy (DEFAULT, LEGACY, FUTURE) on RHEL-family systems." }
        ],
        tip: "Fix cipher negotiation by upgrading the old client, not by setting the server to LEGACY, unless that is a documented, temporary exception."
      }
    ],
    cards: [
      { q: "Apache returns 403 for files you moved from /home/alice to /var/www/html, and permissions look fine. What is likely wrong?", a: "The SELinux context: `mv` kept the user_home_t label. Run `restorecon -Rv /var/www/html` and verify with `ls -Z`." },
      { q: "A web app cannot connect to a remote database, and an AVC denial mentions name_connect. How do you fix it?", a: "Enable the boolean permanently: `setsebool -P httpd_can_network_connect_db on` (or httpd_can_network_connect)." },
      { q: "Which commands help read and explain SELinux denials?", a: "`ausearch -m AVC` to find them, and `sealert -a /var/log/audit/audit.log` or `audit2why` to explain them." },
      { q: "Root cannot delete a log file and gets \"Operation not permitted\". What do you check?", a: "File attributes with `lsattr`. Remove the immutable flag with `chattr -i file`." },
      { q: "`ls -l` shows a `+` after the permissions. What does it mean and how do you view it?", a: "The file has an ACL. View it with `getfacl file` and change it with `setfacl`." },
      { q: "A user's SSH key login fails with \"Permission denied (publickey)\" though the key is correct. Common cause?", a: "Permissions on ~/.ssh (should be 700) or authorized_keys (600) are too open, or the home directory is group-writable." },
      { q: "A user is locked out after several bad passwords. How do you unlock them?", a: "Check and reset with `faillock --user name --reset` (pam_faillock)." },
      { q: "Browsers report the site certificate is invalid starting today. What do you check first?", a: "The expiry date: `openssl s_client -connect host:443` or `openssl x509 -noout -dates -in cert`. Renew the certificate if expired." },
      { q: "`dnf update` fails with a GPG signature error for a repository. Correct fix?", a: "Import the correct GPG key (`rpm --import`) and verify the repo URL. Do not disable gpgcheck." },
      { q: "An old client cannot SSH to a hardened server: \"no matching cipher found\". What is this?", a: "A cipher negotiation issue: no shared cipher. Upgrade the client; only add a weaker cipher as a temporary, documented exception." },
      { q: "Name some obsolete or insecure protocols you should replace.", a: "Telnet, FTP, rsh, SNMPv1/v2c, SSLv3, and TLS 1.0/1.1. Use SSH, SFTP, SNMPv3, and TLS 1.2/1.3." }
    ]
  },

  // ---------------------------------------------------------------- 5.5
  {
    id: "5.5", domain: 5,
    title: "Given a scenario, analyze and troubleshoot performance issues.",
    summary: "Performance troubleshooting means finding which resource is the bottleneck: CPU, memory, disk, or network. This objective covers the symptoms users report (slowness, hangs, timeouts, disconnects) and how to use tools like top, vmstat, iostat, sar, free, pidstat, ss, and mtr to find the cause and compare it with a known baseline.",
    topics: [
      {
        name: "High CPU usage and CPU bottleneck",
        explain: "High CPU usage means one or more processes are using most of the processor time. It becomes a CPU bottleneck when work is waiting for CPU and the system slows down. In top, look at user (us), system (sy), and steal (st) time; high steal on a VM means the hypervisor is overcommitted. Find the top process, then optimize, renice, limit, or add CPU.",
        examples: [
          { cmd: "top -o %CPU", what: "Shows processes sorted by CPU use, plus overall us/sy/wa/st percentages." },
          { cmd: "mpstat -P ALL 2 5", what: "Shows usage per CPU core, revealing a single-threaded app maxing out one core." },
          { cmd: "pidstat -u 2 5", what: "Reports CPU use per process every 2 seconds." },
          { cmd: "sudo renice +10 -p 4321", what: "Lowers the priority of a CPU-hungry process so others get more CPU time." }
        ]
      },
      {
        name: "High load average",
        explain: "Load average (shown by uptime and top) is the average number of tasks running or waiting over 1, 5, and 15 minutes. Compare it to the number of CPU cores: a load of 8 on an 8-core system is fully busy, while 8 on 2 cores is overloaded. On Linux, tasks waiting on disk I/O (D state) also count, so high load with low CPU use usually means an I/O problem.",
        examples: [
          { cmd: "uptime", what: "Shows the 1, 5, and 15-minute load averages." },
          { cmd: "nproc", what: "Shows the number of CPU cores to compare against load average." },
          { cmd: "vmstat 2 5", what: "Shows 'r' (runnable, waiting for CPU) and 'b' (blocked on I/O) columns to see what drives the load." }
        ],
        tip: "Read the three numbers left to right as 1, 5, and 15 minutes. If the first number is the highest, the load is getting worse right now."
      },
      {
        name: "High context switching",
        explain: "A context switch happens when the CPU stops one task and starts another. Very high context switching (for example hundreds of thousands per second) wastes CPU on switching instead of real work, often caused by too many threads, lock contention, or very chatty processes. Watch the cs column in vmstat and per-process switching with pidstat.",
        examples: [
          { cmd: "vmstat 1 5", what: "The 'cs' column shows context switches per second, and 'in' shows interrupts." },
          { cmd: "pidstat -w 2 5", what: "Shows voluntary (cswch/s) and involuntary (nvcswch/s) context switches per process." },
          { cmd: "sar -w 1 5", what: "Reports system-wide context switches and process creation rate." }
        ]
      },
      {
        name: "Swapping and out of memory",
        explain: "Swapping happens when RAM is full and the kernel moves memory pages to disk. A little swap use is fine, but constant swapping in and out (thrashing) makes everything very slow. Out of memory (OOM) is when RAM and swap are exhausted and the kernel's OOM killer terminates a process. Check available memory, the si/so swap columns, and the kernel log, then find the memory hog, add RAM or swap, or limit the process.",
        examples: [
          { cmd: "free -h", what: "Shows total, used, and available memory and swap; 'available' is what new programs can really use." },
          { cmd: "vmstat 2 5", what: "Non-zero 'si' and 'so' columns mean pages are actively swapping in and out." },
          { cmd: "journalctl -k | grep -i 'out of memory'", what: "Finds OOM killer events and which process was killed." },
          { cmd: "cat /proc/sys/vm/swappiness", what: "Shows how eagerly the kernel swaps (0-100; lower keeps more in RAM)." }
        ],
        tip: "Low 'free' memory is normal (Linux uses RAM for cache). Look at 'available' and swap activity instead."
      },
      {
        name: "High I/O wait time and high disk latency",
        explain: "High I/O wait time (the wa value in top) means the CPU is idle because processes are waiting on disk. High disk latency means each read or write takes a long time, shown as high await in iostat, and %util near 100% means the disk is saturated. Causes include a failing disk, a busy backup or database, too little RAM for caching, or slow storage. Find which process is doing the I/O.",
        examples: [
          { cmd: "iostat -xz 2 5", what: "Shows per-disk stats; watch r_await/w_await (latency in ms) and %util (saturation)." },
          { cmd: "sudo iotop -o", what: "Shows only the processes currently doing disk I/O, sorted by usage." },
          { cmd: "pidstat -d 2 5", what: "Reports disk read and write rates per process." },
          { cmd: "sar -d 1 5", what: "Reports disk activity and wait times; sar can also show past data collected by sysstat." }
        ]
      },
      {
        name: "Blocked processes, system unresponsiveness, and sluggish terminal behavior",
        explain: "Blocked processes are stuck in uninterruptible sleep (D state), usually waiting on slow or failed storage or a hung NFS mount; they push up load average and cannot be killed. System unresponsiveness and sluggish terminal behavior, where typing lags or commands take seconds to start, usually come from heavy swapping, CPU saturation, I/O wait, or a fork bomb. Find the busiest resource first; if SSH is too slow, use the console.",
        examples: [
          { cmd: "ps -eo pid,stat,wchan:30,cmd | awk '$2 ~ /D/'", what: "Lists processes in D state and the kernel function they are waiting in." },
          { cmd: "vmstat 1 5", what: "A high 'b' column means many blocked processes; high 'si/so' means swapping." },
          { cmd: "dmesg -T | grep -i 'blocked for more than'", what: "Shows hung task warnings for processes blocked over 120 seconds." },
          { cmd: "nice -n 19 ionice -c3 tar czf /backup/home.tgz /home", what: "Runs a heavy job at the lowest CPU and I/O priority so the system stays responsive." }
        ]
      },
      {
        name: "Slow application response and slow response times",
        explain: "When users report slow application response or slow response times, check whether the server itself is busy (CPU, memory, I/O) or whether the delay is in the network, DNS, or a backend like a database. Measure the timing of each step: DNS lookup, connect, TLS, and server processing. Compare against the normal baseline before deciding what changed.",
        examples: [
          { cmd: "curl -o /dev/null -s -w 'dns:%{time_namelookup} connect:%{time_connect} tls:%{time_appconnect} ttfb:%{time_starttransfer} total:%{time_total}\\n' https://app.example.com/", what: "Breaks a request into timing phases to show where the delay is." },
          { cmd: "top", what: "Checks whether the server is short on CPU or memory while the app is slow." },
          { cmd: "ss -s", what: "Shows a summary of socket counts; huge numbers of connections can mean overload." }
        ],
        tip: "Slow DNS lookup time with fast connect = fix DNS, not the app."
      },
      {
        name: "Slow startup",
        explain: "Slow startup means the system takes a long time to boot. Usually one or two services are slow, such as waiting for the network, a missing disk in fstab timing out (about 90 seconds), or a slow database start. systemd-analyze shows where boot time goes.",
        examples: [
          { cmd: "systemd-analyze", what: "Shows total boot time split into firmware, loader, kernel, and userspace." },
          { cmd: "systemd-analyze blame", what: "Lists units sorted by how long each took to start." },
          { cmd: "systemd-analyze critical-chain", what: "Shows the chain of units that actually delayed reaching the default target." }
        ]
      },
      {
        name: "High failed log-in attempts",
        explain: "High failed log-in attempts usually mean a brute-force or password-spraying attack, often against SSH, and they can also eat CPU and fill logs. Review the authentication logs to find the source addresses, then block them, enable fail2ban or pam_faillock, disable password logins in favor of keys, and limit SSH exposure with the firewall.",
        examples: [
          { cmd: "sudo lastb | head", what: "Shows the most recent failed login attempts (from /var/log/btmp)." },
          { cmd: "sudo journalctl -u sshd | grep 'Failed password' | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head", what: "Counts failed SSH password attempts per source IP." },
          { cmd: "sudo fail2ban-client status sshd", what: "Shows how many IPs fail2ban has banned for SSH." },
          { cmd: "sudo firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=203.0.113.50 drop' && sudo firewall-cmd --reload", what: "Blocks an attacking IP address permanently." }
        ]
      },
      {
        name: "Network performance: packet drops, jitter, high latency, and low throughput",
        explain: "Packet drops show up as RX/TX dropped or error counters and cause retransmissions and slowness; causes include a full ring buffer, a bad cable, duplex mismatch, or congestion. High latency is a long round trip time, and jitter is when latency varies a lot from packet to packet, which hurts voice and video. Low throughput means transfers are slower than the link speed, from drops, a negotiation problem, a small TCP window, or a congested path. Measure each and compare to the baseline.",
        examples: [
          { cmd: "ip -s link show eth0", what: "Shows RX/TX packet, error, and dropped counters for the interface." },
          { cmd: "ethtool -S eth0 | grep -iE 'drop|err|miss'", what: "Shows detailed NIC driver counters for drops and errors." },
          { cmd: "mtr -rwc 100 10.20.0.5", what: "Reports loss, average latency, and StDev (jitter) per hop." },
          { cmd: "iperf3 -c 10.20.0.5 -t 10", what: "Measures real throughput to a host running `iperf3 -s`." }
        ]
      },
      {
        name: "Random disconnects and random timeouts",
        explain: "Random disconnects (SSH sessions dropping, apps losing connection) and random timeouts often come from a flapping link, an IP conflict, idle timeouts on a firewall or NAT device, packet loss, an overloaded server running out of connections, or DNS servers that sometimes do not answer. Check the logs for link changes, look for retransmissions, and use keepalives for idle sessions.",
        examples: [
          { cmd: "journalctl -k | grep -i 'link is'", what: "Finds kernel messages showing the NIC link going down and up (flapping)." },
          { cmd: "netstat -s | grep -i retrans", what: "Shows TCP retransmission counts; a rising number points to packet loss." },
          { cmd: "ss -ti dst 10.20.0.5", what: "Shows TCP details such as rtt and retransmits for connections to a host." },
          { cmd: "echo 'ServerAliveInterval 60' >> ~/.ssh/config", what: "Makes the SSH client send keepalives so idle sessions are not dropped by a firewall." }
        ]
      },
      {
        name: "Slow remote storage response",
        explain: "Slow remote storage response affects NFS, SMB/CIFS, and iSCSI mounts. Symptoms are slow file access, high I/O wait, and processes blocked in D state. Causes include network latency or loss, an overloaded storage server, or poor mount options. Check NFS client statistics and the network path, and use the right mount options.",
        examples: [
          { cmd: "nfsiostat 2 5", what: "Shows per-mount NFS operation rates and average response time (RTT)." },
          { cmd: "nfsstat -c", what: "Shows NFS client statistics, including retransmissions, which indicate network or server problems." },
          { cmd: "mount | grep nfs", what: "Shows NFS mount options such as version, rsize/wsize, and hard/soft." },
          { cmd: "sudo iscsiadm -m session -P 3", what: "Shows iSCSI session details and state when using remote block storage." }
        ]
      },
      {
        name: "Hardware errors",
        explain: "Hardware errors such as failing RAM, overheating CPUs, or dying disks cause random crashes, slowdowns (thermal throttling), and corrupted data. Look for Machine Check Exceptions (MCE), EDAC memory errors, SMART warnings, and temperature readings. Replace failing parts.",
        examples: [
          { cmd: "dmesg -T | grep -iE 'mce|machine check|edac|hardware error'", what: "Searches the kernel log for CPU and memory hardware errors." },
          { cmd: "sudo ras-mc-ctl --errors", what: "Shows memory controller and hardware errors recorded by rasdaemon (if installed)." },
          { cmd: "sensors", what: "Shows CPU and board temperatures and fan speeds (lm_sensors)." },
          { cmd: "sudo smartctl -a /dev/sda", what: "Shows full SMART data including reallocated sectors and error logs." }
        ]
      },
      {
        name: "Exceeding baselines",
        explain: "A baseline is a record of what normal looks like for your system: typical CPU, memory, disk, and network usage at different times. Exceeding baselines means current values are well above normal, which is an early warning even before users complain. Collect historical data with sysstat (sar) or a monitoring system and compare today with a normal day.",
        examples: [
          { cmd: "sudo systemctl enable --now sysstat", what: "Starts sysstat data collection so sar has history to compare against." },
          { cmd: "sar -u -f /var/log/sa/sa15", what: "Shows CPU history from the 15th of the month (path is /var/log/sysstat on Debian/Ubuntu)." },
          { cmd: "sar -r -s 09:00:00 -e 12:00:00", what: "Shows memory usage for this morning's window to compare with the baseline." }
        ],
        tip: "You cannot say something is abnormal without a baseline: collect it before problems happen."
      }
    ],
    cards: [
      { q: "A server feels slow; top shows CPU 5% user but 60% wa. What is the bottleneck?", a: "Disk I/O (high I/O wait). Use `iostat -xz` for latency and %util and `iotop` to find the process." },
      { q: "Load average is 12 on a 4-core server but CPU use is low. What should you suspect?", a: "Processes blocked on I/O (D state), which count toward load. Check `vmstat` (b column), `ps` for D state, and storage or NFS health." },
      { q: "vmstat shows constant non-zero si and so values and the system is crawling. What is happening?", a: "Heavy swapping (thrashing) because RAM is exhausted. Find the memory hog with `top` or `ps --sort=-rss`, then add RAM or reduce usage." },
      { q: "How do you find out what is slowing down the boot?", a: "`systemd-analyze blame` to see slow units and `systemd-analyze critical-chain` to see what delayed the boot." },
      { q: "auth logs show thousands of failed SSH log-ins from a few IPs. What actions do you take?", a: "Block the IPs (firewall or fail2ban), require key-based auth, disable root login, and consider limiting SSH to trusted networks." },
      { q: "VoIP calls sound choppy, and mtr shows a large StDev but low loss. What is the problem?", a: "Jitter (variable latency). Look for congestion on the path and apply QoS or fix the congested link." },
      { q: "Which tool shows context switches per second system-wide?", a: "`vmstat` (cs column) or `sar -w`; `pidstat -w` shows them per process." },
      { q: "File copies to a 10 Gb server only reach 900 Mbit/s. How do you measure and investigate?", a: "Measure with `iperf3`, check link speed and duplex with `ethtool`, and look for drops with `ip -s link`. This is a low throughput issue." },
      { q: "Applications using an NFS share keep hanging. Which tools help?", a: "`nfsiostat` and `nfsstat -c` (look for high RTT and retransmissions), plus checking the network path and NFS server load." },
      { q: "A VM is slow and top shows a high st value. What does it mean?", a: "Steal time: the hypervisor is giving the VM's CPU time to other guests. This is a host-level CPU bottleneck; contact the virtualization team or move the VM." },
      { q: "How do you know whether current CPU usage is abnormal?", a: "Compare it with a baseline, for example historical `sar` data collected by sysstat." }
    ]
  }
);
