## How to Use This Book {#how-to-use .unnumbered}

This book teaches the CompTIA Linux+ XK0-006 exam objectives by having you **do** them. Every exam objective has its own lab. In each lab you type real commands on real Linux systems, watch what happens, and read an explanation of why it happened. By the end you will have done, at least once, nearly everything the exam asks about.

### Who this book is for

You do not need any Linux experience. You need:

- A computer that can run two virtual machines (VMs) at the same time. In practice that means 8 GB of RAM (16 GB is more comfortable) and about 80 GB of free disk space.
- Virtualization software. Any of these work: VirtualBox (free, all platforms), VMware Workstation Pro or Fusion (free for personal use), Hyper-V (built into Windows Pro), or UTM (macOS on Apple silicon).
- Patience to type commands carefully and read what comes back.

### How the book is organized

- **Lab 0** builds your lab: an Ubuntu Server 24.04 LTS VM named `ubuntu-lab` and a Rocky Linux 9 VM named `rocky-lab`. Do this first.
- **Parts 1 to 5** match the five exam domains. Each part has one lab per exam objective, numbered the same way as the objective. Lab 2.4, for example, covers objective 2.4.
- **The appendices** contain the answers to every review question, a coverage map that shows where each exam topic is practiced, and the official acronym list.

You can do the labs in order, which is the easiest path, or jump to the objective you want to study. Every lab cleans up after itself, so labs do not depend on each other.

### What is inside every lab

| Section | What it gives you |
|---|---|
| Lab header | The official objective, exam weight, time needed, which VM to use, and whether to take a snapshot first. |
| What you'll practice | The exam topics this lab covers, in the exam's own words. |
| How it works | A plain-English explanation of the concepts before you touch the keyboard. |
| Tasks | Numbered, step-by-step instructions. Each command is followed by sample output and a **What just happened** box. |
| Checkpoints | Quick checks that prove each task worked before you move on. |
| Challenge | Optional extra tasks with no step-by-step help, to test yourself. |
| Clean up | Steps that undo the lab's changes so the next lab starts fresh. |
| Exam corner | The facts to memorize and review questions. Answers are in Appendix A. |

### Conventions

Commands you type are shown in code blocks like this. Type them exactly, or copy and paste them:

```bash
lsblk
```

Commands run on **ubuntu-lab** unless the first line of the block says otherwise:

```bash
# on rocky-lab
sudo dnf install -y httpd
```

Output that the computer prints back is shown in a shaded block. Your output will differ in small details such as dates, sizes, process IDs, and IP addresses. That is normal.

```{.output}
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda      8:0    0   25G  0 disk
```

Inside commands, words in CAPITALS such as `ROCKY_IP` are placeholders. Replace them with your own values.

The boxes in the text mean:

::: explain
**What just happened:** explains the command you just ran and how to read its output.
:::

::: tip
A shortcut, a good habit, or a difference between Ubuntu and Rocky Linux.
:::

::: warning
Something that can break your VM or lose data. Read it before you continue.
:::

::: checkpoint
**Checkpoint:** a quick test that proves the task worked.
:::

::: exam
A fact that is likely to appear on the exam.
:::

### Safety rules

1. **Never do these labs on a computer you care about.** Use only the lab VMs.
2. **Take snapshots.** A snapshot saves the whole state of a VM so you can roll back in seconds. Take one called `clean` at the end of Lab 0, and take another whenever a lab header says "Snapshot first: Yes". If something goes wrong, restore the snapshot and start the lab again.
3. **Keep a second session open** when you change SSH, firewall, sudo, or login settings. If your change locks you out, the open session lets you undo it. The VM console in your virtualization software always works as a last resort.
4. **Read before you press Enter**, especially for commands that start with `sudo`, `rm`, `dd`, `mkfs`, `wipefs`, or `fdisk`.

### A note on the exam

Linux+ XK0-006 has up to 90 questions, both multiple-choice and performance-based, and you get 90 minutes. Performance-based questions put you in front of a simulated terminal or configuration screen and ask you to complete a task. The hands-on practice in this book is designed for exactly that kind of question.

This is an unofficial study guide. CompTIA and Linux+ are trademarks of CompTIA, Inc. The objective titles are quoted from the official CompTIA Linux+ XK0-006 Exam Objectives, version 5.0.
