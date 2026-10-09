// Domain 4: Automation, Orchestration, and Scripting (objectives 4.1 - 4.5)
window.LINUX_PLUS_DATA.objectives.push(
  {
    id: "4.1", domain: 4,
    title: "Summarize the use cases and techniques of automation and orchestration in a Linux environment.",
    summary: "This objective is about letting tools do repetitive setup work for you. You describe servers, containers, and pipelines in files (infrastructure as code), and tools like Ansible, Puppet, OpenTofu, Kubernetes, and Docker build and keep them that way. Automation means fewer typos, faster builds, and systems that are easy to repeat.",
    topics: [
      {
        name: "Infrastructure as code (IaC) basics",
        explain: "Infrastructure as code means you describe your servers and settings in text files instead of clicking or typing commands by hand. The files live in version control, so you can review, repeat, and roll back changes. Many IaC tools are idempotent: running them twice gives the same result, because they only change what is different from the desired state. Some tools are declarative (you say WHAT you want) rather than step-by-step (HOW to do it).",
        examples: [
          { cmd: "git log --oneline playbooks/site.yml", what: "Because IaC is just text, you can see the full change history of your infrastructure with Git." }
        ],
        tip: "IaC = repeatable, versioned, reviewable infrastructure. Think 'the server is described by a file.'"
      },
      {
        name: "Ansible: agentless, inventory, ad hoc commands",
        explain: "Ansible is an agentless automation tool: nothing has to be installed on the managed hosts. It connects over SSH (and needs Python on the target for most modules). The inventory is a file that lists your hosts and groups them (for example [web] and [db]). An ad hoc command is a quick one-line task run with the `ansible` command, without writing a playbook.",
        examples: [
          { cmd: "[web]\nweb1.example.com\nweb2.example.com\n\n[db]\ndb1.example.com ansible_user=admin", what: "A simple INI inventory file with two groups. Host variables like ansible_user can be set per host." },
          { cmd: "ansible all -i inventory.ini -m ping", what: "Ad hoc command: checks that Ansible can reach every host in the inventory (ping module, not ICMP ping)." },
          { cmd: "ansible web -i inventory.ini -b -m ansible.builtin.dnf -a \"name=httpd state=present\"", what: "Ad hoc command that installs httpd on the web group. -b means become (sudo)." }
        ],
        tip: "Agentless = Ansible. It pushes over SSH; no daemon on the clients."
      },
      {
        name: "Ansible: playbooks, modules, collections, facts",
        explain: "A playbook is a YAML file that lists plays and tasks to run on hosts, in order. Each task calls a module, which is a small unit of work like installing a package (dnf), copying a file (copy), or managing a service (service). Collections are bundles of modules, roles, and plugins that you install from Ansible Galaxy, such as community.general. Facts are details Ansible gathers about each host automatically (OS, IP addresses, memory), stored in variables like ansible_facts.",
        examples: [
          { cmd: "- name: Set up web servers\n  hosts: web\n  become: true\n  tasks:\n    - name: Install nginx\n      ansible.builtin.package:\n        name: nginx\n        state: present\n    - name: Start nginx\n      ansible.builtin.service:\n        name: nginx\n        state: started\n        enabled: true", what: "A small playbook: installs and starts nginx on the web group using two modules." },
          { cmd: "ansible-playbook -i inventory.ini site.yml --check", what: "Runs the playbook in check (dry run) mode to show what would change without changing it." },
          { cmd: "ansible-galaxy collection install community.general", what: "Installs a collection of extra modules from Ansible Galaxy." },
          { cmd: "ansible web1.example.com -i inventory.ini -m setup -a \"filter=ansible_distribution*\"", what: "Uses the setup module to show gathered facts about the host's Linux distribution." }
        ],
        tip: "Playbook = YAML recipe. Module = one tool. Collection = a box of tools. Facts = what Ansible learns about the host."
      },
      {
        name: "Puppet: classes, modules, facts, certificates, agent/agentless",
        explain: "Puppet is another configuration management tool. It is usually agent-based: a puppet agent runs on each node and regularly pulls its configuration (a catalog) from the Puppet server. Agents and the server trust each other with SSL certificates; a new agent sends a certificate request that the server must sign. Code is written in manifests (.pp files); a class is a named group of resources, and a module packages classes, files, and templates together. Facter collects facts about each node. Puppet can also run agentless with `puppet apply` locally or with Puppet Bolt over SSH.",
        examples: [
          { cmd: "class ntp {\n  package { 'chrony': ensure => installed }\n  service { 'chronyd': ensure => running, enable => true }\n}", what: "A Puppet class that makes sure chrony is installed and chronyd is running." },
          { cmd: "sudo puppetserver ca list\nsudo puppetserver ca sign --certname web1.example.com", what: "On the Puppet server: list pending certificate requests, then sign the one from web1." },
          { cmd: "sudo puppet agent --test", what: "On a node: contact the server now, fetch the catalog, and apply it (shows changes)." },
          { cmd: "facter os.family", what: "Shows a single fact gathered by Facter, such as RedHat or Debian." },
          { cmd: "puppet module install puppetlabs-stdlib", what: "Installs a Puppet module from the Puppet Forge." }
        ],
        tip: "Puppet = agent + certificates (pull model). Ansible = agentless (push over SSH)."
      },
      {
        name: "OpenTofu: providers, resources, state, API",
        explain: "OpenTofu is an open-source fork of Terraform used to build infrastructure such as cloud VMs, networks, and DNS records. A provider is a plugin that knows how to talk to a platform's API (AWS, Azure, libvirt, etc.). A resource is one thing you want to exist, like a VM. OpenTofu keeps a state file that records what it has built, so it can work out what to add, change, or delete next time. Files use HCL and end in .tf.",
        examples: [
          { cmd: "provider \"aws\" {\n  region = \"us-east-1\"\n}\n\nresource \"aws_instance\" \"web\" {\n  ami           = \"ami-0abc1234\"\n  instance_type = \"t3.micro\"\n}", what: "Declares the AWS provider and one VM resource named web." },
          { cmd: "tofu init\ntofu plan\ntofu apply", what: "init downloads providers, plan previews changes, apply makes them through the provider's API." },
          { cmd: "tofu state list", what: "Lists the resources recorded in the state file." },
          { cmd: "tofu destroy", what: "Deletes everything this configuration created." }
        ],
        tip: "Provider talks to the API, resource is the thing, state remembers what exists."
      },
      {
        name: "Unattended deployment: Kickstart and cloud-init",
        explain: "Unattended deployment means installing or setting up systems with no one answering prompts. Kickstart is used by RHEL-family installers (Anaconda): a ks.cfg file answers every install question (disk layout, packages, users). After a manual install, a sample is saved as /root/anaconda-ks.cfg. Cloud-init runs on the first boot of cloud VMs and images; it reads user-data (often a #cloud-config YAML file) to set hostnames, create users, add SSH keys, install packages, and run commands.",
        examples: [
          { cmd: "inst.ks=http://192.168.1.10/ks.cfg", what: "Boot option that tells the RHEL installer to fetch and use a Kickstart file." },
          { cmd: "lang en_US.UTF-8\nkeyboard us\ntimezone America/New_York\nrootpw --lock\nautopart\n%packages\n@^minimal-environment\n%end", what: "Pieces of a Kickstart file that answer the installer's questions automatically." },
          { cmd: "#cloud-config\nhostname: web1\nusers:\n  - name: admin\n    ssh_authorized_keys:\n      - ssh-ed25519 AAAA... admin@laptop\npackages:\n  - nginx\nruncmd:\n  - systemctl enable --now nginx", what: "cloud-init user-data: sets hostname, adds a user with an SSH key, installs and starts nginx." },
          { cmd: "cloud-init status --long", what: "Shows whether cloud-init finished and if there were errors." }
        ],
        tip: "Kickstart = installer answers (RHEL). Cloud-init = first-boot setup for cloud images."
      },
      {
        name: "CI/CD: version control, pipelines, shift left, GitOps, DevSecOps",
        explain: "CI/CD stands for Continuous Integration and Continuous Delivery/Deployment. Everything starts with version control (usually Git). A pipeline is an automated series of stages, such as build, test, scan, and deploy, that runs on every commit. Shift left testing means testing earlier in the process (on the left of the timeline), so bugs are cheaper to fix. GitOps means the Git repository is the single source of truth: tools watch the repo and make the live system match it. DevSecOps adds security checks (code scanning, dependency checks, secrets detection) into every stage instead of at the end.",
        examples: [
          { cmd: "stages:\n  - build\n  - test\n  - deploy\n\ntest:\n  stage: test\n  script:\n    - shellcheck scripts/*.sh\n    - pytest", what: "A simple pipeline file (GitLab CI style). Linting and tests run automatically before deploy." },
          { cmd: "git push origin main", what: "In GitOps, pushing a change to the repo is what triggers the deployment." }
        ],
        tip: "Shift left = test early. GitOps = Git is the source of truth. DevSecOps = security in every step."
      },
      {
        name: "Kubernetes: Pods, Deployments, Services, ConfigMaps, Secrets, Volumes, variables",
        explain: "Kubernetes (k8s) orchestrates containers across many nodes. A Pod is the smallest unit: one or more containers that share network and storage. A Deployment keeps a set number of identical Pods running and handles rolling updates. A Service gives Pods a stable name and IP and load-balances traffic to them. A ConfigMap holds plain configuration data; a Secret holds sensitive data like passwords (base64 encoded, not encrypted by default). Volumes give Pods storage that can outlive a container restart, and environment variables pass settings (often from ConfigMaps or Secrets) into containers.",
        examples: [
          { cmd: "kubectl create deployment web --image=nginx --replicas=3\nkubectl expose deployment web --port=80 --type=ClusterIP", what: "Creates a Deployment of 3 nginx Pods, then a Service in front of them." },
          { cmd: "kubectl create configmap app-config --from-literal=LOG_LEVEL=debug\nkubectl create secret generic db-pass --from-literal=password=S3cret", what: "Creates a ConfigMap and a Secret." },
          { cmd: "containers:\n  - name: app\n    image: myapp:1.0\n    env:\n      - name: LOG_LEVEL\n        valueFrom:\n          configMapKeyRef:\n            name: app-config\n            key: LOG_LEVEL\n    volumeMounts:\n      - name: data\n        mountPath: /data\nvolumes:\n  - name: data\n    persistentVolumeClaim:\n      claimName: data-pvc", what: "Part of a Pod spec: an environment variable from a ConfigMap, and a volume mounted at /data." },
          { cmd: "kubectl get pods\nkubectl apply -f deployment.yaml", what: "List Pods, and create or update objects from a YAML file." }
        ],
        tip: "Pod = container wrapper. Deployment = keeps N Pods alive. Service = stable address. ConfigMap = config, Secret = sensitive config."
      },
      {
        name: "Docker Swarm: services, nodes, tasks, networks, scale",
        explain: "Docker Swarm is Docker's built-in clustering mode. Nodes are the machines in the swarm: managers make decisions, workers run containers. A service describes what you want to run (image, ports, replicas). Each running container of a service is called a task. Overlay networks let containers on different nodes talk to each other. You can scale a service up or down by changing its number of replicas.",
        examples: [
          { cmd: "docker swarm init\ndocker node ls", what: "Turns this host into a swarm manager, then lists the nodes in the swarm." },
          { cmd: "docker network create -d overlay appnet\ndocker service create --name web --replicas 3 --network appnet -p 80:80 nginx", what: "Creates an overlay network and a service with 3 replicas attached to it." },
          { cmd: "docker service ps web", what: "Shows the tasks (containers) of the web service and which node each runs on." },
          { cmd: "docker service scale web=5", what: "Scales the web service to 5 replicas." }
        ],
        tip: "Swarm: service = desired app, task = one container of it, node = a machine."
      },
      {
        name: "Docker/Podman Compose: compose file, up/down, logs",
        explain: "Compose runs multi-container apps on a single host from one YAML compose file (compose.yaml or docker-compose.yml). The file lists services, their images, ports, volumes, and networks. `docker compose up` creates and starts everything; `down` stops and removes the containers and networks. `logs` shows the output of the services. Podman offers the same idea with `podman compose` or `podman-compose`.",
        examples: [
          { cmd: "services:\n  web:\n    image: nginx\n    ports:\n      - \"8080:80\"\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: example\n    volumes:\n      - dbdata:/var/lib/postgresql/data\nvolumes:\n  dbdata:", what: "A compose file with a web and a db service and a named volume." },
          { cmd: "docker compose up -d", what: "Starts all services in the background (detached)." },
          { cmd: "docker compose logs -f web", what: "Follows the logs of the web service." },
          { cmd: "docker compose down\npodman-compose up -d", what: "Stops and removes the app; the second line is the Podman equivalent of up." }
        ],
        tip: "Compose = one host, many containers. Swarm/Kubernetes = many hosts."
      }
    ],
    cards: [
      { q: "Which automation tool is agentless and connects to hosts over SSH?", a: "Ansible. It needs no agent on managed hosts, only SSH access (and usually Python)." },
      { q: "In Ansible, what is the inventory?", a: "A file (INI or YAML) that lists managed hosts and groups them, optionally with variables." },
      { q: "What does `ansible all -m ping` do?", a: "Runs an ad hoc command using the ping module to test that Ansible can connect to and run Python on every host." },
      { q: "How does a new Puppet agent become trusted by the Puppet server?", a: "It sends a certificate request; an admin signs it on the server, e.g. `puppetserver ca sign --certname host`." },
      { q: "In OpenTofu, what is the purpose of the state file?", a: "It records the real resources OpenTofu has created so it can compare them to the configuration and plan changes." },
      { q: "In OpenTofu, what is a provider?", a: "A plugin that talks to a platform's API (like AWS or Azure) so OpenTofu can create resources there." },
      { q: "Which tool automates RHEL installs by answering installer questions from a file?", a: "Kickstart (a ks.cfg file, referenced with a boot option like inst.ks=)." },
      { q: "A cloud VM must create a user and install packages on first boot. Which tool?", a: "cloud-init, using #cloud-config user-data." },
      { q: "What is 'shift left' testing?", a: "Moving testing earlier in the development process so problems are found sooner and cheaper." },
      { q: "What is GitOps?", a: "A practice where a Git repository is the single source of truth and automation makes live systems match what is in Git." },
      { q: "Kubernetes: which object stores passwords, and which stores non-sensitive config?", a: "A Secret stores sensitive data; a ConfigMap stores plain configuration." },
      { q: "In Docker Swarm, how do you run 5 copies of the service 'web'?", a: "`docker service scale web=5`" },
      { q: "Which command stops and removes all containers started from a compose file?", a: "`docker compose down` (or `podman-compose down`)." }
    ]
  },

  {
    id: "4.2", domain: 4,
    title: "Given a scenario, perform automated tasks using shell scripting.",
    summary: "Shell scripts let you save a list of commands and run them again any time. This objective covers the building blocks of Bash scripts: variables, expansion, tests and comparisons, if/case, loops, functions, and return codes. Expect to read short scripts on the exam and say what they do or print.",
    topics: [
      {
        name: "Interpreter directive (#!)",
        explain: "The first line of a script, starting with #! (called a shebang), tells the system which program should run the script. Without it, the script runs in whatever shell you call it from. The script also needs execute permission to run as ./script.sh.",
        examples: [
          { cmd: "#!/bin/bash", what: "Run this script with Bash." },
          { cmd: "#!/usr/bin/env python3", what: "Find python3 in the PATH and run the script with it." },
          { cmd: "chmod +x backup.sh\n./backup.sh", what: "Make the script executable, then run it." }
        ],
        tip: "#! must be the very first line, first two characters."
      },
      {
        name: "Variables and assignments: environment, export, local, set, unset, alias",
        explain: "Assign a variable with no spaces around the = sign: name=value. Environment variables (like PATH, HOME, USER) are passed to child processes; `export` turns a normal shell variable into an environment variable. `local` makes a variable exist only inside a function. `unset` deletes a variable. `set` with no arguments lists shell variables and functions; it also sets options like `set -e` (stop on error) and `set -x` (print each command). `alias` creates a shortcut name for a command and `unalias` removes it.",
        examples: [
          { cmd: "name=\"world\"\necho \"Hello $name\"", what: "Assigns a variable and uses it. Prints: Hello world" },
          { cmd: "export BACKUP_DIR=/srv/backup\nenv | grep BACKUP", what: "Exports a variable so child processes see it, then shows it in the environment." },
          { cmd: "set -euo pipefail", what: "Common safe-script setting: exit on errors, on unset variables, and on failures inside pipes." },
          { cmd: "alias ll='ls -l'\nunalias ll\nunset name", what: "Creates an alias, removes it, then deletes the variable name." }
        ],
        tip: "No spaces: x=5 works, x = 5 fails (Bash thinks x is a command)."
      },
      {
        name: "Arguments ($1, $@, $#) and return codes ($?)",
        explain: "Scripts can take arguments. $1, $2, and so on are the first, second argument; $0 is the script name. $@ is all arguments (use \"$@\" to keep each one separate) and $# is how many there are. Every command returns an exit status: 0 means success, anything else means failure. $? holds the return code of the last command. Use `exit N` in a script and `return N` in a function to set it.",
        examples: [
          { cmd: "#!/bin/bash\necho \"Script: $0\"\necho \"First: $1\"\necho \"Count: $#\"\nfor a in \"$@\"; do echo \"Arg: $a\"; done", what: "Running ./args.sh red blue prints the script name, First: red, Count: 2, then each argument." },
          { cmd: "grep -q root /etc/passwd\necho $?", what: "Prints 0 because grep found a match. It would print 1 if not found." },
          { cmd: "if [ $# -lt 1 ]; then\n  echo \"Usage: $0 file\" >&2\n  exit 1\nfi", what: "Checks that at least one argument was given; otherwise prints usage and exits with code 1." }
        ],
        tip: "$# = count, $@ = all, $? = last exit code (0 = success)."
      },
      {
        name: "Expansion: parameter expansion, command substitution, subshells",
        explain: "Parameter expansion is how Bash replaces ${var} with the variable's value; braces also allow tricks like default values and trimming. Command substitution runs a command and puts its output in place: $(command) is the modern form, and backticks are the old form. A subshell is a child copy of the shell, created with (commands) in parentheses; changes like cd or variable assignments inside it do not affect the parent shell.",
        examples: [
          { cmd: "file=\"report.txt\"\necho \"${file}_old\"\necho \"${file%.txt}.csv\"\necho \"${USERNAME:-guest}\"\necho \"${#file}\"", what: "Parameter expansion: prints report.txt_old, report.csv, the value of USERNAME or guest if unset, and the length 10." },
          { cmd: "today=$(date +%F)\ntar czf \"backup-$today.tar.gz\" /etc", what: "Command substitution with $( ): puts today's date into the file name." },
          { cmd: "kernel=`uname -r`\necho \"$kernel\"", what: "Command substitution with backticks (older style), same result as $(uname -r)." },
          { cmd: "(cd /tmp && ls)\npwd", what: "Subshell: the cd happens only inside the parentheses, so pwd still shows your original directory." }
        ],
        tip: "${ } = variable value, $( ) = command output, ( ) = subshell."
      },
      {
        name: "Functions",
        explain: "A function is a named block of commands you can call many times. Define it before you use it. Inside, $1, $2 are the function's own arguments. Use `local` for variables that should stay inside the function, and `return` to give back an exit status (0-255). To hand back text, echo it and capture it with command substitution.",
        examples: [
          { cmd: "greet() {\n  local who=\"$1\"\n  echo \"Hello, $who\"\n}\ngreet Linux", what: "Defines a function with a local variable and calls it. Prints: Hello, Linux" },
          { cmd: "is_root() {\n  [ \"$(id -u)\" -eq 0 ]\n}\nif is_root; then echo admin; else echo normal; fi", what: "A function whose return code comes from the test inside it, used directly in an if." },
          { cmd: "function add { echo $(( $1 + $2 )); }\nsum=$(add 2 3)\necho $sum", what: "Another way to define a function. Captures its output; prints 5." }
        ]
      },
      {
        name: "Conditional statements: if and case",
        explain: "`if` runs commands based on whether a test or command succeeds (exit code 0). You can add `elif` and `else`, and you finish with `fi`. `case` compares one value against several patterns and is cleaner than many elifs; each pattern ends with ) and each block ends with ;;, and the whole thing ends with `esac`. The pattern * is the catch-all default.",
        examples: [
          { cmd: "if [ -f /etc/os-release ]; then\n  echo \"found\"\nelif [ -d /etc ]; then\n  echo \"no os-release\"\nelse\n  echo \"strange system\"\nfi", what: "if / elif / else / fi structure." },
          { cmd: "case \"$1\" in\n  start) systemctl start httpd ;;\n  stop)  systemctl stop httpd ;;\n  restart|reload) systemctl restart httpd ;;\n  *) echo \"Usage: $0 {start|stop|restart}\" ;;\nesac", what: "case statement: picks an action based on the first argument; * catches anything else." }
        ],
        tip: "if ends in fi, case ends in esac (the words spelled backward)."
      },
      {
        name: "Loops: for, while, until",
        explain: "A `for` loop runs once for each item in a list. A `while` loop keeps going as long as its condition is true. An `until` loop is the opposite: it keeps going as long as its condition is false, and stops once it becomes true. All loops use do ... done. `break` leaves a loop and `continue` skips to the next round.",
        examples: [
          { cmd: "for host in web1 web2 db1; do\n  ping -c1 -W1 \"$host\" >/dev/null && echo \"$host up\"\ndone", what: "for loop over a list of host names." },
          { cmd: "for i in {1..3}; do echo \"$i\"; done", what: "Prints 1, 2, 3 on separate lines." },
          { cmd: "count=1\nwhile [ $count -le 3 ]; do\n  echo \"Try $count\"\n  count=$((count + 1))\ndone", what: "while loop: runs while count is less than or equal to 3. Prints Try 1, Try 2, Try 3." },
          { cmd: "until ping -c1 -W1 db1 >/dev/null; do\n  echo \"waiting for db1...\"\n  sleep 5\ndone", what: "until loop: keeps waiting until the ping succeeds." },
          { cmd: "while read -r line; do\n  echo \"User: $line\"\ndone < users.txt", what: "Reads a file one line at a time." }
        ],
        tip: "while = repeat while TRUE. until = repeat until TRUE (while false)."
      },
      {
        name: "Test: [ ], [[ ]], file and string tests (! -d -f -n -z)",
        explain: "The `test` command (also written as [ ... ]) checks a condition and returns 0 for true or 1 for false. [[ ... ]] is Bash's improved version that is safer with empty variables and supports patterns and regex. Common tests: -f (is a regular file), -d (is a directory), -n (string is not empty), -z (string is empty). Put ! in front to reverse the result. Always leave spaces inside the brackets.",
        examples: [
          { cmd: "test -d /var/log && echo \"directory exists\"", what: "test -d checks that /var/log is a directory." },
          { cmd: "[ -f /etc/hosts ] && echo \"regular file\"", what: "-f is true for an existing regular file." },
          { cmd: "if [ ! -d /backup ]; then mkdir /backup; fi", what: "! negates: create /backup only if it does NOT exist." },
          { cmd: "[ -z \"$name\" ] && echo \"name is empty\"\n[ -n \"$name\" ] && echo \"name is set\"", what: "-z means zero length (empty); -n means non-empty." }
        ],
        tip: "-z = Zero length. -n = Non-zero. Quote your variables inside [ ]."
      },
      {
        name: "Comparisons: numeric and string",
        explain: "Numbers are compared with letter operators: -eq (equal), -ne (not equal), -gt (greater than), -ge (greater or equal), -lt (less than), -le (less or equal). Strings use symbols: = or == (equal), != (not equal), < and > (sorts before/after alphabetically), and =~ (matches a regular expression, only inside [[ ]]). Inside [ ], escape < and > as \\< and \\> or the shell treats them as redirection. The <= and >= symbols work in arithmetic (( )) for numbers; Bash's [[ ]] has no <= or >= string operator.",
        examples: [
          { cmd: "[ \"$age\" -ge 18 ] && echo adult", what: "Numeric: greater than or equal to 18." },
          { cmd: "[ \"$a\" -eq \"$b\" ]; [ \"$a\" -ne \"$b\" ]; [ \"$a\" -gt 5 ]; [ \"$a\" -lt 5 ]; [ \"$a\" -le 5 ]", what: "The other numeric operators: equal, not equal, greater than, less than, less or equal." },
          { cmd: "[[ \"$USER\" == \"root\" ]] && echo root\n[ \"$shell\" = \"/bin/bash\" ] && echo bash\n[[ \"$os\" != \"Linux\" ]] && echo other", what: "String equal (== or =) and not equal (!=)." },
          { cmd: "[[ \"apple\" < \"banana\" ]] && echo \"apple sorts first\"\n[[ \"zebra\" > \"apple\" ]] && echo \"zebra sorts later\"", what: "String < and > compare alphabetical (sort) order." },
          { cmd: "(( disk_used >= 90 )) && echo \"Disk almost full\"\n(( load <= 2 )) && echo \"Load OK\"", what: "Inside (( )), <= and >= compare numbers (no $ needed on variable names)." }
        ],
        tip: "Letters (-eq, -lt) for numbers; symbols (=, ==, !=) for strings. Using < on numbers in [[ ]] compares them as text!"
      },
      {
        name: "Regular expressions in Bash: [[ $foo =~ regex ]]",
        explain: "Inside [[ ]], the =~ operator checks whether a string matches an extended regular expression. Do not put quotes around the regex, or Bash treats it as plain text. The parts that matched are saved in the BASH_REMATCH array.",
        examples: [
          { cmd: "ip=\"192.168.1.20\"\nif [[ $ip =~ ^([0-9]{1,3}\\.){3}[0-9]{1,3}$ ]]; then\n  echo \"looks like an IPv4 address\"\nfi", what: "Uses a regular expression to check the IPv4 format." },
          { cmd: "file=\"backup-2026-10-09.tar\"\nif [[ $file =~ ([0-9]{4})-([0-9]{2}) ]]; then\n  echo \"Year: ${BASH_REMATCH[1]}\"\nfi", what: "Captures part of the match. Prints: Year: 2026" }
        ],
        tip: "=~ only works in double brackets [[ ]], and the regex stays unquoted."
      },
      {
        name: "IFS and OFS (field separators)",
        explain: "IFS (Internal Field Separator) is the shell variable that decides how Bash splits text into words, for example when using `read` or looping over unquoted variables. By default it is space, tab, and newline. OFS (Output Field Separator) is an awk variable that sets what goes between fields when awk prints them (default is a space). awk's matching input setting is FS, set with -F.",
        examples: [
          { cmd: "while IFS=: read -r user _ uid _; do\n  echo \"$user has UID $uid\"\ndone < /etc/passwd", what: "Sets IFS to a colon for read, so each /etc/passwd line splits into fields." },
          { cmd: "csv=\"red,green,blue\"\nIFS=',' read -ra colors <<< \"$csv\"\necho \"${colors[1]}\"", what: "Splits a comma-separated string into an array. Prints: green" },
          { cmd: "awk -F: 'BEGIN { OFS=\",\" } { print $1, $7 }' /etc/passwd", what: "Reads colon-separated input and prints user name and shell separated by commas using OFS." }
        ],
        tip: "IFS = how input is split (shell). OFS = how output is joined (awk)."
      }
    ],
    cards: [
      { q: "What does the first line `#!/bin/bash` do?", a: "It is the interpreter directive (shebang); it tells the system to run the script with /bin/bash." },
      { q: "Which variable holds the number of arguments passed to a script?", a: "$# (and $@ holds all the arguments, $1 the first one)." },
      { q: "What does `echo $?` show?", a: "The return code (exit status) of the last command. 0 means success; non-zero means an error." },
      { q: "What does this print?\nx=5\nif [ $x -gt 3 ]; then echo big; else echo small; fi", a: "big, because 5 is greater than 3." },
      { q: "What is the difference between `while` and `until` loops?", a: "while repeats as long as the condition is true; until repeats as long as the condition is false (until it becomes true)." },
      { q: "Which test checks that a string is empty? Which checks it is not empty?", a: "-z checks empty (zero length); -n checks non-empty." },
      { q: "How do you check if a variable matches a regex in Bash?", a: "Use [[ $var =~ regex ]] with the regex unquoted, e.g. [[ $ip =~ ^[0-9.]+$ ]]." },
      { q: "What does `export VAR=value` do?", a: "Creates VAR and makes it an environment variable, so child processes and programs started from the shell can see it." },
      { q: "What does this print?\nf=notes.txt\necho ${f%.txt}.md", a: "notes.md. ${f%.txt} removes .txt from the end of the value (parameter expansion)." },
      { q: "Why does `(cd /tmp)` not change your current directory?", a: "The parentheses run the command in a subshell; changes there do not affect the parent shell." },
      { q: "Which keyword makes a variable visible only inside a function?", a: "local, e.g. local count=0" },
      { q: "What is IFS used for?", a: "The Internal Field Separator tells the shell which characters split text into fields/words (default: space, tab, newline)." }
    ]
  },

  {
    id: "4.3", domain: 4,
    title: "Summarize Python basics used for Linux system administration.",
    summary: "Python is a popular language for automating admin tasks that are too complex for a shell script. This objective covers creating virtual environments, installing dependencies with pip, using built-in modules like os and subprocess, the main data types, and writing clean code that follows PEP 8. You need to recognize these basics, not be an expert programmer.",
    topics: [
      {
        name: "Python 3 and running scripts",
        explain: "The current version of Python is Python 3; Python 2 reached end of life in 2020 and should not be used for new work. On most Linux systems you run it as `python3`. A script can start with a shebang line so you can run it directly.",
        examples: [
          { cmd: "python3 --version", what: "Shows the installed Python 3 version, e.g. Python 3.12.3." },
          { cmd: "#!/usr/bin/env python3\nprint(\"Hello from Python\")", what: "A tiny script with a shebang; make it executable with chmod +x and run ./hello.py." }
        ],
        tip: "On the exam, assume Python 3. print is a function: print(\"x\")."
      },
      {
        name: "Virtual environments (python3 -m venv)",
        explain: "A virtual environment (venv) is a private folder with its own Python and its own installed packages. It keeps one project's dependencies from clashing with another's or with the system's Python packages. You create it once, activate it while you work, and deactivate it when done.",
        examples: [
          { cmd: "python3 -m venv .venv", what: "Creates a virtual environment in the .venv folder." },
          { cmd: "source .venv/bin/activate", what: "Activates it; python and pip now use the venv. Your prompt usually shows (.venv)." },
          { cmd: "deactivate", what: "Leaves the virtual environment." }
        ],
        tip: "Use a venv instead of `sudo pip install` so you don't break system packages."
      },
      {
        name: "Installing dependencies (pip install, requirements.txt)",
        explain: "Dependencies are extra packages your code needs. pip is Python's package installer and downloads packages from PyPI. A requirements.txt file lists the packages (and often exact versions) a project needs, so anyone can install the same set with one command.",
        examples: [
          { cmd: "pip install requests", what: "Installs the requests package into the active environment." },
          { cmd: "pip install -r requirements.txt", what: "Installs every dependency listed in requirements.txt." },
          { cmd: "pip freeze > requirements.txt", what: "Saves the currently installed packages and versions to requirements.txt." },
          { cmd: "requests==2.32.3\nPyYAML>=6.0", what: "Example contents of a requirements.txt file." }
        ]
      },
      {
        name: "Built-in modules: os, sys, subprocess, pathlib, json",
        explain: "Built-in modules come with Python (the standard library); you only need to import them. os talks to the operating system (environment variables, files, users). sys gives access to the interpreter, like command-line arguments (sys.argv) and exiting (sys.exit). subprocess runs other Linux commands. pathlib handles file paths in an easy, object-oriented way. json reads and writes JSON data. Others you may see: shutil (copy files), re (regex), logging, argparse.",
        examples: [
          { cmd: "import os\nprint(os.getenv(\"HOME\"))\nprint(os.listdir(\"/etc\")[:5])", what: "os: reads an environment variable and lists files in /etc." },
          { cmd: "import sys\nif len(sys.argv) < 2:\n    print(\"Usage: script.py NAME\")\n    sys.exit(1)", what: "sys: checks command-line arguments and exits with code 1." },
          { cmd: "import subprocess\nresult = subprocess.run([\"df\", \"-h\"], capture_output=True, text=True)\nprint(result.stdout)\nprint(result.returncode)", what: "subprocess: runs df -h, captures its output and its return code." },
          { cmd: "from pathlib import Path\nfor p in Path(\"/var/log\").glob(\"*.log\"):\n    print(p.name, p.stat().st_size)", what: "pathlib: lists .log files and their sizes." },
          { cmd: "import json\nwith open(\"config.json\") as f:\n    cfg = json.load(f)\nprint(cfg[\"hostname\"])", what: "json: loads a JSON file into a dictionary." }
        ],
        tip: "Run Linux commands from Python with subprocess.run([...])."
      },
      {
        name: "Indentation",
        explain: "Python uses indentation (spaces at the start of a line) to mark blocks of code, instead of braces or keywords like fi and done. Every line in a block must be indented the same amount. Wrong indentation causes an IndentationError or changes what the code does. The standard is 4 spaces per level.",
        examples: [
          { cmd: "for user in [\"alice\", \"bob\"]:\n    if user == \"alice\":\n        print(\"admin:\", user)\n    else:\n        print(\"user:\", user)", what: "The indented lines belong to the for loop and the if/else. Prints admin: alice, then user: bob." }
        ],
        tip: "A colon (:) at the end of a line means 'indent the next lines.'"
      },
      {
        name: "Data types and structures",
        explain: "Python's basic data types: integer (int) for whole numbers, floating point (float) for decimals, string (str) for text, and Boolean (bool) for True or False. Data structures hold several values: a list is an ordered, changeable collection in square brackets; a dictionary (dict) stores key-value pairs in curly braces. Use type() to see a value's type.",
        examples: [
          { cmd: "count = 42          # integer (int)\nload = 0.75         # floating point (float)\nhost = \"web1\"       # string (str)\nis_up = True        # Boolean (bool)", what: "One variable of each basic type." },
          { cmd: "servers = [\"web1\", \"web2\", \"db1\"]\nservers.append(\"db2\")\nprint(servers[0], len(servers))", what: "A list: ordered, indexed from 0. Prints: web1 4" },
          { cmd: "user = {\"name\": \"alice\", \"uid\": 1001, \"shell\": \"/bin/bash\"}\nprint(user[\"uid\"])\nfor key, value in user.items():\n    print(key, value)", what: "A dictionary of key-value pairs. Prints 1001, then each key and value." },
          { cmd: "print(type(3.14))\nprint(int(\"10\") + 5)\nprint(7 / 2, 7 // 2)", what: "Prints the float class, then 15, then 3.5 3 (/ gives a float; // is whole-number division)." }
        ],
        tip: "[ ] = list, { key: value } = dictionary, True/False = Boolean (capital letters)."
      },
      {
        name: "Extending Python with modules and packages",
        explain: "Python is extensible: you add features by importing modules and packages. A module is a single .py file; a package is a folder of modules. You can use the standard library, install third-party packages with pip (like requests or PyYAML), or write your own module and import it.",
        examples: [
          { cmd: "# helpers.py\ndef disk_ok(percent):\n    return percent < 90\n\n# main.py\nfrom helpers import disk_ok\nprint(disk_ok(75))", what: "Your own module: main.py imports a function from helpers.py. Prints True." },
          { cmd: "import yaml   # from the PyYAML package (pip install PyYAML)\ndata = yaml.safe_load(open(\"inventory.yml\"))", what: "Uses a third-party package installed with pip." }
        ]
      },
      {
        name: "PEP 8 best practices",
        explain: "PEP 8 is the official style guide for Python code. It makes code easier for everyone to read. Key rules: 4 spaces per indentation level (no tabs), lines up to 79 characters, snake_case for variable and function names, CapWords for class names, UPPER_CASE for constants, imports at the top of the file, and blank lines between functions. Tools like flake8, pycodestyle, or black check or fix style.",
        examples: [
          { cmd: "MAX_RETRIES = 3\n\n\ndef check_service(service_name):\n    \"\"\"Return True if the service is active.\"\"\"\n    return service_name != \"\"", what: "PEP 8 style: UPPER_CASE constant, two blank lines before a function, snake_case names, 4-space indent, a docstring." },
          { cmd: "flake8 myscript.py", what: "Lints the script and reports PEP 8 style problems." }
        ],
        tip: "PEP 8 = Python style guide. Remember: 4 spaces, snake_case, 79 characters."
      }
    ],
    cards: [
      { q: "Which command creates a Python virtual environment in a folder called venv?", a: "`python3 -m venv venv`, then activate it with `source venv/bin/activate`." },
      { q: "How do you install all packages listed in requirements.txt?", a: "`pip install -r requirements.txt`" },
      { q: "Which built-in module is used to run Linux commands from Python?", a: "subprocess, e.g. subprocess.run([\"ls\", \"-l\"])." },
      { q: "Which module gives access to command-line arguments via argv?", a: "sys (sys.argv is a list; sys.argv[0] is the script name)." },
      { q: "What is PEP 8?", a: "The official Python style guide: 4-space indentation, snake_case names, max 79-character lines, and other readability rules." },
      { q: "What data type is 3.14 in Python? What is 42?", a: "3.14 is a float (floating point); 42 is an int (integer)." },
      { q: "What is the difference between a list and a dictionary?", a: "A list is an ordered collection accessed by index, e.g. [\"a\", \"b\"]. A dictionary stores key-value pairs accessed by key, e.g. {\"name\": \"alice\"}." },
      { q: "What does Python use to define code blocks?", a: "Indentation (whitespace). Lines in the same block must be indented equally, normally 4 spaces." },
      { q: "What does this print?\nnums = [1, 2, 3]\nprint(len(nums) > 2)", a: "True (a Boolean), because the list has 3 items." },
      { q: "Which Python version should be used for new admin scripts?", a: "Python 3. Python 2 is end of life." }
    ]
  },

  {
    id: "4.4", domain: 4,
    title: "Given a scenario, implement version control using Git.",
    summary: "Git tracks changes to files over time, so you can see who changed what, undo mistakes, and work with others. This objective covers the everyday Git commands: creating and cloning repositories, staging and committing, branching and merging, syncing with remotes, and fixing mistakes. Scenario questions will ask which command fits a situation.",
    topics: [
      {
        name: "Setting up: git config, git init, git clone",
        explain: "`git config` sets options such as your name and email, which are stored in every commit. Use --global for all your repos. `git init` turns the current folder into a new, empty Git repository (it creates a hidden .git folder). `git clone` copies an existing remote repository, with its full history, to your machine.",
        examples: [
          { cmd: "git config --global user.name \"Alex Admin\"\ngit config --global user.email \"alex@example.com\"", what: "Sets your identity for all repositories." },
          { cmd: "git config --list", what: "Shows all current Git settings." },
          { cmd: "mkdir scripts && cd scripts\ngit init", what: "Creates a new local repository." },
          { cmd: "git clone https://github.com/example/ansible-roles.git", what: "Downloads a copy of a remote repository into a new folder." }
        ]
      },
      {
        name: "Saving work: git add, git commit, .gitignore",
        explain: "Git has three areas: the working directory (your files), the staging area (what will go into the next commit), and the repository (saved commits). `git add` moves changes into the staging area. `git commit` saves the staged changes as a snapshot with a message. A .gitignore file lists files and patterns Git should not track, such as logs, secrets, or virtual environments. `git status` shows what is changed and staged.",
        examples: [
          { cmd: "git status\ngit add backup.sh\ngit add .", what: "Check status, stage one file, then stage all changes in the folder." },
          { cmd: "git commit -m \"Add nightly backup script\"", what: "Saves the staged changes as a commit with a message." },
          { cmd: "*.log\n.venv/\n__pycache__/\nsecrets.env", what: "Example .gitignore: ignore log files, the Python venv, cache folders, and a secrets file." }
        ],
        tip: "Edit, git add (stage), git commit (save). .gitignore keeps junk and secrets out."
      },
      {
        name: "Looking at history and changes: git log, git diff",
        explain: "`git log` shows the list of commits with their IDs (hashes), authors, dates, and messages. `git diff` shows the exact lines that changed. With no options it compares your working files to the staging area; --staged compares staged changes to the last commit.",
        examples: [
          { cmd: "git log --oneline --graph --all", what: "Compact history with a branch graph." },
          { cmd: "git diff\ngit diff --staged", what: "Unstaged changes, then changes that are staged for commit." },
          { cmd: "git diff main feature-x", what: "Shows differences between two branches." }
        ]
      },
      {
        name: "Branches: git branch, git checkout",
        explain: "A branch is a separate line of work, so you can try changes without touching the main code. `git branch` lists, creates, or deletes branches. `git checkout` switches to another branch (or restores files); `git checkout -b` creates and switches in one step. Newer Git also has `git switch` for changing branches.",
        examples: [
          { cmd: "git branch\ngit branch feature-firewall", what: "Lists branches, then creates a new one." },
          { cmd: "git checkout feature-firewall", what: "Switches to the feature-firewall branch." },
          { cmd: "git checkout -b hotfix-dns", what: "Creates a new branch and switches to it." },
          { cmd: "git branch -d feature-firewall", what: "Deletes a branch that has been merged." }
        ]
      },
      {
        name: "Combining work: git merge, git merge --squash, git rebase",
        explain: "`git merge` joins another branch's commits into your current branch, often creating a merge commit. `git merge --squash` takes all of a branch's changes and stages them as one change, so you make a single clean commit. `git rebase` moves your commits so they sit on top of another branch, giving a straight, linear history. Do not rebase commits that others already pulled, because it rewrites history.",
        examples: [
          { cmd: "git checkout main\ngit merge feature-firewall", what: "Merges the feature branch into main." },
          { cmd: "git checkout main\ngit merge --squash feature-firewall\ngit commit -m \"Add firewall rules\"", what: "Squash merge: all feature commits become one commit on main." },
          { cmd: "git checkout feature-firewall\ngit rebase main", what: "Replays the feature branch's commits on top of the latest main." }
        ],
        tip: "merge keeps history as it happened; rebase rewrites it into a straight line; --squash makes it one commit."
      },
      {
        name: "Working with remotes: git fetch, git pull, git push",
        explain: "A remote is a shared copy of the repository, usually called origin. `git fetch` downloads new commits from the remote but does not change your files. `git pull` is fetch plus merge (or rebase) into your current branch. `git push` uploads your local commits to the remote.",
        examples: [
          { cmd: "git fetch origin", what: "Downloads updates from origin without merging them." },
          { cmd: "git pull origin main", what: "Fetches and merges the remote main branch into your current branch." },
          { cmd: "git push origin main\ngit push -u origin feature-firewall", what: "Pushes main; the second line pushes a new branch and sets it to track the remote." }
        ],
        tip: "pull = fetch + merge. fetch is the 'safe look' that changes nothing locally."
      },
      {
        name: "Undoing and saving for later: git reset, git stash",
        explain: "`git reset` moves the current branch back to an earlier commit or unstages files. --soft keeps changes staged, --mixed (the default) keeps changes but unstages them, and --hard throws changes away completely. `git stash` saves your uncommitted changes in a temporary area and cleans your working directory, so you can switch tasks; `git stash pop` brings them back.",
        examples: [
          { cmd: "git reset backup.sh", what: "Unstages backup.sh but keeps your edits." },
          { cmd: "git reset --soft HEAD~1", what: "Undoes the last commit but keeps its changes staged." },
          { cmd: "git reset --hard HEAD", what: "Discards all uncommitted changes. Be careful: they are lost." },
          { cmd: "git stash\ngit checkout main\ngit stash list\ngit stash pop", what: "Stash work in progress, switch branch, list stashes, then restore the latest stash." }
        ],
        tip: "Need to switch branches but not ready to commit? git stash."
      },
      {
        name: "Marking releases: git tag",
        explain: "A tag is a named pointer to a specific commit, usually used to mark a release like v1.0. Annotated tags (-a) store a message, author, and date. Tags are not pushed by default; push them explicitly.",
        examples: [
          { cmd: "git tag -a v1.0 -m \"First stable release\"", what: "Creates an annotated tag on the current commit." },
          { cmd: "git tag\ngit push origin v1.0", what: "Lists tags, then pushes the v1.0 tag to the remote." }
        ]
      }
    ],
    cards: [
      { q: "Which command creates a new, empty Git repository in the current directory?", a: "`git init`" },
      { q: "Which command copies a remote repository to your machine?", a: "`git clone URL`" },
      { q: "How do you set the name that appears on your commits?", a: "`git config --global user.name \"Your Name\"` (and user.email for your email)." },
      { q: "What is the difference between `git fetch` and `git pull`?", a: "git fetch downloads remote changes without touching your branch; git pull fetches and then merges them into your current branch." },
      { q: "You need to switch branches but have uncommitted work you're not ready to commit. What do you run?", a: "`git stash` to save it, then later `git stash pop` to restore it." },
      { q: "How do you combine all commits from a feature branch into one commit on main?", a: "On main: `git merge --squash feature`, then `git commit`." },
      { q: "Which file tells Git to ignore files like *.log and secrets?", a: ".gitignore" },
      { q: "What does `git reset --hard HEAD` do?", a: "Throws away all uncommitted changes in tracked files and the staging area, returning to the last commit." },
      { q: "Which command creates and switches to a new branch named test?", a: "`git checkout -b test` (or `git switch -c test`)." },
      { q: "Which command marks the current commit as release v2.0?", a: "`git tag -a v2.0 -m \"Release 2.0\"`, then `git push origin v2.0`." },
      { q: "Which command replays your branch's commits on top of the latest main, for a linear history?", a: "`git rebase main`" },
      { q: "Which commands show what changed and the commit history?", a: "`git diff` shows line changes; `git log` shows the commit history." }
    ]
  },

  {
    id: "4.5", domain: 4,
    title: "Summarize best practices and responsible uses of artificial intelligence (AI).",
    summary: "AI tools such as large language models (LLMs) can write scripts, regexes, and documentation for Linux admins very quickly. But they can be wrong, and what you type into them may leak sensitive data. This objective covers what AI is good for and how to use it safely: review everything, protect data, follow company policy, and write good prompts.",
    topics: [
      {
        name: "Common use cases: generating code, regex, and infrastructure as code",
        explain: "AI assistants can generate Bash or Python scripts, regular expressions, and infrastructure as code (Ansible playbooks, OpenTofu files, Kubernetes YAML, Dockerfiles) from a plain-English request. This saves time, especially for boilerplate. The result is a first draft, not a finished product.",
        examples: [
          { cmd: "Prompt: \"Write a Bash script that deletes files older than 30 days in /var/tmp and logs what it removed.\"\nPossible output: find /var/tmp -type f -mtime +30 -print -delete >> /var/log/cleanup.log", what: "Code generation. You must still check the command (here, test without -delete first)." },
          { cmd: "Prompt: \"Give me a regex for a MAC address like 00:1A:2B:3C:4D:5E\"\nOutput: ^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$", what: "Regular expression generation. Test it against good and bad samples with grep -E." },
          { cmd: "Prompt: \"Create an Ansible playbook that installs chrony and enables it on RHEL 9.\"", what: "Infrastructure as code generation. Run it with --check on a test host first." }
        ]
      },
      {
        name: "Common use cases: documentation, compliance, security review, optimization, linting",
        explain: "AI can document code (add comments, write a README or man-page style help), suggest how to improve compliance with standards like CIS benchmarks or company rules, perform a first-pass security review (spotting hard-coded passwords, unquoted variables, or command injection), suggest code optimization (faster or simpler code), and do code linting (finding style problems and likely bugs, like ShellCheck or flake8 would).",
        examples: [
          { cmd: "Prompt: \"Explain what this script does and add comments to each section.\"", what: "Document code / create documentation." },
          { cmd: "Prompt: \"Review this sshd_config against CIS benchmark recommendations and list changes.\"", what: "Recommendations for improving compliance." },
          { cmd: "Prompt: \"Do a security review of this script. Look for injection risks and secrets.\"", what: "Security review. Still confirm findings with real scanners and a human." },
          { cmd: "Prompt: \"Lint this Bash script and suggest optimizations.\"\nshellcheck myscript.sh", what: "Code linting and optimization. Compare the AI's advice to a real linter like ShellCheck." }
        ],
        tip: "AI is an assistant for reviewing, not a replacement for real scanners, linters, and human review."
      },
      {
        name: "Avoid copy/paste without review; verify output",
        explain: "AI can 'hallucinate': it may invent options that do not exist, use the wrong distro's commands, or write code that is insecure or destructive. Never copy and paste AI output straight into production. Always do quality assurance: read it, understand it, check man pages and official docs, and test in a lab or with dry-run options before using it for real.",
        examples: [
          { cmd: "bash -n ai_script.sh\nshellcheck ai_script.sh", what: "Check AI-generated scripts for syntax errors (bash -n) and common mistakes (ShellCheck) before running." },
          { cmd: "ansible-playbook site.yml --check --diff\ntofu plan", what: "Use dry runs to verify what AI-generated IaC would change before applying it." },
          { cmd: "man rsync", what: "Verify that the options the AI suggested really exist and do what it claims." }
        ],
        tip: "Trust, but verify. If you can't explain the code, don't run it."
      },
      {
        name: "Data governance: LLM training, human review, local vs. public models",
        explain: "Data governance means controlling what data goes where. Anything you paste into a public AI service may be stored, seen during human review by the provider's staff, or used for LLM training, so it could leak. Never paste passwords, API keys, private keys, customer data, or internal hostnames into a public model. Local models (run on your own hardware or a private, company-controlled service) keep data private; public models are hosted by someone else on the internet. Choose based on how sensitive the data is.",
        examples: [
          { cmd: "sed -E 's/(password=).*/\\1REDACTED/' app.conf > app.redacted.conf", what: "Redact secrets from a config file before sharing it with an AI tool." },
          { cmd: "ollama run llama3", what: "Example of running a local model on your own machine, so prompts never leave it." }
        ],
        tip: "Sensitive data + public model = risk. Use a private/local model or remove the sensitive parts."
      },
      {
        name: "Adhere to corporate policy",
        explain: "Always follow your organization's AI policy. It may say which AI tools are approved, what kinds of data may be shared, whether AI-written code must be labeled, and what review is required. Also think about licensing: generated code might resemble copyrighted code. Using an unapproved AI tool at work (shadow AI) can break rules and laws even if your intentions are good."
      },
      {
        name: "Prompt engineering",
        explain: "Prompt engineering is writing clear, specific requests to get better AI output. Give context (distro, version, tool), say exactly what you want, set limits (for example 'POSIX sh only' or 'no external packages'), ask for a format, and give examples. If the answer is wrong, refine the prompt and try again. Asking the AI to explain its answer or list assumptions helps you verify it.",
        examples: [
          { cmd: "Weak: \"write a backup script\"\nBetter: \"Write a Bash script for RHEL 9 that tars /etc into /backup/etc-YYYY-MM-DD.tar.gz, keeps only the last 7 archives, exits non-zero on failure, and includes comments.\"", what: "A specific prompt with context, requirements, and limits gives much better results." }
        ],
        tip: "Be specific: context + task + constraints + format."
      }
    ],
    cards: [
      { q: "Name four common uses of AI for a Linux administrator.", a: "Generating code or scripts, generating regular expressions, generating infrastructure as code, documenting code, security review, compliance recommendations, code optimization, and linting." },
      { q: "Why should you never copy and paste AI-generated commands straight into production?", a: "AI output can be wrong, insecure, or destructive (hallucinations). Review it, verify it against docs, and test it first." },
      { q: "What is the risk of pasting a config file with passwords into a public AI tool?", a: "The data may be stored, used for LLM training, or seen during human review by the provider, causing a data leak. Redact it or use an approved private model." },
      { q: "What is the main data governance advantage of a local model?", a: "Prompts and data stay on your own private systems instead of being sent to a public third-party service." },
      { q: "What is prompt engineering?", a: "Writing clear, specific prompts with context, constraints, and desired format to get accurate, useful AI output." },
      { q: "An AI gives you an Ansible playbook. How do you safely verify it?", a: "Read and understand it, then run `ansible-playbook playbook.yml --check --diff` on a test host before using it in production." },
      { q: "Your company has not approved a particular AI tool. What should you do?", a: "Don't use it for work data. Adhere to corporate policy and use only approved tools." },
      { q: "Can AI replace a human security review?", a: "No. AI can help find issues, but its findings must be verified by people and proper security tools." }
    ]
  }
);
