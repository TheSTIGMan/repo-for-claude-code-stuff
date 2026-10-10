## Lab 0: Build Your Lab {#lab-0}

::: labinfo
**Goal:** Build the two virtual machines used in every lab.\
**Time:** about 90 minutes (most of it is waiting for installers)\
**You will end with:** `ubuntu-lab` (Ubuntu Server 24.04 LTS) and `rocky-lab` (Rocky Linux 9) on the same network, each with a snapshot named `clean`
:::

The labs in this book need two Linux servers. Most labs use Ubuntu Server, the most popular Linux server distribution. A few labs need a Red Hat-style system, because the exam covers tools that only exist there: SELinux, firewalld, dnf, rpm, dracut, and Kickstart. For those labs you will use Rocky Linux, a free rebuild of Red Hat Enterprise Linux (RHEL). Anything you learn on Rocky works the same way on RHEL.

### How it works

A **virtual machine (VM)** is a computer simulated in software. Your real computer, the **host**, runs a program called a **hypervisor** (VirtualBox, VMware, Hyper-V, or UTM). The hypervisor carves out some of the host's CPU, memory, and disk and presents them to the VM as if they were real hardware. The operating system inside the VM, the **guest**, does not know the difference.

VMs are perfect for practice because you can break them without consequences. A **snapshot** freezes the complete state of a VM's disks (and optionally its memory). If a lab goes wrong, you restore the snapshot and you are back where you started.

```{.diagram}
 +-------------------------- Your computer (host) ---------------------------+
 |                                                                           |
 |   Hypervisor (VirtualBox / VMware / Hyper-V / UTM)                        |
 |                                                                           |
 |   +---------------------------+        +---------------------------+      |
 |   | ubuntu-lab                |        | rocky-lab                 |      |
 |   | Ubuntu Server 24.04 LTS   |        | Rocky Linux 9 (minimal)   |      |
 |   | 2 vCPU, 4 GB RAM          |        | 1-2 vCPU, 2 GB RAM        |      |
 |   | disk 25 GB (OS)           |        | disk 20 GB (OS)           |      |
 |   | + 4 x 5 GB lab disks      |        |                           |      |
 |   | 192.168.100.10            |        | 192.168.100.20            |      |
 |   +-------------+-------------+        +-------------+-------------+      |
 |                 |      virtual network (NAT)         |                    |
 |                 +-------------------+----------------+                    |
 |                                     |                                     |
 +-------------------------------------|-------------------------------------+
                                       |
                                   Internet
```

Both VMs sit on the same virtual network. They can reach each other and the internet, and you can reach both of them from your host with SSH.

The four extra 5 GB disks on `ubuntu-lab` are for the storage labs (partitions, LVM, RAID, encryption, and disk troubleshooting). They start empty, and every lab that uses them wipes them clean again at the end.

### What you need

| Item | Where to get it |
|---|---|
| Hypervisor | VirtualBox (virtualbox.org), VMware Workstation Pro or Fusion (free for personal use), Hyper-V (Windows Pro and up), or UTM (Apple silicon Macs) |
| Ubuntu Server 24.04 LTS ISO | ubuntu.com/download/server. Choose the latest 24.04.x point release. |
| Rocky Linux 9 minimal ISO | rockylinux.org/download. Choose the latest 9.x **Minimal** ISO for your CPU type. |
| Free resources on the host | About 6 GB of RAM and 80 GB of disk for both VMs |

::: tip
**Apple silicon Macs (M1 and later):** download the **ARM64** (aarch64) ISOs of both distributions. Everything in the book works the same way. Where a lab downloads an `x86_64` file, such as a cloud image in Lab 1.7, choose the `aarch64` version instead.
:::

### Tasks

#### Task 1: Prepare a virtual network

Both VMs need to be on a network where they can see each other and reach the internet. The simplest choice depends on your hypervisor.

1. Set up the network for your hypervisor:

    - **VirtualBox:** open **File > Tools > Network Manager**, select the **NAT Networks** tab, and click **Create**. Name it `LabNet`, set the IPv4 prefix to `192.168.100.0/24`, and keep **Enable DHCP** checked. You will attach both VMs to this NAT network. (The plain "NAT" mode does **not** let VMs talk to each other.)
    - **VMware Workstation or Fusion:** use the default **NAT** network (VMnet8, or "Share with my Mac"). Its subnet is chosen at random when VMware is installed, for example `192.168.47.0/24`. You will find yours in Task 4.
    - **Hyper-V:** use the **Default Switch**. It provides NAT and DHCP. Its subnet can change when the host reboots, so in Task 4 you will keep DHCP and update `/etc/hosts` if the addresses change.
    - **UTM:** use the default **Shared Network** mode for both VMs.

    ::: explain
    **What just happened:** You created (or chose) a private virtual network. **NAT** (Network Address Translation) lets the VMs reach the internet through your host's connection, while hiding them from the outside world. **DHCP** hands each VM an IP address automatically when it boots.
    :::

#### Task 2: Create and install ubuntu-lab

1. Create a new VM with these settings:

    | Setting | Value |
    |---|---|
    | Name | `ubuntu-lab` |
    | Type | Linux, Ubuntu (64-bit), or ARM64 on Apple silicon |
    | CPUs | 2 |
    | Memory | 4096 MB |
    | Disk | 25 GB, dynamically allocated (thin provisioned) |
    | Network | The network from Task 1 |
    | Firmware | UEFI if offered (BIOS also works) |
    | Install media | The Ubuntu Server 24.04 ISO |

    ::: tip
    **VirtualBox:** turn **off** "Unattended Installation" (check "Skip Unattended Installation"), so that you see and learn the installer screens.
    :::

    Do **not** add the four extra lab disks yet. Adding them after the installation guarantees the installer cannot touch them, and that your system disk is the first disk (`sda` or `vda`).

2. Start the VM and walk through the installer. Use the arrow keys, Tab, Space, and Enter to move around.

    | Installer screen | What to choose |
    |---|---|
    | Language | English |
    | Installer update | "Continue without updating" is fine |
    | Keyboard | Your layout |
    | Type of installation | **Ubuntu Server** (not minimized) |
    | Network | Accept the DHCP address it found. Write it down. |
    | Proxy | Leave empty |
    | Ubuntu archive mirror | Accept the default |
    | Guided storage | **Use an entire disk**, keep **Set up this disk as an LVM group** checked |
    | Storage configuration | See the tip below, then **Done** and **Continue** |
    | Profile | Your name: `Student`, server name: `ubuntu-lab`, username: `student`, and a password you will remember |
    | Ubuntu Pro | Skip for now |
    | SSH configuration | **Install OpenSSH server**: checked. Do not import keys. |
    | Featured server snaps | Select none |

    ::: tip
    On the storage summary, the installer usually gives the root logical volume (`ubuntu-lv`) only about half of the disk and leaves the rest free in the volume group. That is fine. You will grow it to full size in Task 3 with one command, which is also a sneak preview of Lab 1.3.
    :::

3. Wait for the installation to finish, choose **Reboot Now**, and remove the ISO if your hypervisor asks you to. Log in at the console as `student`.

::: checkpoint
**Checkpoint:** you see a prompt like `student@ubuntu-lab:~$`, and `hostnamectl` shows `Static hostname: ubuntu-lab` and `Operating System: Ubuntu 24.04.x LTS`.
:::

#### Task 3: First steps on ubuntu-lab

1. Update the system. Updating takes a few minutes the first time.

    ```bash
    sudo apt update
    sudo apt full-upgrade -y
    ```

    ::: explain
    **What just happened:** `sudo` runs a command as the administrator (root). It asks for **your** password the first time. `apt update` downloads the latest list of available packages from Ubuntu's servers. `apt full-upgrade` installs newer versions of everything already installed, and `-y` answers "yes" to the confirmation prompt.
    :::

2. Grow the root filesystem to use the whole disk:

    ```bash
    sudo lvextend -r -l +100%FREE /dev/ubuntu-vg/ubuntu-lv
    df -h /
    ```

    ```{.output}
    Filesystem                         Size  Used Avail Use% Mounted on
    /dev/mapper/ubuntu--vg-ubuntu--lv   23G  5.1G   17G  24% /
    ```

    ::: explain
    **What just happened:** The installer used **LVM** (Logical Volume Manager), which lets you resize storage on the fly. `lvextend` grew the logical volume into all the free space (`-l +100%FREE`), and `-r` also resized the filesystem inside it, so the extra space is usable immediately. `df -h /` shows the size of the root filesystem in human-readable units. You will learn exactly how this works in Lab 1.3.
    :::

3. Install a few tools that many labs use:

    ```bash
    sudo apt install -y vim nano curl wget git tree bash-completion \
      net-tools dnsutils traceroute tcpdump unzip
    ```

4. Set your time zone so log timestamps match your clock. List zones with `timedatectl list-timezones`, then set yours (this example uses US Central time):

    ```bash
    sudo timedatectl set-timezone America/Chicago
    timedatectl
    ```

5. Reboot to load the updated kernel:

    ```bash
    sudo reboot
    ```

#### Task 4: Give ubuntu-lab a fixed IP address (recommended)

Servers normally keep the same IP address forever, so other machines can find them. A fixed (static) address also means the `/etc/hosts` entries you create in Task 7 never go stale.

::: tip
**Hyper-V Default Switch users:** skip this task and keep DHCP. If your VMs' addresses change after a host reboot, update `/etc/hosts` on both VMs (Task 7).
:::

1. Find your current address, network, and gateway:

    ```bash
    ip -br address
    ip route
    ```

    ```{.output}
    lo               UNKNOWN        127.0.0.1/8 ::1/128
    enp0s3           UP             192.168.100.4/24 fe80::a00:27ff:fe4e:66a1/64
    default via 192.168.100.1 dev enp0s3 proto dhcp src 192.168.100.4 metric 100
    192.168.100.0/24 dev enp0s3 proto kernel scope link src 192.168.100.4 metric 100
    ```

    ::: explain
    **What just happened:** `ip -br address` lists your network interfaces briefly (`-br`). Here the interface is named `enp0s3` and has the address `192.168.100.4` on a `/24` network (the first three numbers identify the network). `ip route` shows the routing table. The `default via 192.168.100.1` line is your **default gateway**, the router used to reach everything outside your own network.

    Write down three things: your **interface name** (for example `enp0s3`, `ens33`, or `eth0`), your **network** (for example `192.168.100`), and your **gateway** (for example `192.168.100.1`; on VMware NAT it usually ends in `.2`).
    :::

2. Look at the current Netplan configuration. Netplan is Ubuntu's network configuration tool, and it reads YAML files in `/etc/netplan/`:

    ```bash
    ls /etc/netplan/
    sudo cat /etc/netplan/50-cloud-init.yaml
    ```

    The file name may differ slightly. Whatever its name, that file currently tells the interface to use DHCP.

3. Create a new configuration file that sets a static address. Replace `enp0s3`, the address, and the gateway with **your** values. Keep the address in your own network and end it in `.10`:

    ```bash
    cat <<'EOF' | sudo tee /etc/netplan/60-static.yaml
    network:
      version: 2
      ethernets:
        enp0s3:
          dhcp4: false
          addresses:
            - 192.168.100.10/24
          routes:
            - to: default
              via: 192.168.100.1
          nameservers:
            addresses: [1.1.1.1, 8.8.8.8]
    EOF
    sudo chmod 600 /etc/netplan/60-static.yaml
    ```

    ::: explain
    **What just happened:** `cat <<'EOF' ... EOF` is a **here document**. Everything between the two `EOF` markers is fed to `sudo tee`, which writes it into the file with root privileges. You will use this trick often, because it avoids typos in an editor. The YAML says: for this interface, turn DHCP off, use this address, send everything else to this gateway, and use these DNS servers. Netplan files are combined in alphabetical order, so `60-static.yaml` overrides the DHCP setting from `50-cloud-init.yaml`. `chmod 600` makes the file readable only by root, because Netplan warns about files that other users can read.
    :::

4. Apply the change safely with `netplan try`. It applies the new settings and **automatically rolls back after 120 seconds** unless you press Enter to confirm:

    ```bash
    sudo netplan try
    ```

    If the network still works (for example `ping -c 2 8.8.8.8` succeeds in another session or after you confirm), press **Enter** to keep the configuration.

    ::: warning
    Do this step from the VM's own console, not over SSH. If you mistype the gateway or interface name, you can lose network access. The console always works.
    :::

5. Prevent cloud-init from rewriting the network configuration at a later boot:

    ```bash
    echo 'network: {config: disabled}' | \
      sudo tee /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg
    ```

::: checkpoint
**Checkpoint:** `ip -br address` shows your `.10` address, and both `ping -c 2 8.8.8.8` and `ping -c 2 ubuntu.com` succeed.
:::

#### Task 5: Create and install rocky-lab

1. Create a second VM:

    | Setting | Value |
    |---|---|
    | Name | `rocky-lab` |
    | Type | Linux, Red Hat (64-bit), or ARM64 on Apple silicon |
    | CPUs | 1 (2 if you can spare it) |
    | Memory | 2048 MB |
    | Disk | 20 GB, dynamically allocated |
    | Network | The same network as ubuntu-lab |
    | Install media | The Rocky Linux 9 minimal ISO |

2. Boot the VM and choose **Install Rocky Linux 9**. The graphical installer, Anaconda, shows an **Installation Summary** hub. Configure each item:

    | Item | What to choose |
    |---|---|
    | Language | English |
    | Installation Destination | Select the 20 GB disk, keep **Automatic** storage, click **Done** |
    | Software Selection | **Minimal Install** |
    | Network & Host Name | Switch the Ethernet adapter **ON**. Set Host Name to `rocky-lab` and click **Apply**. |
    | Root Password | Leave root **locked** ("Lock root account" checked) |
    | User Creation | Full name `Student`, user name `student`, check **Make this user administrator**, set a password |
    | Time & Date | Your time zone |

3. Click **Begin Installation**. When it finishes, click **Reboot System** and log in at the console as `student`.

    ::: explain
    **What just happened:** "Make this user administrator" adds `student` to the `wheel` group. On Red Hat-style systems, members of `wheel` may use `sudo`. Ubuntu uses a group named `sudo` for the same purpose. Both distributions lock the root account by default, so you always work as a normal user and use `sudo` for admin tasks. That is a security best practice you will study in Lab 3.4.
    :::

4. Update the system and install a few tools:

    ```bash
    # on rocky-lab
    sudo dnf -y upgrade
    sudo dnf -y install vim nano curl wget git tree bash-completion \
      bind-utils traceroute tcpdump tar unzip policycoreutils-python-utils
    sudo reboot
    ```

    ::: explain
    **What just happened:** `dnf` is the package manager on Red Hat-style systems. It does the same job as `apt` on Ubuntu. `upgrade` updates all installed packages, and `-y` answers yes to prompts. `bind-utils` provides `dig` and `nslookup`, and `policycoreutils-python-utils` provides `semanage`, which the SELinux labs use.
    :::

#### Task 6: Give rocky-lab a fixed IP address (recommended)

Rocky Linux manages networking with **NetworkManager**, controlled from the command line with `nmcli`.

1. Find the connection name and current settings:

    ```bash
    # on rocky-lab
    nmcli connection show
    ip -br address
    ip route
    ```

    ```{.output}
    NAME    UUID                                  TYPE      DEVICE
    enp0s3  5fb06bd0-0bb0-7ffb-45f1-d6edd65f3e03  ethernet  enp0s3
    lo      2f2b8e4a-5c3a-4b2f-9a1f-0c3b2a1d0e9f  loopback  lo
    ```

2. Set a static address ending in `.20` in the same network. Replace the connection name, address, and gateway with your values:

    ```bash
    # on rocky-lab
    sudo nmcli connection modify enp0s3 \
      ipv4.method manual \
      ipv4.addresses 192.168.100.20/24 \
      ipv4.gateway 192.168.100.1 \
      ipv4.dns "1.1.1.1 8.8.8.8"
    sudo nmcli connection up enp0s3
    ```

    ::: explain
    **What just happened:** `nmcli connection modify` changed the saved connection profile: `ipv4.method manual` turns off DHCP, and the other settings set the address, gateway, and DNS servers. `nmcli connection up` re-activates the profile so the change takes effect. NetworkManager stores the profile in `/etc/NetworkManager/system-connections/`, so it survives reboots.
    :::

::: checkpoint
**Checkpoint:** `ip -br address` on rocky-lab shows the `.20` address, and `ping -c 2 rockylinux.org` works.
:::

#### Task 7: Let the VMs find each other by name

**DNS** turns names into IP addresses, but your lab network has no DNS server for your own VMs. Instead you will use `/etc/hosts`, a simple local lookup file that Linux checks before DNS.

1. On **both** VMs, add these lines to `/etc/hosts`. Use your real addresses:

    ```bash
    echo "192.168.100.10  ubuntu-lab" | sudo tee -a /etc/hosts
    echo "192.168.100.20  rocky-lab"  | sudo tee -a /etc/hosts
    ```

    ```bash
    # on rocky-lab
    echo "192.168.100.10  ubuntu-lab" | sudo tee -a /etc/hosts
    echo "192.168.100.20  rocky-lab"  | sudo tee -a /etc/hosts
    ```

    ::: explain
    **What just happened:** `tee -a` **appends** (`-a`) to the file instead of overwriting it. Running `tee` through `sudo` is the standard way to write to a root-owned file from a pipe. `sudo echo ... >> /etc/hosts` would fail, because the `>>` redirection is done by your own shell, which is not running as root.
    :::

2. Test name resolution and connectivity in both directions:

    ```bash
    ping -c 2 rocky-lab
    ssh student@rocky-lab hostname
    ```

    The first time you connect with SSH, you are asked to confirm the server's **host key fingerprint**. Type `yes`, then enter student's password on rocky-lab. The command prints `rocky-lab`.

::: checkpoint
**Checkpoint:** `ping rocky-lab` works from ubuntu-lab, and `ping ubuntu-lab` works from rocky-lab.
:::

#### Task 8: Connect from your host with SSH

Typing in the VM console works, but a terminal on your host is far more comfortable: you get copy and paste, scrollback, and several windows at once.

1. From your host, open a terminal (macOS or Linux Terminal, or Windows Terminal/PowerShell, which include an SSH client) and connect:

    ```bash
    ssh student@192.168.100.10
    ```

    - **VirtualBox NAT Network:** the host cannot reach VMs on a NAT Network directly. Add port forwarding: in **Network Manager > NAT Networks > LabNet > Port Forwarding**, add rule `ubuntu-ssh`, host port `2210`, guest IP `192.168.100.10`, guest port `22`, and rule `rocky-ssh`, host port `2220`, guest IP `192.168.100.20`, guest port `22`. Then connect with `ssh -p 2210 student@127.0.0.1` and `ssh -p 2220 student@127.0.0.1`.
    - **VMware, Hyper-V, and UTM:** the host can reach the VM addresses directly.

2. Open a second terminal and connect to rocky-lab the same way. From now on you can work in host terminals.

::: tip
Many labs ask you to keep a second session open while you change login or network settings. Two host terminal windows connected to the same VM give you exactly that.
:::

#### Task 9: Add the four lab disks to ubuntu-lab

1. Shut down ubuntu-lab:

    ```bash
    sudo poweroff
    ```

2. In your hypervisor's settings for ubuntu-lab, add **four new virtual hard disks**, each **5 GB** and dynamically allocated. Put them on the same controller as the system disk (SATA, SCSI, or VirtIO).
3. Start ubuntu-lab, log in, and list the disks:

    ```bash
    lsblk -d -o NAME,SIZE,TYPE,MODEL
    ```

    ```{.output}
    NAME  SIZE TYPE MODEL
    sda    25G disk VBOX HARDDISK
    sdb     5G disk VBOX HARDDISK
    sdc     5G disk VBOX HARDDISK
    sdd     5G disk VBOX HARDDISK
    sde     5G disk VBOX HARDDISK
    ```

    ::: explain
    **What just happened:** `lsblk` lists **block devices** (storage devices). `-d` shows only whole disks, not partitions, and `-o` chooses the columns. Linux names SATA and SCSI disks `sda`, `sdb`, `sdc`, and so on, in the order they are detected. VirtIO disks are named `vda`, `vdb`, and so on, and NVMe disks `nvme0n1`, `nvme0n2`, and so on.
    :::

    ::: warning
    The labs call the extra disks `/dev/sdb`, `/dev/sdc`, `/dev/sdd`, and `/dev/sde`. If your names differ, for example `vdb` or `nvme0n2`, **substitute your names every time**. Always run `lsblk` before any command that writes to a disk, and make sure you never touch the 25 GB system disk.
    :::

#### Task 10: Enable nested virtualization (for Lab 1.7)

Lab 1.7 runs a small VM **inside** ubuntu-lab. That is called **nested virtualization**, and it is much faster if the hypervisor passes the CPU's virtualization features through to the VM. Lab 1.7 also works without nesting, just more slowly, so do not worry if your setup does not support it.

1. With ubuntu-lab powered off, enable nesting:

    - **VirtualBox:** Settings > System > Processor > check **Enable Nested VT-x/AMD-V**. If it is greyed out, run this on the host: `VBoxManage modifyvm ubuntu-lab --nested-hw-virt on`.
    - **VMware:** VM Settings > Processors > check **Virtualize Intel VT-x/EPT or AMD-V/RVI**.
    - **Hyper-V:** in an administrator PowerShell on the host: `Set-VMProcessor -VMName ubuntu-lab -ExposeVirtualizationExtensions $true`
    - **UTM on Apple silicon:** not available on most macOS versions. Lab 1.7 uses emulation instead.

2. Start ubuntu-lab and check:

    ```bash
    grep -cE 'vmx|svm' /proc/cpuinfo
    ```

    ::: explain
    **What just happened:** `vmx` (Intel) and `svm` (AMD) are CPU flags that mean "hardware virtualization is available". `grep -c` counts the matching lines in `/proc/cpuinfo`, one per CPU core. A number greater than 0 means nesting works. `0` means Lab 1.7 will use software emulation.
    :::

#### Task 11: Take the clean snapshots

1. Shut down both VMs (`sudo poweroff`).
2. In your hypervisor, take a snapshot of each VM and name it `clean`.

    - **VirtualBox:** select the VM, open the **Snapshots** view, and click **Take**.
    - **VMware:** VM > Snapshot > Take Snapshot.
    - **Hyper-V:** right-click the VM > Checkpoint.
    - **UTM:** UTM has no snapshot button. Instead, shut down the VM, right-click it, and choose **Clone** to keep a backup copy.

3. Start both VMs again.

::: checkpoint
**Checkpoint:** each VM has a snapshot named `clean`, and you can log in to both from your host.
:::

::: tip
**Restoring a snapshot:** shut down the VM (or power it off), select the snapshot, and choose **Restore** (VirtualBox), **Revert to Snapshot** (VMware), or **Apply** (Hyper-V). The VM returns to exactly the state it was in when you took the snapshot.
:::

### Your lab at a glance

| | ubuntu-lab | rocky-lab |
|---|---|---|
| Operating system | Ubuntu Server 24.04 LTS | Rocky Linux 9 (minimal) |
| Address (example) | 192.168.100.10 | 192.168.100.20 |
| Login | `student` (in the `sudo` group) | `student` (in the `wheel` group) |
| Package manager | `apt`, `dpkg` | `dnf`, `rpm` |
| Network configuration | Netplan (`/etc/netplan/`) | NetworkManager (`nmcli`) |
| Firewall | `ufw` (off by default) | `firewalld` (on by default) |
| Mandatory access control | AppArmor | SELinux (enforcing) |
| Extra disks | `sdb`, `sdc`, `sdd`, `sde` (5 GB each) | none |

You are ready. Start with Lab 1.1, or go to any objective you want to practice.
