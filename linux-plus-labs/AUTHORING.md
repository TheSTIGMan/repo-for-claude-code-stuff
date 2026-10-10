# Authoring guide for the Linux+ XK0-006 Lab Book

Every lab file in `labs/` follows this guide exactly. The build script and validator depend on it.

## Audience and voice
- Complete beginners preparing for CompTIA Linux+ XK0-006. Assume they can start a VM and type commands, nothing more.
- Plain, simple English. Short sentences. Define every term the first time it appears.
- Explain **every** command: what it does, what each important option means, and how to read the output.
- Friendly, direct, second person ("you"). No fluff, no jokes that waste space.
- Technical accuracy is critical: commands must work exactly as written on **Ubuntu Server 24.04 LTS** (and **Rocky Linux 9** where noted). If a command needs a package, install it in the lab first (`sudo apt install -y ...` / `sudo dnf install -y ...`). Ubuntu 24.04 facts to respect: netplan + systemd-networkd on server, systemd-resolved (resolv.conf is a stub at 127.0.0.53), `ufw` (inactive by default) on top of nftables, AppArmor (not SELinux), initramfs-tools (`update-initramfs`), `update-grub`, user creation with `adduser` (Debian helper) or `useradd`, `apt`/`dpkg`, chrony is the default NTP client, Python 3.12, `docker.io` and `podman` available in the archive, `sudo` group for admins. Rocky 9: dnf, rpm, SELinux enforcing, firewalld active, `wheel` group, dracut, `grub2-mkconfig`, chronyd.

## Lab environment (set up in Lab 0; every lab can rely on this)
| | ubuntu-lab | rocky-lab |
|---|---|---|
| OS | Ubuntu Server 24.04 LTS (minimal not required) | Rocky Linux 9 (minimal install) |
| Resources | 2 vCPU, 4 GB RAM, 25 GB OS disk | 1–2 vCPU, 2 GB RAM, 20 GB disk |
| Extra disks | **4 × 5 GB blank disks**, usually `/dev/sdb`, `/dev/sdc`, `/dev/sdd`, `/dev/sde` (may be `vdb`… or `nvme0n2`… — always tell the reader to confirm with `lsblk` first and substitute) | none |
| Example IP | 192.168.100.10 | 192.168.100.20 |
| Admin user | `student` (member of `sudo`) | `student` (member of `wheel`) |

- Both VMs are on the same virtual network with internet access, and each VM's `/etc/hosts` maps `ubuntu-lab` and `rocky-lab`, so labs use the hostnames. Tell the reader to substitute their real IPs wherever an IP appears.
- The OpenSSH server runs on both. SSH key login is **not** set up in Lab 0 (Lab 3.3 teaches it; later labs that need it say "if you have not done Lab 3.3, run `ssh-keygen` and `ssh-copy-id student@rocky-lab` first").
- Lab 0 tells the reader to take a snapshot named **clean** on both VMs. Before any risky lab, say: "Take a snapshot now" (in the lab header and in a warning box before the risky step).
- **Each lab must leave the system clean** for later labs (the Clean up section undoes changes: unmount, remove LVs/VGs/PVs, `wipefs -a` the extra disks, delete lab users, remove test firewall rules, stop/disable lab services). Labs must not depend on state left by other labs, except that tools installed earlier may already be present (always include the install command anyway; apt/dnf will just say "already installed").
- Lab working directory: `~/labs/<id>` (e.g. `mkdir -p ~/labs/1.5 && cd ~/labs/1.5`).

## File format
One Markdown file per lab: `labs/1.1.md` … `labs/5.5.md`. Pandoc Markdown. Structure (headings and section names are **exact** — the validator checks them):

```markdown
## Lab 1.3: Manage Storage {#lab-1-3}

::: labinfo
**Objective:** 1.3 Given a scenario, manage storage in a Linux system.\
**Domain:** 1.0 System Management (23% of the exam)\
**Time:** about 90 minutes\
**VM:** ubuntu-lab\
**Snapshot first:** Yes. This lab partitions and formats disks.
:::

Short 2–3 sentence intro: what you will do and why it matters on the job and on the exam.

### What you'll practice

- Bullet list that names every exam bullet this lab covers (use the exam's own words: "Logical Volume Manager (LVM): pvcreate, vgcreate, lvcreate ...").

### How it works

Plain-English background, 300–900 words. Use analogies. Include a simple ASCII diagram where it helps:

```{.diagram}
 Disks         /dev/sdb      /dev/sdc
                  |             |
 PVs           [ PV ]        [ PV ]
                  \_____  _____/
 VG                 [  labvg  ]
                   /         \
 LVs          [ data ]    [ logs ]
```

### Tasks

#### Task 1: Find your extra disks

1. Step text that says what to do and why.

    ```bash
    lsblk
    ```

    Sample output (keep it realistic and short; mark it as output):

    ```{.output}
    NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
    sda      8:0    0   25G  0 disk
    ...
    ```

    ::: explain
    **What just happened:** explanation of the command, its options, and how to read the output.
    :::

2. Next step...

::: checkpoint
**Checkpoint:** what the reader should see/verify now, with the command to check it.
:::

#### Task 2: ...

(4–9 tasks per lab; each task ends with a checkpoint box.)

::: warning
Use for anything destructive or risky ("This erases /dev/sdb. Double-check the name with lsblk.").
:::

::: tip
Use for shortcuts, good habits, and Ubuntu-vs-Rocky differences.
:::

::: exam
Use for "On the exam..." facts inside tasks (sparingly).
:::

### Challenge

::: challenge
1–3 optional tasks with no step-by-step help, which combine what the lab taught.
:::

### Clean up

Numbered steps (with commands) that undo everything the lab changed.

### Exam corner

- 6–12 bullets of key facts to memorize for this objective.

**Review questions**

1. Question (multiple choice with A–D options, or short answer, or "which command...").
2. ... (4–6 questions)

::: answers
1. **B.** One-sentence explanation.
2. ...
:::
```

### Formatting rules
- Commands go in ```` ```bash ```` blocks, one logical command per line, copy-paste ready. No `$` prompt characters. For commands that must be run on Rocky, put a first-line comment: `# on rocky-lab`. Default is ubuntu-lab.
- Command output goes in ```` ```{.output} ```` blocks. Diagrams in ```` ```{.diagram} ````. Config file contents in ```` ```ini ````, ```` ```yaml ````, ```` ```python ````, ```` ```text ```` etc., always preceded by a sentence naming the file path.
- Writing a file: prefer showing the editor approach once ("open it with `sudo nano /etc/...` and add these lines:") and use heredocs (`cat <<'EOF' | sudo tee /path`) where it saves the reader from typos. Explain heredocs the first time in a lab.
- Keep lines in code blocks under ~90 characters; break long commands with ` \` continuation.
- Indent code blocks and callouts inside numbered list items by 4 spaces so they stay part of the step.
- Use `inline code` for every command, file, option, and value in prose.
- Do NOT use HTML. Do NOT use emoji. Do NOT use level-1 headings (`#`) — the build adds part headings.
- The `::: answers` block must be the **last thing** in the file and must contain a numbered list matching the review questions. The build moves it into the answer-key appendix.
- Things a VM cannot really do (PXE boot, Secure Boot, GPU, IPMI, embedded boards, physical link negotiation…) must still get a hands-on "explore/simulate" step (inspect the relevant files, run the tool and read its output or error, write the config you would use), clearly labeled with a tip box starting "**Explore/simulate:**".

## Coverage
`linux-plus-study/tools/objectives.js` lists required keywords per objective (case-insensitive substrings). Every keyword must appear somewhere in that objective's lab file. Run `python3 tools/validate.py <id>` (e.g. `python3 tools/validate.py 1.3`) until it reports ok for every lab you wrote.

## Length
Aim for 3,000–5,500 words per lab (big objectives like 1.3, 1.5, 2.6, 3.3, 4.1, 4.2 can be longer). Depth and explanation matter more than brevity — this is a teaching book.
