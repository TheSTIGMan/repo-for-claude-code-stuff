// Domain 2: Services and User Management (objectives 2.1 - 2.6)
window.LINUX_PLUS_DATA.objectives.push(
  // ------------------------------------------------------------------ 2.1
  {
    id: "2.1", domain: 2,
    title: "Given a scenario, manage files and directories on a Linux system.",
    summary: "This objective is about the everyday commands you use to move around the filesystem, create, copy, compare, find and delete files. It also covers links (shortcuts to files) and the special device files in /dev. These are the basic tools every Linux admin uses all day.",
    topics: [
      {
        name: "Moving around: pwd, cd, ls",
        explain: "`pwd` (print working directory) shows the folder you are in right now. `cd` changes to another folder. `ls` lists what is inside a folder. `cd` with no argument takes you to your home directory, and `cd -` jumps back to the previous folder.",
        examples: [
          { cmd: "pwd", what: "Prints the full path of the current directory, such as /home/alice." },
          { cmd: "cd /etc", what: "Moves into the /etc directory (an absolute path)." },
          { cmd: "cd ..", what: "Moves up one level to the parent directory." },
          { cmd: "ls -lah", what: "Long listing of all files, including hidden ones, with human-readable sizes." }
        ],
        tip: "Hidden files start with a dot. Plain `ls` hides them; `ls -a` shows them."
      },
      {
        name: "Creating files and directories: touch, mkdir",
        explain: "`touch` creates an empty file, or updates the timestamp of a file that already exists. `mkdir` makes a new directory. Use `mkdir -p` to create a whole path of parent folders in one step without errors if they already exist.",
        examples: [
          { cmd: "touch notes.txt", what: "Creates an empty notes.txt, or updates its modified time if it exists." },
          { cmd: "mkdir -p /srv/app/logs/old", what: "Creates /srv/app, /srv/app/logs and /srv/app/logs/old as needed." }
        ]
      },
      {
        name: "Copying, moving and deleting: cp, mv, rm, rmdir",
        explain: "`cp` copies files; add `-r` to copy a whole directory. `mv` moves a file, and it is also how you rename a file. `rm` deletes files; `rm -r` deletes a directory and everything inside it. `rmdir` removes a directory only if it is empty. There is no recycle bin, so deleted files are gone.",
        examples: [
          { cmd: "cp -a /etc/nginx /root/nginx-backup", what: "Copies the folder recursively while keeping permissions, owners and timestamps (archive mode)." },
          { cmd: "mv report.txt report-old.txt", what: "Renames report.txt to report-old.txt." },
          { cmd: "rm -i *.tmp", what: "Deletes .tmp files, asking for confirmation for each one." },
          { cmd: "rmdir emptydir", what: "Removes emptydir, but fails if it still contains anything." }
        ],
        tip: "`rm -rf` is powerful and dangerous. Double-check the path before pressing Enter."
      },
      {
        name: "Inspecting files: file, stat",
        explain: "`file` tells you what kind of data a file holds (text, image, ELF program, etc.) by looking at its contents, not its name. `stat` shows detailed metadata: size, permissions, owner, inode number, link count, and access/modify/change timestamps.",
        examples: [
          { cmd: "file /bin/ls", what: "Reports that /bin/ls is an ELF 64-bit executable." },
          { cmd: "stat /etc/passwd", what: "Shows the inode, permissions, owner, size, link count and timestamps of /etc/passwd." }
        ]
      },
      {
        name: "Comparing files: diff, sdiff",
        explain: "`diff` compares two files line by line and prints only the differences. `diff -u` gives the unified format used in patches. `sdiff` shows the two files side by side so you can see changes in columns.",
        examples: [
          { cmd: "diff -u httpd.conf.orig httpd.conf", what: "Shows changed lines with - for removed and + for added lines." },
          { cmd: "sdiff file1.txt file2.txt", what: "Displays both files side by side, marking differing lines with |, < or >." }
        ]
      },
      {
        name: "Finding files: find, locate",
        explain: "`find` searches the live filesystem using tests like name, size, owner, type or age. It is always up to date but can be slow. `locate` searches a prebuilt database, so it is very fast but may miss new files until the database is refreshed with `updatedb`.",
        examples: [
          { cmd: "find /var/log -name '*.log' -mtime -1", what: "Lists .log files under /var/log changed in the last day." },
          { cmd: "find / -type f -size +100M", what: "Finds regular files larger than 100 MB." },
          { cmd: "find /home -user bob -exec ls -l {} \\;", what: "Finds files owned by bob and runs ls -l on each one." },
          { cmd: "sudo updatedb && locate sshd_config", what: "Refreshes the locate database, then quickly finds sshd_config." }
        ],
        tip: "Fast but maybe stale = `locate`. Slow but always current = `find`."
      },
      {
        name: "Open files: lsof",
        explain: "`lsof` (list open files) shows which processes have which files open. In Linux almost everything is a file, including network sockets, so lsof can also show which program is using a port. It is handy when a disk will not unmount because something is still using it.",
        examples: [
          { cmd: "lsof /var/log/messages", what: "Shows which processes have /var/log/messages open." },
          { cmd: "lsof +D /mnt/data", what: "Lists open files under /mnt/data, useful when umount says the target is busy." },
          { cmd: "lsof -i :80", what: "Shows the process listening on or connected to port 80." }
        ]
      },
      {
        name: "Links: symbolic link vs. hard link",
        explain: "A symbolic link (soft link, symlink) is a small file that points to another path, like a shortcut. It can cross filesystems and point to directories, but it breaks if the target is deleted. A hard link is a second name for the same inode (the same data on disk). It cannot cross filesystems or point to directories, and the data stays until every hard link is removed. Both are made with `ln`.",
        examples: [
          { cmd: "ln -s /opt/app/current/bin/app /usr/local/bin/app", what: "Creates a symbolic link named /usr/local/bin/app that points to the real program." },
          { cmd: "ln data.txt data-hardlink.txt", what: "Creates a hard link; both names share the same inode and contents." },
          { cmd: "ls -li", what: "Shows inode numbers (hard links share one) and link counts; symlinks show as l and an arrow." }
        ],
        tip: "`ln -s` = soft/symbolic. Plain `ln` = hard link. Hard links share an inode number."
      },
      {
        name: "Device types in /dev",
        explain: "Hardware and virtual devices appear as files in /dev. A block device moves data in fixed-size blocks and allows random access, like disks (/dev/sda, /dev/nvme0n1); `ls -l` shows a `b` at the start. A character device moves data as a stream of bytes, like terminals and serial ports (/dev/tty); `ls -l` shows a `c`. Special character devices are virtual ones built into the kernel: /dev/null throws away anything written to it, /dev/zero gives endless zero bytes, and /dev/urandom gives endless random bytes.",
        examples: [
          { cmd: "ls -l /dev/sda /dev/tty", what: "Shows b for the block device /dev/sda and c for the character device /dev/tty." },
          { cmd: "command 2>/dev/null", what: "Throws away error messages by sending them to /dev/null." },
          { cmd: "dd if=/dev/zero of=/swapfile bs=1M count=1024", what: "Creates a 1 GB file filled with zeros, e.g. for a swap file." },
          { cmd: "head -c 16 /dev/urandom | base64", what: "Reads 16 random bytes and prints them as text, e.g. for a random password." }
        ],
        tip: "b = block (disks), c = character (streams). /dev/null is the 'black hole'."
      }
    ],
    cards: [
      { q: "Which command shows which process has a file open, or is keeping a filesystem busy?", a: "`lsof`, for example `lsof /mnt/data` or `lsof +D /mnt/data`." },
      { q: "What is the difference between a symbolic link and a hard link?", a: "A symbolic link points to a path and breaks if the target is removed; it can cross filesystems. A hard link is another name for the same inode, cannot cross filesystems, and keeps the data alive until all links are gone." },
      { q: "How do you create a symbolic link named /usr/local/bin/tool pointing to /opt/tool/bin/tool?", a: "`ln -s /opt/tool/bin/tool /usr/local/bin/tool` (target first, then link name)." },
      { q: "You just created a file but `locate` cannot find it. Why, and how do you fix it?", a: "locate uses a database that is updated on a schedule. Run `sudo updatedb` and search again, or use `find` instead." },
      { q: "What does `rmdir` do if the directory is not empty?", a: "It refuses and prints an error. Use `rm -r` to remove a directory and its contents." },
      { q: "Which command shows inode number, link count and the access/modify/change times of a file?", a: "`stat filename`." },
      { q: "Which command identifies a file's type by its contents rather than its extension?", a: "`file`, for example `file /usr/bin/ls`." },
      { q: "Which command compares two files side by side?", a: "`sdiff file1 file2`. Use `diff` for a normal line-by-line difference listing." },
      { q: "In `ls -l /dev` output, what do a leading b and c mean?", a: "b is a block device (like a disk), c is a character device (like a terminal or /dev/null)." },
      { q: "What are /dev/null, /dev/zero and /dev/urandom?", a: "Special character devices: /dev/null discards everything written to it, /dev/zero returns endless zero bytes, /dev/urandom returns endless random bytes." }
    ]
  },

  // ------------------------------------------------------------------ 2.2
  {
    id: "2.2", domain: 2,
    title: "Given a scenario, perform local account management in a Linux environment.",
    summary: "This objective covers creating, changing, locking and deleting local users and groups, and the files where Linux stores that information. You also need to know how account aging and expiration work, how new users get their default files, and how UIDs separate real users from system and service accounts.",
    topics: [
      {
        name: "Adding users and groups: useradd, adduser, groupadd",
        explain: "`useradd` is the low-level tool found on every distro; you give it options such as `-m` (make a home directory) and `-s` (shell). `adduser` is a friendlier interactive script on Debian/Ubuntu that asks questions and creates the home directory for you (on RHEL-type systems it is just a link to useradd). `groupadd` creates a new group.",
        examples: [
          { cmd: "sudo useradd -m -s /bin/bash -c 'Alice Smith' -G wheel alice", what: "Creates user alice with a home directory, bash shell, a comment, and membership in the wheel group." },
          { cmd: "sudo adduser bob", what: "On Debian/Ubuntu, interactively creates bob, his home directory and asks for a password." },
          { cmd: "sudo groupadd -g 2001 developers", what: "Creates a group named developers with GID 2001." }
        ],
        tip: "`useradd` without `-m` may not create a home directory (depends on CREATE_HOME in /etc/login.defs)."
      },
      {
        name: "Deleting users and groups: userdel, deluser, groupdel",
        explain: "`userdel` removes a user account; add `-r` to also remove the home directory and mail spool. `deluser` is the Debian/Ubuntu friendly version (`--remove-home` deletes the home folder). `groupdel` deletes a group, but it cannot delete a group that is still some user's primary group.",
        examples: [
          { cmd: "sudo userdel -r alice", what: "Deletes alice and her home directory and mail spool." },
          { cmd: "sudo deluser --remove-home bob", what: "On Debian/Ubuntu, deletes bob and his home directory." },
          { cmd: "sudo groupdel developers", what: "Deletes the developers group." }
        ]
      },
      {
        name: "Modifying accounts: usermod, groupmod, chsh, passwd",
        explain: "`usermod` changes an existing user: groups, shell, home, name and more. Always use `-aG` to add a supplementary group; `-G` alone replaces all existing supplementary groups. `groupmod` renames a group or changes its GID. `chsh` changes a user's login shell. `passwd` sets or changes a password.",
        examples: [
          { cmd: "sudo usermod -aG docker alice", what: "Adds alice to the docker group without removing her other groups." },
          { cmd: "sudo groupmod -n devs developers", what: "Renames the group developers to devs." },
          { cmd: "chsh -s /bin/zsh", what: "Changes your own login shell to zsh (must be listed in /etc/shells)." },
          { cmd: "sudo passwd alice", what: "Sets a new password for alice." }
        ],
        tip: "Forgetting the `-a` in `usermod -aG` is a classic mistake that kicks the user out of other groups."
      },
      {
        name: "Locking and unlocking accounts",
        explain: "To lock an account means to stop it from logging in with a password. `passwd -l` and `usermod -L` both put a `!` in front of the password hash in /etc/shadow; `passwd -u` and `usermod -U` unlock it. Locking the password does not block SSH key logins, so to fully disable an account also expire it with `chage -E 0` or `usermod -e`.",
        examples: [
          { cmd: "sudo passwd -l alice", what: "Locks alice's password." },
          { cmd: "sudo usermod -L alice", what: "Also locks the password (adds ! to the hash)." },
          { cmd: "sudo usermod -U alice", what: "Unlocks alice's password." },
          { cmd: "sudo chage -E 0 alice", what: "Expires the account immediately so no login method works." }
        ]
      },
      {
        name: "Password aging and account expiration: chage, /etc/login.defs, /etc/default/useradd",
        explain: "`chage` (change age) controls password aging and account expiration for one user: max days before a password must change, min days between changes, warning days, and an expiration date. /etc/login.defs holds system-wide defaults for new accounts, like PASS_MAX_DAYS, PASS_MIN_DAYS, PASS_WARN_AGE, UID_MIN and UID_MAX. /etc/default/useradd holds useradd defaults like the default shell, home base, skeleton directory (SKEL), INACTIVE and EXPIRE.",
        examples: [
          { cmd: "sudo chage -l alice", what: "Lists alice's password aging and account expiration settings." },
          { cmd: "sudo chage -M 90 -W 7 alice", what: "Forces a password change every 90 days with a 7-day warning." },
          { cmd: "sudo chage -d 0 alice", what: "Forces alice to change her password at next login." },
          { cmd: "sudo chage -E 2026-12-31 contractor", what: "Makes the contractor account expire on 31 Dec 2026." },
          { cmd: "useradd -D", what: "Shows the current defaults from /etc/default/useradd." }
        ],
        tip: "login.defs changes only affect accounts created after the change. Use chage for existing users."
      },
      {
        name: "Listing users and sessions: id, groups, whoami, who, w, last, lastlog, getent passwd",
        explain: "`whoami` prints your current username. `id` shows your UID, GID and all groups. `groups` lists group names for a user. `who` lists who is logged in; `w` does the same plus what each user is running and system load. `last` shows the login history (from /var/log/wtmp). `lastlog` shows each account's most recent login. `getent passwd` lists all accounts, including ones from LDAP or other directory services, not just /etc/passwd.",
        examples: [
          { cmd: "id alice", what: "Shows uid, gid and groups for alice, e.g. uid=1001(alice) gid=1001(alice) groups=1001(alice),10(wheel)." },
          { cmd: "groups alice", what: "Lists the group names alice belongs to." },
          { cmd: "w", what: "Shows logged-in users, their idle time, and what they are running." },
          { cmd: "last -n 10", what: "Shows the last 10 logins and reboots." },
          { cmd: "getent passwd alice", what: "Looks up alice through NSS (local files, LDAP, SSSD, etc.)." }
        ]
      },
      {
        name: "User profile templates: /etc/skel and /etc/profile",
        explain: "/etc/skel is a skeleton directory. When a new user is created with a home directory, everything in /etc/skel (like .bashrc and .bash_profile) is copied into it. /etc/profile is a system-wide script that runs for every login shell, setting things like PATH and umask; extra snippets can live in /etc/profile.d/. Per-user files like ~/.bash_profile run after it.",
        examples: [
          { cmd: "sudo cp company-motd.sh /etc/skel/.motd.sh", what: "Every new user created after this gets .motd.sh in their home." },
          { cmd: "echo 'export EDITOR=vim' | sudo tee /etc/profile.d/editor.sh", what: "Sets EDITOR for all users on login via a profile.d snippet." }
        ],
        tip: "skel = new users only. /etc/profile = every login shell, for all users."
      },
      {
        name: "Account files: /etc/passwd, /etc/shadow, /etc/group",
        explain: "/etc/passwd lists accounts with 7 colon-separated fields: name, x (password is in shadow), UID, GID, comment (GECOS), home, shell. It is world-readable. /etc/shadow holds the hashed passwords and aging fields and is readable only by root. /etc/group lists groups: name, password placeholder, GID and member list.",
        examples: [
          { cmd: "alice:x:1001:1001:Alice Smith:/home/alice:/bin/bash", what: "A sample /etc/passwd line: name, x, UID, GID, comment, home, shell." },
          { cmd: "alice:$6$salt$hash...:20000:0:90:7:::", what: "A sample /etc/shadow line: name, hash, last change, min, max, warn, inactive, expire." },
          { cmd: "wheel:x:10:alice,bob", what: "A sample /etc/group line: group wheel, GID 10, members alice and bob." },
          { cmd: "sudo vipw", what: "Safely edits /etc/passwd with locking (vipw -s for shadow, vigr for group)." }
        ]
      },
      {
        name: "UID, GID, EUID, EGID and account types (UID range)",
        explain: "The UID (user ID) is the number Linux really uses for a user; the GID (group ID) is the number for a group. Root is always UID 0. The EUID (Effective User ID) and EGID (effective group ID) are the identities a process acts as for permission checks; they differ from the real UID when using sudo or a setuid program like passwd. Regular user accounts usually get UID 1000 and up (UID_MIN in /etc/login.defs). A system account or service account (for daemons like apache or sshd) gets a low UID range, usually 1 to 999, often with no login shell (/sbin/nologin).",
        examples: [
          { cmd: "sudo useradd -r -s /sbin/nologin -d /var/lib/myapp myapp", what: "Creates a system/service account (low UID, no login shell) for a daemon." },
          { cmd: "grep -E '^(UID|SYS_UID)_(MIN|MAX)' /etc/login.defs", what: "Shows the UID range for regular and system accounts." },
          { cmd: "ps -eo pid,user,euser,cmd", what: "Shows real user and effective user (EUID) for processes." }
        ],
        tip: "UID 0 = root, 1-999 = system/service accounts, 1000+ = regular users (on most modern distros)."
      }
    ],
    cards: [
      { q: "What is the safe way to add an existing user to the extra group 'docker'?", a: "`sudo usermod -aG docker username`. Without -a, -G replaces all supplementary groups." },
      { q: "Which file stores hashed passwords and password aging data?", a: "/etc/shadow (readable only by root)." },
      { q: "What are the 7 fields of /etc/passwd?", a: "Username, password placeholder (x), UID, GID, comment (GECOS), home directory, login shell." },
      { q: "Which command forces a user to change their password at next login?", a: "`chage -d 0 username` (or `passwd -e username`)." },
      { q: "Which two commands lock a user's password?", a: "`passwd -l username` and `usermod -L username`. Unlock with `passwd -u` or `usermod -U`." },
      { q: "Where are default files copied from when a new home directory is created?", a: "/etc/skel." },
      { q: "Which file holds system-wide defaults like PASS_MAX_DAYS and UID_MIN?", a: "/etc/login.defs. Defaults for useradd itself (shell, SKEL, EXPIRE) are in /etc/default/useradd." },
      { q: "What is the typical UID range for system/service accounts vs. regular users?", a: "System and service accounts: 1-999 (root is 0). Regular user accounts: 1000 and above." },
      { q: "What is the EUID?", a: "The Effective User ID: the identity a process uses for permission checks. It can differ from the real UID, e.g. with sudo or setuid programs." },
      { q: "Which command lists all accounts including those from LDAP/SSSD?", a: "`getent passwd`." },
      { q: "Which command shows recent login history, and which shows each user's most recent login?", a: "`last` shows login history; `lastlog` shows the latest login per account." }
    ]
  },

  // ------------------------------------------------------------------ 2.3
  {
    id: "2.3", domain: 2,
    title: "Given a scenario, manage processes and jobs in a Linux environment.",
    summary: "A process is a running program. This objective covers how to see what processes are doing, understand their states and IDs, change their priority and limits, control them with signals and job control, and schedule commands to run later or on a repeating schedule.",
    topics: [
      {
        name: "Process IDs: PID and PPID",
        explain: "Every process has a PID (process ID), a unique number. Every process except the first also has a PPID (parent process ID), the PID of the process that started it. On systemd systems PID 1 is systemd, the parent of everything else. `$$` in a shell is the shell's own PID.",
        examples: [
          { cmd: "ps -o pid,ppid,cmd -p $$", what: "Shows the PID, PPID and command of your current shell." },
          { cmd: "pgrep -l sshd", what: "Lists PIDs of processes named sshd." }
        ]
      },
      {
        name: "Viewing processes: ps, pstree, top, htop, atop",
        explain: "`ps` takes a snapshot of processes. `pstree` shows processes as a tree so you can see parent and child relationships. `top` is a live, updating view sorted by CPU use. `htop` is a friendlier, colorful version of top with scrolling and mouse support. `atop` is a detailed monitor that can also log resource history (CPU, memory, disk, network) to look back at later.",
        examples: [
          { cmd: "ps aux", what: "Lists every process with user, CPU%, memory%, state and command (BSD style)." },
          { cmd: "ps -ef --forest", what: "Lists every process (UNIX style) with PPID, shown as a tree." },
          { cmd: "pstree -p", what: "Shows the process tree with PIDs." },
          { cmd: "top", what: "Live view; press P to sort by CPU, M by memory, k to kill, q to quit." }
        ],
        tip: "`ps aux` and `ps -ef` both show all processes; just different styles."
      },
      {
        name: "Deeper inspection: /proc/<PID>, lsof, strace, mpstat, pidstat",
        explain: "Each running process has a folder /proc/<PID>/ with live info: cmdline, status, environ, open file descriptors (fd/) and more. `lsof -p` lists files a process has open. `strace` shows the system calls a program makes, which is great for seeing why it fails. `mpstat` shows CPU usage per processor core. `pidstat` shows CPU, memory or disk stats per process over time. mpstat and pidstat come from the sysstat package.",
        examples: [
          { cmd: "cat /proc/1234/status", what: "Shows name, state, PPID, UIDs and memory info for PID 1234." },
          { cmd: "ls -l /proc/1234/fd", what: "Shows the file descriptors (open files) of PID 1234." },
          { cmd: "strace -f -p 1234", what: "Attaches to PID 1234 and prints every system call it makes, including child threads." },
          { cmd: "mpstat -P ALL 2", what: "Prints per-CPU usage every 2 seconds." },
          { cmd: "pidstat -u 1 5", what: "Shows CPU use per process every second, 5 times." }
        ]
      },
      {
        name: "Process states",
        explain: "Running (R): using the CPU or ready to run. Sleeping (S): waiting for something, like input; this is normal for most processes (interruptible sleep). Blocked (D, uninterruptible sleep): waiting on I/O such as a disk or NFS and cannot be interrupted, even by kill -9. Stopped (T): paused, e.g. with Ctrl+Z or SIGSTOP. Zombie (Z): finished, but the parent has not yet collected its exit status; it uses no resources except a PID table entry.",
        examples: [
          { cmd: "ps -eo pid,ppid,stat,cmd | awk '$3 ~ /Z/'", what: "Finds zombie processes and their parent PIDs." },
          { cmd: "ps -eo pid,stat,cmd | grep ' D'", what: "Finds processes blocked in uninterruptible I/O wait." }
        ],
        tip: "You cannot kill a zombie; it is already dead. Kill or fix its parent (PPID) instead."
      },
      {
        name: "Priority: nice and renice",
        explain: "The nice value controls how much CPU time a process gets compared to others. It goes from -20 (highest priority, least nice) to 19 (lowest priority, most nice); the default is 0. `nice` starts a new command with a chosen value. `renice` changes the value of a running process. Only root can lower a nice value (raise priority).",
        examples: [
          { cmd: "nice -n 10 tar czf backup.tgz /home", what: "Runs the backup with lower priority (nice 10)." },
          { cmd: "sudo renice -n -5 -p 1234", what: "Raises the priority of PID 1234 to nice -5." },
          { cmd: "renice -n 15 -u alice", what: "Lowers the priority of all of alice's processes." }
        ],
        tip: "Higher nice number = nicer to others = lower priority."
      },
      {
        name: "Process limits: ulimit and /etc/security/limits.conf",
        explain: "Process limits stop a user or program from using too many resources, like open files or number of processes. `ulimit` shows or sets limits for the current shell and its children. Soft limits are the current value, which a user can raise up to the hard limit. Permanent per-user or per-group limits go in /etc/security/limits.conf (or files in /etc/security/limits.d/), applied at login by PAM.",
        examples: [
          { cmd: "ulimit -a", what: "Shows all current limits for this shell." },
          { cmd: "ulimit -n 4096", what: "Sets the open-files limit to 4096 for this shell session." },
          { cmd: "alice  hard  nproc  200", what: "A limits.conf line limiting alice to 200 processes (hard limit)." },
          { cmd: "@devs  soft  nofile  8192", what: "A limits.conf line setting a soft open-file limit for the devs group." }
        ]
      },
      {
        name: "Job control: &, jobs, fg, bg, Ctrl+Z, Ctrl+C, Ctrl+D, nohup, exec",
        explain: "Adding `&` to a command runs it in the background. `jobs` lists background and stopped jobs in this shell. Ctrl+Z stops (pauses) the foreground job; `bg` resumes it in the background and `fg` brings it back to the foreground. Ctrl+C sends SIGINT to interrupt and usually end the foreground program. Ctrl+D sends end-of-file (EOF), which ends input and logs out of a shell. `nohup` runs a command immune to hangups so it keeps going after you log out. `exec` replaces the current shell with a new program (no new process is created).",
        examples: [
          { cmd: "sleep 600 &", what: "Starts sleep in the background and prints its job number and PID." },
          { cmd: "jobs -l", what: "Lists jobs with their job numbers and PIDs." },
          { cmd: "fg %1", what: "Brings job 1 to the foreground." },
          { cmd: "nohup ./long-task.sh > task.log 2>&1 &", what: "Runs the script in the background and keeps it running after logout." },
          { cmd: "exec bash", what: "Replaces the current shell process with a fresh bash." }
        ],
        tip: "Ctrl+Z pauses, Ctrl+C cancels, Ctrl+D means 'end of input'."
      },
      {
        name: "Signals: kill, killall, pkill (1 HUP, 9 KILL, 15 TERM)",
        explain: "Signals are messages sent to processes. 15 SIGTERM is the default and politely asks a process to exit, letting it clean up. 9 SIGKILL forces it to stop instantly and cannot be caught or ignored; use it only as a last resort. 1 SIGHUP (hangup) often tells a daemon to reload its configuration. `kill` sends a signal to a PID, `killall` to all processes with an exact name, and `pkill` to processes matching a pattern or other criteria like user.",
        examples: [
          { cmd: "kill 1234", what: "Sends SIGTERM (15) to PID 1234." },
          { cmd: "kill -9 1234", what: "Sends SIGKILL to force PID 1234 to stop." },
          { cmd: "kill -HUP $(pidof nginx)", what: "Sends SIGHUP so nginx reloads its configuration." },
          { cmd: "killall firefox", what: "Sends SIGTERM to every process named firefox." },
          { cmd: "pkill -u bob", what: "Terminates all processes owned by user bob." }
        ],
        tip: "Memory trick: 1 HUP = reload, 9 KILL = force, 15 TERM = polite default. `kill -l` lists all signals."
      },
      {
        name: "Scheduling: crontab, at, anacron",
        explain: "cron runs jobs on a repeating schedule. Edit your jobs with `crontab -e`; each line has 5 time fields (minute, hour, day of month, month, day of week) and a command. `at` runs a command once at a set time (needs the atd service). anacron is for machines that are not always on: it runs daily, weekly or monthly jobs that were missed while the system was off, configured in /etc/anacrontab.",
        examples: [
          { cmd: "crontab -e", what: "Opens your personal crontab for editing (crontab -l lists it, -r removes it)." },
          { cmd: "30 2 * * 1-5 /usr/local/bin/backup.sh", what: "Crontab line: runs backup.sh at 2:30 AM Monday through Friday." },
          { cmd: "echo 'systemctl reboot' | sudo at 03:00 tomorrow", what: "Schedules a one-time reboot at 3 AM tomorrow. atq lists jobs, atrm removes them." },
          { cmd: "7  10  backup.daily  /usr/local/bin/backup.sh", what: "/etc/anacrontab line: every 7 days, 10 minutes after boot, run backup.sh." }
        ],
        tip: "Repeating = cron. Once = at. Laptop that sleeps a lot = anacron."
      }
    ],
    cards: [
      { q: "What is the difference between SIGTERM (15) and SIGKILL (9)?", a: "SIGTERM asks the process to exit cleanly and can be caught. SIGKILL ends it immediately and cannot be caught or ignored." },
      { q: "Which signal is often used to make a daemon reload its config?", a: "1 SIGHUP, e.g. `kill -HUP <PID>`." },
      { q: "You pressed Ctrl+Z on a running program. How do you let it keep running in the background?", a: "Run `bg` (or `bg %1`). Use `fg` to bring it back to the foreground." },
      { q: "What is a zombie process and how do you get rid of it?", a: "A process that has finished but whose parent has not read its exit status. Fix or kill the parent (find it via PPID); the zombie itself cannot be killed." },
      { q: "What is the nice value range and which end is highest priority?", a: "-20 to 19. -20 is the highest priority; 19 is the lowest. Default is 0." },
      { q: "Which command changes the priority of an already running process?", a: "`renice`, e.g. `renice -n 5 -p 1234`." },
      { q: "How do you keep a command running after logging out?", a: "Use `nohup command &` (or run it in tmux/screen, or as a systemd service)." },
      { q: "Where do you set permanent per-user process limits like max open files?", a: "/etc/security/limits.conf (or /etc/security/limits.d/). Use `ulimit` for the current shell." },
      { q: "Which tool traces the system calls a program makes?", a: "`strace`, e.g. `strace -p <PID>` or `strace ls`." },
      { q: "Which scheduler runs missed daily jobs on a machine that was powered off?", a: "anacron. Use `at` for one-time jobs and crontab for regular repeating jobs." },
      { q: "What does process state D mean?", a: "Uninterruptible sleep (blocked), usually waiting on disk or network I/O; it cannot be killed until the I/O finishes." }
    ]
  },

  // ------------------------------------------------------------------ 2.4
  {
    id: "2.4", domain: 2,
    title: "Given a scenario, configure and manage software in a Linux environment.",
    summary: "This objective covers installing, updating and removing software with package managers, repositories, source builds, language tools and sandboxed app formats. It also covers controlling repositories, trust (GPG signatures), exclusions and alternatives, plus basic setup of common network services like DNS, NTP, DHCP, web and mail servers.",
    topics: [
      {
        name: "Package managers: dnf/yum/rpm, apt/dpkg, zypper",
        explain: "A package manager installs, updates and removes software packages and tracks what is installed. On Red Hat-family systems (RHEL, Fedora, Rocky) `dnf` (successor to `yum`) works with repositories and resolves dependencies, while `rpm` handles single .rpm files without fetching dependencies. On Debian/Ubuntu `apt` works with repositories and `dpkg` handles single .deb files. On SUSE, `zypper` is the high-level tool (it also uses rpm underneath).",
        examples: [
          { cmd: "sudo dnf install httpd", what: "Installs Apache httpd and its dependencies from enabled repositories." },
          { cmd: "sudo dnf upgrade", what: "Updates all installed packages (dnf update does the same)." },
          { cmd: "rpm -qa | grep openssl", what: "Lists installed RPM packages that match openssl." },
          { cmd: "rpm -qf /etc/ssh/sshd_config", what: "Shows which package owns that file." },
          { cmd: "sudo apt update && sudo apt upgrade", what: "Refreshes the package lists, then upgrades installed packages." },
          { cmd: "sudo dpkg -i package.deb", what: "Installs a local .deb file (run `apt -f install` to fix missing dependencies)." },
          { cmd: "sudo zypper install nginx", what: "Installs nginx on SUSE/openSUSE." }
        ],
        tip: "`apt update` refreshes the list only; `apt upgrade` actually installs updates."
      },
      {
        name: "Dependencies, conflicts and removal",
        explain: "A dependency is another package that a program needs to work. Repository tools (dnf, apt, zypper) find and install dependencies automatically. A conflict happens when two packages cannot be installed together, for example both provide the same file. Removing a package can leave unused dependencies behind; autoremove cleans them up.",
        examples: [
          { cmd: "dnf deplist nginx", what: "Lists the dependencies of the nginx package." },
          { cmd: "apt-cache depends nginx", what: "Shows what nginx depends on (Debian/Ubuntu)." },
          { cmd: "sudo dnf remove httpd", what: "Removes httpd." },
          { cmd: "sudo apt purge apache2 && sudo apt autoremove", what: "Removes apache2 with its config files, then removes no-longer-needed dependencies." }
        ]
      },
      {
        name: "Compiling from source",
        explain: "Some software is only shared as source code. You download it, then build it yourself. The classic steps are: `./configure` (checks your system and creates a Makefile), `make` (compiles), and `make install` (copies files into place, usually under /usr/local). You need build tools such as gcc and make, plus development (-devel or -dev) libraries.",
        examples: [
          { cmd: "tar xzf app-2.1.tar.gz && cd app-2.1", what: "Unpacks the source archive and enters the folder." },
          { cmd: "./configure --prefix=/usr/local", what: "Checks dependencies and prepares the build to install under /usr/local." },
          { cmd: "make && sudo make install", what: "Compiles the program, then installs it." },
          { cmd: "sudo dnf groupinstall 'Development Tools'", what: "Installs gcc, make and other build tools on RHEL-family systems (apt install build-essential on Debian)." }
        ],
        tip: "Order to remember: configure, make, make install."
      },
      {
        name: "Language-specific package managers: pip, cargo, npm",
        explain: "Programming languages have their own package managers. `pip` installs Python packages, `cargo` installs and builds Rust crates, and `npm` installs Node.js (JavaScript) packages. Avoid mixing them with system packages as root; use a Python virtual environment or per-user installs to avoid breaking OS tools.",
        examples: [
          { cmd: "python3 -m venv venv && . venv/bin/activate && pip install requests", what: "Creates a Python virtual environment and installs requests inside it." },
          { cmd: "cargo install ripgrep", what: "Builds and installs the ripgrep Rust tool into ~/.cargo/bin." },
          { cmd: "npm install express", what: "Installs the express package into ./node_modules for the current project." },
          { cmd: "npm install -g pm2", what: "Installs pm2 globally for the whole system." }
        ]
      },
      {
        name: "Repository management: enabling, disabling, third-party, GPG",
        explain: "A repository is a server holding packages and metadata. On dnf systems repos are defined in /etc/yum.repos.d/*.repo; on apt systems in /etc/apt/sources.list and /etc/apt/sources.list.d/. You can enable or disable a repo permanently or for one command. A third-party repository (like EPEL or a vendor repo) adds software the distro does not ship. GNU Privacy Guard (GPG) signatures prove packages really come from the publisher and were not changed; import the repo's key and keep gpgcheck=1.",
        examples: [
          { cmd: "dnf repolist --all", what: "Lists all repositories and whether each is enabled or disabled." },
          { cmd: "sudo dnf config-manager --set-enabled crb", what: "Permanently enables the crb repository (--set-disabled turns it off; on dnf5 use `setopt crb.enabled=1`)." },
          { cmd: "sudo dnf --enablerepo=epel install htop", what: "Uses the epel repo just for this one command." },
          { cmd: "sudo rpm --import https://example.com/RPM-GPG-KEY-example", what: "Imports a third-party repo's GPG key so its signed packages can be verified." },
          { cmd: "[example]\nname=Example Repo\nbaseurl=https://repo.example.com/el9/\nenabled=1\ngpgcheck=1\ngpgkey=https://repo.example.com/key.asc", what: "A sample /etc/yum.repos.d/example.repo file." },
          { cmd: "deb [signed-by=/etc/apt/keyrings/example.gpg] https://repo.example.com/apt stable main", what: "A sample apt source line tied to a specific GPG keyring." }
        ],
        tip: "Never turn off gpgcheck just to make an install work; fix the key instead."
      },
      {
        name: "Package and repository exclusions",
        explain: "Sometimes you must stop a package from being updated, for example to keep a tested kernel version. On dnf systems add an `exclude=` line to /etc/dnf/dnf.conf or to one repo's .repo file, or use `--exclude` once. The versionlock plugin pins a package. On apt systems `apt-mark hold` pins a package.",
        examples: [
          { cmd: "exclude=kernel* php*", what: "Line in /etc/dnf/dnf.conf (or a .repo file) that excludes these packages from installs and updates." },
          { cmd: "sudo dnf upgrade --exclude=kernel*", what: "Updates everything except kernel packages this one time." },
          { cmd: "sudo dnf versionlock add nginx", what: "Locks nginx at its current version (needs the versionlock plugin)." },
          { cmd: "sudo apt-mark hold linux-image-generic", what: "Holds the kernel package so apt will not upgrade it (unhold to release)." }
        ]
      },
      {
        name: "Update alternatives",
        explain: "The alternatives system lets several programs provide the same command, like multiple Java versions or editors, and you choose which one the generic name points to. It works with symbolic links under /etc/alternatives. Debian uses `update-alternatives`; RHEL uses `alternatives` (same tool).",
        examples: [
          { cmd: "sudo update-alternatives --config java", what: "Shows installed Java versions and lets you pick the default." },
          { cmd: "sudo alternatives --config python3", what: "RHEL-style: picks which python3 the command name points to." },
          { cmd: "update-alternatives --display editor", what: "Shows all choices for 'editor' and which is current." }
        ]
      },
      {
        name: "Software configuration",
        explain: "After installing, most software is configured with text files, usually under /etc (for example /etc/ssh/sshd_config). Back up a file before editing, check the syntax if the program offers a test, then restart or reload the service. Many programs also read drop-in files from a .d directory, which keeps your changes separate from the package defaults.",
        examples: [
          { cmd: "sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak", what: "Backs up the config before editing." },
          { cmd: "sudo sshd -t && sudo systemctl reload sshd", what: "Tests the SSH config for errors, then reloads the service." },
          { cmd: "rpm -qc openssh-server", what: "Lists the configuration files that come with the package." }
        ]
      },
      {
        name: "Sandboxed applications: Flatpak, Snap, AppImage",
        explain: "Sandboxed app formats bundle an app with its libraries so it runs on many distros and is isolated from the rest of the system. Flatpak installs apps from remotes like Flathub. Snap (from Canonical) installs apps from the Snap Store using the snapd service. AppImage is a single file you make executable and run; nothing is installed.",
        examples: [
          { cmd: "flatpak install flathub org.gimp.GIMP", what: "Installs GIMP from Flathub as a sandboxed app." },
          { cmd: "flatpak run org.gimp.GIMP", what: "Runs the Flatpak app." },
          { cmd: "sudo snap install code --classic", what: "Installs VS Code as a snap (--classic gives it less confinement)." },
          { cmd: "chmod +x App.AppImage && ./App.AppImage", what: "Makes the AppImage executable and runs it directly." }
        ]
      },
      {
        name: "Common services: DNS, NTP/PTP (chrony), DHCP",
        explain: "DNS turns names into IP addresses; a common server is BIND (named, config in /etc/named.conf), and clients use /etc/resolv.conf. NTP keeps clocks in sync over the network; chrony (chronyd, /etc/chrony.conf) is the modern NTP client and server. PTP (Precision Time Protocol) gives even more accurate, sub-microsecond time on local networks, often with linuxptp (ptp4l). DHCP hands out IP addresses automatically; a classic server is ISC dhcpd (/etc/dhcp/dhcpd.conf) or the newer Kea.",
        examples: [
          { cmd: "server time.example.com iburst", what: "A line in /etc/chrony.conf telling chrony which NTP server to use." },
          { cmd: "chronyc sources -v", what: "Shows the time sources chrony is using and their status." },
          { cmd: "dig @127.0.0.1 example.com", what: "Tests a local DNS server by querying it for example.com." },
          { cmd: "subnet 192.168.1.0 netmask 255.255.255.0 { range 192.168.1.100 192.168.1.200; option routers 192.168.1.1; }", what: "A dhcpd.conf block that hands out addresses .100-.200 with a default gateway." }
        ]
      },
      {
        name: "Common services: HTTP (Apache httpd, Nginx), SMTP, IMAP4",
        explain: "HTTP servers deliver websites. Apache is called httpd on RHEL (config /etc/httpd/conf/httpd.conf) and apache2 on Debian; it uses VirtualHost blocks for sites. Nginx (config /etc/nginx/nginx.conf) uses server blocks and is popular as a fast web server and reverse proxy. SMTP (port 25, 587 for submission) sends and relays email; Postfix is a common SMTP server (/etc/postfix/main.cf). IMAP4 (port 143, 993 with TLS) lets mail clients read mail kept on the server; Dovecot is a common IMAP server.",
        examples: [
          { cmd: "sudo dnf install httpd && sudo systemctl enable --now httpd", what: "Installs Apache httpd and starts it now and at boot." },
          { cmd: "sudo apachectl configtest", what: "Checks the Apache config for syntax errors." },
          { cmd: "server { listen 80; server_name example.com; root /var/www/html; }", what: "A minimal nginx server block serving files for example.com." },
          { cmd: "sudo nginx -t && sudo systemctl reload nginx", what: "Tests the nginx config, then reloads it without dropping connections." },
          { cmd: "sudo postconf -e 'myhostname = mail.example.com'", what: "Sets the Postfix SMTP server hostname in main.cf." },
          { cmd: "protocols = imap", what: "Line in /etc/dovecot/dovecot.conf enabling the IMAP protocol." }
        ],
        tip: "SMTP sends mail; IMAP reads it from the server. Ports: SMTP 25/587, IMAP 143/993, HTTP 80, HTTPS 443, DNS 53, NTP 123/UDP, DHCP 67/68 UDP."
      }
    ],
    cards: [
      { q: "What is the difference between rpm and dnf?", a: "rpm installs or queries single .rpm files and does not fetch dependencies. dnf works with repositories and resolves dependencies automatically." },
      { q: "Which command installs a local .deb file?", a: "`dpkg -i file.deb` (then `apt -f install` to fix dependencies), or `apt install ./file.deb`." },
      { q: "What are the three classic steps to compile and install from source?", a: "`./configure`, `make`, `make install`." },
      { q: "How do you stop dnf from ever updating kernel packages?", a: "Add `exclude=kernel*` to /etc/dnf/dnf.conf (or use versionlock). One time only: `dnf upgrade --exclude=kernel*`." },
      { q: "Why do repositories use GPG signatures?", a: "To prove packages come from the real publisher and were not tampered with. Keep gpgcheck=1 and import the repo's key." },
      { q: "Which command lets you choose the default Java version among several installed?", a: "`update-alternatives --config java` (RHEL: `alternatives --config java`)." },
      { q: "Name three sandboxed app formats.", a: "Flatpak, Snap and AppImage." },
      { q: "Which service and file configure NTP time sync on modern RHEL?", a: "chrony (chronyd), configured in /etc/chrony.conf; check with `chronyc sources`." },
      { q: "Which mail protocol sends mail and which lets a client read mail stored on the server?", a: "SMTP sends/relays mail (e.g. Postfix). IMAP4 reads mail on the server (e.g. Dovecot)." },
      { q: "Which language package managers go with Python, Rust and Node.js?", a: "pip (Python), cargo (Rust), npm (Node.js)." },
      { q: "How do you hold a package at its current version on Debian/Ubuntu?", a: "`sudo apt-mark hold packagename`." }
    ]
  },

  // ------------------------------------------------------------------ 2.5
  {
    id: "2.5", domain: 2,
    title: "Given a scenario, manage Linux using systemd.",
    summary: "systemd is the init system and service manager on most modern Linux distros. This objective covers its unit types (services, timers, mounts, targets), the systemctl commands to control them, and the helper tools for hostname, DNS, time, kernel settings and boot performance.",
    topics: [
      {
        name: "What units are",
        explain: "systemd manages everything as units, each described by a unit file. Package-supplied unit files live in /usr/lib/systemd/system/; your own or overriding files go in /etc/systemd/system/, which takes priority. The file name ending tells you the type: .service, .timer, .mount, .target and others.",
        examples: [
          { cmd: "systemctl list-units --type=service", what: "Lists loaded service units and their state." },
          { cmd: "systemctl list-unit-files --state=enabled", what: "Lists unit files that are enabled to start at boot." },
          { cmd: "systemctl cat sshd.service", what: "Shows the unit file (and any drop-ins) for sshd." }
        ]
      },
      {
        name: "Service units",
        explain: "A service unit runs and supervises a program, usually a daemon. The [Unit] section has a description and ordering (After=, Requires=, Wants=). The [Service] section says what to run (ExecStart=), as which user, and whether to restart on failure. The [Install] section says which target pulls it in when enabled (WantedBy=).",
        examples: [
          { cmd: "[Unit]\nDescription=My App\nAfter=network-online.target\n\n[Service]\nExecStart=/usr/local/bin/myapp\nUser=myapp\nRestart=on-failure\n\n[Install]\nWantedBy=multi-user.target", what: "A simple /etc/systemd/system/myapp.service file." }
        ]
      },
      {
        name: "Timer units",
        explain: "A timer unit starts another unit (normally a .service with the same name) on a schedule, like a modern replacement for cron. OnCalendar= gives calendar times; OnBootSec= or OnUnitActiveSec= give delays. Persistent=true runs a missed job after the machine boots, similar to anacron. You enable and start the .timer, not the service.",
        examples: [
          { cmd: "[Unit]\nDescription=Nightly backup\n\n[Timer]\nOnCalendar=*-*-* 02:00:00\nPersistent=true\n\n[Install]\nWantedBy=timers.target", what: "backup.timer: runs backup.service every day at 2 AM." },
          { cmd: "sudo systemctl enable --now backup.timer", what: "Enables and starts the timer." },
          { cmd: "systemctl list-timers", what: "Shows all timers with their last and next run times." }
        ]
      },
      {
        name: "Mount units",
        explain: "A mount unit describes a filesystem to mount, like an /etc/fstab entry. Its name must match the mount path, with slashes turned into dashes, so /data becomes data.mount. systemd also creates mount units automatically from /etc/fstab.",
        examples: [
          { cmd: "[Mount]\nWhat=/dev/sdb1\nWhere=/data\nType=xfs\nOptions=defaults\n\n[Install]\nWantedBy=multi-user.target", what: "A /etc/systemd/system/data.mount file that mounts /dev/sdb1 on /data." },
          { cmd: "systemctl list-units --type=mount", what: "Lists active mount units." }
        ]
      },
      {
        name: "Target units",
        explain: "A target is a group of units that represents a system state, replacing old runlevels. multi-user.target is a text-mode server (like runlevel 3), graphical.target adds a desktop (runlevel 5), rescue.target is single-user mode, and emergency.target is the most minimal. You can see or change the default target and switch targets live.",
        examples: [
          { cmd: "systemctl get-default", what: "Shows the target the system boots into." },
          { cmd: "sudo systemctl set-default multi-user.target", what: "Makes the system boot to text mode by default." },
          { cmd: "sudo systemctl isolate rescue.target", what: "Switches now to rescue (single-user) mode." }
        ]
      },
      {
        name: "Managing unit states with systemctl",
        explain: "`start` and `stop` run or end a unit right now. `restart` stops then starts it; `reload` tells it to re-read config without stopping (if supported). `status` shows if it is running plus recent log lines. `enable` makes it start at boot; `disable` removes that. `enable --now` does both enable and start. `mask` links the unit to /dev/null so it cannot be started at all, even by other units; `unmask` undoes that. `edit` creates a drop-in override file. `daemon-reload` makes systemd re-read unit files after you change them.",
        examples: [
          { cmd: "sudo systemctl start nginx", what: "Starts nginx now (stop ends it)." },
          { cmd: "sudo systemctl restart nginx", what: "Fully stops and starts nginx." },
          { cmd: "sudo systemctl reload nginx", what: "Reloads nginx config without dropping connections." },
          { cmd: "systemctl status nginx", what: "Shows active state, PID, and recent log lines." },
          { cmd: "sudo systemctl enable --now nginx", what: "Enables nginx at boot and starts it now (disable --now does the reverse)." },
          { cmd: "sudo systemctl mask cups", what: "Prevents cups from being started manually or as a dependency (unmask to undo)." },
          { cmd: "sudo systemctl edit nginx", what: "Opens an override file at /etc/systemd/system/nginx.service.d/override.conf." },
          { cmd: "sudo systemctl daemon-reload", what: "Re-reads unit files after you create or change one by hand." }
        ],
        tip: "enable = at boot; start = right now. disable does not stop a running service. mask is stronger than disable."
      },
      {
        name: "Boot performance: systemd-analyze and systemd-analyze blame",
        explain: "`systemd-analyze` reports how long the last boot took, split into firmware, loader, kernel and userspace. `systemd-analyze blame` lists units sorted by how long they took to start, so you can find slow ones. `systemd-analyze critical-chain` shows the chain of units that delayed boot the most.",
        examples: [
          { cmd: "systemd-analyze", what: "Shows total boot time, e.g. 'Startup finished in 2.1s (kernel) + 8.4s (userspace)'." },
          { cmd: "systemd-analyze blame", what: "Lists units from slowest to fastest startup time." },
          { cmd: "systemd-analyze critical-chain", what: "Shows the time-critical chain of units during boot." }
        ]
      },
      {
        name: "Hostname, DNS and time: hostnamectl, resolvectl, systemd-resolved, timedatectl",
        explain: "`hostnamectl` shows or sets the system hostname (stored in /etc/hostname). systemd-resolved is a local DNS resolver service with caching; `resolvectl` shows and controls it, for example which DNS servers each interface uses. `timedatectl` shows and sets the time, date, time zone, and whether NTP sync is on.",
        examples: [
          { cmd: "sudo hostnamectl set-hostname web01.example.com", what: "Sets the permanent hostname." },
          { cmd: "resolvectl status", what: "Shows DNS servers and settings per network link." },
          { cmd: "resolvectl query example.com", what: "Resolves a name through systemd-resolved." },
          { cmd: "sudo timedatectl set-timezone America/New_York", what: "Sets the system time zone." },
          { cmd: "sudo timedatectl set-ntp true", what: "Turns on automatic network time synchronization." }
        ]
      },
      {
        name: "Kernel parameters: sysctl",
        explain: "`sysctl` reads and changes kernel settings at runtime; they map to files under /proc/sys/. Changes made with `sysctl -w` are lost at reboot. To make them permanent, put them in a file under /etc/sysctl.d/ (or /etc/sysctl.conf) and load with `sysctl --system` or `sysctl -p`.",
        examples: [
          { cmd: "sysctl net.ipv4.ip_forward", what: "Shows whether IP forwarding is on (1) or off (0)." },
          { cmd: "sudo sysctl -w vm.swappiness=10", what: "Sets swappiness to 10 until the next reboot." },
          { cmd: "echo 'vm.swappiness = 10' | sudo tee /etc/sysctl.d/99-swap.conf && sudo sysctl --system", what: "Makes the setting permanent and loads it now." }
        ]
      }
    ],
    cards: [
      { q: "You edited a unit file in /etc/systemd/system. What must you run before restarting it?", a: "`sudo systemctl daemon-reload` so systemd re-reads the unit files." },
      { q: "What is the difference between enable and start?", a: "start runs the unit now; enable makes it start automatically at boot. `enable --now` does both." },
      { q: "What is the difference between disable and mask?", a: "disable stops it from starting at boot but it can still be started manually or by other units. mask links it to /dev/null so it cannot be started at all until unmasked." },
      { q: "What is the difference between restart and reload?", a: "restart stops and starts the service (brief outage). reload asks it to re-read its config without stopping, if the service supports it." },
      { q: "Which command lists units by how long they took to start at boot?", a: "`systemd-analyze blame`." },
      { q: "Which command safely creates an override drop-in for a unit?", a: "`systemctl edit unitname` (use `--full` to edit a full copy)." },
      { q: "Which systemd unit type replaces cron-like scheduling?", a: "A .timer unit, which activates a matching .service. List them with `systemctl list-timers`." },
      { q: "Which target is the systemd equivalent of runlevel 3 (multi-user text mode)?", a: "multi-user.target. graphical.target is like runlevel 5." },
      { q: "Which command sets the system time zone?", a: "`timedatectl set-timezone Zone/City`." },
      { q: "Which command shows the DNS servers used by systemd-resolved per interface?", a: "`resolvectl status`." },
      { q: "How do you make a sysctl change survive a reboot?", a: "Put it in a file under /etc/sysctl.d/ (or /etc/sysctl.conf) and run `sysctl --system`." }
    ]
  },

  // ------------------------------------------------------------------ 2.6
  {
    id: "2.6", domain: 2,
    title: "Given a scenario, manage applications in a container on a Linux server.",
    summary: "Containers package an application with everything it needs and run it isolated from the host, sharing the host kernel. This objective covers container runtimes, building and managing images, running and inspecting containers, storage volumes, container networks, and the difference between privileged (rootful) and rootless containers. Podman and Docker commands are almost identical.",
    topics: [
      {
        name: "Container runtimes: runC, containerd, Docker, Podman",
        explain: "runC is the low-level runtime that actually creates a container using kernel features (namespaces and cgroups), following the OCI standard. containerd is a daemon that manages images and container lifecycles and calls runC; Docker and Kubernetes use it. Docker is a full platform with a background daemon (dockerd) and the `docker` CLI. Podman is a daemonless, Docker-compatible tool from Red Hat that can easily run rootless containers.",
        examples: [
          { cmd: "podman version", what: "Shows Podman client and engine versions." },
          { cmd: "docker info", what: "Shows Docker daemon info, including the storage driver and runtime (often runc)." },
          { cmd: "alias docker=podman", what: "Lets you use Docker commands with Podman, since the syntax matches." }
        ],
        tip: "Docker needs a daemon; Podman does not. Both use OCI images and runC (or crun) underneath."
      },
      {
        name: "Image operations: pull, tag, layers, prune",
        explain: "An image is a read-only template for containers. `pull` downloads an image from a registry like Docker Hub or quay.io. A tag is a label for a version, like nginx:1.27 or myapp:latest; one image can have many tags. Images are made of layers, each one a set of file changes from a build step; layers are shared and cached to save space. `image prune` removes unused images.",
        examples: [
          { cmd: "podman pull docker.io/library/nginx:1.27", what: "Downloads the nginx image with tag 1.27." },
          { cmd: "podman images", what: "Lists local images with their tags, IDs and sizes." },
          { cmd: "podman tag myapp:latest registry.example.com/team/myapp:1.0", what: "Adds a new tag so the image can be pushed to a private registry." },
          { cmd: "podman history nginx:1.27", what: "Shows the layers that make up the image." },
          { cmd: "podman image prune -a", what: "Removes all images not used by any container." }
        ]
      },
      {
        name: "Building an image: Dockerfile (FROM, USER, ENTRYPOINT, CMD)",
        explain: "A Dockerfile (Podman also calls it a Containerfile) is a recipe for an image. FROM picks the base image and must come first. RUN runs commands at build time, and each instruction makes a layer. USER sets which user the container runs as, so it does not run as root. ENTRYPOINT sets the main program that always runs. CMD gives default arguments (or a default command) that can be overridden on the `run` command line.",
        examples: [
          { cmd: "FROM registry.access.redhat.com/ubi9/ubi-minimal\nRUN microdnf install -y python3 && microdnf clean all\nCOPY app.py /app/app.py\nUSER 1001\nENTRYPOINT [\"python3\", \"/app/app.py\"]\nCMD [\"--port\", \"8080\"]", what: "A Dockerfile: base image, install Python, copy code, run as UID 1001, run app.py with default args --port 8080." },
          { cmd: "podman build -t myapp:1.0 .", what: "Builds an image from the Dockerfile in the current folder and tags it myapp:1.0." },
          { cmd: "podman run myapp:1.0 --port 9090", what: "Runs the image; --port 9090 replaces the CMD defaults but ENTRYPOINT stays." }
        ],
        tip: "ENTRYPOINT = what always runs. CMD = default arguments you can override."
      },
      {
        name: "Running and controlling containers: run, start, stop, exec, rm",
        explain: "`run` creates and starts a new container from an image. `-d` runs it in the background, `--name` gives it a name, and `-it` gives an interactive terminal. `stop` sends SIGTERM (then SIGKILL after a timeout) and `start` starts a stopped container again. `exec` runs an extra command inside a running container, like a shell. `rm` deletes a container; `-f` forces removal of a running one.",
        examples: [
          { cmd: "podman run -d --name web -p 8080:80 nginx:1.27", what: "Runs nginx in the background, named web, with host port 8080 mapped to container port 80." },
          { cmd: "podman ps -a", what: "Lists all containers, including stopped ones." },
          { cmd: "podman stop web && podman start web", what: "Stops and then starts the web container again." },
          { cmd: "podman exec -it web /bin/bash", what: "Opens an interactive shell inside the running web container." },
          { cmd: "podman rm -f web", what: "Force-deletes the web container." },
          { cmd: "podman container prune", what: "Deletes all stopped containers." }
        ]
      },
      {
        name: "Logs, inspect, tags and environment variables",
        explain: "`logs` shows a container's standard output and error, which is where containerized apps write their logs. `inspect` prints full JSON details about a container or image: IP address, mounts, environment, status. An environment variable is passed with `-e` (or `--env-file`) and is the usual way to configure an app in a container. Choosing the right image tag when you run a container controls which version you get; avoid relying on :latest in production.",
        examples: [
          { cmd: "podman logs -f --tail 50 web", what: "Shows the last 50 log lines from web and keeps following new ones." },
          { cmd: "podman inspect web", what: "Shows full JSON details of the web container." },
          { cmd: "podman inspect -f '{{.NetworkSettings.IPAddress}}' web", what: "Prints just the container's IP address." },
          { cmd: "podman run -d --name db -e POSTGRES_PASSWORD=secret postgres:16", what: "Runs PostgreSQL version 16, setting its password through an environment variable." }
        ]
      },
      {
        name: "Volumes: create, map, prune, SELinux context (:z / :Z), overlay",
        explain: "Container files disappear when the container is deleted, so persistent data goes in a volume. A named volume is managed by the engine (`volume create`); a bind mount maps a host folder into the container with `-v host:container`. `volume prune` removes unused volumes. On SELinux systems the container may be blocked from a host folder; adding `:z` relabels it so many containers can share it, and `:Z` relabels it as private to one container. Images and container layers are stored with the overlay (overlay2/OverlayFS) storage driver, which stacks a writable layer on top of read-only image layers.",
        examples: [
          { cmd: "podman volume create dbdata", what: "Creates a named volume called dbdata." },
          { cmd: "podman run -d -v dbdata:/var/lib/postgresql/data postgres:16", what: "Maps the named volume into the container so data survives container removal." },
          { cmd: "podman run -d -v /srv/web:/usr/share/nginx/html:Z nginx", what: "Bind-mounts a host folder and relabels it with a private SELinux context." },
          { cmd: "podman run -d -v /srv/shared:/data:z alpine sleep 1000", what: "Bind-mounts a folder with a shared SELinux label usable by several containers." },
          { cmd: "podman volume ls && podman volume prune", what: "Lists volumes, then removes volumes not used by any container." },
          { cmd: "podman info --format '{{.Store.GraphDriverName}}'", what: "Shows the storage driver, usually overlay." }
        ],
        tip: "Lowercase :z = shared. Uppercase :Z = private (one container). Permission denied on a bind mount with SELinux enforcing? Add :Z."
      },
      {
        name: "Container networks: network create, port mapping, types, prune",
        explain: "Containers connect through networks. Bridge is the default: a private virtual network on the host with NAT, where containers on the same user-defined bridge can reach each other by name. Host shares the host's network stack directly (no isolation, no port mapping needed). None gives no network at all. Macvlan gives each container its own MAC address so it looks like a real device on the physical LAN; ipvlan is similar but containers share the host's MAC and get their own IP. Overlay networks span several hosts (used by Docker Swarm or Kubernetes). Port mapping with `-p host:container` publishes a container port on the host.",
        examples: [
          { cmd: "podman network create appnet", what: "Creates a new bridge network called appnet." },
          { cmd: "podman run -d --name api --network appnet -p 8080:80 myapi", what: "Runs a container on appnet and maps host port 8080 to container port 80." },
          { cmd: "podman run --rm --network host nginx", what: "Uses the host's network directly." },
          { cmd: "podman run --rm --network none alpine ip a", what: "Runs with no network; only the loopback interface exists." },
          { cmd: "docker network create -d macvlan --subnet 192.168.1.0/24 --gateway 192.168.1.1 -o parent=eth0 lan", what: "Creates a macvlan network attached to the physical eth0 LAN (use -d ipvlan for ipvlan)." },
          { cmd: "docker network create -d overlay multihost", what: "Creates an overlay network across Docker Swarm nodes." },
          { cmd: "podman network ls && podman network prune", what: "Lists networks, then removes unused ones." },
          { cmd: "podman port api", what: "Shows the port mappings for the api container." }
        ],
        tip: "-p HOST:CONTAINER. Host port comes first."
      },
      {
        name: "Pruning everything",
        explain: "Over time, stopped containers, unused images, volumes, networks and build cache use disk space. Each object type has a prune command, and `system prune` cleans many at once. Be careful: pruned volumes and their data are gone.",
        examples: [
          { cmd: "podman system prune", what: "Removes stopped containers, unused networks, dangling images and build cache." },
          { cmd: "docker system prune -a --volumes", what: "Also removes all unused images and unused volumes." },
          { cmd: "docker system df", what: "Shows how much disk space images, containers and volumes use." }
        ]
      },
      {
        name: "Privileged vs. unprivileged (rootless) containers",
        explain: "A privileged (rootful) container is run by root, and with `--privileged` it gets almost full access to the host's devices and kernel features, which is risky if the app is compromised. An unprivileged or rootless container is run by a normal user; root inside the container maps to that user's unprivileged UID on the host through user namespaces (/etc/subuid and /etc/subgid). Rootless is safer. Podman runs rootless by default when a normal user runs it. Rootless containers cannot bind host ports below 1024 by default.",
        examples: [
          { cmd: "podman run --rm alpine id", what: "Run as a normal user: shows uid=0 inside, but it is really your own UID on the host." },
          { cmd: "grep alice /etc/subuid", what: "Shows the range of subordinate UIDs alice's rootless containers can use." },
          { cmd: "sudo podman run --privileged -it fedora bash", what: "Runs a rootful, privileged container with broad host access (use with care)." },
          { cmd: "podman run -d --user 1001 --cap-drop ALL myapp", what: "Runs as a non-root user and drops all Linux capabilities for extra safety." }
        ],
        tip: "Least privilege: prefer rootless, add USER in the Dockerfile, and avoid --privileged."
      }
    ],
    cards: [
      { q: "What is the difference between ENTRYPOINT and CMD in a Dockerfile?", a: "ENTRYPOINT sets the program that always runs. CMD sets default arguments or a default command that can be replaced on the `run` command line." },
      { q: "Which Dockerfile instruction must come first and picks the base image?", a: "FROM." },
      { q: "How do you open a shell inside a running container named web?", a: "`podman exec -it web /bin/bash` (or `docker exec -it web sh`)." },
      { q: "With SELinux enforcing, a bind mount gives permission denied. What do you add?", a: "Add `:Z` (private to one container) or `:z` (shared) to the -v option, e.g. `-v /srv/data:/data:Z`." },
      { q: "In `-p 8080:80`, which is the host port?", a: "8080 is the host port; 80 is the container port." },
      { q: "How do you create a custom container network named appnet?", a: "`podman network create appnet` (or `docker network create appnet`)." },
      { q: "Which network type gives a container its own MAC address on the physical LAN?", a: "macvlan. ipvlan is similar but shares the host's MAC address." },
      { q: "What is the low-level OCI runtime used by Docker, containerd and Podman?", a: "runC (Podman may also use crun)." },
      { q: "What is a rootless container and why use it?", a: "A container run by a normal user, with container root mapped to an unprivileged host UID via user namespaces. It limits damage if the container is compromised." },
      { q: "How do you view a container's output logs?", a: "`podman logs <name>` (add -f to follow)." },
      { q: "How do you clean up unused images, stopped containers and networks at once?", a: "`podman system prune` or `docker system prune` (add -a and --volumes to remove more)." },
      { q: "How do you pass configuration to an app inside a container?", a: "With environment variables, e.g. `-e DB_HOST=db` or `--env-file app.env`." }
    ]
  }
);
