// Domain 1: System Management (objectives 1.1 - 1.7)
window.LINUX_PLUS_DATA.objectives.push(
  // ---------------------------------------------------------------- 1.1
  {
    id: "1.1", domain: 1, title: "Explain basic Linux concepts.",
    summary: "This objective covers the building blocks of every Linux system: how it boots, where files live, which CPU types it runs on, the main distribution families, how the graphical desktop works, and the licenses that make Linux free to share. These ideas show up everywhere else on the exam, so a solid grasp here makes the rest easier.",
    topics: [
      {
        name: "Basic boot process",
        explain: "The boot process is the chain of steps from power-on to a login prompt. First the firmware (BIOS or UEFI) checks the hardware and finds a bootloader. The bootloader loads the Linux kernel and the initial RAM disk into memory. The kernel starts up, uses the RAM disk to find the real root filesystem, and then starts the first process (systemd, PID 1), which brings up all the services.",
        examples: [
          { cmd: "Firmware -> Bootloader (GRUB2) -> Kernel + initrd -> systemd -> login", what: "The order of the boot process in one line. Memorize this chain." },
          { cmd: "systemd-analyze", what: "Shows how long the firmware, bootloader, kernel, and user space each took during the last boot." },
          { cmd: "ls /boot", what: "Lists the kernel files (vmlinuz-*), initial RAM disk images (initramfs-* or initrd.img-*), and the grub folder." }
        ],
        tip: "Remember the order: firmware, bootloader, kernel, initrd, init (systemd)."
      },
      {
        name: "Bootloader (GRUB2) and its configuration files",
        explain: "A bootloader is a small program that loads the kernel. Most Linux systems use GRUB2. You do not edit the generated menu file directly. Instead you change the settings configuration file /etc/default/grub (or scripts in /etc/grub.d/) and then rebuild the menu. On Red Hat style systems the generated file is /boot/grub2/grub.cfg; on Debian/Ubuntu it is /boot/grub/grub.cfg.",
        examples: [
          { cmd: "sudo vim /etc/default/grub", what: "Edit GRUB settings such as GRUB_TIMEOUT and GRUB_CMDLINE_LINUX (default kernel parameters)." },
          { cmd: "sudo grub2-mkconfig -o /boot/grub2/grub.cfg", what: "Rebuilds the GRUB menu file after you change /etc/default/grub (RHEL/Fedora)." },
          { cmd: "sudo update-grub", what: "Debian/Ubuntu shortcut that runs grub-mkconfig and writes /boot/grub/grub.cfg." },
          { cmd: "sudo grubby --default-kernel", what: "Shows which kernel GRUB will boot by default on RHEL-based systems." }
        ],
        tip: "Edit /etc/default/grub, then regenerate grub.cfg. Never hand-edit grub.cfg; it gets overwritten."
      },
      {
        name: "Kernel and kernel parameters",
        explain: "The kernel is the core of the operating system. It talks to hardware and manages memory, processes, and devices. Kernel parameters (also called boot options or the kernel command line) are settings passed to the kernel by the bootloader at boot time. You can add them for one boot by pressing `e` in the GRUB menu, or make them permanent in /etc/default/grub.",
        examples: [
          { cmd: "cat /proc/cmdline", what: "Shows the kernel parameters the running kernel was booted with." },
          { cmd: "uname -r", what: "Prints the version of the running kernel, for example 5.14.0-427.el9.x86_64." },
          { cmd: "GRUB_CMDLINE_LINUX=\"quiet rd.break\"", what: "A line in /etc/default/grub that adds parameters. rd.break stops boot early in the initrd (used for root password recovery)." },
          { cmd: "sudo grubby --update-kernel=ALL --args=\"systemd.unit=multi-user.target\"", what: "Adds a kernel parameter to every installed kernel on RHEL-based systems." }
        ],
        tip: "Runtime kernel tuning uses sysctl; boot-time kernel parameters go on the kernel command line."
      },
      {
        name: "Initial RAM disk (initrd / initramfs)",
        explain: "The initial RAM disk (initrd, or the newer initramfs) is a small temporary filesystem loaded into memory along with the kernel. It holds the drivers and tools needed to find and mount the real root filesystem, such as storage, RAID, LVM, or encryption drivers. Once the real root is mounted, the system switches to it and the initrd is thrown away.",
        examples: [
          { cmd: "ls -lh /boot/initramfs-$(uname -r).img", what: "Shows the initrd image for the running kernel on a RHEL-based system." },
          { cmd: "lsinitrd | less", what: "Lists the files packed inside the current initramfs image (RHEL/Fedora)." }
        ],
        tip: "If a new storage driver is needed at boot, rebuild the initrd (dracut or mkinitrd)."
      },
      {
        name: "Preboot Execution Environment (PXE)",
        explain: "PXE lets a computer boot over the network instead of from a local disk. The network card asks a DHCP server for an IP address and the location of a boot file, then downloads a bootloader and kernel using TFTP (or HTTP with newer setups). It is widely used to install Linux on many servers at once, often together with Kickstart or similar automated install files.",
        examples: [
          { cmd: "DHCP + TFTP + boot files (pxelinux.0 or grubx64.efi)", what: "The three pieces you need for a PXE boot server." },
          { cmd: "next-server 192.168.1.10; filename \"pxelinux.0\";", what: "Lines in a DHCP server config that tell PXE clients where to download the boot file." }
        ],
        tip: "PXE = network boot. Think DHCP tells you where, TFTP hands you the file."
      },
      {
        name: "Filesystem Hierarchy Standard (FHS)",
        explain: "The Filesystem Hierarchy Standard defines where things go on a Linux system so every distribution looks familiar. Everything starts at the root directory /. Each top-level folder has a specific job. On many modern distributions /bin, /sbin, and /lib are links into /usr, but the names still matter for the exam.",
        examples: [
          { cmd: "/", what: "The root of the whole directory tree. Every other path starts here." },
          { cmd: "/bin and /sbin", what: "/bin holds essential user commands (ls, cp). /sbin holds system admin commands (fdisk, mkfs)." },
          { cmd: "/boot", what: "Kernel, initrd images, and bootloader files." },
          { cmd: "/dev", what: "Device files, such as /dev/sda (a disk) and /dev/null." },
          { cmd: "/etc", what: "System-wide configuration files, such as /etc/fstab and /etc/passwd." },
          { cmd: "/home", what: "Personal folders for regular users, such as /home/alice." },
          { cmd: "/lib", what: "Shared libraries and kernel modules (/lib/modules) needed by programs in /bin and /sbin." },
          { cmd: "/proc", what: "A virtual filesystem made by the kernel showing live process and system info, such as /proc/cpuinfo." },
          { cmd: "/tmp", what: "Temporary files. Often cleared at reboot and writable by everyone." },
          { cmd: "/usr", what: "Installed software, libraries, and docs (/usr/bin, /usr/lib, /usr/share). Usually read-only data." },
          { cmd: "/var", what: "Variable data that changes often: logs (/var/log), mail, caches, and spool files." }
        ],
        tip: "Config = /etc. Logs = /var/log. Devices = /dev. Kernel info = /proc. Boot files = /boot."
      },
      {
        name: "Server architectures",
        explain: "Linux runs on many CPU architectures. x86 is the older 32-bit Intel/AMD design. x86_64 (also called AMD64) is the 64-bit version used by most PCs and servers. AArch64 (ARM64) is the 64-bit ARM design used in phones, Raspberry Pi boards, and many cloud servers because it is power-efficient. RISC-V is a newer open, royalty-free instruction set that anyone can build chips for.",
        examples: [
          { cmd: "uname -m", what: "Prints the machine architecture, for example x86_64 or aarch64." },
          { cmd: "lscpu | grep Architecture", what: "Shows the CPU architecture line from lscpu." },
          { cmd: "bash-5.2.15-5.el9.x86_64.rpm", what: "Package file names include the architecture. Other common tags: aarch64, i686 (x86), noarch." }
        ],
        tip: "x86_64 and AMD64 are the same thing. AArch64 = 64-bit ARM. RISC-V = open standard ISA."
      },
      {
        name: "Distributions: RPM-based vs. dpkg-based",
        explain: "A distribution (distro) is the Linux kernel plus tools and a package manager. RPM-based distros, like Red Hat Enterprise Linux, Fedora, Rocky Linux, AlmaLinux, and openSUSE, use .rpm packages with rpm and dnf (or zypper). dpkg-based (Debian) distros, like Debian, Ubuntu, and Linux Mint, use .deb packages with dpkg and apt.",
        examples: [
          { cmd: "cat /etc/os-release", what: "Shows which distribution and version you are running." },
          { cmd: "sudo dnf install httpd", what: "Installs a package on an RPM-based system." },
          { cmd: "sudo apt install apache2", what: "Installs a package on a dpkg-based (Debian/Ubuntu) system." },
          { cmd: "rpm -qa | head   /   dpkg -l | head", what: "Lists installed packages with the low-level tool for each family." }
        ],
        tip: "rpm/dnf = Red Hat family. dpkg/apt = Debian family."
      },
      {
        name: "GUI: display managers, window managers, X Server, Wayland",
        explain: "The graphical desktop is built from layers. A display server draws on the screen and handles keyboard and mouse. The X Server (X11/Xorg) is the classic display server; Wayland is the modern replacement that is simpler and more secure. A display manager is the graphical login screen (GDM, SDDM, LightDM). A window manager controls how windows are placed, moved, and decorated (Mutter, KWin, i3, Openbox); desktop environments like GNOME and KDE include one.",
        examples: [
          { cmd: "echo $XDG_SESSION_TYPE", what: "Prints x11 or wayland, showing which display server your session uses." },
          { cmd: "systemctl status gdm", what: "Checks the GNOME display manager (the graphical login screen) service." },
          { cmd: "sudo systemctl set-default graphical.target", what: "Makes the system boot to the graphical login (display manager) by default." }
        ],
        tip: "Display manager = login screen. Window manager = moves and decorates windows. X Server / Wayland = draws the pixels."
      },
      {
        name: "Software licensing",
        explain: "Open source means the source code is available to view, change, and share. Free software (as defined by the FSF) focuses on the user's freedom to run, study, change, and share the program, not on price. Proprietary software is closed: the vendor keeps the code private and limits how you use it. Copyleft is a license rule that says if you share a changed version, you must share it under the same free license (the GPL is the best-known copyleft license). Permissive licenses like MIT and BSD do not require this.",
        examples: [
          { cmd: "rpm -qi bash | grep License", what: "Shows the license of an installed package (bash is GPLv3+, a copyleft license)." },
          { cmd: "GPL v3", what: "Copyleft: derivative works you distribute must also be GPL and include source." },
          { cmd: "MIT / BSD / Apache 2.0", what: "Permissive open source licenses: you can reuse the code, even in proprietary products." },
          { cmd: "Commercial antivirus or a closed driver", what: "Proprietary: no source code, use is limited by an end-user license agreement." }
        ],
        tip: "Free software is about freedom (\"free as in speech\"), not price (\"free as in beer\")."
      }
    ],
    cards: [
      { q: "List the basic Linux boot process in order.", a: "Firmware (BIOS/UEFI) -> bootloader (GRUB2) -> kernel plus initrd -> init system (systemd) -> login." },
      { q: "You changed /etc/default/grub on a RHEL system. What must you run next?", a: "`grub2-mkconfig -o /boot/grub2/grub.cfg` to rebuild the GRUB configuration file (on Ubuntu, `update-grub`)." },
      { q: "How do you see the kernel parameters the system booted with?", a: "`cat /proc/cmdline`." },
      { q: "What is the job of the initrd (initramfs)?", a: "It is a temporary in-memory filesystem with the drivers and tools needed to find and mount the real root filesystem early in boot." },
      { q: "What is PXE and which services does it need?", a: "Preboot Execution Environment: booting a computer over the network. It needs DHCP (to get an address and boot file location) and TFTP (to download the boot files)." },
      { q: "Which FHS directory holds log files? Which holds system configuration?", a: "Logs are in /var (usually /var/log). System-wide configuration is in /etc." },
      { q: "What is /proc?", a: "A virtual filesystem created by the kernel that shows live information about processes and the system, such as /proc/cpuinfo and /proc/meminfo." },
      { q: "What is another name for x86_64? What is AArch64?", a: "x86_64 is also called AMD64 (64-bit Intel/AMD). AArch64 is 64-bit ARM." },
      { q: "Which package tools go with RPM-based and dpkg-based distributions?", a: "RPM-based (RHEL, Fedora): rpm and dnf. dpkg-based (Debian, Ubuntu): dpkg and apt." },
      { q: "What is the difference between a display manager and a window manager?", a: "A display manager is the graphical login screen (GDM, SDDM). A window manager controls placing, moving, and decorating windows (Mutter, KWin)." },
      { q: "What is copyleft?", a: "A licensing rule (used by the GPL) that requires modified versions you distribute to be released under the same free license, with source code." }
    ]
  },

  // ---------------------------------------------------------------- 1.2
  {
    id: "1.2", domain: 1, title: "Summarize Linux device management concepts and tools.",
    summary: "This objective is about how Linux finds, loads drivers for, and reports on hardware. You need to know how to work with kernel modules (drivers), which commands show details about CPUs, memory, PCI and USB devices, how to rebuild the initial RAM disk, and where special hardware like embedded boards and GPUs fit in.",
    topics: [
      {
        name: "Kernel modules: listing and inspecting",
        explain: "A kernel module is a piece of code, usually a driver, that can be loaded into or removed from the running kernel without rebooting. Module files end in .ko and live under /lib/modules/KERNEL-VERSION/. lsmod shows which modules are loaded right now. modinfo shows details about a module, such as its description, file path, dependencies, and options.",
        examples: [
          { cmd: "lsmod", what: "Lists loaded kernel modules, their size, and what is using them (reads /proc/modules)." },
          { cmd: "lsmod | grep usb", what: "Checks whether any USB-related modules are loaded." },
          { cmd: "modinfo e1000e", what: "Shows the description, file, version, dependencies, and parameters of the e1000e network driver." }
        ],
        tip: "ls-mod = list modules. mod-info = module information."
      },
      {
        name: "Kernel modules: loading and removing (modprobe, insmod, rmmod, depmod)",
        explain: "modprobe is the smart, preferred tool: it loads or removes a module by name and automatically handles any modules it depends on. insmod is the low-level tool: it loads one module file by full path and does NOT handle dependencies. rmmod removes a loaded module, also without dependency handling. depmod scans the module folder and builds the modules.dep file that modprobe uses to know the dependencies.",
        examples: [
          { cmd: "sudo modprobe vfat", what: "Loads the vfat module plus any modules it needs (such as fat)." },
          { cmd: "sudo modprobe -r vfat", what: "Removes the vfat module and unused dependencies." },
          { cmd: "sudo insmod /lib/modules/$(uname -r)/kernel/fs/fat/fat.ko.xz", what: "Loads a single module file by path; fails if its dependencies are not already loaded." },
          { cmd: "sudo rmmod vfat", what: "Unloads the vfat module (fails if something is still using it)." },
          { cmd: "sudo depmod -a", what: "Rebuilds modules.dep so modprobe knows the dependencies; run it after adding a new module." }
        ],
        tip: "Use modprobe in real life. insmod/rmmod are low-level and ignore dependencies. Blacklist a module with a file in /etc/modprobe.d/ containing `blacklist name`."
      },
      {
        name: "Kernel and hardware messages (dmesg)",
        explain: "dmesg prints the kernel ring buffer, which is a log of messages from the kernel. It shows hardware being detected, drivers loading, disks being added, USB devices plugged in, and hardware errors. It is the first place to look when a new device does not work.",
        examples: [
          { cmd: "sudo dmesg | tail", what: "Shows the most recent kernel messages, for example right after plugging in a USB drive." },
          { cmd: "sudo dmesg -T | grep -i error", what: "Shows kernel errors with human-readable timestamps." },
          { cmd: "sudo dmesg -w", what: "Follows (watches) new kernel messages live." }
        ]
      },
      {
        name: "Listing hardware: lscpu, lsmem, lspci, lsusb, lshw",
        explain: "These commands each describe a part of the hardware. lscpu shows CPU details (architecture, cores, threads). lsmem shows memory blocks and how much RAM is online. lspci lists devices on the PCI bus, like network cards, storage controllers, and GPUs. lsusb lists USB devices. lshw gives a full report of all hardware.",
        examples: [
          { cmd: "lscpu", what: "Shows CPU architecture, model name, number of cores, threads, and virtualization support." },
          { cmd: "lsmem", what: "Shows memory ranges and the total online memory." },
          { cmd: "lspci -k", what: "Lists PCI devices and the kernel driver (module) in use for each." },
          { cmd: "lsusb -t", what: "Shows USB devices as a tree by bus and port." },
          { cmd: "sudo lshw -short", what: "Prints a short summary table of all detected hardware." }
        ],
        tip: "lspci -k is great for answering 'which driver is this card using?'"
      },
      {
        name: "Firmware and management data: dmidecode, ipmitool, lm_sensors",
        explain: "dmidecode reads the DMI/SMBIOS table from the firmware. It shows the manufacturer, model, serial number, BIOS version, and memory slot details. ipmitool talks to a server's IPMI baseboard management controller (BMC), which lets you check sensors, read the event log, and even power the server on or off remotely. lm_sensors is a package that reads hardware sensors like CPU temperature, voltages, and fan speed; you set it up with sensors-detect and read values with sensors.",
        examples: [
          { cmd: "sudo dmidecode -t system", what: "Shows the server maker, model, and serial number." },
          { cmd: "sudo dmidecode -t memory", what: "Shows each RAM slot, module size, and speed." },
          { cmd: "sudo ipmitool sensor list", what: "Lists temperature, fan, and voltage readings from the BMC." },
          { cmd: "ipmitool -I lanplus -H 10.0.0.50 -U admin -P secret chassis power status", what: "Checks the power state of a remote server through its BMC over the network." },
          { cmd: "sudo sensors-detect && sensors", what: "Uses lm_sensors to detect sensor chips and then shows temperatures and fan speeds." }
        ],
        tip: "Need a serial number without opening the case? dmidecode. Need to power-cycle a frozen remote server? ipmitool."
      },
      {
        name: "initrd management: dracut and mkinitrd",
        explain: "When you add a new storage driver, change the root disk setup (LVM, RAID, encryption), or need a module available at boot, you must rebuild the initrd. dracut is the modern tool on RHEL, Fedora, and many others. mkinitrd is the older tool name; on some systems it is now a wrapper around dracut. Debian/Ubuntu use update-initramfs.",
        examples: [
          { cmd: "sudo dracut -f", what: "Rebuilds (forces overwrite of) the initramfs for the running kernel." },
          { cmd: "sudo dracut -f /boot/initramfs-$(uname -r).img $(uname -r)", what: "Rebuilds the initramfs for a specific kernel version and output file." },
          { cmd: "sudo mkinitrd /boot/initrd-$(uname -r).img $(uname -r)", what: "Older syntax to create an initrd image for a kernel." },
          { cmd: "sudo update-initramfs -u", what: "The Debian/Ubuntu equivalent to update the current initramfs." }
        ],
        tip: "dracut -f = rebuild initramfs now."
      },
      {
        name: "Custom hardware: embedded systems and GPUs",
        explain: "Embedded systems are small, dedicated computers built into other products, like routers, smart TVs, industrial controllers, and IoT sensors. They often run a trimmed-down Linux on ARM (AArch64) or RISC-V chips with limited storage and memory. GPUs (graphics processing units) are now used for much more than graphics: AI and machine learning, video encoding, scientific computing, and cryptography. nvtop is a top-like tool that shows live GPU usage, memory, and processes for NVIDIA, AMD, and Intel GPUs.",
        examples: [
          { cmd: "nvtop", what: "Shows a live, interactive view of GPU load, GPU memory use, temperature, and which processes use the GPU." },
          { cmd: "lspci | grep -i -E \"vga|3d\"", what: "Finds the GPU on the PCI bus." },
          { cmd: "nvidia-smi", what: "NVIDIA's own tool for GPU status and driver version." },
          { cmd: "Raspberry Pi running Linux on AArch64", what: "A common example of an embedded or single-board Linux system." }
        ],
        tip: "top is for CPU, nvtop is for GPU."
      }
    ],
    cards: [
      { q: "What is the difference between modprobe and insmod?", a: "modprobe loads a module by name and automatically loads its dependencies. insmod loads a single .ko file by path and does not handle dependencies." },
      { q: "Which command rebuilds the module dependency list used by modprobe?", a: "`depmod` (for example `depmod -a`), which writes modules.dep." },
      { q: "How do you see which kernel modules are currently loaded?", a: "`lsmod`." },
      { q: "Which command shows a module's description, parameters, and dependencies?", a: "`modinfo modulename`." },
      { q: "You plugged in a USB drive and it did not appear. Where do you look first?", a: "Run `dmesg` (for example `dmesg | tail`) to see kernel messages about the device, and `lsusb` to see if it was detected." },
      { q: "Which command reads the server's serial number and BIOS version from firmware?", a: "`dmidecode` (for example `dmidecode -t system`)." },
      { q: "What is ipmitool used for?", a: "Talking to a server's IPMI baseboard management controller to read sensors and logs or control power, even remotely." },
      { q: "Which package lets you read CPU temperature and fan speed?", a: "lm_sensors: run `sensors-detect` once, then `sensors`." },
      { q: "You added a new RAID controller driver needed at boot on RHEL. What do you run?", a: "`dracut -f` to rebuild the initramfs so the driver is available early in boot (older systems: mkinitrd)." },
      { q: "Which tool shows live GPU usage and the processes using the GPU?", a: "`nvtop`." }
    ]
  },

  // ---------------------------------------------------------------- 1.3
  {
    id: "1.3", domain: 1, title: "Given a scenario, manage storage in a Linux system.",
    summary: "This objective covers how Linux stores data: partitioning disks, using the Logical Volume Manager (LVM) for flexible volumes, building filesystems, combining disks with RAID, and mounting local and network storage with the right options. Expect scenario questions such as growing a full volume, adding a disk, or fixing an fstab entry.",
    topics: [
      {
        name: "LVM physical volumes (PV)",
        explain: "The Logical Volume Manager (LVM) adds a flexible layer between disks and filesystems. It has three layers: physical volumes (PVs) are disks or partitions prepared for LVM, volume groups (VGs) pool PVs together, and logical volumes (LVs) are carved out of a VG and used like partitions. The pv commands manage the bottom layer.",
        examples: [
          { cmd: "sudo pvcreate /dev/sdb /dev/sdc", what: "Prepares two disks as LVM physical volumes." },
          { cmd: "sudo pvs   /   sudo pvdisplay /dev/sdb", what: "pvs shows a short summary of all PVs; pvdisplay shows full details for one." },
          { cmd: "sudo pvscan", what: "Scans all disks for physical volumes." },
          { cmd: "sudo pvmove /dev/sdb /dev/sdc", what: "Moves all data off /dev/sdb onto /dev/sdc while online, so you can remove the old disk." },
          { cmd: "sudo pvresize /dev/sdb", what: "Updates the PV size after the underlying disk or partition was grown." },
          { cmd: "sudo pvremove /dev/sdb", what: "Removes the LVM label from a disk that is no longer in a VG." }
        ],
        tip: "Order to build: pvcreate -> vgcreate -> lvcreate -> mkfs -> mount."
      },
      {
        name: "LVM volume groups (VG)",
        explain: "A volume group is a storage pool made of one or more physical volumes. You can grow it by adding PVs. vgexport and vgimport let you move a whole VG's disks to another server safely. vgchange activates or deactivates a VG.",
        examples: [
          { cmd: "sudo vgcreate datavg /dev/sdb /dev/sdc", what: "Creates a volume group called datavg from two PVs." },
          { cmd: "sudo vgextend datavg /dev/sdd", what: "Adds another PV to the VG to give it more free space." },
          { cmd: "sudo vgs   /   sudo vgdisplay datavg", what: "vgs gives a short summary (size, free); vgdisplay shows full details." },
          { cmd: "sudo vgscan", what: "Scans disks for volume groups (useful after attaching moved disks)." },
          { cmd: "sudo vgchange -an datavg && sudo vgexport datavg", what: "Deactivates the VG and marks it exported so the disks can move to another server." },
          { cmd: "sudo vgimport datavg && sudo vgchange -ay datavg", what: "On the new server, imports the VG and activates its logical volumes." },
          { cmd: "sudo vgremove datavg", what: "Deletes a volume group (remove its LVs first)." }
        ]
      },
      {
        name: "LVM logical volumes (LV)",
        explain: "A logical volume is the piece you format and mount. Its big advantage is that it can be resized while in use. lvextend grows an LV; lvresize can grow or shrink it. Adding -r (--resizefs) also resizes the filesystem in the same step. LV device paths look like /dev/datavg/web or /dev/mapper/datavg-web.",
        examples: [
          { cmd: "sudo lvcreate -n web -L 20G datavg", what: "Creates a 20 GB logical volume named web in datavg." },
          { cmd: "sudo lvcreate -n logs -l 100%FREE datavg", what: "Creates an LV using all remaining free space in the VG." },
          { cmd: "sudo lvextend -r -L +10G /dev/datavg/web", what: "Grows the LV by 10 GB and grows its filesystem at the same time." },
          { cmd: "sudo lvresize -L 15G /dev/datavg/web", what: "Sets the LV to exactly 15 GB (can grow or shrink; shrink the filesystem first if shrinking)." },
          { cmd: "sudo lvs   /   sudo lvdisplay /dev/datavg/web", what: "lvs shows a short summary; lvdisplay shows full details." },
          { cmd: "sudo lvchange -an /dev/datavg/web", what: "Deactivates the LV (use -ay to activate)." },
          { cmd: "sudo lvremove /dev/datavg/web", what: "Deletes the LV and its data (unmount it first)." }
        ],
        tip: "XFS can grow but cannot shrink. ext4 can do both (shrink only when unmounted)."
      },
      {
        name: "Partitions: fdisk, gdisk, parted, growpart, lsblk, blkid",
        explain: "Partitions divide a disk into sections. MBR is the old partition table (max 2 TB, 4 primary partitions); GPT is the modern one. fdisk is an interactive partition tool (now supports both MBR and GPT); gdisk is the GPT-focused version. parted can script partition changes and handle large disks. growpart grows a partition to fill new space, common after enlarging a cloud disk. lsblk shows disks and partitions as a tree; blkid shows UUIDs and filesystem types.",
        examples: [
          { cmd: "lsblk -f", what: "Shows a tree of disks, partitions, LVs, filesystem types, and mount points." },
          { cmd: "sudo blkid /dev/sdb1", what: "Shows the UUID and filesystem type of a partition (use the UUID in /etc/fstab)." },
          { cmd: "sudo fdisk /dev/sdb", what: "Opens an interactive menu: n (new), p (print), t (type), w (write and quit)." },
          { cmd: "sudo gdisk /dev/sdb", what: "Interactive partitioning for GPT disks." },
          { cmd: "sudo parted /dev/sdb mklabel gpt mkpart primary xfs 1MiB 100%", what: "Creates a GPT label and one partition using the whole disk, in one command." },
          { cmd: "sudo growpart /dev/xvda 1", what: "Grows partition 1 of /dev/xvda to use newly added disk space." }
        ],
        tip: "After growpart, you still need to grow the filesystem (xfs_growfs or resize2fs) or the PV (pvresize)."
      },
      {
        name: "Filesystem formats: xfs, ext4, btrfs, tmpfs",
        explain: "A filesystem organizes files on a partition or LV. xfs is the default on RHEL; it is fast with large files and can grow but not shrink. ext4 is the long-time default on Debian/Ubuntu; it is reliable and can grow or shrink. btrfs is a copy-on-write filesystem with built-in snapshots, subvolumes, checksums, and compression (default on Fedora and openSUSE). tmpfs is a filesystem stored in RAM; it is very fast and its contents vanish at reboot (often used for /tmp and /run).",
        examples: [
          { cmd: "sudo mkfs.xfs /dev/datavg/web", what: "Creates an xfs filesystem on the LV." },
          { cmd: "sudo mkfs -t ext4 /dev/sdb1", what: "Creates an ext4 filesystem (same as mkfs.ext4)." },
          { cmd: "sudo mkfs.btrfs /dev/sdc && sudo btrfs subvolume snapshot /data /data/snap1", what: "Creates a btrfs filesystem and later takes a snapshot of a subvolume." },
          { cmd: "sudo mount -t tmpfs -o size=512M tmpfs /mnt/ramdisk", what: "Mounts a 512 MB RAM-based tmpfs filesystem." }
        ]
      },
      {
        name: "Filesystem utilities: mkfs, fsck, resize2fs, xfs_growfs, xfs_repair, df, du, fio",
        explain: "mkfs creates a filesystem. fsck checks and repairs ext filesystems (run it on an unmounted filesystem). For XFS, use xfs_repair instead. To grow a filesystem after enlarging its LV or partition, use resize2fs for ext4 and xfs_growfs for xfs (xfs_growfs takes the mount point). df shows free space per mounted filesystem; du shows how much space files and folders use. fio is a benchmark tool that tests disk read/write speed and IOPS.",
        examples: [
          { cmd: "df -h", what: "Shows size, used, and available space for each mounted filesystem in human-readable units." },
          { cmd: "df -i", what: "Shows inode usage instead of block usage." },
          { cmd: "du -sh /var/log/*", what: "Shows how much space each item in /var/log uses." },
          { cmd: "sudo umount /dev/sdb1 && sudo fsck -y /dev/sdb1", what: "Unmounts, then checks and auto-repairs an ext4 filesystem." },
          { cmd: "sudo xfs_repair /dev/datavg/web", what: "Repairs an unmounted XFS filesystem." },
          { cmd: "sudo resize2fs /dev/datavg/home", what: "Grows an ext4 filesystem to fill its (already enlarged) LV." },
          { cmd: "sudo xfs_growfs /srv/web", what: "Grows a mounted XFS filesystem to fill its device." },
          { cmd: "fio --name=test --rw=randwrite --bs=4k --size=1G --runtime=30 --filename=/data/fio.test", what: "Benchmarks random 4K writes for 30 seconds." }
        ],
        tip: "ext = resize2fs + fsck. XFS = xfs_growfs + xfs_repair. df = disk free, du = disk usage."
      },
      {
        name: "RAID with mdadm and /proc/mdstat",
        explain: "RAID (Redundant Array of Independent Disks) combines disks for speed, redundancy, or both. RAID 0 stripes (fast, no redundancy). RAID 1 mirrors (copies data to two disks). RAID 5 stripes with parity (survives one disk failure). RAID 6 survives two failures. RAID 10 is a stripe of mirrors. Linux software RAID is managed with mdadm, and live status is in /proc/mdstat.",
        examples: [
          { cmd: "sudo mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc", what: "Creates a RAID 1 mirror named /dev/md0 from two disks." },
          { cmd: "cat /proc/mdstat", what: "Shows all software RAID arrays, their state, and rebuild progress." },
          { cmd: "sudo mdadm --detail /dev/md0", what: "Shows detailed array status, including failed or spare disks." },
          { cmd: "sudo mdadm /dev/md0 --fail /dev/sdb --remove /dev/sdb", what: "Marks a disk as failed and removes it from the array." },
          { cmd: "sudo mdadm --detail --scan | sudo tee -a /etc/mdadm.conf", what: "Saves the array definition so it assembles at boot (Debian: /etc/mdadm/mdadm.conf)." }
        ],
        tip: "Check RAID health fast: cat /proc/mdstat. [UU] means both disks up; [U_] means one is missing."
      },
      {
        name: "Mounting: mount, umount, /etc/fstab, /etc/mtab, /proc/mounts, autofs",
        explain: "Mounting attaches a filesystem to a folder (the mount point). mount attaches it now; umount detaches it. /etc/fstab lists filesystems to mount at boot, with six fields: device, mount point, type, options, dump, and fsck order. /proc/mounts is the kernel's live list of what is mounted; /etc/mtab shows the same thing (today it is usually a link to /proc/self/mounts). autofs mounts filesystems automatically when someone accesses the folder and unmounts them after they go idle, which is handy for network shares.",
        examples: [
          { cmd: "sudo mount /dev/datavg/web /srv/web", what: "Mounts the LV onto /srv/web." },
          { cmd: "sudo umount /srv/web", what: "Unmounts it. If it says 'target is busy', find users with `lsof /srv/web` or `fuser -m /srv/web`." },
          { cmd: "UUID=3f2a...e9  /srv/web  xfs  defaults,noatime  0 0", what: "An /etc/fstab line: device, mount point, type, options, dump, fsck order." },
          { cmd: "sudo mount -a", what: "Mounts everything in /etc/fstab that is not mounted yet; a good way to test fstab before rebooting." },
          { cmd: "cat /proc/mounts   /   cat /etc/mtab   /   findmnt", what: "Show what is currently mounted." },
          { cmd: "/home/nfs  /etc/auto.home   (in /etc/auto.master)", what: "autofs master map line; /etc/auto.home then lists keys like `* -rw nfs1:/export/home/&`." }
        ],
        tip: "Always test fstab changes with `mount -a` (and `findmnt --verify`). A bad fstab line can stop the system from booting."
      },
      {
        name: "Mount options",
        explain: "Mount options change how a filesystem behaves. They go in the fourth column of /etc/fstab or after -o on the mount command. Security options like nodev, nosuid, and noexec are often used on /tmp, /home, and removable media.",
        examples: [
          { cmd: "ro / rw", what: "Mount read-only or read-write." },
          { cmd: "noatime / nodiratime", what: "Do not update the last-access time on files (noatime) or directories (nodiratime). Fewer writes, better speed." },
          { cmd: "noexec", what: "Do not allow programs to run from this filesystem." },
          { cmd: "nosuid", what: "Ignore setuid/setgid bits, so programs cannot gain extra privileges." },
          { cmd: "nodev", what: "Ignore device files on this filesystem." },
          { cmd: "nofail", what: "Do not stop the boot if this device is missing (good for USB or network disks)." },
          { cmd: "sudo mount -o remount,ro /data", what: "remount changes options on an already mounted filesystem without unmounting it." }
        ],
        tip: "Hardening /tmp: `tmpfs /tmp tmpfs defaults,nodev,nosuid,noexec 0 0`."
      },
      {
        name: "Network mounts: NFS and SMB (Samba)",
        explain: "Network mounts let you use storage on another server. NFS (Network File System) is the native Linux/Unix way to share folders; the server lists shares in /etc/exports. SMB (also called CIFS) is the Windows file-sharing protocol; Samba is the Linux software that serves or connects to SMB shares. Use the _netdev or nofail option in fstab so boot waits for or skips the network.",
        examples: [
          { cmd: "sudo mount -t nfs nfs1:/export/data /mnt/data", what: "Mounts an NFS share from server nfs1." },
          { cmd: "showmount -e nfs1", what: "Lists the NFS shares that server nfs1 exports." },
          { cmd: "sudo mount -t cifs //fs1/share /mnt/share -o username=alice", what: "Mounts an SMB share (needs the cifs-utils package)." },
          { cmd: "nfs1:/export/data  /mnt/data  nfs  defaults,_netdev,nofail  0 0", what: "fstab line for an NFS mount that waits for networking and does not block boot." },
          { cmd: "smbclient -L //fs1 -U alice", what: "Uses the Samba client to list shares on an SMB server." }
        ]
      },
      {
        name: "Inodes",
        explain: "An inode is a data structure that stores information about a file: its owner, permissions, size, timestamps, and where its data blocks are. It does not store the file name; directories map names to inode numbers. Each filesystem has a limited number of inodes, so millions of tiny files can use them all up. When that happens you get 'No space left on device' even though df -h shows free space.",
        examples: [
          { cmd: "ls -i file.txt", what: "Shows the inode number of a file." },
          { cmd: "stat file.txt", what: "Shows the inode number plus all the file's metadata (size, owner, timestamps, links)." },
          { cmd: "df -i", what: "Shows inodes used and free on each filesystem; check this when a disk looks full but has space." }
        ],
        tip: "Disk 'full' but df -h shows space? Run df -i: you are probably out of inodes."
      }
    ],
    cards: [
      { q: "List the steps to put a new disk into LVM and mount it.", a: "`pvcreate /dev/sdb`, `vgcreate vg1 /dev/sdb` (or vgextend), `lvcreate -n lv1 -L 10G vg1`, `mkfs.xfs /dev/vg1/lv1`, then mount it." },
      { q: "A logical volume /dev/vg1/data with ext4 is full and the VG has free space. How do you grow it in one command?", a: "`lvextend -r -L +5G /dev/vg1/data` (the -r flag also resizes the filesystem). Without -r, run `resize2fs` afterward." },
      { q: "Which command grows a mounted XFS filesystem?", a: "`xfs_growfs /mountpoint`. XFS cannot be shrunk." },
      { q: "Which command moves data off a physical volume so the disk can be removed?", a: "`pvmove /dev/sdb` (then `vgreduce` and `pvremove`)." },
      { q: "How do you move a volume group's disks to a different server?", a: "Deactivate with `vgchange -an vg`, run `vgexport vg`, move the disks, then on the new server run `vgscan`, `vgimport vg`, and `vgchange -ay vg`." },
      { q: "Where can you check the status and rebuild progress of software RAID?", a: "`cat /proc/mdstat` (or `mdadm --detail /dev/md0`)." },
      { q: "Which command shows a partition's UUID for use in /etc/fstab?", a: "`blkid` (also `lsblk -f`)." },
      { q: "What are the six fields of an /etc/fstab line?", a: "Device (or UUID), mount point, filesystem type, mount options, dump flag, and fsck pass order." },
      { q: "Which mount options stop programs from running and block setuid on a filesystem?", a: "`noexec` stops running programs; `nosuid` ignores setuid/setgid bits. `nodev` ignores device files." },
      { q: "A USB backup drive in fstab is sometimes unplugged and boot hangs. Which option fixes this?", a: "Add `nofail` to its mount options so boot continues if the device is missing." },
      { q: "Users get 'No space left on device' but df -h shows 40% free. What is likely wrong?", a: "The filesystem has run out of inodes (too many small files). Check with `df -i`." },
      { q: "What is the difference between NFS and SMB?", a: "NFS is the native Unix/Linux network file sharing protocol. SMB/CIFS is the Windows protocol, served on Linux by Samba." }
    ]
  },

  // ---------------------------------------------------------------- 1.4
  {
    id: "1.4", domain: 1, title: "Given a scenario, manage network services and configurations on a Linux server.",
    summary: "This objective covers how a Linux server gets on the network and how you test it. You need to know the key name-resolution files, how to configure interfaces with NetworkManager (nmcli) or Netplan, and which troubleshooting tool fits each job, from ping and ip to dig, ss, and tcpdump.",
    topics: [
      {
        name: "Name resolution files: /etc/hosts, /etc/resolv.conf, /etc/nsswitch.conf",
        explain: "/etc/hosts is a simple local list that maps IP addresses to host names. /etc/resolv.conf lists the DNS servers (nameserver lines) and search domains the system uses. /etc/nsswitch.conf decides the order of lookup sources; the 'hosts:' line usually says files first (meaning /etc/hosts), then dns. On systems using systemd-resolved, resolv.conf often points to 127.0.0.53.",
        examples: [
          { cmd: "192.168.1.20   web01.example.com   web01", what: "An /etc/hosts line: IP, full name, then short alias." },
          { cmd: "nameserver 8.8.8.8\nsearch example.com", what: "Lines in /etc/resolv.conf: which DNS server to ask and which domain to add to short names." },
          { cmd: "hosts: files dns", what: "Line in /etc/nsswitch.conf: check /etc/hosts first, then DNS." },
          { cmd: "getent hosts web01", what: "Looks up a name the same way applications do, following nsswitch.conf." }
        ],
        tip: "If /etc/hosts and DNS disagree, nsswitch.conf decides who wins (files usually first)."
      },
      {
        name: "NetworkManager: nmcli, nmtui, and connection profiles (nmconnect)",
        explain: "NetworkManager is the network service on RHEL, Fedora, and many desktops. It stores settings as connection profiles (on RHEL 9 in /etc/NetworkManager/system-connections/). nmcli is its command-line tool and is the one to know for the exam. The exam objective lists 'nmconnect', which refers to this NetworkManager connection tooling: creating, modifying, and bringing connections up and down. nmtui is a simple text menu for the same tasks.",
        examples: [
          { cmd: "nmcli device status", what: "Shows each network device and whether it is connected." },
          { cmd: "nmcli connection show", what: "Lists all saved connection profiles." },
          { cmd: "sudo nmcli con mod eth0 ipv4.method manual ipv4.addresses 192.168.1.50/24 ipv4.gateway 192.168.1.1 ipv4.dns 1.1.1.1", what: "Sets a static IP, gateway, and DNS server on the eth0 profile." },
          { cmd: "sudo nmcli con up eth0", what: "Activates the profile so the changes take effect." },
          { cmd: "sudo nmcli con add type ethernet ifname ens4 con-name lab", what: "Creates a new connection profile (DHCP by default)." },
          { cmd: "sudo nmtui", what: "Opens the text user interface to edit connections with arrow keys." }
        ],
        tip: "After `nmcli con mod`, run `nmcli con up NAME` to apply."
      },
      {
        name: "Netplan",
        explain: "Netplan is Ubuntu's network configuration system. You describe interfaces in YAML files in /etc/netplan/ (for example 01-netcfg.yaml), and Netplan hands the settings to a back end (systemd-networkd or NetworkManager). netplan try applies the change and rolls it back automatically if you do not confirm in time, which protects you from locking yourself out. netplan apply makes it permanent. netplan status shows the current state.",
        examples: [
          { cmd: "network:\n  version: 2\n  ethernets:\n    eth0:\n      addresses: [192.168.1.50/24]\n      routes:\n        - to: default\n          via: 192.168.1.1\n      nameservers:\n        addresses: [1.1.1.1]", what: "A static IP config in /etc/netplan/01-netcfg.yaml. YAML uses spaces, never tabs." },
          { cmd: "sudo netplan try", what: "Applies the config for 120 seconds and reverts unless you press Enter to accept." },
          { cmd: "sudo netplan apply", what: "Applies the YAML configuration now." },
          { cmd: "netplan status", what: "Shows the current state of interfaces, addresses, routes, and DNS as Netplan sees them." }
        ],
        tip: "Working remotely over SSH? Use netplan try first so a mistake rolls back."
      },
      {
        name: "The ip command and hostname",
        explain: "ip is the modern tool for viewing and changing network settings (it replaced ifconfig and route). ip address shows and sets IP addresses, ip link shows and controls interfaces, and ip route shows and sets the routing table. Changes made with ip are temporary until reboot. hostname shows or sets the system name (hostnamectl makes it permanent).",
        examples: [
          { cmd: "ip address show   (or ip a)", what: "Shows every interface and its IP addresses." },
          { cmd: "sudo ip address add 10.0.0.5/24 dev eth1", what: "Adds an IP address to eth1 (temporary)." },
          { cmd: "ip link show   /   sudo ip link set eth1 up", what: "Shows interface state and MAC addresses; brings eth1 up." },
          { cmd: "ip route show   /   sudo ip route add default via 192.168.1.1", what: "Shows the routing table; adds a default gateway." },
          { cmd: "hostname   /   hostname -I", what: "Shows the host name; -I shows all the host's IP addresses." },
          { cmd: "sudo hostnamectl set-hostname web01.example.com", what: "Sets the host name permanently." }
        ],
        tip: "ip a = addresses, ip link = interfaces, ip route (ip r) = routes."
      },
      {
        name: "Connectivity and path testing: ping, ping6, traceroute, tracepath, mtr, arp",
        explain: "ping sends ICMP echo requests to check if a host is reachable and how long replies take; ping6 does the same for IPv6 (or use ping -6). traceroute lists each router (hop) on the path to a host; tracepath does the same and also finds the path MTU, without needing root. mtr combines ping and traceroute into a live, updating report that shows packet loss at each hop. arp shows the ARP cache, which maps IP addresses to MAC addresses on the local network (ip neigh is the modern equivalent).",
        examples: [
          { cmd: "ping -c 4 8.8.8.8", what: "Sends 4 pings and shows response times and packet loss." },
          { cmd: "ping6 -c 4 2001:4860:4860::8888", what: "Pings an IPv6 address." },
          { cmd: "traceroute example.com", what: "Lists each hop between you and example.com." },
          { cmd: "tracepath example.com", what: "Like traceroute, plus shows the path MTU; works without root." },
          { cmd: "mtr -rwc 50 example.com", what: "Runs 50 cycles and prints a report of loss and latency per hop." },
          { cmd: "arp -n   /   ip neigh", what: "Shows the local IP-to-MAC address table." }
        ]
      },
      {
        name: "DNS and web testing: dig, nslookup, curl",
        explain: "dig queries DNS servers and shows detailed answers; it is the preferred DNS tool. nslookup is an older, simpler DNS lookup tool that also works on Windows. curl transfers data to or from a URL; it is great for testing web servers and APIs and seeing HTTP headers.",
        examples: [
          { cmd: "dig example.com A +short", what: "Shows just the IPv4 address(es) for example.com." },
          { cmd: "dig @1.1.1.1 example.com MX", what: "Asks a specific DNS server for mail (MX) records." },
          { cmd: "dig -x 93.184.216.34", what: "Does a reverse lookup (IP to name)." },
          { cmd: "nslookup example.com", what: "Simple lookup of a host name's address." },
          { cmd: "curl -I https://example.com", what: "Fetches only the HTTP response headers, such as status code 200 or 404." },
          { cmd: "curl -o file.tar.gz https://example.com/file.tar.gz", what: "Downloads a file and saves it." }
        ]
      },
      {
        name: "Ports, sockets, and scanning: ss, nc, nmap",
        explain: "ss shows network sockets: which ports are listening and which connections are open (it replaced netstat). nc (netcat) can open a raw TCP or UDP connection to test if a port answers, or listen on a port. nmap scans hosts to find open ports and running services; only scan systems you are allowed to scan.",
        examples: [
          { cmd: "ss -tulpn", what: "Lists listening TCP (t) and UDP (u) ports (l), with process names (p), using numbers (n)." },
          { cmd: "ss -tn state established", what: "Shows current established TCP connections." },
          { cmd: "nc -zv db01 5432", what: "Tests whether TCP port 5432 is open on db01 without sending data." },
          { cmd: "nc -l 9000", what: "Listens on port 9000 (handy for testing firewalls between two hosts)." },
          { cmd: "nmap -sV 192.168.1.0/24", what: "Scans a subnet for open ports and tries to identify service versions." }
        ],
        tip: "Is my service listening? ss -tulpn. Can I reach a remote port? nc -zv host port."
      },
      {
        name: "Interface and performance tools: ethtool, iperf3, tcpdump",
        explain: "ethtool shows and changes network card settings such as link speed, duplex, link detected, and offload features. iperf3 measures network throughput between two hosts; one runs as a server and the other as a client. tcpdump captures packets on an interface so you can see exactly what traffic is flowing; captures can be saved and opened in Wireshark.",
        examples: [
          { cmd: "sudo ethtool eth0", what: "Shows speed (e.g. 1000Mb/s), duplex, and whether a link is detected." },
          { cmd: "sudo ethtool -S eth0", what: "Shows NIC statistics such as errors and dropped packets." },
          { cmd: "iperf3 -s   (server)   /   iperf3 -c 10.0.0.5   (client)", what: "Measures bandwidth between two machines." },
          { cmd: "sudo tcpdump -i eth0 port 53", what: "Captures DNS traffic on eth0 and prints it live." },
          { cmd: "sudo tcpdump -i eth0 -w capture.pcap host 10.0.0.5", what: "Saves all traffic to/from 10.0.0.5 into a file for later analysis." }
        ]
      }
    ],
    cards: [
      { q: "Which file lists the DNS servers the system uses?", a: "/etc/resolv.conf (nameserver lines)." },
      { q: "Which file controls whether /etc/hosts or DNS is checked first?", a: "/etc/nsswitch.conf, on the `hosts:` line (for example `hosts: files dns`)." },
      { q: "With NetworkManager, how do you set a static IP on profile eth0 and apply it?", a: "`nmcli con mod eth0 ipv4.method manual ipv4.addresses 192.168.1.50/24 ipv4.gateway 192.168.1.1` then `nmcli con up eth0`." },
      { q: "What is nmtui?", a: "A text-based menu interface for NetworkManager, an alternative to nmcli for editing connections." },
      { q: "You are editing Netplan over SSH and fear losing access. Which command should you use?", a: "`netplan try`. It applies the change and automatically rolls back if you do not confirm." },
      { q: "Where are Netplan configuration files stored and in what format?", a: "In /etc/netplan/ as YAML files (e.g. 01-netcfg.yaml)." },
      { q: "Which commands show IP addresses, interfaces, and routes?", a: "`ip address` (ip a), `ip link`, and `ip route` (ip r)." },
      { q: "Which command lists all listening TCP and UDP ports with process names?", a: "`ss -tulpn`." },
      { q: "Which tool combines ping and traceroute into a live per-hop loss report?", a: "`mtr`." },
      { q: "Which command shows NIC link speed and duplex?", a: "`ethtool eth0`." },
      { q: "How do you measure throughput between two servers?", a: "Run `iperf3 -s` on one server and `iperf3 -c SERVER_IP` on the other." },
      { q: "Which tool queries DNS and can target a specific server, e.g. for MX records?", a: "`dig @server domain MX` (nslookup is an older alternative)." }
    ]
  },

  // ---------------------------------------------------------------- 1.5
  {
    id: "1.5", domain: 1, title: "Given a scenario, manage a Linux system using common shell operations.",
    summary: "This objective is about working efficiently at the command line. You need to know key environment variables, how paths work, which startup files set up your shell, how to redirect input and output, the everyday text-processing utilities, and how to use the vi/vim and nano editors.",
    topics: [
      {
        name: "Common environment variables",
        explain: "Environment variables are named values the shell and programs read. PATH is the list of folders searched for commands. HOME is your home directory. USER is your login name. SHELL is your login shell. PS1 sets what your prompt looks like. DISPLAY tells graphical programs which X display to draw on (like :0). Use echo $NAME to view one and export to pass one to child programs.",
        examples: [
          { cmd: "echo $PATH", what: "Shows the folders searched for commands, separated by colons." },
          { cmd: "export PATH=$PATH:/opt/tools/bin", what: "Adds a folder to the end of PATH for this session and its children." },
          { cmd: "echo $HOME $USER $SHELL", what: "Prints your home directory, user name, and login shell, e.g. /home/alice alice /bin/bash." },
          { cmd: "PS1='[\\u@\\h \\W]\\$ '", what: "Sets the prompt to show user, host, and current folder, like [alice@web01 ~]$." },
          { cmd: "echo $DISPLAY", what: "Shows the X display, such as :0; needed for GUI apps and X11 forwarding." },
          { cmd: "env   /   printenv", what: "Lists all environment variables." }
        ],
        tip: "A command works with its full path but not by name? Its folder is missing from PATH."
      },
      {
        name: "Absolute and relative paths",
        explain: "An absolute path starts at the root / and works from anywhere, like /etc/ssh/sshd_config. The tilde ~ is a shortcut for your home directory, so ~/notes.txt is also absolute. A relative path starts from your current directory. A single dot . means the current directory, two dots .. mean the parent directory, and cd - jumps back to the previous directory you were in.",
        examples: [
          { cmd: "cd /var/log", what: "Absolute path: goes straight to /var/log from anywhere." },
          { cmd: "cd ~   (or just cd)", what: "Goes to your home directory." },
          { cmd: "cd ../..", what: "Relative path: moves up two levels." },
          { cmd: "./script.sh", what: "Runs script.sh from the current directory (the current folder is usually not in PATH)." },
          { cmd: "cd -", what: "Returns to the previous directory." }
        ]
      },
      {
        name: "Shell environment configs: .bashrc, .bash_profile, .profile",
        explain: "Bash reads startup files to set variables, aliases, and functions. A login shell (for example when you SSH in) reads /etc/profile, then the first of ~/.bash_profile, ~/.bash_login, or ~/.profile. An interactive non-login shell (a new terminal window) reads ~/.bashrc. Most ~/.bash_profile files simply source ~/.bashrc so both kinds of shell get the same settings. ~/.profile is the generic file read by sh-compatible shells and by Bash if no .bash_profile exists.",
        examples: [
          { cmd: "echo \"alias ll='ls -l'\" >> ~/.bashrc", what: "Adds an alias permanently for new interactive shells." },
          { cmd: "source ~/.bashrc   (or . ~/.bashrc)", what: "Reloads .bashrc in the current shell so changes apply right away." },
          { cmd: "if [ -f ~/.bashrc ]; then . ~/.bashrc; fi", what: "Common line in ~/.bash_profile that loads .bashrc for login shells too." }
        ],
        tip: "Login shell = .bash_profile (or .profile). New terminal = .bashrc."
      },
      {
        name: "Channel redirection: standard input, standard output, standard error",
        explain: "Every command has three channels. Standard input (stdin, number 0) is where it reads from, normally the keyboard. Standard output (stdout, 1) is where normal results go. Standard error (stderr, 2) is where error messages go. Redirection sends these channels to or from files, and a pipe | sends one command's standard output into the next command's standard input.",
        examples: [
          { cmd: "ls > list.txt", what: "Sends standard output to a file, overwriting it." },
          { cmd: "echo done >> log.txt", what: "Appends standard output to the end of a file." },
          { cmd: "sort < names.txt", what: "Reads standard input from a file." },
          { cmd: "find / -name '*.conf' 2> /dev/null", what: "Throws away standard error (permission denied messages)." },
          { cmd: "cmd > all.log 2>&1   (or cmd &> all.log)", what: "Sends both standard output and standard error to the same file." },
          { cmd: "ps aux | grep sshd", what: "Pipe: passes the output of ps into grep." }
        ],
        tip: "> overwrites, >> appends, 2> is errors, | chains commands."
      },
      {
        name: "Here docs and here strings",
        explain: "A here doc (here document) uses << followed by a marker word to feed several lines of text into a command's standard input until the marker appears again. It is common in scripts for writing files or sending input to programs. A here string uses <<< to feed a single string as standard input.",
        examples: [
          { cmd: "cat << EOF > /etc/motd\nWelcome to web01\nAuthorized users only\nEOF", what: "Here doc: writes two lines into /etc/motd." },
          { cmd: "bc <<< \"5 * 12\"", what: "Here string: sends the text 5 * 12 to bc, which prints 60." },
          { cmd: "tr a-z A-Z <<< hello", what: "Here string: prints HELLO." }
        ],
        tip: "<< = here doc (many lines, needs an end marker). <<< = here string (one line)."
      },
      {
        name: "Viewing text: cat, less, more, head, tail, tee",
        explain: "cat prints whole files (and can join them). less and more page through long files; less can scroll back and search with /, more is older and simpler. head shows the first lines and tail shows the last lines; tail -f follows a growing log file. tee reads standard input and writes it both to the screen and to a file.",
        examples: [
          { cmd: "cat /etc/os-release", what: "Prints the whole file." },
          { cmd: "less /var/log/messages", what: "Pages through the file; press / to search, q to quit." },
          { cmd: "more /etc/services", what: "Simple pager: space for next page, q to quit." },
          { cmd: "head -n 5 /etc/passwd", what: "Shows the first 5 lines." },
          { cmd: "tail -f /var/log/secure", what: "Shows the end of the log and keeps printing new lines as they arrive." },
          { cmd: "dnf update -y | tee update.log", what: "Shows output on screen and saves it to update.log at the same time." }
        ]
      },
      {
        name: "Processing text: grep, cut, sort, uniq, wc, tr, sed, awk",
        explain: "These tools filter and transform text, and are often chained with pipes. grep finds lines that match a pattern. cut pulls out columns. sort orders lines. uniq removes duplicate neighboring lines (so sort first). wc counts lines, words, and characters. tr translates or deletes characters. sed edits text as a stream, often for find-and-replace. awk is a small language for working with fields (columns).",
        examples: [
          { cmd: "grep -i error /var/log/messages", what: "Shows lines containing 'error', ignoring case. -v inverts, -r searches folders." },
          { cmd: "cut -d: -f1 /etc/passwd", what: "Prints the first field (user names) using : as the separator." },
          { cmd: "cut -d: -f7 /etc/passwd | sort | uniq -c", what: "Counts how many users use each login shell." },
          { cmd: "wc -l /etc/passwd", what: "Counts the lines in the file (one per account)." },
          { cmd: "echo hello | tr a-z A-Z", what: "Converts lowercase to uppercase: HELLO." },
          { cmd: "sed -i 's/oldhost/newhost/g' app.conf", what: "Replaces every 'oldhost' with 'newhost' in the file, editing it in place." },
          { cmd: "awk -F: '$3 >= 1000 {print $1}' /etc/passwd", what: "Prints user names whose UID is 1000 or higher." }
        ],
        tip: "uniq only removes duplicates that are next to each other, so use sort | uniq."
      },
      {
        name: "Output, math, and system info: echo, printf, bc, uname, xargs",
        explain: "echo prints text. printf prints formatted text and gives you more control (no automatic newline). bc is a calculator that can do decimal math. uname shows system information such as the kernel version and architecture. xargs takes input lines and turns them into arguments for another command.",
        examples: [
          { cmd: "echo \"Backup finished\"", what: "Prints a line of text." },
          { cmd: "printf \"%-10s %5d\\n\" disk 42", what: "Prints formatted output: a left-aligned word and a right-aligned number." },
          { cmd: "echo \"scale=2; 10/3\" | bc", what: "Does decimal math: prints 3.33." },
          { cmd: "uname -a", what: "Shows kernel name, host, kernel release, and architecture. uname -r shows only the kernel version." },
          { cmd: "find /tmp -name '*.log' -mtime +7 | xargs rm -f", what: "Deletes .log files older than 7 days by passing the found names to rm." }
        ]
      },
      {
        name: "History, aliases, and source: history, !, !!, alias",
        explain: "history lists the commands you ran before. ! runs a past command: !! repeats the last command, !42 runs command number 42, and !ssh runs the last command that started with ssh. alias creates a short name for a longer command. source runs a file in the current shell, so variables and aliases it sets stay in effect.",
        examples: [
          { cmd: "history | tail", what: "Shows your last few commands with numbers." },
          { cmd: "sudo !!", what: "Repeats the last command with sudo, handy when you forgot it." },
          { cmd: "!42", what: "Runs command number 42 from history." },
          { cmd: "alias ll='ls -lh'", what: "Creates an alias so ll runs ls -lh (put it in ~/.bashrc to keep it)." },
          { cmd: "source /etc/profile.d/custom.sh", what: "Loads the file's settings into the current shell." }
        ]
      },
      {
        name: "Text editors: vi/vim and nano",
        explain: "vi and its improved version vim are on almost every Linux system. vim has modes: normal mode for moving and commands, insert mode for typing (press i), and command-line mode (press :). nano is a simpler editor that shows its shortcuts at the bottom of the screen; ^ means the Ctrl key.",
        examples: [
          { cmd: "vim /etc/hosts", what: "Opens the file. Press i to insert text, Esc to go back to normal mode." },
          { cmd: ":wq   /   :q!", what: "In vim: save and quit / quit without saving." },
          { cmd: "dd, yy, p, u, /word", what: "vim normal mode: delete line, copy line, paste, undo, search for 'word'." },
          { cmd: ":%s/old/new/g", what: "vim: replace every 'old' with 'new' in the whole file." },
          { cmd: "nano notes.txt", what: "Opens nano. Ctrl+O saves, Ctrl+X exits, Ctrl+W searches." }
        ],
        tip: "Stuck in vim? Press Esc, then type :q! and press Enter."
      }
    ],
    cards: [
      { q: "Which environment variable lists the directories searched for commands?", a: "PATH. View it with `echo $PATH`; add to it with `export PATH=$PATH:/new/dir`." },
      { q: "Which variable controls the look of the Bash prompt?", a: "PS1." },
      { q: "What does cd - do?", a: "It returns you to the previous working directory." },
      { q: "What is the difference between .bashrc and .bash_profile?", a: ".bash_profile is read by login shells (e.g. SSH logins). .bashrc is read by interactive non-login shells (e.g. a new terminal). Many .bash_profile files source .bashrc." },
      { q: "How do you send both standard output and standard error to one file?", a: "`command > file 2>&1` (or `command &> file`)." },
      { q: "What is the difference between > and >>?", a: "> overwrites the file with standard output; >> appends to the end of it." },
      { q: "What is a here doc, and what is a here string?", a: "A here doc (<< MARKER ... MARKER) feeds multiple lines to standard input. A here string (<<<) feeds a single string, e.g. `bc <<< \"2+2\"`." },
      { q: "You ran a command and got 'Permission denied'. How do you rerun it with sudo quickly?", a: "`sudo !!` (!! repeats the previous command)." },
      { q: "How do you count unique values in a column of a file?", a: "Pipe through sort then uniq -c, e.g. `cut -d: -f7 /etc/passwd | sort | uniq -c`." },
      { q: "Which command saves output to a file while still showing it on screen?", a: "`tee`, e.g. `command | tee output.log` (tee -a to append)." },
      { q: "How do you replace every 'foo' with 'bar' in a file in place?", a: "`sed -i 's/foo/bar/g' file`." },
      { q: "How do you save and quit in vim? Exit nano?", a: "vim: Esc then `:wq`. nano: Ctrl+O to save, Ctrl+X to exit." }
    ]
  },

  // ---------------------------------------------------------------- 1.6
  {
    id: "1.6", domain: 1, title: "Given a scenario, perform backup and restore operations for a Linux server.",
    summary: "This objective covers the tools used to bundle, compress, copy, and recover data. You should know how archive tools (tar, cpio) differ from compression tools (gzip, bzip2, xz, 7-Zip, zip), how to copy whole disks with dd and rescue failing ones with ddrescue, and how rsync makes efficient backups.",
    topics: [
      {
        name: "Archiving with tar",
        explain: "tar (tape archive) bundles many files and folders into one archive file while keeping permissions and ownership. By itself it does not compress, but it can call a compressor: -z for gzip, -j for bzip2, -J for xz. Key flags: c create, x extract, t list, f file name, v verbose.",
        examples: [
          { cmd: "tar -cvf etc-backup.tar /etc", what: "Creates an uncompressed archive of /etc." },
          { cmd: "tar -czvf home.tar.gz /home", what: "Creates a gzip-compressed archive of /home." },
          { cmd: "tar -cJf logs.tar.xz /var/log", what: "Creates an xz-compressed archive (smallest, slowest)." },
          { cmd: "tar -tvf home.tar.gz", what: "Lists the contents without extracting." },
          { cmd: "tar -xzvf home.tar.gz -C /restore", what: "Extracts the archive into /restore." }
        ],
        tip: "c = create, x = extract, t = table (list). z = gzip, j = bzip2, J = xz."
      },
      {
        name: "Archiving with cpio",
        explain: "cpio (copy in, copy out) is an older archive tool. Instead of taking file names as arguments, it reads a list of file names from standard input, usually from find. It is still used inside initramfs images and RPM packages.",
        examples: [
          { cmd: "find /etc | cpio -ov > etc.cpio", what: "Creates (-o, copy out) an archive from the list of files find produces." },
          { cmd: "cpio -idv < etc.cpio", what: "Extracts (-i, copy in) the archive, creating directories as needed (-d)." },
          { cmd: "cpio -tv < etc.cpio", what: "Lists the archive contents." },
          { cmd: "rpm2cpio package.rpm | cpio -idmv", what: "Extracts the files inside an RPM package without installing it." }
        ]
      },
      {
        name: "Compression tools: gzip, bzip2, xz",
        explain: "These tools compress a single file, replacing it with a smaller version (they do not bundle folders; use tar for that). gzip (.gz) is fast with good compression. bzip2 (.bz2) compresses better but is slower. xz (.xz) usually compresses best but is the slowest. Each has a matching decompress command: gunzip, bunzip2, unxz (or use -d).",
        examples: [
          { cmd: "gzip big.log   /   gunzip big.log.gz", what: "Compresses to big.log.gz and removes the original; gunzip reverses it." },
          { cmd: "bzip2 -k data.csv", what: "Compresses to data.csv.bz2 and keeps (-k) the original." },
          { cmd: "xz -9 image.raw   /   xz -d image.raw.xz", what: "Compresses with the highest level; -d decompresses." },
          { cmd: "gzip -l big.log.gz", what: "Shows compressed and uncompressed size and ratio." }
        ],
        tip: "Speed: gzip fastest. Size: xz smallest. bzip2 is in the middle."
      },
      {
        name: "Zip and 7-Zip: unzip, zip, 7z",
        explain: ".zip files both bundle and compress, and are common for sharing with Windows users. unzip extracts them; zip creates them. 7-Zip uses the .7z format with very high compression and can also read many other formats. On Linux it is provided by the 7z command (packages p7zip or 7zip).",
        examples: [
          { cmd: "zip -r site.zip /var/www/html", what: "Creates a zip archive of a folder (recursively)." },
          { cmd: "unzip site.zip -d /tmp/site", what: "Extracts the zip into /tmp/site." },
          { cmd: "unzip -l site.zip", what: "Lists the contents without extracting." },
          { cmd: "7z a backup.7z /data", what: "Creates a 7-Zip archive of /data." },
          { cmd: "7z x backup.7z", what: "Extracts a 7-Zip archive with full paths." }
        ]
      },
      {
        name: "Reading compressed files: zcat, zgrep, zless",
        explain: "These tools let you read gzip-compressed files without decompressing them first, which is handy for rotated logs like messages-20250101.gz. zcat prints the contents, zgrep searches inside, and zless pages through it. (bzip2 and xz have similar tools: bzcat, xzcat, xzgrep.)",
        examples: [
          { cmd: "zcat /var/log/messages-1.gz | tail", what: "Prints the end of a compressed log." },
          { cmd: "zgrep -i \"failed password\" /var/log/secure*.gz", what: "Searches compressed logs for failed logins." },
          { cmd: "zless /usr/share/doc/bash/CHANGES.gz", what: "Pages through a compressed file like less." }
        ]
      },
      {
        name: "Disk-level copies: dd and ddrescue",
        explain: "dd copies raw data block by block. It can clone a whole disk, make a disk image, write an ISO to a USB stick, or wipe a disk. It does exactly what you tell it, so a wrong of= (output) can destroy data. ddrescue (GNU ddrescue) is built for failing disks: it copies the good parts first, skips bad areas, retries them later, and keeps a map file so it can resume.",
        examples: [
          { cmd: "sudo dd if=/dev/sda of=/backup/sda.img bs=4M status=progress", what: "Copies the entire disk /dev/sda into an image file." },
          { cmd: "sudo dd if=rocky.iso of=/dev/sdb bs=4M conv=fsync", what: "Writes an ISO image to a USB drive (destroys what was on /dev/sdb)." },
          { cmd: "sudo dd if=/dev/sda of=mbr.bin bs=512 count=1", what: "Backs up the first 512-byte sector (the MBR)." },
          { cmd: "sudo ddrescue -n /dev/sdb /backup/sdb.img rescue.map", what: "Rescues data from a failing disk, skipping bad spots on the first pass (-n), logging to rescue.map." }
        ],
        tip: "dd: if = input file, of = output file. Double-check of= before pressing Enter."
      },
      {
        name: "Syncing backups with rsync",
        explain: "rsync copies files and folders locally or over SSH. After the first copy, it only sends the parts that changed, which makes repeat backups fast. -a (archive) keeps permissions, times, links, and ownership. --delete makes the destination an exact mirror by removing files that no longer exist at the source.",
        examples: [
          { cmd: "rsync -av /home/ /backup/home/", what: "Copies /home into /backup/home, keeping file attributes. The trailing / means copy the contents." },
          { cmd: "rsync -avz -e ssh /var/www/ backup01:/srv/www/", what: "Copies to a remote server over SSH with compression (-z)." },
          { cmd: "rsync -av --delete /data/ /mirror/data/", what: "Makes /mirror/data an exact copy, deleting extra files." },
          { cmd: "rsync -avn --delete /data/ /mirror/data/", what: "Dry run (-n): shows what would change without changing anything." }
        ],
        tip: "rsync -a = archive mode; -n = dry run first when using --delete."
      }
    ],
    cards: [
      { q: "Which tar command creates a gzip-compressed archive of /etc named etc.tar.gz?", a: "`tar -czvf etc.tar.gz /etc`." },
      { q: "Which tar flags select gzip, bzip2, and xz compression?", a: "-z for gzip, -j for bzip2, -J (capital) for xz." },
      { q: "How do you list the contents of a tar archive without extracting it?", a: "`tar -tvf archive.tar` (add z/j/J for compressed archives, though modern tar detects it)." },
      { q: "How does cpio get the list of files to archive?", a: "From standard input, usually piped from find: `find /etc | cpio -ov > etc.cpio`." },
      { q: "Rank gzip, bzip2, and xz by compression ratio.", a: "xz usually compresses smallest, then bzip2, then gzip. gzip is the fastest." },
      { q: "How do you search inside a gzip-compressed log without extracting it?", a: "`zgrep pattern file.gz` (zcat prints it, zless pages it)." },
      { q: "A disk is failing with read errors. Which tool should you use to image it?", a: "`ddrescue`, which skips bad areas, retries later, and keeps a map file to resume." },
      { q: "What does `dd if=/dev/sda of=/dev/sdb bs=4M` do?", a: "Clones the whole /dev/sda disk onto /dev/sdb, overwriting everything on sdb." },
      { q: "Which rsync option makes the destination an exact mirror?", a: "`--delete`, which removes files at the destination that no longer exist at the source (usually with -a)." },
      { q: "Which commands extract a .zip and a .7z archive?", a: "`unzip file.zip` and `7z x file.7z` (7-Zip)." }
    ]
  },

  // ---------------------------------------------------------------- 1.7
  {
    id: "1.7", domain: 1, title: "Summarize virtualization on Linux systems.",
    summary: "This objective covers running virtual machines on Linux. You should know the KVM and QEMU hypervisor stack, how VirtIO drivers speed up guests, how to work with disk images and VM states, common operations like snapshots, cloning, and migration, the virtual network types, and the libvirt tools (virsh and virt-manager) used to manage it all.",
    topics: [
      {
        name: "Linux hypervisors: KVM and QEMU",
        explain: "A hypervisor runs virtual machines. KVM (Kernel-based Virtual Machine) is a module built into the Linux kernel that turns Linux into a type 1 hypervisor using the CPU's hardware virtualization (Intel VT-x or AMD-V). QEMU is the user-space program that emulates the rest of the computer (disks, network cards, display) for each VM. Together, QEMU uses KVM for speed: QEMU/KVM. QEMU can also run alone, using slower full software emulation, even for a different CPU architecture.",
        examples: [
          { cmd: "grep -E -c \"vmx|svm\" /proc/cpuinfo", what: "Counts CPU threads that support hardware virtualization (vmx = Intel, svm = AMD). 0 means not supported or disabled in firmware." },
          { cmd: "lsmod | grep kvm", what: "Checks that kvm and kvm_intel or kvm_amd modules are loaded." },
          { cmd: "sudo dnf install qemu-kvm libvirt virt-install", what: "Installs the KVM/QEMU virtualization stack on a RHEL-based host." }
        ],
        tip: "KVM = kernel part (speed via hardware). QEMU = emulates devices. They work together."
      },
      {
        name: "Paravirtualized drivers and VirtIO",
        explain: "Fully emulating real hardware (like an old Intel network card) is slow. Paravirtualized drivers are special drivers that know they are running in a VM and talk to the hypervisor directly, which is much faster. VirtIO is the standard set of paravirtualized devices for KVM: virtio-net for networking, virtio-blk and virtio-scsi for disks, and virtio-balloon for memory. Linux guests include VirtIO drivers; Windows guests need them installed.",
        examples: [
          { cmd: "lspci | grep -i virtio", what: "Run inside a guest: shows VirtIO devices presented by the hypervisor." },
          { cmd: "/dev/vda", what: "Disks attached with virtio-blk appear as /dev/vda, /dev/vdb inside the guest." },
          { cmd: "virt-install ... --disk size=20,bus=virtio --network network=default,model=virtio", what: "Creates a VM that uses VirtIO for its disk and network card." }
        ]
      },
      {
        name: "Disk image operations with qemu-img",
        explain: "VM disks are usually files. qcow2 is QEMU's native format: it supports thin provisioning (grows as used), snapshots, and compression. raw is a plain byte-for-byte image: simple and fast but no extras. qemu-img creates images, shows image properties (format, virtual size, actual disk size, backing file), converts between formats such as VMDK, VHDX, raw, and qcow2, and resizes images.",
        examples: [
          { cmd: "qemu-img create -f qcow2 web01.qcow2 20G", what: "Creates a new 20 GB thin-provisioned qcow2 disk." },
          { cmd: "qemu-img info web01.qcow2", what: "Shows image properties: format, virtual size, real disk size, snapshots, and backing file." },
          { cmd: "qemu-img convert -f vmdk -O qcow2 old.vmdk new.qcow2", what: "Converts a VMware disk to qcow2." },
          { cmd: "qemu-img resize web01.qcow2 +10G", what: "Resizes the image by 10 GB. You must still grow the partition and filesystem inside the guest." }
        ],
        tip: "qemu-img info = properties, convert = change format, resize = change size."
      },
      {
        name: "VM states and nested virtualization",
        explain: "VM states describe what a VM is doing. Common states are running, paused (suspended in memory, CPU stopped), shut off, saved (memory written to disk so it can resume later), and crashed. Nested virtualization means running a hypervisor inside a VM, so the VM can host its own VMs. It is useful for labs and testing, but it must be enabled on the host's KVM module and is slower.",
        examples: [
          { cmd: "virsh list --all", what: "Lists all VMs and their state (running, paused, shut off)." },
          { cmd: "virsh suspend web01   /   virsh resume web01", what: "Pauses a running VM and then continues it." },
          { cmd: "virsh save web01 /var/lib/libvirt/save/web01.save", what: "Saves the VM's memory to a file and stops it; `virsh restore` brings it back." },
          { cmd: "cat /sys/module/kvm_intel/parameters/nested", what: "Shows Y or 1 if nested virtualization is enabled on an Intel host (kvm_amd for AMD)." },
          { cmd: "options kvm_intel nested=1", what: "Line in /etc/modprobe.d/kvm.conf that turns on nested virtualization." }
        ]
      },
      {
        name: "VM operations: resources, templates, cloning, snapshots, migrations",
        explain: "Each VM is given resources: CPU (virtual CPUs), RAM, storage (virtual disks), and network (virtual NICs). A baseline image template is a clean, pre-configured 'golden' image you copy to build new VMs quickly and consistently. Cloning makes a copy of a VM, giving it a new name, UUID, and MAC address. A snapshot saves the VM's state at a point in time so you can roll back after a bad change; it is not a full backup. Migration moves a VM to another host; live migration does it while the VM keeps running.",
        examples: [
          { cmd: "virsh setvcpus web01 4 --config   /   virsh setmaxmem web01 8G --config", what: "Changes the CPU count and maximum RAM for the next boot." },
          { cmd: "virsh attach-disk web01 /var/lib/libvirt/images/data.qcow2 vdb --persistent", what: "Adds more storage to a VM." },
          { cmd: "virt-clone --original template-rhel9 --name web02 --auto-clone", what: "Clones a baseline template VM into a new VM called web02." },
          { cmd: "virt-sysprep -d web02", what: "Removes unique data (SSH host keys, machine-id, logs) so a cloned or template image is clean." },
          { cmd: "virsh snapshot-create-as web01 pre-patch   /   virsh snapshot-revert web01 pre-patch", what: "Takes a snapshot before patching and rolls back to it if needed." },
          { cmd: "virsh migrate --live web01 qemu+ssh://host2/system", what: "Live-migrates the running VM to host2." }
        ],
        tip: "Snapshots are for quick rollback, not long-term backup. Delete old snapshots; they slow disks and use space."
      },
      {
        name: "Bare metal vs. virtual machines",
        explain: "Bare metal means the operating system runs directly on the physical hardware with no hypervisor in between. It gives full performance and direct hardware access, which is good for databases, high-performance computing, and GPU workloads. Virtual machines share one physical host. They are more flexible and use hardware better: you can create, snapshot, clone, and move them easily, at the cost of a little overhead. The word bare metal is also used for a type 1 hypervisor that runs directly on hardware (like KVM), versus a type 2 hypervisor that runs as an app on a desktop OS (like VirtualBox).",
        examples: [
          { cmd: "systemd-detect-virt", what: "Prints none on bare metal, or the hypervisor type such as kvm or vmware inside a VM." },
          { cmd: "sudo dmidecode -s system-product-name", what: "Shows the hardware model; in a KVM VM it often says KVM or Standard PC (Q35)." }
        ]
      },
      {
        name: "Virtual network types",
        explain: "Bridged networking connects the VM straight to the physical network through a bridge (like br0), so it gets an address on the real LAN like any other machine. NAT (the libvirt default network, virbr0) hides VMs behind the host's IP; VMs can reach out but outsiders cannot reach in easily. Host-only or isolated networks let VMs talk to each other and the host but not the outside world. Routed networks give VMs their own subnet that the host routes to the LAN without NAT. An open network is like routed, but libvirt adds no firewall rules at all, leaving traffic control to you.",
        examples: [
          { cmd: "virsh net-list --all", what: "Lists virtual networks, such as the default NAT network." },
          { cmd: "virsh net-dumpxml default", what: "Shows the network definition; `<forward mode='nat'/>` means NAT, mode='route' means routed, mode='open' means open, and no forward element means isolated." },
          { cmd: "sudo nmcli con add type bridge ifname br0 con-name br0", what: "Creates a Linux bridge on the host for bridged VM networking." },
          { cmd: "virt-install ... --network bridge=br0", what: "Attaches a new VM to the bridged network." }
        ],
        tip: "Bridged = on the real LAN. NAT = out only. Isolated/host-only = no outside. Routed = own subnet, no NAT. Open = routed with no libvirt firewall rules."
      },
      {
        name: "Virtual machine tools: libvirt, virsh, virt-manager",
        explain: "libvirt is a management layer and daemon (libvirtd or the newer modular virtqemud) that provides one API to control hypervisors like KVM/QEMU. virsh is the command-line shell for libvirt; it starts, stops, edits, and inspects VMs. virt-manager is the graphical desktop app for creating and managing VMs. virt-install creates new VMs from the command line.",
        examples: [
          { cmd: "sudo systemctl enable --now libvirtd", what: "Starts the libvirt service and enables it at boot." },
          { cmd: "virsh start web01   /   virsh shutdown web01   /   virsh destroy web01", what: "Starts a VM, asks it to shut down cleanly, or forcefully powers it off." },
          { cmd: "virsh autostart web01", what: "Starts the VM automatically when the host boots." },
          { cmd: "virsh dominfo web01   /   virsh edit web01", what: "Shows a VM's CPU, memory, and state; opens its XML definition for editing." },
          { cmd: "virt-manager", what: "Opens the graphical Virtual Machine Manager." },
          { cmd: "virt-install --name web01 --memory 2048 --vcpus 2 --disk size=20 --cdrom rocky9.iso --os-variant rocky9", what: "Creates and installs a new VM from an ISO." }
        ],
        tip: "virsh destroy does not delete the VM; it just pulls the virtual power plug. virsh undefine removes it."
      }
    ],
    cards: [
      { q: "What is the difference between KVM and QEMU?", a: "KVM is a Linux kernel module that uses CPU hardware virtualization to run VMs fast. QEMU is the user-space program that emulates devices; together they form QEMU/KVM." },
      { q: "How can you check if a CPU supports hardware virtualization?", a: "Look for vmx (Intel) or svm (AMD) flags: `grep -E \"vmx|svm\" /proc/cpuinfo`, or check lscpu." },
      { q: "What are VirtIO drivers?", a: "Paravirtualized drivers that let a guest talk efficiently to the hypervisor for disk, network, and memory, much faster than emulated hardware." },
      { q: "Which command converts a VMDK disk to qcow2?", a: "`qemu-img convert -f vmdk -O qcow2 disk.vmdk disk.qcow2`." },
      { q: "Which command shows a disk image's format, virtual size, and backing file?", a: "`qemu-img info image.qcow2`." },
      { q: "What is nested virtualization?", a: "Running a hypervisor inside a VM so that VM can host its own VMs. On KVM it is enabled with the kvm_intel or kvm_amd nested=1 option." },
      { q: "What is the difference between a snapshot and a clone?", a: "A snapshot saves a VM's state at a point in time for rollback. A clone is a new, separate VM copied from an existing one (with a new name, UUID, and MAC)." },
      { q: "Which virtual network type puts the VM directly on the physical LAN?", a: "Bridged networking." },
      { q: "What is libvirt's default network type, and what does it allow?", a: "NAT (virbr0). VMs can reach outside networks through the host's IP, but outside hosts cannot reach the VMs directly." },
      { q: "Which network type lets VMs talk only to each other and the host?", a: "Host-only / isolated." },
      { q: "Which command lists all VMs, including those that are shut off?", a: "`virsh list --all`." },
      { q: "What does live migration do?", a: "Moves a running VM to another host with little or no downtime, e.g. `virsh migrate --live vm qemu+ssh://host2/system`." },
      { q: "What is virt-manager?", a: "The graphical (GUI) Virtual Machine Manager application for libvirt; virsh is the command-line equivalent." }
    ]
  }
);
