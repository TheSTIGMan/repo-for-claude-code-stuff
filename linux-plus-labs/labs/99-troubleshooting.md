## Appendix D: Lab VM Troubleshooting {#appendix-d}

Things go wrong in labs. That is part of learning. This appendix covers the problems readers hit most often and how to get unstuck. When in doubt, **restore your snapshot** and start the lab again. That is always faster than digging out of a mess you do not yet understand.

### I cannot connect with SSH from my host

1. Log in at the VM console and check that the SSH server is running:

    ```bash
    systemctl status ssh        # Ubuntu (the service is named ssh)
    ```

    ```bash
    # on rocky-lab
    systemctl status sshd       # Rocky (the service is named sshd)
    ```

2. Check the VM's address with `ip -br address`, and make sure you connect to that address.
3. **VirtualBox NAT Network:** the host reaches the VMs only through the port-forwarding rules from Lab 0, Task 8 (`ssh -p 2210 student@127.0.0.1`).
4. Check the firewall. On Ubuntu, `sudo ufw status` must show `OpenSSH ALLOW` if ufw is active. On Rocky, `sudo firewall-cmd --list-services` must include `ssh`.
5. If you changed `/etc/ssh/sshd_config` or a file in `/etc/ssh/sshd_config.d/`, test the configuration with `sudo sshd -t`. It prints the line with the error. Fix it, then restart the service.

### I lost network access after changing the network configuration

Work at the VM console, not over SSH.

- **Ubuntu (Netplan):** list the files with `ls /etc/netplan/`. Move the file you changed out of the way and re-apply:

    ```bash
    sudo mv /etc/netplan/60-static.yaml /root/
    sudo netplan apply
    ```

    Always use `sudo netplan try` for future changes. It rolls back automatically if you do not confirm.

- **Rocky (NetworkManager):** show the connection with `nmcli connection show enp0s3`, fix the wrong value with `sudo nmcli connection modify`, then run `sudo nmcli connection up enp0s3`. To go back to DHCP: `sudo nmcli connection modify enp0s3 ipv4.method auto ipv4.addresses "" ipv4.gateway ""`.

### Name resolution fails (ping by name does not work)

- `ping rocky-lab` fails but `ping 192.168.100.20` works: check `/etc/hosts` on the VM (`cat /etc/hosts`). The entry must contain the current address.
- `ping ubuntu.com` fails: on Ubuntu run `resolvectl status` and check that a DNS server is listed. On Rocky run `cat /etc/resolv.conf`. Re-check the `nameservers` (Netplan) or `ipv4.dns` (nmcli) settings from Lab 0.

### apt says "Could not get lock /var/lib/dpkg/lock-frontend"

Another package process is running, usually the automatic `unattended-upgrades` job that runs shortly after boot. Wait a few minutes and try again. Check what holds the lock with:

```bash
ps aux | grep -E 'apt|dpkg' | grep -v grep
```

Never delete the lock files while a package process is running. That can corrupt the package database.

### dpkg was interrupted

If an installation was cut off, run:

```bash
sudo dpkg --configure -a
sudo apt -f install
```

The first command finishes configuring half-installed packages. The second fixes broken dependencies.

### The extra disks have different names

Your disks may be named `vdb`, `vdc`, and so on (VirtIO), or `nvme0n2`, `nvme0n3`, and so on (NVMe), instead of `sdb` to `sde`. Run `lsblk` and substitute your names in every command. Partitions on NVMe disks get a `p`, for example `nvme0n2p1` instead of `sdb1`.

### A disk is busy and cannot be unmounted or wiped

```bash
sudo lsof +f -- /mnt/data      # which processes use the mount point?
sudo fuser -vm /mnt/data       # another view of the same thing
```

`cd` out of the directory in every terminal, stop the listed processes, then try `umount` again. Leftover LVM or RAID devices keep disks busy too: run `sudo vgchange -an`, `sudo mdadm --stop /dev/md0`, and then `sudo wipefs -a /dev/sdX`.

### The VM boots into emergency mode

This almost always means a bad line in `/etc/fstab`, for example a disk that was removed or a mistyped UUID.

1. Enter the root password (Rocky) or press Enter for a maintenance shell.
2. Remount the root filesystem read-write and edit fstab:

    ```bash
    mount -o remount,rw /
    nano /etc/fstab
    ```

3. Put a `#` in front of the bad line, save, and run `systemctl daemon-reload` and `mount -a` to check. Then reboot.

Lab 5.2 practices exactly this scenario.

::: tip
Ubuntu locks the root account, so its emergency mode may say "root account is locked" and refuse a shell. Reboot, open the GRUB menu (hold **Shift** on BIOS or tap **Esc** on UEFI), choose **Advanced options > recovery mode**, then **root - Drop to root shell prompt**.
:::

### I forgot my password or broke sudo

Restoring the snapshot is easiest. To fix it in place on Ubuntu:

1. Reboot and open the GRUB menu (hold **Shift** or tap **Esc** during boot).
2. Highlight the Ubuntu entry and press **e**.
3. On the line that starts with `linux`, add `init=/bin/bash` at the end, then press **Ctrl+X** to boot.
4. You get a root shell with the root filesystem read-only. Run:

    ```bash
    mount -o remount,rw /
    passwd student          # set a new password
    visudo                  # or fix /etc/sudoers.d/ files
    sync
    reboot -f
    ```

On Rocky, add `rd.break` instead, then run `mount -o remount,rw /sysroot`, `chroot /sysroot`, `passwd student`, `touch /.autorelabel` (so SELinux relabels the files you changed), `exit`, and `exit`.

### I locked myself out with the firewall

Use the VM console, which the firewall does not affect.

- Ubuntu: `sudo ufw disable`, or `sudo nft flush ruleset` for raw nftables rules.
- Rocky: `sudo firewall-cmd --reload` drops runtime-only changes. `sudo firewall-cmd --permanent --add-service=ssh` followed by `sudo firewall-cmd --reload` restores SSH access.

### SELinux blocks something and I do not know why

On rocky-lab:

```bash
sudo ausearch -m AVC -ts recent      # recent denials
sudo sealert -a /var/log/audit/audit.log | less
```

`sealert` (package `setroubleshoot-server`) explains each denial and suggests a fix. Switching to permissive mode with `sudo setenforce 0` is fine for a quick test, but always switch back with `sudo setenforce 1` and fix the real cause. Labs 3.3 and 5.4 teach this.

### The VM is very slow or runs out of memory

- Give the VM more RAM in the hypervisor (power it off first).
- Check memory with `free -h` and the biggest processes with `top`, sorted by memory (press **M**).
- Labs that install k3s (4.1) or run nested VMs (1.7) need the full 4 GB. Stop other lab services first (`sudo systemctl stop ...`).
- Running out of disk space? `df -h` shows usage. `sudo apt clean`, `sudo journalctl --vacuum-size=100M`, and `docker system prune -a` (if you did Lab 2.6) free space quickly.

### Nested virtualization does not work (Lab 1.7)

If `grep -cE 'vmx|svm' /proc/cpuinfo` prints `0`, the labs use QEMU software emulation instead (`--virt-type qemu`). It is slower but every command works. On Windows hosts, VirtualBox may not offer nested virtualization while Hyper-V or "Virtual Machine Platform" is enabled. In that case, use emulation.

### Time is wrong in the VM

Wrong time breaks TLS certificates, package downloads, and Kerberos. Check with `timedatectl`. `System clock synchronized: yes` is what you want. If it says `no`, check the time service: `systemctl status systemd-timesyncd` or `chronyd` on Ubuntu, or `chronyc tracking` on Rocky.
