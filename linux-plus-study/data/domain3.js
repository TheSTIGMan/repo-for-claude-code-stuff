// Domain 3: Security (objectives 3.1 - 3.6)
window.LINUX_PLUS_DATA.objectives.push(
  // ---------------------------------------------------------------- 3.1
  {
    id: "3.1", domain: 3,
    title: "Summarize authorization, authentication, and accounting methods.",
    summary: "This objective is about the three A's: authentication (proving who you are), authorization (deciding what you may do), and accounting (recording what you did). You need to know the Linux tools behind each one, such as PAM, Polkit, SSSD, LDAP, Kerberos, Samba, the system logs, and the audit system.",
    topics: [
      {
        name: "The three A's (AAA)",
        explain: "Authentication answers 'who are you?' (for example, a password or key). Authorization answers 'what are you allowed to do?' (for example, file permissions, sudo, or Polkit). Accounting answers 'what did you do?' by keeping records in logs and audit trails. Linux has separate tools for each step.",
        examples: [
          { cmd: "Login with password -> PAM checks it -> sudo rules decide access -> journal records it", what: "A real-world flow: authentication, then authorization, then accounting." }
        ],
        tip: "Memory trick: Authentication = Identity, Authorization = Permission, Accounting = Records."
      },
      {
        name: "Pluggable Authentication Modules (PAM)",
        explain: "PAM is a shared framework that programs like login, sshd, and sudo use to check users. Each program has a config file in /etc/pam.d/ that lists modules to run. Lines have four types: auth (check identity), account (is the account allowed now?), password (changing passwords), and session (setup at login). Control flags like required, requisite, sufficient, and optional decide how a module's result counts.",
        examples: [
          { cmd: "cat /etc/pam.d/sshd", what: "Shows which PAM modules check logins over SSH." },
          { cmd: "auth required pam_unix.so", what: "A PAM line: the standard Unix password check must succeed." },
          { cmd: "ls /etc/pam.d/", what: "Lists the PAM config file for every PAM-aware program." },
          { cmd: "ls /lib64/security/ /usr/lib/x86_64-linux-gnu/security/", what: "Shows where the PAM module .so files live (path depends on distro)." }
        ],
        tip: "required = must pass but keeps checking; requisite = must pass and stops right away on failure; sufficient = success is enough (if nothing required failed before)."
      },
      {
        name: "Polkit",
        explain: "Polkit (PolicyKit) is an authorization service. It lets normal, unprivileged programs ask permission to do privileged actions, like shutting down or managing network connections, without running the whole program as root. Rules and actions live in /usr/share/polkit-1/ and /etc/polkit-1/rules.d/. The pkexec command runs a command as another user through Polkit.",
        examples: [
          { cmd: "pkexec systemctl restart sshd", what: "Asks Polkit for permission, then runs the command as root." },
          { cmd: "pkaction | grep login1", what: "Lists Polkit actions, filtered to systemd-logind ones like power-off." },
          { cmd: "ls /etc/polkit-1/rules.d/", what: "Shows local Polkit rule files (written in JavaScript)." }
        ],
        tip: "Polkit = fine-grained authorization for desktop and system services; sudo = run whole commands as another user."
      },
      {
        name: "LDAP and Kerberos",
        explain: "LDAP (Lightweight Directory Access Protocol) is a central directory that stores users, groups, and other info, so many servers share one account list. It uses port 389, or 636 for LDAPS (encrypted). Kerberos is a network authentication protocol that uses tickets: you log in once, get a ticket-granting ticket (TGT) from the KDC, and then reach services without retyping your password. Kerberos needs accurate clocks on all machines.",
        examples: [
          { cmd: "ldapsearch -x -H ldap://ldap.example.com -b \"dc=example,dc=com\" \"(uid=jdoe)\"", what: "Searches the LDAP directory for the user jdoe." },
          { cmd: "kinit jdoe@EXAMPLE.COM", what: "Gets a Kerberos ticket-granting ticket for jdoe." },
          { cmd: "klist", what: "Lists the Kerberos tickets you currently hold." },
          { cmd: "kdestroy", what: "Deletes your Kerberos tickets (a kind of log out)." }
        ],
        tip: "LDAP = the phone book of users. Kerberos = the ticket booth. Active Directory uses both. Kerberos fails if clocks drift more than about 5 minutes."
      },
      {
        name: "SSSD, Winbind, and realm",
        explain: "SSSD (System Security Services Daemon) connects Linux to remote identity sources like LDAP, Kerberos, or Active Directory. It caches credentials so users can still log in if the server is briefly offline. Winbind is the Samba component that does a similar job for Windows domains. The realm command (from realmd) makes joining a domain easy and sets up SSSD or Winbind for you.",
        examples: [
          { cmd: "realm discover example.com", what: "Finds a domain and shows what software is needed to join it." },
          { cmd: "realm join -U Administrator example.com", what: "Joins this Linux machine to the Active Directory domain." },
          { cmd: "systemctl status sssd", what: "Checks that the SSSD service is running." },
          { cmd: "id jdoe@example.com", what: "Confirms a domain user can be looked up through SSSD or Winbind." }
        ],
        tip: "Main config files: /etc/sssd/sssd.conf (must be mode 600) and /etc/samba/smb.conf for Winbind."
      },
      {
        name: "Samba",
        explain: "Samba lets Linux share files and printers with Windows using the SMB/CIFS protocol. It can also act as a member of, or even a controller for, a Windows (Active Directory) domain. The main config file is /etc/samba/smb.conf, and the main daemons are smbd (file sharing) and nmbd (name service).",
        examples: [
          { cmd: "testparm", what: "Checks /etc/samba/smb.conf for syntax errors." },
          { cmd: "smbpasswd -a jdoe", what: "Adds a Samba password for the existing Linux user jdoe." },
          { cmd: "smbclient -L //fileserver -U jdoe", what: "Lists the shares offered by a Samba or Windows server." },
          { cmd: "wbinfo -u", what: "Lists domain users that Winbind can see." }
        ]
      },
      {
        name: "Logging: journalctl and /var/log",
        explain: "Logs are the accounting part of AAA. On systemd systems, the journal collects messages from the kernel and services, and you read it with journalctl. Classic text logs live in /var/log, such as /var/log/secure (RHEL) or /var/log/auth.log (Debian/Ubuntu) for logins and sudo use, and /var/log/messages or /var/log/syslog for general events.",
        examples: [
          { cmd: "journalctl -u sshd --since today", what: "Shows today's log entries for the SSH service." },
          { cmd: "journalctl -p err -b", what: "Shows only error-level messages (and worse) since the last boot." },
          { cmd: "journalctl -f", what: "Follows the journal live, like tail -f." },
          { cmd: "tail -f /var/log/secure", what: "Watches login and sudo events in real time on RHEL-type systems." }
        ],
        tip: "The journal is only kept across reboots if /var/log/journal exists or Storage=persistent is set in /etc/systemd/journald.conf."
      },
      {
        name: "rsyslog and logrotate",
        explain: "rsyslog is the classic syslog daemon. It receives log messages and writes them to files or sends them to a remote log server, based on facility (source) and priority (severity) rules in /etc/rsyslog.conf and /etc/rsyslog.d/. logrotate keeps log files from filling the disk by renaming, compressing, and deleting old logs on a schedule. Its config is /etc/logrotate.conf plus files in /etc/logrotate.d/.",
        examples: [
          { cmd: "authpriv.*    /var/log/secure", what: "An rsyslog rule: send all private authentication messages to /var/log/secure." },
          { cmd: "*.* @@logserver.example.com:514", what: "rsyslog rule forwarding everything to a remote server over TCP (@@ = TCP, @ = UDP)." },
          { cmd: "logrotate -d /etc/logrotate.conf", what: "Dry run (debug): shows what logrotate would do without changing anything." },
          { cmd: "/var/log/myapp.log { weekly rotate 4 compress missingok }", what: "A logrotate block: rotate weekly, keep 4 old copies, compress them." }
        ],
        tip: "Sending logs to a remote server protects them: an attacker who breaks into the box cannot easily erase the copies."
      },
      {
        name: "System audit: auditd and audit.rules",
        explain: "The Linux audit system records detailed security events, such as who opened a sensitive file or ran a certain command. The auditd daemon writes events to /var/log/audit/audit.log. Rules are added live with auditctl or saved permanently in /etc/audit/rules.d/*.rules, which are combined into /etc/audit/audit.rules. You search the log with ausearch and summarize it with aureport.",
        examples: [
          { cmd: "auditctl -w /etc/passwd -p wa -k passwd_changes", what: "Watches /etc/passwd for writes or attribute changes and tags events with a key." },
          { cmd: "ausearch -k passwd_changes", what: "Finds all audit events tagged with that key." },
          { cmd: "aureport -au", what: "Prints a summary report of authentication attempts." },
          { cmd: "auditctl -l", what: "Lists the audit rules that are currently loaded." }
        ],
        tip: "auditctl changes are lost at reboot. Put rules in /etc/audit/rules.d/ and run augenrules --load to make them stick."
      }
    ],
    cards: [
      { q: "What is the difference between authentication and authorization?", a: "Authentication proves who you are (password, key, ticket). Authorization decides what you are allowed to do once you are known." },
      { q: "Where are PAM configuration files stored?", a: "In /etc/pam.d/, one file per service, such as /etc/pam.d/sshd or /etc/pam.d/login." },
      { q: "What does Polkit do?", a: "It is an authorization framework that lets unprivileged processes ask to perform specific privileged actions, without running the whole program as root. `pkexec` runs a command through it." },
      { q: "Which command gets a Kerberos ticket, and which lists your tickets?", a: "`kinit` gets a ticket-granting ticket; `klist` lists the tickets you hold." },
      { q: "You need to join a Linux server to an Active Directory domain with the least effort. Which command?", a: "`realm join example.com` (realmd), which configures SSSD (or Winbind) and Kerberos for you." },
      { q: "What is SSSD?", a: "The System Security Services Daemon. It connects Linux to remote identity and auth sources such as LDAP, Kerberos, and AD, and caches credentials for offline logins." },
      { q: "Which command shows logs for only the nginx service since the last boot?", a: "`journalctl -u nginx -b`" },
      { q: "What tool keeps log files in /var/log from filling the disk?", a: "logrotate. It rotates, compresses, and deletes old logs based on /etc/logrotate.conf and /etc/logrotate.d/." },
      { q: "Where is the persistent audit rules file and where does auditd write its log?", a: "Rules go in /etc/audit/rules.d/ (compiled into /etc/audit/audit.rules). Events are written to /var/log/audit/audit.log." },
      { q: "What do Samba and Winbind provide?", a: "Samba provides SMB/CIFS file and print sharing with Windows; Winbind (part of Samba) lets Linux use Windows domain users and groups." }
    ]
  },

  // ---------------------------------------------------------------- 3.2
  {
    id: "3.2", domain: 3,
    title: "Given a scenario, configure and implement firewalls on a Linux system.",
    summary: "A firewall decides which network traffic may enter, leave, or pass through a system. On Linux, every firewall tool (firewalld, ufw, nftables, iptables) is a front end for the kernel's Netfilter framework. You need to open ports and services, understand zones, NAT, stateful filtering, and IP forwarding.",
    topics: [
      {
        name: "Netfilter: the engine under every firewall",
        explain: "Netfilter is the packet-filtering framework built into the Linux kernel. It provides hooks where rules can inspect packets: PREROUTING, INPUT, FORWARD, OUTPUT, and POSTROUTING. Tools like iptables, nftables, firewalld, and ufw only write rules; the Netfilter module in the kernel does the actual work. Related kernel modules include nf_tables, nf_conntrack (connection tracking), and nf_nat.",
        examples: [
          { cmd: "lsmod | grep -E 'nf_|xt_'", what: "Shows the Netfilter kernel modules that are loaded." },
          { cmd: "modprobe nf_conntrack", what: "Loads the Netfilter connection-tracking module." }
        ],
        tip: "If a question asks what actually filters the packets in the kernel, the answer is Netfilter."
      },
      {
        name: "firewalld and firewall-cmd: zones",
        explain: "firewalld is the default firewall service on RHEL, Fedora, and SUSE. You control it with firewall-cmd. It groups rules into zones, which are trust levels such as public, home, internal, trusted, drop, and block. Each network interface or source address belongs to a zone, and the zone's rules apply to its traffic.",
        examples: [
          { cmd: "firewall-cmd --state", what: "Checks whether firewalld is running." },
          { cmd: "firewall-cmd --get-active-zones", what: "Shows which zones are in use and which interfaces they hold." },
          { cmd: "firewall-cmd --zone=public --list-all", what: "Lists everything allowed in the public zone." },
          { cmd: "firewall-cmd --zone=internal --change-interface=eth1 --permanent", what: "Moves interface eth1 into the internal zone." }
        ],
        tip: "drop silently throws packets away; block rejects them with an ICMP message; trusted allows everything."
      },
      {
        name: "firewalld: runtime vs. permanent",
        explain: "firewalld has two configurations. Runtime is what is active right now; changes take effect at once but are lost on reload or reboot. Permanent is saved to disk but does not take effect until you reload. Add --permanent to save a rule, then run --reload, or make the change in runtime and save it with --runtime-to-permanent.",
        examples: [
          { cmd: "firewall-cmd --add-service=http", what: "Runtime only: allows HTTP now, but it disappears after a reload or reboot." },
          { cmd: "firewall-cmd --permanent --add-service=http", what: "Saves the rule to disk, but it is not active yet." },
          { cmd: "firewall-cmd --reload", what: "Loads the permanent config, making saved rules active (and dropping unsaved runtime ones)." },
          { cmd: "firewall-cmd --runtime-to-permanent", what: "Saves the current working runtime rules as permanent." }
        ],
        tip: "Classic exam trap: a rule added with --permanent 'doesn't work' because nobody ran firewall-cmd --reload."
      },
      {
        name: "firewalld: ports vs. services and rich rules",
        explain: "You can open traffic by service name or by port number. A service is a named definition (like ssh or https) that can include several ports and helpers; they live in /usr/lib/firewalld/services/. A port is just a number and protocol, like 8080/tcp. Rich rules give finer control, such as allowing a port only from one subnet, logging, or rejecting a single address.",
        examples: [
          { cmd: "firewall-cmd --permanent --add-service=https", what: "Opens HTTPS by service name (port 443/tcp)." },
          { cmd: "firewall-cmd --permanent --add-port=8080/tcp", what: "Opens a raw port number for a custom app." },
          { cmd: "firewall-cmd --get-services", what: "Lists all service names firewalld knows." },
          { cmd: "firewall-cmd --permanent --add-rich-rule='rule family=\"ipv4\" source address=\"10.0.0.0/24\" service name=\"ssh\" accept'", what: "Rich rule: allow SSH only from the 10.0.0.0/24 network." }
        ],
        tip: "Prefer services when one exists: the name is self-documenting and includes every port the app needs."
      },
      {
        name: "Uncomplicated Firewall (ufw)",
        explain: "ufw is the simple firewall front end used on Ubuntu and Debian. Like firewalld, you can allow by port or by service name (it reads names from /etc/services and app profiles). Rules are permanent as soon as you add them. By default it denies incoming and allows outgoing traffic once enabled.",
        examples: [
          { cmd: "ufw enable", what: "Turns the firewall on (and at boot)." },
          { cmd: "ufw allow ssh", what: "Allows SSH by service name (port 22/tcp)." },
          { cmd: "ufw allow 8080/tcp", what: "Allows a specific port and protocol." },
          { cmd: "ufw allow from 192.168.1.0/24 to any port 22", what: "Allows SSH only from the local subnet." },
          { cmd: "ufw status numbered", what: "Shows rules with numbers so you can delete one with ufw delete N." }
        ],
        tip: "Allow ssh BEFORE running ufw enable on a remote server, or you may lock yourself out."
      },
      {
        name: "iptables and nftables",
        explain: "iptables is the older rule tool. Rules sit in tables (filter, nat, mangle) and chains (INPUT, OUTPUT, FORWARD), and are checked top to bottom until one matches. nftables is the modern replacement, using the nft command; it has one syntax for IPv4, IPv6, and more, and it is faster. Many distros now run iptables commands on top of nftables (iptables-nft).",
        examples: [
          { cmd: "iptables -L -n -v", what: "Lists the current iptables rules with packet counts, without DNS lookups." },
          { cmd: "iptables -A INPUT -p tcp --dport 22 -j ACCEPT", what: "Appends a rule allowing incoming SSH." },
          { cmd: "iptables-save > /etc/iptables/rules.v4", what: "Saves current rules to a file so they can be restored at boot." },
          { cmd: "nft list ruleset", what: "Shows all nftables tables, chains, and rules." },
          { cmd: "nft add rule inet filter input tcp dport 443 accept", what: "Adds an nftables rule allowing HTTPS." }
        ],
        tip: "-A appends to the end; -I inserts at the top. Order matters because the first match wins."
      },
      {
        name: "ipset",
        explain: "ipset stores large lists of IP addresses or networks in one named set. Your firewall then needs only a single rule that matches the whole set, which is much faster than thousands of separate rules. It is great for blocklists.",
        examples: [
          { cmd: "ipset create blocklist hash:ip", what: "Creates an empty set that holds single IP addresses." },
          { cmd: "ipset add blocklist 203.0.113.50", what: "Adds an address to the set." },
          { cmd: "iptables -I INPUT -m set --match-set blocklist src -j DROP", what: "One rule drops traffic from every address in the set." },
          { cmd: "firewall-cmd --permanent --new-ipset=blocklist --type=hash:ip", what: "Creates an ipset managed by firewalld." }
        ]
      },
      {
        name: "Stateful vs. stateless filtering",
        explain: "A stateless firewall looks at each packet alone, checking only things like address and port. A stateful firewall tracks connections (using Netfilter's conntrack), so it knows if a packet belongs to a connection that was already allowed. That lets you allow replies automatically while blocking new, unrequested traffic. firewalld and ufw are stateful by default.",
        examples: [
          { cmd: "iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT", what: "Stateful rule: allow replies to connections we started." },
          { cmd: "conntrack -L", what: "Lists the connections the kernel is currently tracking." }
        ],
        tip: "Connection states: NEW, ESTABLISHED, RELATED, INVALID."
      },
      {
        name: "Address translation: NAT, PAT, SNAT, DNAT",
        explain: "NAT (Network Address Translation) rewrites IP addresses as packets pass a router. SNAT (source NAT) changes the source address of outgoing packets, so private hosts share a public IP; masquerading is SNAT that uses whatever IP the outgoing interface has. DNAT (destination NAT) changes the destination, which is used for port forwarding to an internal server. PAT (Port Address Translation) also rewrites port numbers so many devices can share one public IP at once; home routers do this.",
        examples: [
          { cmd: "iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE", what: "SNAT/PAT: hide the internal network behind eth0's public address." },
          { cmd: "iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 192.168.1.10:8080", what: "DNAT: forward incoming port 80 to an internal web server on port 8080." },
          { cmd: "firewall-cmd --permanent --zone=public --add-masquerade", what: "Turns on masquerading (SNAT) in firewalld." },
          { cmd: "firewall-cmd --permanent --add-forward-port=port=80:proto=tcp:toport=8080:toaddr=192.168.1.10", what: "DNAT port forwarding with firewalld." }
        ],
        tip: "SNAT happens in POSTROUTING (on the way out); DNAT happens in PREROUTING (on the way in, before routing)."
      },
      {
        name: "IP forwarding (net.ipv4.ip_forward)",
        explain: "By default, Linux will not pass packets from one network interface to another. To make the machine act as a router or NAT gateway, turn on IP forwarding with the kernel setting net.ipv4.ip_forward. Set it to 1 now with sysctl, and save it in /etc/sysctl.conf or /etc/sysctl.d/ so it survives a reboot.",
        examples: [
          { cmd: "sysctl net.ipv4.ip_forward", what: "Shows whether forwarding is on (1) or off (0)." },
          { cmd: "sysctl -w net.ipv4.ip_forward=1", what: "Turns IP forwarding on right now (lost at reboot)." },
          { cmd: "echo 'net.ipv4.ip_forward = 1' > /etc/sysctl.d/99-forward.conf && sysctl --system", what: "Makes IP forwarding permanent and reloads settings." },
          { cmd: "cat /proc/sys/net/ipv4/ip_forward", what: "Reads the same value straight from /proc." }
        ],
        tip: "NAT rules that 'do nothing' often mean net.ipv4.ip_forward is still 0."
      }
    ],
    cards: [
      { q: "You added a firewalld rule with --permanent but it is not working. What did you forget?", a: "Run `firewall-cmd --reload`. Permanent rules are saved to disk but not active until a reload." },
      { q: "What is the difference between firewalld runtime and permanent configuration?", a: "Runtime is active now but lost on reload or reboot. Permanent is saved to disk and used after a reload or reboot." },
      { q: "Which command opens TCP port 8443 permanently in firewalld?", a: "`firewall-cmd --permanent --add-port=8443/tcp` and then `firewall-cmd --reload`." },
      { q: "What is a firewalld rich rule used for?", a: "For detailed rules a simple service or port can't express, such as allowing a service only from a certain source address, logging, or rejecting one host." },
      { q: "Which ufw command allows SSH only from 10.0.0.0/8?", a: "`ufw allow from 10.0.0.0/8 to any port 22`" },
      { q: "What kernel framework do iptables, nftables, firewalld, and ufw all control?", a: "Netfilter, the packet-filtering framework inside the Linux kernel." },
      { q: "What is ipset good for?", a: "Holding large lists of IPs or networks in one named set, so a single firewall rule can match all of them efficiently (e.g., blocklists)." },
      { q: "SNAT vs. DNAT?", a: "SNAT rewrites the source address of outgoing packets (e.g., masquerading). DNAT rewrites the destination address of incoming packets (e.g., port forwarding)." },
      { q: "What is PAT?", a: "Port Address Translation: many internal hosts share one public IP, and the router tracks them by rewriting port numbers. Also called NAT overload or masquerading." },
      { q: "How is a stateful firewall different from a stateless one?", a: "A stateful firewall tracks connections and can automatically allow reply traffic (ESTABLISHED, RELATED). A stateless one judges every packet alone." },
      { q: "Your Linux box must route traffic between two networks. Which kernel setting must be enabled?", a: "`net.ipv4.ip_forward = 1`, e.g., `sysctl -w net.ipv4.ip_forward=1` and saved in /etc/sysctl.d/." }
    ]
  },

  // ---------------------------------------------------------------- 3.3
  {
    id: "3.3", domain: 3,
    title: "Given a scenario, apply operating system (OS) hardening techniques on a Linux system.",
    summary: "Hardening means reducing ways an attacker can get in or do damage. This objective covers controlling root access with sudo, file permissions and attributes, ACLs, SELinux, securing SSH, removing insecure services, disabling unused file systems and unneeded SUID files, and Secure Boot.",
    topics: [
      {
        name: "sudo, /etc/sudoers, and visudo",
        explain: "sudo lets approved users run commands as root (or another user) while logging what they did. Rules live in /etc/sudoers and in drop-in files under /etc/sudoers.d. Always edit them with visudo, which locks the file and checks the syntax before saving, so a typo cannot break sudo for everyone. On RHEL-type systems members of the wheel group get full sudo; on Debian/Ubuntu it is the sudo group.",
        examples: [
          { cmd: "visudo", what: "Safely edits /etc/sudoers with a syntax check." },
          { cmd: "visudo -f /etc/sudoers.d/webadmins", what: "Safely creates or edits a drop-in sudo rules file." },
          { cmd: "%wheel ALL=(ALL) ALL", what: "sudoers line: anyone in the wheel group may run any command as any user." },
          { cmd: "usermod -aG wheel alice", what: "Gives alice sudo rights on RHEL (use the sudo group on Ubuntu: usermod -aG sudo alice)." },
          { cmd: "sudo -l", what: "Lists what the current user is allowed to run with sudo." }
        ],
        tip: "Use /etc/sudoers.d drop-in files for custom rules; they survive package updates and are easy to manage."
      },
      {
        name: "sudo tags: NOPASSWD and NOEXEC",
        explain: "NOPASSWD lets a user run a sudo command without typing a password. It is handy for scripts, but if that account is taken over, the attacker gets root with no extra barrier, so limit it to specific commands. NOEXEC stops a command run through sudo from starting other programs, which blocks 'shell escapes' (for example, running a shell from inside vi or less).",
        examples: [
          { cmd: "backup ALL=(root) NOPASSWD: /usr/bin/rsync", what: "The backup user can run only rsync as root without a password." },
          { cmd: "bob ALL=(root) NOEXEC: /usr/bin/less /var/log/*", what: "bob can read logs with less, but cannot launch a shell from inside it." }
        ],
        tip: "Never give NOPASSWD: ALL to a regular user. Least privilege: name exact commands with full paths."
      },
      {
        name: "Switching users: sudo -i and su -",
        explain: "su - switches to another user (root by default) and starts a full login shell with that user's environment, but you need the target user's password. sudo -i gives you a root login shell using your own password and is logged. A plain su (without the dash) keeps your old environment, which can cause confusing PATH problems.",
        examples: [
          { cmd: "su -", what: "Becomes root with a full login environment (needs root's password)." },
          { cmd: "su - alice", what: "Becomes alice with her login environment." },
          { cmd: "sudo -i", what: "Opens a root login shell using your own password (if sudoers allows it)." },
          { cmd: "sudo -u postgres psql", what: "Runs one command as the postgres user." }
        ],
        tip: "sudo is preferred over su because it uses your own password, can be limited per command, and logs every use."
      },
      {
        name: "File attributes: chattr and lsattr",
        explain: "File attributes are extra flags on ext4/XFS files that apply even to root. The immutable flag (+i) means the file cannot be changed, deleted, renamed, or linked. The append only flag (+a) means data can only be added to the end, which is great for log files. Use chattr to set them and lsattr to view them.",
        examples: [
          { cmd: "chattr +i /etc/resolv.conf", what: "Makes the file immutable; not even root can edit or delete it until the flag is removed." },
          { cmd: "chattr -i /etc/resolv.conf", what: "Removes the immutable flag." },
          { cmd: "chattr +a /var/log/app.log", what: "Sets append only: new lines can be added, but old ones cannot be changed." },
          { cmd: "lsattr /etc/resolv.conf", what: "Lists attributes; an 'i' or 'a' in the output shows the flag is set." }
        ],
        tip: "If root gets 'Operation not permitted' on a file, check lsattr for the immutable flag."
      },
      {
        name: "File permissions: chmod (octal and symbolic), chown, chgrp",
        explain: "Each file has read (r=4), write (w=2), and execute (x=1) permissions for the user (owner), group, and others. chmod changes permissions using octal numbers (add the values, like 7=rwx, 5=r-x) or symbolic letters (u, g, o, a with +, -, =). chown changes the owner (and optionally group), and chgrp changes only the group.",
        examples: [
          { cmd: "chmod 640 report.txt", what: "Octal: owner rw-, group r--, others no access." },
          { cmd: "chmod u+x,go-w script.sh", what: "Symbolic: add execute for the owner, remove write for group and others." },
          { cmd: "chown alice:developers app.py", what: "Makes alice the owner and developers the group." },
          { cmd: "chgrp developers /srv/project", what: "Changes only the group of the directory." },
          { cmd: "chmod -R 750 /srv/project", what: "Applies the permissions recursively to everything inside." }
        ],
        tip: "Octal math: rwx=7, rw-=6, r-x=5, r--=4. So 755 = rwxr-xr-x and 644 = rw-r--r--."
      },
      {
        name: "Special permissions: setuid, setgid, sticky bit",
        explain: "setuid (SUID, octal 4000) makes a program run as its owner, not the person running it; passwd uses this to edit /etc/shadow. setgid (octal 2000) on a program runs it as the file's group; on a directory, new files inherit the directory's group, which is good for shared folders. The sticky bit (octal 1000) on a directory means users can delete only their own files, as in /tmp.",
        examples: [
          { cmd: "ls -l /usr/bin/passwd", what: "Shows -rwsr-xr-x; the 's' in the owner execute spot means setuid." },
          { cmd: "chmod 2775 /srv/shared", what: "Sets setgid on a shared directory so new files keep the group." },
          { cmd: "chmod +t /srv/dropbox", what: "Adds the sticky bit (shows as 't' in ls -l, like /tmp's drwxrwxrwt)." },
          { cmd: "chmod u+s /usr/local/bin/tool", what: "Adds setuid symbolically (use carefully)." }
        ],
        tip: "4 = SUID, 2 = SGID, 1 = sticky. A capital S or T means the special bit is set but execute is not."
      },
      {
        name: "Default file-creation mode mask (umask)",
        explain: "umask sets which permissions are removed from new files and directories. New files start from 666 and new directories from 777, then the umask bits are taken away. A umask of 022 gives files 644 and directories 755; a stricter 027 gives 640 and 750.",
        examples: [
          { cmd: "umask", what: "Shows the current mask, such as 0022." },
          { cmd: "umask 027", what: "For this shell, new files get 640 and directories 750." },
          { cmd: "umask -S", what: "Shows the mask in symbolic form, like u=rwx,g=rx,o=rx." }
        ],
        tip: "Set a system-wide default in /etc/login.defs (UMASK) or /etc/profile; per user in ~/.bashrc."
      },
      {
        name: "Access control lists (ACLs): setfacl and getfacl",
        explain: "ACLs let you give permissions to extra users or groups beyond the single owner and group. For example, you can let one more user read a file without changing its group. setfacl sets ACL entries and getfacl shows them. A '+' at the end of the ls -l permission string means the file has an ACL.",
        examples: [
          { cmd: "setfacl -m u:bob:rw report.txt", what: "Gives user bob read and write access to the file." },
          { cmd: "setfacl -m g:auditors:r report.txt", what: "Gives the auditors group read access." },
          { cmd: "setfacl -d -m g:devs:rwx /srv/project", what: "Sets a default ACL so new files in the directory inherit it." },
          { cmd: "getfacl report.txt", what: "Shows all ACL entries and the mask." },
          { cmd: "setfacl -x u:bob report.txt", what: "Removes bob's ACL entry (-b removes all ACLs)." }
        ]
      },
      {
        name: "SELinux: states and modes",
        explain: "SELinux is mandatory access control (MAC) on RHEL-type systems. Even if normal permissions allow something, SELinux policy can block it. It has three states: Enforcing (policy is applied and violations are blocked and logged), Permissive (nothing is blocked, but violations are logged, which is useful for troubleshooting), and Disabled (SELinux is off). The boot-time state is set in /etc/selinux/config.",
        examples: [
          { cmd: "getenforce", what: "Prints the current mode: Enforcing, Permissive, or Disabled." },
          { cmd: "setenforce 0", what: "Switches to Permissive until reboot (setenforce 1 = Enforcing)." },
          { cmd: "sestatus", what: "Shows detailed SELinux status and the loaded policy." },
          { cmd: "SELINUX=enforcing", what: "Line in /etc/selinux/config that sets the state used at boot." }
        ],
        tip: "setenforce cannot switch to or from disabled; that needs a change in /etc/selinux/config and a reboot (plus a relabel when re-enabling)."
      },
      {
        name: "SELinux: contexts, booleans, and troubleshooting",
        explain: "Every file and process has an SELinux context (label) like system_u:object_r:httpd_sys_content_t:s0. ls -Z shows file contexts. chcon changes a label temporarily, while semanage fcontext saves a rule and restorecon applies the saved rules. Booleans are on/off switches for policy features, managed with getsebool and setsebool. When something is denied, sealert explains why and audit2allow can build a custom policy module from the denials.",
        examples: [
          { cmd: "ls -Z /var/www/html", what: "Shows the SELinux context of each file." },
          { cmd: "semanage fcontext -a -t httpd_sys_content_t \"/web(/.*)?\"", what: "Saves a permanent rule labeling /web as web content." },
          { cmd: "restorecon -Rv /web", what: "Applies the saved default labels to /web and its contents." },
          { cmd: "chcon -t httpd_sys_content_t /web/index.html", what: "Temporary label change; a relabel or restorecon will undo it." },
          { cmd: "getsebool httpd_can_network_connect", what: "Checks whether Apache may make outbound network connections." },
          { cmd: "setsebool -P httpd_can_network_connect on", what: "Turns the boolean on; -P makes it permanent." },
          { cmd: "semanage port -a -t http_port_t -p tcp 8081", what: "Allows the web server to use port 8081 under SELinux." },
          { cmd: "sealert -a /var/log/audit/audit.log", what: "Explains SELinux denials in plain language with suggested fixes." },
          { cmd: "ausearch -m avc -ts recent | audit2allow -M mypolicy", what: "Builds a custom policy module from recent denials (load with semodule -i mypolicy.pp)." }
        ],
        tip: "Files moved with mv keep their old label. If a web page gives 403 after a move, run restorecon."
      },
      {
        name: "Secure remote access: hardening sshd",
        explain: "The SSH server (sshd) is configured in /etc/ssh/sshd_config. Key authentication is safer than password authentication because a key cannot be guessed like a weak password. Good settings: PermitRootLogin no, PasswordAuthentication no (after keys work), X11Forwarding no to disable X forwarding, and AllowUsers or AllowGroups to limit who may log in. Restart or reload sshd after changes.",
        examples: [
          { cmd: "PermitRootLogin no", what: "sshd_config: root cannot log in directly over SSH." },
          { cmd: "PasswordAuthentication no", what: "sshd_config: only key authentication is accepted." },
          { cmd: "X11Forwarding no", what: "sshd_config: disables X forwarding of graphical apps." },
          { cmd: "AllowUsers alice bob@10.0.0.*", what: "sshd_config: only these users (bob only from 10.0.0.x) may log in." },
          { cmd: "AllowGroups sshusers", what: "sshd_config: only members of the sshusers group may log in." },
          { cmd: "sshd -t && systemctl reload sshd", what: "Tests the config for errors, then reloads the service." }
        ],
        tip: "Keep a second session open when changing sshd_config remotely so you do not lock yourself out."
      },
      {
        name: "SSH keys, ssh-agent, and SSH tunneling",
        explain: "ssh-keygen makes a key pair, and ssh-copy-id puts the public key in the server's ~/.ssh/authorized_keys. ssh-agent holds your unlocked private keys in memory, and ssh-add loads a key into it, so you type the passphrase once per session. SSH tunneling (port forwarding) sends other traffic safely through an encrypted SSH connection.",
        examples: [
          { cmd: "ssh-keygen -t ed25519", what: "Creates a modern Ed25519 key pair in ~/.ssh/." },
          { cmd: "ssh-copy-id alice@server", what: "Installs your public key on the server for key authentication." },
          { cmd: "eval \"$(ssh-agent -s)\" && ssh-add ~/.ssh/id_ed25519", what: "Starts ssh-agent and loads your key into it." },
          { cmd: "ssh -L 8080:localhost:80 alice@server", what: "Local tunnel: browsing localhost:8080 reaches port 80 on the server." },
          { cmd: "ssh -R 9000:localhost:22 alice@jumphost", what: "Remote tunnel: port 9000 on the jump host leads back to your SSH port." },
          { cmd: "ssh -D 1080 alice@server", what: "Dynamic tunnel: creates a SOCKS proxy through the server." }
        ],
        tip: "Private key files must be readable only by you (chmod 600), or ssh will refuse to use them."
      },
      {
        name: "SFTP with chroot and fail2ban",
        explain: "SFTP is secure file transfer that runs over SSH. You can lock SFTP users into a chroot (a jail directory) so they cannot see the rest of the system. The chroot directory must be owned by root and not writable by others. fail2ban watches log files for repeated failed logins and temporarily bans the offending IP address with a firewall rule.",
        examples: [
          { cmd: "Match Group sftponly\n  ChrootDirectory /srv/sftp/%u\n  ForceCommand internal-sftp\n  X11Forwarding no", what: "sshd_config block: jail sftponly group members in their own directory with SFTP only." },
          { cmd: "systemctl enable --now fail2ban", what: "Starts fail2ban now and at boot." },
          { cmd: "fail2ban-client status sshd", what: "Shows the sshd jail and currently banned IPs." },
          { cmd: "fail2ban-client set sshd unbanip 203.0.113.7", what: "Removes a ban for an address." }
        ],
        tip: "Put custom fail2ban settings in /etc/fail2ban/jail.local, not jail.conf, so updates do not overwrite them."
      },
      {
        name: "Avoid unsecure access services: Telnet, FTP, TFTP",
        explain: "Telnet, FTP, and TFTP send data, and often usernames and passwords, in plain text that anyone sniffing the network can read. TFTP has no authentication at all. Replace Telnet with SSH, and FTP or TFTP with SFTP, SCP, or FTPS. Remove or disable these services if they are not needed.",
        examples: [
          { cmd: "dnf remove telnet-server vsftpd tftp-server", what: "Removes insecure servers on RHEL-type systems." },
          { cmd: "systemctl disable --now telnet.socket", what: "Stops Telnet and keeps it from starting at boot." },
          { cmd: "ss -tulpn | grep -E ':(21|23|69)\\b'", what: "Checks whether FTP (21), Telnet (23), or TFTP (69/udp) are listening." }
        ],
        tip: "Ports to remember: FTP 20/21, Telnet 23, TFTP 69/UDP, SSH/SFTP 22."
      },
      {
        name: "Disabling unused file systems",
        explain: "The kernel can load drivers for many file systems that a server never uses, like cramfs, udf, hfs, or squashfs. Each one is extra code an attacker could abuse, for example with a malicious USB drive. Disabling unused file systems stops these modules from loading. CIS Benchmarks recommend this.",
        examples: [
          { cmd: "echo 'install cramfs /bin/false' > /etc/modprobe.d/cramfs.conf", what: "Makes any attempt to load cramfs fail." },
          { cmd: "echo 'blacklist udf' >> /etc/modprobe.d/blacklist.conf", what: "Blacklists the udf module so it does not auto-load." },
          { cmd: "lsmod | grep cramfs", what: "Checks whether the module is currently loaded." },
          { cmd: "modprobe -r cramfs", what: "Unloads the module if it is loaded now." }
        ],
        tip: "blacklist only stops auto-loading; 'install <module> /bin/false' also blocks manual loading."
      },
      {
        name: "Removal of unnecessary SUID permissions",
        explain: "Every SUID program runs with its owner's rights, often root. If such a program has a bug, an attacker can use it to become root (privilege escalation). Find all SUID and SGID files, keep only the ones that are really needed, and remove the bit from the rest.",
        examples: [
          { cmd: "find / -perm -4000 -type f 2>/dev/null", what: "Lists every SUID file on the system." },
          { cmd: "find / -perm /6000 -type f 2>/dev/null", what: "Lists files with SUID or SGID set." },
          { cmd: "chmod u-s /usr/bin/someprogram", what: "Removes the SUID bit from a program that does not need it." },
          { cmd: "mount -o remount,nosuid /home", what: "Ignores SUID bits on a whole file system (also set in /etc/fstab)." }
        ]
      },
      {
        name: "Secure Boot and UEFI",
        explain: "UEFI is the modern firmware that replaced BIOS. Secure Boot is a UEFI feature that only runs boot loaders and kernels signed by trusted keys. This stops bootkits and rootkits that try to load before the OS. Linux distros use a small signed 'shim' boot loader to support Secure Boot.",
        examples: [
          { cmd: "mokutil --sb-state", what: "Shows whether Secure Boot is enabled." },
          { cmd: "ls /sys/firmware/efi", what: "If this directory exists, the system booted in UEFI mode." },
          { cmd: "mokutil --import my_signing_key.der", what: "Enrolls your own key so self-built kernel modules can load under Secure Boot." }
        ],
        tip: "Unsigned third-party kernel modules (some drivers) will not load with Secure Boot on unless you sign them and enroll the key."
      }
    ],
    cards: [
      { q: "Why should you always edit sudo rules with visudo?", a: "visudo locks the file and checks the syntax before saving, so a mistake cannot break sudo access." },
      { q: "What is the security risk of NOPASSWD in /etc/sudoers?", a: "If the account is compromised, the attacker can run those commands as root with no password prompt. Limit it to specific commands." },
      { q: "What does the NOEXEC tag do in sudoers?", a: "It prevents the command from launching other programs, blocking shell escapes from tools like vi or less." },
      { q: "Which group gives full sudo rights on RHEL, and which on Ubuntu?", a: "wheel on RHEL/Fedora; sudo on Debian/Ubuntu." },
      { q: "Even root cannot delete a config file and gets 'Operation not permitted'. What is the likely cause?", a: "The immutable attribute is set. Check with `lsattr` and remove it with `chattr -i file`." },
      { q: "What octal value is rwxr-x--- ?", a: "750." },
      { q: "What does the sticky bit do on a directory like /tmp?", a: "Users can delete or rename only their own files in that directory, even if it is world-writable." },
      { q: "With a umask of 027, what permissions do new files and directories get?", a: "Files 640 (rw-r-----) and directories 750 (rwxr-x---)." },
      { q: "How do you give user bob read access to a file without changing its owner or group?", a: "Use an ACL: `setfacl -m u:bob:r file`. Check with `getfacl file`." },
      { q: "Which SELinux state logs violations but does not block them?", a: "Permissive. Enforcing blocks and logs; Disabled turns SELinux off." },
      { q: "A web page returns 403 after files were moved into /var/www/html, and permissions look fine. What fixes it?", a: "Restore the SELinux labels: `restorecon -Rv /var/www/html`. Check labels with `ls -Z`." },
      { q: "How do you permanently allow Apache to make network connections under SELinux?", a: "`setsebool -P httpd_can_network_connect on`" },
      { q: "Which sshd_config settings block root logins and disable X forwarding?", a: "`PermitRootLogin no` and `X11Forwarding no`." },
      { q: "What do ssh-agent and ssh-add do?", a: "ssh-agent holds unlocked private keys in memory; ssh-add loads a key into it so you enter the passphrase only once." },
      { q: "Which command finds all SUID files on the system?", a: "`find / -perm -4000 -type f 2>/dev/null`" },
      { q: "Why replace Telnet, FTP, and TFTP?", a: "They send data (and credentials) in clear text; TFTP has no authentication. Use SSH, SFTP, or SCP instead." },
      { q: "How do you disable an unused file system like cramfs?", a: "Add `install cramfs /bin/false` (and/or `blacklist cramfs`) to a file in /etc/modprobe.d/." },
      { q: "What does UEFI Secure Boot protect against?", a: "It only runs signed boot loaders and kernels, blocking bootkits and rootkits that load before the OS." }
    ]
  },

  // ---------------------------------------------------------------- 3.4
  {
    id: "3.4", domain: 3,
    title: "Explain account hardening techniques and best practices.",
    summary: "User accounts are a top target for attackers. This objective covers strong password policies, multifactor authentication, checking passwords against breach lists, locking out repeated failed logins, restricted shells for service accounts, and avoiding day-to-day work as root.",
    topics: [
      {
        name: "Password complexity and length",
        explain: "Complexity rules require a mix of character types (upper, lower, digits, symbols). Length is the minimum number of characters; longer passwords and passphrases are much harder to crack. On Linux these rules are enforced by the pam_pwquality module, configured in /etc/security/pwquality.conf.",
        examples: [
          { cmd: "minlen = 14", what: "pwquality.conf: passwords must be at least 14 characters long." },
          { cmd: "minclass = 3", what: "pwquality.conf: require at least 3 of the 4 character classes." },
          { cmd: "dcredit = -1", what: "pwquality.conf: require at least one digit (negative means 'at least')." },
          { cmd: "password requisite pam_pwquality.so retry=3", what: "PAM line that applies the pwquality rules when a password is changed." }
        ],
        tip: "Modern guidance (NIST) values length over complicated rules: a long passphrase beats a short complex password."
      },
      {
        name: "Password expiration",
        explain: "Expiration (aging) sets how long a password lasts before it must be changed, plus a warning period and an optional lock after it expires. Defaults for new users are set in /etc/login.defs; existing users are changed with chage. The values are stored in /etc/shadow.",
        examples: [
          { cmd: "chage -l alice", what: "Lists alice's password aging info." },
          { cmd: "chage -M 90 -m 1 -W 7 alice", what: "Max 90 days, min 1 day between changes, warn 7 days before expiry." },
          { cmd: "chage -d 0 alice", what: "Forces alice to change her password at next login." },
          { cmd: "PASS_MAX_DAYS 90", what: "/etc/login.defs default for new accounts." }
        ],
        tip: "chage -E sets an account expiration date (whole account), which is different from password expiration (-M)."
      },
      {
        name: "Password reuse and history",
        explain: "Password history remembers a user's recent passwords so they cannot be used again. Preventing reuse stops people from 'changing' a password back to the same old one. On Linux this is done with the remember option of pam_unix or the pam_pwhistory module, with old hashes stored in /etc/security/opasswd.",
        examples: [
          { cmd: "password required pam_pwhistory.so remember=5 use_authtok", what: "Blocks reuse of the last 5 passwords." },
          { cmd: "password sufficient pam_unix.so sha512 shadow remember=5", what: "Older method using pam_unix to remember 5 passwords." },
          { cmd: "chage -m 1 alice", what: "A minimum age stops users cycling through passwords quickly to reuse an old one." }
        ],
        tip: "History without a minimum password age is weak: users can change their password 5 times in a minute and get back to the old one."
      },
      {
        name: "Multifactor authentication (MFA)",
        explain: "MFA requires two or more different kinds of proof: something you know (password), something you have (phone, hardware key), and something you are (fingerprint). Even if a password is stolen, the attacker still needs the second factor. On Linux, MFA can be added through PAM modules such as pam_google_authenticator (TOTP codes) or with FIDO2/U2F hardware keys.",
        examples: [
          { cmd: "auth required pam_google_authenticator.so", what: "PAM line in /etc/pam.d/sshd that adds a one-time code prompt." },
          { cmd: "AuthenticationMethods publickey,keyboard-interactive", what: "sshd_config: require both an SSH key and a code (two factors)." },
          { cmd: "ssh-keygen -t ed25519-sk", what: "Creates an SSH key tied to a FIDO2 hardware security key." }
        ],
        tip: "Two passwords are NOT MFA. The factors must be different types."
      },
      {
        name: "Checking existing breach lists",
        explain: "Billions of passwords have leaked in data breaches, and attackers try them first. Good practice is to reject any password that appears in a known breach list or a dictionary of common passwords, even if it meets complexity rules. Services like Have I Been Pwned offer lists you can check against, and pam_pwquality can use a cracklib dictionary.",
        examples: [
          { cmd: "dictcheck = 1", what: "pwquality.conf: reject passwords found in the cracklib dictionary." },
          { cmd: "echo -n 'Summer2024!' | sha1sum", what: "Hashes a password so only the hash prefix needs to be checked against a breach-list API (k-anonymity)." }
        ],
        tip: "'Summer2024!' passes most complexity rules but is in every breach list. Breach checking catches it."
      },
      {
        name: "Account lockout: pam_tally2 and pam_faillock",
        explain: "Lockout modules count failed login attempts and lock the account after too many, which stops password-guessing attacks. pam_tally2 is the older module and is now deprecated (removed from newer distros). pam_faillock is its modern replacement, configured in /etc/security/faillock.conf. Both let admins view and reset the failure counters.",
        examples: [
          { cmd: "pam_tally2 --user alice", what: "Older systems: shows alice's failed login count." },
          { cmd: "pam_tally2 --user alice --reset", what: "Older systems: resets the counter and unlocks alice." },
          { cmd: "faillock --user alice", what: "Modern systems: shows alice's failed attempts." },
          { cmd: "faillock --user alice --reset", what: "Modern systems: unlocks alice." },
          { cmd: "deny = 5\nunlock_time = 900", what: "/etc/security/faillock.conf: lock after 5 failures for 15 minutes." }
        ],
        tip: "Exam may say pam_tally2; real modern systems use pam_faillock. Know both."
      },
      {
        name: "Restricted shells: /sbin/nologin and /bin/rbash",
        explain: "Service accounts (like apache or mysql) do not need an interactive login. Setting their shell to /sbin/nologin refuses logins with a polite message (/bin/false refuses silently). A restricted shell like /bin/rbash lets a user log in but blocks things like changing directory with cd, changing PATH, or running commands with a '/' in the name.",
        examples: [
          { cmd: "usermod -s /sbin/nologin svc_backup", what: "Stops the service account from getting a login shell." },
          { cmd: "useradd -r -s /sbin/nologin appuser", what: "Creates a system account that cannot log in." },
          { cmd: "usermod -s /bin/rbash kiosk", what: "Gives the kiosk user a restricted bash shell." },
          { cmd: "grep nologin /etc/passwd", what: "Lists accounts that cannot log in interactively." }
        ],
        tip: "rbash is easy to escape if the user can run programs like vi or python, so limit their PATH too."
      },
      {
        name: "Avoid running as root",
        explain: "Working as root all the time means one typo or one malicious script can damage the whole system. Use a normal account and sudo only for specific tasks (least privilege). Disable direct root logins over SSH, and consider locking the root password so only sudo can be used. Run services as dedicated non-root users.",
        examples: [
          { cmd: "passwd -l root", what: "Locks the root password so nobody can log in as root with it (sudo still works)." },
          { cmd: "PermitRootLogin no", what: "sshd_config: blocks root logins over SSH." },
          { cmd: "sudo systemctl restart nginx", what: "Uses root power for one command only, and it is logged." }
        ],
        tip: "Least privilege: give each user and service only the rights it needs, nothing more."
      }
    ],
    cards: [
      { q: "Which file sets password complexity and length rules for pam_pwquality?", a: "/etc/security/pwquality.conf (e.g., `minlen = 14`, `minclass = 3`)." },
      { q: "How do you force user alice to change her password at next login?", a: "`chage -d 0 alice` (or `passwd -e alice`)." },
      { q: "Which command sets alice's password to expire every 90 days?", a: "`chage -M 90 alice`" },
      { q: "How do you stop users from reusing their last 5 passwords?", a: "Use password history: `pam_pwhistory.so remember=5` (or `pam_unix.so remember=5`) in the PAM password stack." },
      { q: "Is a password plus a security question MFA?", a: "No. Both are 'something you know'. MFA needs different factor types, like a password plus a phone code or hardware key." },
      { q: "Why check passwords against breach lists?", a: "Leaked passwords are tried first by attackers. A password can meet complexity rules and still be in a breach list." },
      { q: "What replaced the deprecated pam_tally2 module?", a: "pam_faillock. Use `faillock --user name --reset` to unlock an account." },
      { q: "How do you unlock a user locked by pam_tally2 on an older system?", a: "`pam_tally2 --user name --reset`" },
      { q: "What shell should a service account have so it cannot log in?", a: "/sbin/nologin (or /bin/false), e.g., `usermod -s /sbin/nologin svcuser`." },
      { q: "What does /bin/rbash do?", a: "It is a restricted bash shell: the user cannot cd, change PATH, redirect output, or run commands containing '/'." },
      { q: "Why should admins avoid logging in as root for daily work?", a: "Mistakes or malware then have full system power. Use a normal account plus sudo (least privilege), which is also logged." }
    ]
  },

  // ---------------------------------------------------------------- 3.5
  {
    id: "3.5", domain: 3,
    title: "Explain cryptographic concepts and technologies in a Linux environment.",
    summary: "Cryptography protects data at rest (stored on disk) and data in transit (moving over a network), and hashing proves data has not changed. This objective covers GPG, LUKS2, OpenSSL, WireGuard, TLS versions, SHA-256, HMAC, dropping weak algorithms, and managing certificates properly.",
    topics: [
      {
        name: "Data at rest: file encryption with GPG",
        explain: "Data at rest is data stored on a disk, USB drive, or backup. GPG (GNU Privacy Guard) encrypts and signs single files. It can use a passphrase (symmetric encryption) or a public/private key pair (asymmetric encryption), where anyone with your public key can encrypt a file that only your private key can open.",
        examples: [
          { cmd: "gpg --full-generate-key", what: "Creates a new GPG key pair." },
          { cmd: "gpg -c secrets.txt", what: "Encrypts with a passphrase, creating secrets.txt.gpg." },
          { cmd: "gpg -e -r alice@example.com report.pdf", what: "Encrypts the file so only alice's private key can decrypt it." },
          { cmd: "gpg -d report.pdf.gpg > report.pdf", what: "Decrypts a GPG file." },
          { cmd: "gpg --verify file.tar.gz.sig file.tar.gz", what: "Checks a detached signature to prove who made the file and that it is unchanged." }
        ]
      },
      {
        name: "Data at rest: filesystem encryption with LUKS2 and Argon2",
        explain: "LUKS (Linux Unified Key Setup) encrypts a whole partition or disk, managed with cryptsetup. LUKS2 is the current version. It supports several key slots (different passphrases can unlock the same disk) and uses Argon2 (Argon2id by default) to turn your passphrase into a key. Argon2 is 'memory-hard', which makes brute-force guessing with GPUs very slow and expensive.",
        examples: [
          { cmd: "cryptsetup luksFormat --type luks2 /dev/sdb1", what: "Encrypts the partition with LUKS2 (destroys existing data)." },
          { cmd: "cryptsetup open /dev/sdb1 securedata", what: "Unlocks it as /dev/mapper/securedata." },
          { cmd: "mkfs.ext4 /dev/mapper/securedata && mount /dev/mapper/securedata /mnt/secure", what: "Creates a file system on the unlocked device and mounts it." },
          { cmd: "cryptsetup luksDump /dev/sdb1", what: "Shows the LUKS version, key slots, and key derivation function (e.g., argon2id)." },
          { cmd: "cryptsetup luksAddKey /dev/sdb1", what: "Adds another passphrase to a free key slot." },
          { cmd: "securedata /dev/sdb1 none luks", what: "/etc/crypttab line so the volume is unlocked at boot." }
        ],
        tip: "LUKS1 used PBKDF2; LUKS2 defaults to Argon2id, which resists GPU cracking much better."
      },
      {
        name: "Data in transit: TLS, OpenSSL, and LibreSSL",
        explain: "Data in transit is data moving across a network. TLS (Transport Layer Security) encrypts web, mail, and many other connections. Use TLS 1.2 or TLS 1.3 only; SSLv2, SSLv3, TLS 1.0, and TLS 1.1 are old and insecure. OpenSSL is the most common library and command-line toolkit for TLS and certificates. LibreSSL is a fork of OpenSSL from the OpenBSD project, made to be smaller and more secure, and it offers a similar openssl command.",
        examples: [
          { cmd: "openssl s_client -connect example.com:443 -tls1_3", what: "Tests whether the server supports TLS 1.3 and shows its certificate." },
          { cmd: "openssl version", what: "Shows which OpenSSL (or LibreSSL) version is installed." },
          { cmd: "ssl_protocols TLSv1.2 TLSv1.3;", what: "nginx config line allowing only modern TLS protocol versions." },
          { cmd: "SSLProtocol -all +TLSv1.2 +TLSv1.3", what: "Apache config line doing the same." }
        ],
        tip: "TLS 1.3 removed many old, weak ciphers and is faster to connect. SSL is the old name; all SSL versions are broken."
      },
      {
        name: "Data in transit: WireGuard",
        explain: "WireGuard is a modern, fast, simple VPN built into the Linux kernel. Each peer has a public/private key pair, and traffic travels in an encrypted tunnel over UDP (default port 51820). It uses modern cryptography only, such as ChaCha20 and Curve25519, and has far less code than older VPNs like OpenVPN or IPsec.",
        examples: [
          { cmd: "wg genkey | tee privatekey | wg pubkey > publickey", what: "Creates a WireGuard private key and its matching public key." },
          { cmd: "wg-quick up wg0", what: "Brings up the tunnel defined in /etc/wireguard/wg0.conf." },
          { cmd: "wg show", what: "Shows interfaces, peers, and the last handshake time." },
          { cmd: "systemctl enable --now wg-quick@wg0", what: "Starts the tunnel now and at every boot." }
        ]
      },
      {
        name: "Hashing: SHA-256 and HMAC",
        explain: "A hash is a fixed-length fingerprint of data. It is one-way: you cannot get the data back from the hash, and any tiny change gives a totally different hash. SHA-256 is a widely used, secure hash for checking file integrity and downloads. An HMAC (Hash-based Message Authentication Code) mixes a secret key into the hash, so it proves both that data is unchanged and that it came from someone who knows the key.",
        examples: [
          { cmd: "sha256sum ubuntu.iso", what: "Prints the SHA-256 hash to compare with the one the publisher lists." },
          { cmd: "sha256sum -c SHA256SUMS", what: "Checks many files against a list of known hashes." },
          { cmd: "openssl dgst -sha256 -hmac 'mysecretkey' message.txt", what: "Computes an HMAC-SHA256 of the file using a secret key." }
        ],
        tip: "Hashing is not encryption: encryption can be reversed with a key, hashing cannot be reversed."
      },
      {
        name: "Removal of weak algorithms",
        explain: "Old algorithms like MD5, SHA-1, DES, 3DES, RC4, and small RSA keys (under 2048 bits) can be broken. Hardening means removing weak algorithms from SSH, TLS, VPN, and other configs so they can never be negotiated. On RHEL-type systems, system-wide crypto policies make this easy.",
        examples: [
          { cmd: "update-crypto-policies --show", what: "Shows the current system-wide crypto policy (e.g., DEFAULT)." },
          { cmd: "update-crypto-policies --set FUTURE", what: "Switches to a stricter policy that disables more weak algorithms." },
          { cmd: "Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com", what: "sshd_config: allow only strong SSH ciphers." },
          { cmd: "ssh -Q cipher", what: "Lists ciphers the SSH client supports." }
        ],
        tip: "MD5 and SHA-1 are broken for security use. Choose SHA-256 or better."
      },
      {
        name: "Certificate management: trusted root certificates",
        explain: "A TLS certificate proves a server's identity. It is trusted because it is signed by a certificate authority (CA) whose trusted root certificate is already in your system's trust store. You can get certificates from no-cost CAs like Let's Encrypt, which use the ACME protocol to issue and renew them automatically, or from commercial CAs, which charge a fee and may offer extended validation, warranties, and support.",
        examples: [
          { cmd: "certbot --nginx -d www.example.com", what: "Gets a free Let's Encrypt certificate using ACME and sets up nginx." },
          { cmd: "certbot renew --dry-run", what: "Tests automatic renewal (Let's Encrypt certs last 90 days)." },
          { cmd: "openssl req -new -newkey rsa:2048 -nodes -keyout site.key -out site.csr", what: "Creates a private key and certificate signing request (CSR) to send to a commercial CA." },
          { cmd: "openssl x509 -in cert.pem -noout -dates -issuer", what: "Shows a certificate's issuer and expiry dates." },
          { cmd: "cp myca.crt /etc/pki/ca-trust/source/anchors/ && update-ca-trust", what: "Adds an internal CA to the trusted root store (Debian: /usr/local/share/ca-certificates/ + update-ca-certificates)." }
        ],
        tip: "No-cost (Let's Encrypt/ACME) = automated, short-lived certs. Commercial = paid, longer support, more validation options."
      },
      {
        name: "Avoiding self-signed certificates",
        explain: "A self-signed certificate is signed by its own key, not by a trusted CA. Browsers and clients cannot verify it, so users see warnings and learn to click past them, which makes man-in-the-middle attacks easier. Use them only for quick testing. In production, use a public CA or your organization's own internal CA that is added to every client's trust store.",
        examples: [
          { cmd: "openssl req -x509 -newkey rsa:4096 -nodes -keyout test.key -out test.crt -days 30", what: "Creates a self-signed certificate (fine for a lab, not for production)." },
          { cmd: "curl https://internal.example.com", what: "Fails with a 'self-signed certificate' error because the issuer is not trusted." }
        ],
        tip: "Never 'fix' cert errors with curl -k or by turning off verification in production; fix the certificate instead."
      }
    ],
    cards: [
      { q: "What is the difference between data at rest and data in transit?", a: "Data at rest is stored (disks, backups); data in transit is moving over a network. Examples: LUKS/GPG protect data at rest; TLS/WireGuard protect data in transit." },
      { q: "Which command encrypts a file with a passphrase using GPG?", a: "`gpg -c file` (symmetric encryption, creates file.gpg)." },
      { q: "What is LUKS2 and which command creates it?", a: "The current Linux disk-encryption format. Create it with `cryptsetup luksFormat --type luks2 /dev/sdX`." },
      { q: "What is Argon2 and why does LUKS2 use it?", a: "A memory-hard key derivation function that turns a passphrase into a key. It makes brute-force attacks with GPUs slow and costly." },
      { q: "Which TLS protocol versions should be allowed today?", a: "Only TLS 1.2 and TLS 1.3. Disable all SSL versions and TLS 1.0/1.1." },
      { q: "What is LibreSSL?", a: "A fork of OpenSSL made by the OpenBSD project, focused on cleaner, more secure code. It provides a similar TLS library and openssl tool." },
      { q: "What is WireGuard?", a: "A modern, fast, kernel-based VPN using public/private keys and modern crypto over UDP (default 51820). Managed with `wg` and `wg-quick`." },
      { q: "How is HMAC different from a plain SHA-256 hash?", a: "HMAC mixes in a secret key, so it proves integrity AND authenticity. A plain hash proves only integrity." },
      { q: "Which command verifies a downloaded ISO against a published SHA-256 value?", a: "`sha256sum file.iso` and compare, or `sha256sum -c SHA256SUMS`." },
      { q: "Name some weak algorithms that should be removed.", a: "MD5, SHA-1, DES, 3DES, RC4, and RSA keys under 2048 bits. On RHEL use `update-crypto-policies` to enforce this." },
      { q: "What protocol does Let's Encrypt use to issue certificates automatically?", a: "ACME (Automatic Certificate Management Environment), usually through the certbot client." },
      { q: "Why avoid self-signed certificates in production?", a: "Clients cannot verify them against a trusted root, so users get warnings and become used to ignoring them, enabling man-in-the-middle attacks." }
    ]
  },

  // ---------------------------------------------------------------- 3.6
  {
    id: "3.6", domain: 3,
    title: "Explain the importance of compliance and audit procedures.",
    summary: "Compliance means proving your systems meet security rules and standards; auditing means checking regularly that they still do. This objective covers malware detection, vulnerability scanning, benchmarks like CIS and OpenSCAP, file integrity checks, safe data destruction, the software supply chain, and login banners.",
    topics: [
      {
        name: "Detection and response: anti-malware and IoCs",
        explain: "Anti-malware tools scan files for known malicious code. On Linux, ClamAV is a common free scanner, often used on mail and file servers. Indicators of compromise (IoC) are clues that a system was attacked, such as unknown processes, odd outbound connections, new user accounts, changed system files, strange cron jobs, or known bad file hashes and IP addresses.",
        examples: [
          { cmd: "freshclam", what: "Updates the ClamAV malware signature database." },
          { cmd: "clamscan -r -i /home", what: "Scans /home recursively and lists only infected files." },
          { cmd: "ss -tunap", what: "Lists network connections with process names, to spot suspicious outbound traffic (an IoC)." },
          { cmd: "last -a | head", what: "Shows recent logins, which can reveal logins from unexpected places." }
        ],
        tip: "IoC examples: unknown listening ports, new SUID files, unexpected crontab entries, unfamiliar SSH keys in authorized_keys."
      },
      {
        name: "Vulnerability scanning: CVEs and CVSS",
        explain: "A vulnerability scan checks systems for known security weaknesses. Each publicly known flaw gets a CVE ID (Common Vulnerabilities and Exposures), like CVE-2024-3094. CVSS (Common Vulnerability Scoring System) rates how serious it is from 0.0 to 10.0: low, medium, high, or critical. Fix the highest scores and most exposed systems first. Tools include OpenVAS/Greenbone and Nessus.",
        examples: [
          { cmd: "dnf updateinfo list --security", what: "Lists available security updates and their advisories on RHEL-type systems." },
          { cmd: "dnf updateinfo info --cve CVE-2024-3094", what: "Shows whether an update addresses a specific CVE." },
          { cmd: "CVSS 9.8 = Critical", what: "Illustration: a 9.0-10.0 score means patch immediately." }
        ],
        tip: "CVE = the name/ID of the flaw. CVSS = how bad it is (the score)."
      },
      {
        name: "Backporting patches",
        explain: "Enterprise distros like RHEL often backport security fixes: they copy just the fix into the older version of a package instead of upgrading to the newest version. So a package's version number may look old but still be patched. Scanners that only compare version numbers can report false positives; check the package changelog for the CVE instead.",
        examples: [
          { cmd: "rpm -q --changelog openssh | grep CVE", what: "Shows which CVEs were fixed in the installed openssh package, even if the version looks old." },
          { cmd: "apt changelog openssh-server | grep CVE", what: "Same idea on Debian/Ubuntu." }
        ]
      },
      {
        name: "Service misconfigurations",
        explain: "Many breaches come from service misconfiguration, not software bugs: default passwords, anonymous FTP, open database ports, world-readable secrets, directory listing on web servers, or debug mode left on. Audits and scans should look for these too. Disable what you don't need and follow vendor hardening guides.",
        examples: [
          { cmd: "ss -tulpn", what: "Shows every listening service, so you can find ones that should not be exposed." },
          { cmd: "sshd -T | grep -i permitrootlogin", what: "Shows the effective SSH setting to confirm root login is disabled." },
          { cmd: "find /etc -perm -o+w -type f", what: "Finds config files that anyone can write to." }
        ]
      },
      {
        name: "Tools: port scanners and protocol analyzers",
        explain: "A port scanner, like nmap, finds which hosts are up and which ports and services they offer, so you can spot unexpected open ports. A protocol analyzer (packet sniffer), like Wireshark or tcpdump, captures and decodes network traffic, which shows things like passwords being sent in clear text. Only scan networks you are authorized to test.",
        examples: [
          { cmd: "nmap -sV 192.168.1.10", what: "Port scanner: finds open ports and guesses service versions." },
          { cmd: "nmap -p- --open server1", what: "Scans all 65,535 TCP ports and shows only open ones." },
          { cmd: "tcpdump -i eth0 port 21 -A", what: "Protocol analyzer: captures FTP traffic and prints it as text (clear-text passwords show up)." },
          { cmd: "tshark -i eth0 -f 'tcp port 443'", what: "Command-line Wireshark capturing HTTPS traffic." }
        ]
      },
      {
        name: "Standards and audit: OpenSCAP and CIS Benchmarks",
        explain: "CIS Benchmarks are free, consensus-based hardening guides from the Center for Internet Security, with step-by-step settings for each OS. OpenSCAP is an open-source tool that uses SCAP content (such as the SCAP Security Guide) to automatically scan a system against a profile like CIS, PCI-DSS, or STIG, and produce an HTML report. It can even generate fix scripts.",
        examples: [
          { cmd: "dnf install openscap-scanner scap-security-guide", what: "Installs the OpenSCAP scanner and security profiles." },
          { cmd: "oscap info /usr/share/xml/scap/ssg/content/ssg-rhel9-ds.xml", what: "Lists the profiles available in the content file." },
          { cmd: "oscap xccdf eval --profile xccdf_org.ssgproject.content_profile_cis --report report.html /usr/share/xml/scap/ssg/content/ssg-rhel9-ds.xml", what: "Scans the system against the CIS profile and writes an HTML report." }
        ],
        tip: "CIS = the checklist. OpenSCAP = the tool that checks the list automatically."
      },
      {
        name: "File integrity: AIDE and rkhunter",
        explain: "File integrity tools detect unexpected changes to important files. AIDE (Advanced Intrusion Detection Environment) takes a baseline database of file hashes and attributes, and later reports anything that changed. rkhunter (Rootkit Hunter) scans for known rootkits, backdoors, and suspicious file changes.",
        examples: [
          { cmd: "aide --init && mv /var/lib/aide/aide.db.new.gz /var/lib/aide/aide.db.gz", what: "Creates the first AIDE baseline and puts it in place." },
          { cmd: "aide --check", what: "Compares the current system to the baseline and reports changes." },
          { cmd: "rkhunter --update && rkhunter --propupd", what: "Updates rkhunter's data and records current file properties as trusted." },
          { cmd: "rkhunter --check --sk", what: "Scans for rootkits without pausing for key presses." }
        ],
        tip: "Build the AIDE baseline on a clean, freshly installed system, and store a copy somewhere read-only."
      },
      {
        name: "Signed packages and installed file verification",
        explain: "Package managers check a GPG signature on each package to prove it came from the real vendor and was not changed (signed package verification). After install, you can verify installed files against the package database to spot modified or missing files. Use rpm -V on RPM systems and debsums or dpkg --verify on Debian systems.",
        examples: [
          { cmd: "rpm --checksig package.rpm", what: "Checks a package file's signature and digest before installing (also rpm -K)." },
          { cmd: "rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release", what: "Imports the vendor's GPG key so its signed packages are trusted." },
          { cmd: "gpgcheck=1", what: "Line in a /etc/yum.repos.d/*.repo file requiring signed packages." },
          { cmd: "rpm -V openssh-server", what: "Verifies installed files; output like 'S.5....T' means size, checksum, and time changed." },
          { cmd: "rpm -Va", what: "Verifies every installed package (no output = nothing changed)." },
          { cmd: "debsums -c", what: "Debian/Ubuntu: lists installed files whose checksums changed." },
          { cmd: "dpkg --verify openssh-server", what: "Debian/Ubuntu: verifies the package's installed files." }
        ],
        tip: "In rpm -V output: S = size, 5 = checksum (digest), T = modification time, c = config file."
      },
      {
        name: "Secure data destruction",
        explain: "When disks are reused or thrown away, old data must be unrecoverable. shred overwrites a file or device several times. badblocks -w does a destructive write test that overwrites every block with patterns. dd if=/dev/urandom fills a whole disk with random data. Cryptographic destruction (crypto erase) means encrypting data and then destroying the key, so the data becomes useless; it is fast and works well for SSDs.",
        examples: [
          { cmd: "shred -v -n 3 -z -u secret.txt", what: "Overwrites the file 3 times, adds a final pass of zeros, then deletes it." },
          { cmd: "badblocks -w -s /dev/sdb", what: "Destructive write test that overwrites the entire disk with patterns." },
          { cmd: "dd if=/dev/urandom of=/dev/sdb bs=4M status=progress", what: "Overwrites the whole disk with random data." },
          { cmd: "cryptsetup luksErase /dev/sdb1", what: "Cryptographic destruction: wipes all LUKS key slots so the data can never be decrypted." }
        ],
        tip: "shred is unreliable on SSDs and journaling or copy-on-write file systems; cryptographic destruction or the drive's own secure erase is better there."
      },
      {
        name: "Software supply chain",
        explain: "The software supply chain is everything your software depends on: upstream projects, libraries, build systems, container images, and repositories. Attackers may hide malicious code in a dependency, like the 2024 xz backdoor. Protect it by using trusted, signed repositories, pinning and checking versions and hashes, keeping a software bill of materials (SBOM), and scanning dependencies and images for known CVEs.",
        examples: [
          { cmd: "dnf repolist", what: "Shows which repositories the system trusts for packages." },
          { cmd: "pip install --require-hashes -r requirements.txt", what: "Installs Python packages only if their hashes match the pinned values." },
          { cmd: "Real-world: CVE-2024-3094 (xz backdoor)", what: "A malicious maintainer slipped a backdoor into the xz compression library; caught before most stable releases shipped it." }
        ]
      },
      {
        name: "Security banners: /etc/issue, /etc/issue.net, /etc/motd",
        explain: "Banners give legal warnings, such as 'authorized use only; activity is monitored', which can help with prosecution and compliance. /etc/issue is shown before login on local consoles. /etc/issue.net is shown before login for remote connections (for SSH, set Banner /etc/issue.net in sshd_config). /etc/motd (message of the day) is shown after a successful login.",
        examples: [
          { cmd: "echo 'Authorized users only. Activity is monitored.' > /etc/issue.net", what: "Sets the pre-login banner text for remote logins." },
          { cmd: "Banner /etc/issue.net", what: "sshd_config line that shows the banner before SSH authentication." },
          { cmd: "cat /etc/motd", what: "Shows the message users see after logging in." }
        ],
        tip: "Before login: issue (local) and issue.net (remote). After login: motd. Don't reveal OS or version info in banners."
      }
    ],
    cards: [
      { q: "What is an indicator of compromise (IoC)?", a: "Evidence that a system may have been breached, such as unknown processes, unexpected outbound connections, new accounts, changed system files, or known malicious hashes or IPs." },
      { q: "What is the difference between a CVE and CVSS?", a: "A CVE is the unique ID of a publicly known vulnerability. CVSS is the 0.0-10.0 score that rates its severity." },
      { q: "A scanner flags an old OpenSSH version on RHEL, but the system is fully updated. Why?", a: "Red Hat backports security patches into older versions. Check `rpm -q --changelog openssh | grep CVE` to confirm the fix." },
      { q: "What is the difference between a port scanner and a protocol analyzer?", a: "A port scanner (nmap) finds open ports and services. A protocol analyzer (Wireshark, tcpdump) captures and decodes network traffic." },
      { q: "What do CIS Benchmarks and OpenSCAP do?", a: "CIS Benchmarks are hardening guides; OpenSCAP automatically scans a system against profiles like CIS and reports or fixes gaps." },
      { q: "How does AIDE detect tampering?", a: "It builds a baseline database of file hashes and attributes (`aide --init`), then `aide --check` reports any differences." },
      { q: "What does rkhunter scan for?", a: "Known rootkits, backdoors, and suspicious changes to system files." },
      { q: "Which commands verify installed package files on RPM and Debian systems?", a: "`rpm -V package` (or `rpm -Va` for all) on RPM; `debsums` or `dpkg --verify` on Debian/Ubuntu." },
      { q: "Name four secure data destruction methods.", a: "`shred`, `badblocks -w`, `dd if=/dev/urandom of=/dev/sdX`, and cryptographic destruction (destroying the encryption key)." },
      { q: "Why is cryptographic destruction good for SSDs?", a: "SSDs remap blocks, so overwriting may miss data. Destroying the encryption key makes all the encrypted data unreadable instantly." },
      { q: "What is a software supply chain attack?", a: "An attack that hides malicious code in a trusted dependency, build tool, or repository (e.g., the xz backdoor), so victims install it themselves." },
      { q: "Which banner file is shown before SSH login, and which after any login?", a: "/etc/issue.net (with `Banner /etc/issue.net` in sshd_config) before SSH login; /etc/motd after login. /etc/issue is for local console logins." }
    ]
  }
);
