import "server-only";

/**
 * Quiz question bank.
 *
 * Each row: [level, question, options, explanation]
 * THE FIRST OPTION IS ALWAYS THE CORRECT ANSWER — options are shuffled and given
 * opaque ids before they are sent to the browser, so the order here never leaks.
 *
 * To add questions, append rows to a tool's list. Keep 4 options, one correct,
 * and a one-line explanation of WHY it is correct.
 */

export type Level = "beginner" | "intermediate" | "advanced";
export type Question = {
  id: string;
  tool: string;
  level: Level;
  question: string;
  options: string[]; // options[0] is correct
  explanation: string;
};

type Row = [Level, string, string[], string];
const B: Level = "beginner";
const I: Level = "intermediate";
const A: Level = "advanced";

function bank(tool: string, rows: Row[]): Question[] {
  return rows.map(([level, question, options, explanation], i) => ({
    id: `${tool}-${i + 1}`,
    tool,
    level,
    question,
    options,
    explanation,
  }));
}

const docker = bank("docker", [
  [B, "Which command lists the containers that are currently running?", ["docker ps", "docker images", "docker ls", "docker run --list"], "docker ps shows running containers; add -a to include stopped ones."],
  [B, "What is a Docker image?", ["A read-only template used to create containers", "A running process on the host", "A full virtual machine with its own kernel", "A network bridge between containers"], "A container is a running instance of an image."],
  [B, "Which file describes how to build a Docker image?", ["Dockerfile", "docker-compose.yml", ".dockerignore", "image.json"], "The Dockerfile lists the instructions (FROM, COPY, RUN…) that build the image."],
  [B, "Which command builds an image from the Dockerfile in the current folder and tags it myapp?", ["docker build -t myapp .", "docker create myapp", "docker run -t myapp .", "docker commit myapp"], "docker build -t <name> <context>; the dot is the build context (current folder)."],
  [B, "What is .dockerignore used for?", ["Excluding files from the build context", "Ignoring containers that failed", "Hiding exposed ports", "Skipping cached layers"], "Files listed there are not sent to the daemon, keeping builds fast and secrets out of images."],
  [I, "What is the difference between CMD and ENTRYPOINT?", ["ENTRYPOINT sets the main executable; CMD gives default arguments you can override at docker run", "CMD runs at build time, ENTRYPOINT at start time", "They are exactly the same", "ENTRYPOINT only works in multi-stage builds"], "Arguments passed to docker run replace CMD but are appended to ENTRYPOINT."],
  [I, "How do you keep a database's data after its container is removed?", ["Store the data in a volume", "Add an EXPOSE instruction", "Give the container more memory", "Run docker commit after every write"], "Volumes live outside the container's writable layer, so data survives container removal."],
  [I, "What does -p 8080:80 do in docker run?", ["Maps port 8080 on the host to port 80 in the container", "Maps container port 8080 to host port 80", "Opens port 8080 only to other containers", "Sets the CPU priority"], "The format is host:container."],
  [I, "Why use a multi-stage build?", ["To keep the final image small by copying in only the build output", "To run several containers from one image", "To build for many operating systems at once", "To make docker pull download layers in parallel"], "Build tools stay in the first stage; the final stage contains only what is needed to run."],
  [I, "For a Node.js app, which Dockerfile order makes the best use of the build cache?", ["Copy package*.json and install dependencies before copying the rest of the source", "Copy all source code first, then install dependencies", "Put RUN npm install as the very last step", "Use ADD instead of COPY everywhere"], "Dependencies change less often than code, so that layer stays cached across most builds."],
  [I, "What does docker compose up -d do?", ["Starts all services in the compose file in the background", "Deletes every container", "Builds only the first service", "Updates the Docker engine"], "-d means detached: the services keep running after the command returns."],
  [I, "Which command shows the logs of a container named web?", ["docker logs web", "docker inspect --logs web", "docker attach --log web", "docker events web"], "Add -f to follow the logs live."],
  [A, "Containers on the same user-defined bridge network can reach each other by…", ["Container or service name, through Docker's built-in DNS", "IP address only", "Published host ports only", "They cannot talk to each other"], "User-defined networks provide automatic name resolution between containers."],
  [A, "Why run the app inside the container as a non-root user?", ["It limits the damage if the container is compromised", "It makes the image smaller", "Networking requires it", "Docker refuses to run root processes"], "Use the USER instruction so an attacker does not get root inside the container."],
  [A, "What does a HEALTHCHECK instruction do?", ["Runs a command periodically so Docker can mark the container healthy or unhealthy", "Restarts the host when CPU is high", "Scans the image for vulnerabilities", "Limits container memory"], "Orchestrators and docker ps use the health status to decide what to do."],
]);

const kubernetes = bank("kubernetes", [
  [B, "What is the smallest deployable unit in Kubernetes?", ["Pod", "Container", "Node", "Deployment"], "A Pod wraps one or more containers that share network and storage."],
  [B, "Which object keeps a set number of Pod replicas running and supports rolling updates?", ["Deployment", "Service", "ConfigMap", "Namespace"], "A Deployment manages ReplicaSets and rolls out new versions gradually."],
  [B, "Which command lists the pods in the current namespace?", ["kubectl get pods", "kubectl list pods", "kubectl show pods", "kubectl pods"], "kubectl get <resource> lists objects; add -A for all namespaces."],
  [B, "What does a Namespace provide?", ["A way to group and isolate resources inside one cluster", "A separate physical cluster", "A container runtime", "A cloud load balancer"], "Namespaces separate teams or environments and scope names, quotas and access."],
  [I, "What gives a stable IP and DNS name to a changing set of Pods?", ["Service", "PersistentVolume", "Secret", "DaemonSet"], "Pods come and go; a Service keeps one stable address and load-balances to matching Pods."],
  [I, "Which Service type opens the same port on every node?", ["NodePort", "ClusterIP", "ExternalName", "Headless"], "NodePort exposes the Service on <NodeIP>:<port> on all nodes."],
  [I, "Where should non-secret settings like APP_MODE=production be stored?", ["ConfigMap", "Secret", "PersistentVolumeClaim", "Role"], "ConfigMaps hold plain configuration; Secrets are for sensitive values."],
  [I, "What does a readiness probe decide?", ["Whether the Pod should receive traffic yet", "Whether the Pod should be restarted", "How much CPU the Pod gets", "Which image to pull"], "Readiness controls traffic; liveness restarts a stuck container."],
  [I, "Which component stores the cluster's state?", ["etcd", "kubelet", "kube-proxy", "CoreDNS"], "etcd is the key-value store behind the API server."],
  [I, "Which object routes HTTP traffic by host name or path to Services?", ["Ingress", "NodePort", "DaemonSet", "Endpoint"], "An Ingress (with an Ingress controller) is the HTTP entry point to the cluster."],
  [I, "A Pod is in CrashLoopBackOff. What should you check first?", ["kubectl logs <pod> (with --previous for the last crash)", "Delete the node", "Increase the replica count", "Recreate the namespace"], "The container logs usually show why the process keeps exiting."],
  [A, "What does a HorizontalPodAutoscaler change?", ["The number of Pod replicas, based on metrics like CPU", "The number of nodes in the cluster", "One Pod's memory limit", "The namespace a Pod runs in"], "HPA scales Pods; the Cluster Autoscaler is what adds nodes."],
  [A, "Which workload runs one Pod on every node, for example a log agent?", ["DaemonSet", "StatefulSet", "ReplicaSet", "Job"], "A DaemonSet schedules a copy onto each (matching) node automatically."],
  [A, "Why run a database as a StatefulSet?", ["Each Pod gets a stable name and its own persistent storage", "It runs faster than a Deployment", "It removes the need for Services", "It turns off restarts"], "Stable identity and per-Pod volumes matter for stateful systems."],
  [A, "Which command rolls a Deployment back to its previous version?", ["kubectl rollout undo deployment/<name>", "kubectl revert deployment <name>", "kubectl rollback <name>", "kubectl apply --previous"], "kubectl rollout history shows the revisions you can return to."],
]);

const terraform = bank("terraform", [
  [B, "Which command downloads providers and prepares a working directory?", ["terraform init", "terraform plan", "terraform apply", "terraform validate"], "init installs providers and modules and configures the backend."],
  [B, "What does terraform plan do?", ["Shows what Terraform would change, without changing anything", "Applies the changes", "Deletes the state file", "Formats the code"], "Always read the plan before you apply."],
  [B, "Which language are Terraform configurations written in?", ["HCL (HashiCorp Configuration Language)", "YAML", "Python", "Bash"], "Terraform also accepts JSON, but HCL is the normal format."],
  [B, "Which command removes every resource the configuration manages?", ["terraform destroy", "terraform delete", "terraform remove", "terraform clean"], "destroy shows a plan of deletions and asks for confirmation."],
  [I, "What is the Terraform state file used for?", ["Mapping real infrastructure to the resources in your code", "Storing provider binaries", "Logging CLI output", "Holding variable descriptions"], "State is how Terraform knows what already exists and what to change."],
  [I, "Why use a remote backend such as S3 for state in a team?", ["Everyone shares one state, and locking stops two applies at once", "It makes plan output faster", "It encrypts the provider", "It replaces terraform init"], "Local state on one laptop leads to conflicts and lost changes."],
  [I, "How do you pass values into a configuration or module?", ["Input variables", "Outputs", "Provisioners", "Backends"], "variable blocks take input; outputs return values."],
  [I, "What is a data source for?", ["Reading information about something that already exists", "Creating new resources", "Destroying resources", "Storing secrets"], "For example, looking up the latest AMI ID or an existing VPC."],
  [I, "What does terraform fmt do?", ["Rewrites files in the standard formatting style", "Validates cloud credentials", "Formats the state file", "Compresses modules"], "Run it before committing so diffs stay clean."],
  [I, "What are outputs used for?", ["Showing values after apply, such as an instance's public IP", "Hiding secrets", "Defining providers", "Locking state"], "Outputs can also be read by other configurations."],
  [I, "What does lifecycle { prevent_destroy = true } do?", ["Makes Terraform fail instead of destroying that resource", "Prevents any apply", "Locks the state", "Turns off drift detection"], "A safety net for things like production databases."],
  [A, "What does count = 3 on a resource do?", ["Creates three instances of that resource", "Retries creation three times", "Limits the plan output", "Creates three providers"], "Each instance is addressed as resource[0], [1], [2]."],
  [A, "Why prefer for_each over count for a list of named items?", ["Removing one item doesn't shift and recreate the others", "It applies faster", "count cannot be used with modules", "for_each doesn't need state"], "for_each keys instances by name instead of by position."],
  [A, "How do you bring a manually created resource under Terraform management?", ["terraform import (or an import block)", "terraform adopt", "terraform pull", "terraform refresh-only"], "Import records the existing resource in state; you still write its configuration."],
  [A, "What is 'drift'?", ["Real infrastructure was changed outside Terraform, so it no longer matches the code", "A slow apply", "A provider upgrade", "A syntax error"], "terraform plan shows drift as changes it wants to make."],
]);

const aws = bank("aws", [
  [B, "Which AWS service provides virtual servers?", ["EC2", "S3", "RDS", "Route 53"], "EC2 = Elastic Compute Cloud."],
  [B, "Which AWS service is object storage for files like images and backups?", ["S3", "EBS", "CloudWatch", "Route 53"], "S3 stores objects in buckets and is accessed over HTTPS."],
  [B, "What is an AWS Region?", ["A geographic area containing multiple isolated Availability Zones", "A single data centre", "A subnet inside a VPC", "An IAM group"], "Example: ap-south-1 (Mumbai) has several AZs."],
  [B, "Which service is AWS's managed relational database?", ["RDS", "DynamoDB", "S3", "ElastiCache"], "DynamoDB is NoSQL; RDS runs MySQL, PostgreSQL and others for you."],
  [B, "Which service runs your code without you managing servers?", ["Lambda", "EC2", "EBS", "VPC"], "You upload a function; AWS runs it on demand and bills per request and duration."],
  [I, "How do Security Groups and Network ACLs differ?", ["Security Groups are stateful and attach to instances; NACLs are stateless and apply to subnets", "NACLs are stateful and attach to instances", "They are identical", "Security Groups apply to the whole VPC only"], "Stateful means return traffic is allowed automatically."],
  [I, "What is the best way to let an EC2 instance read from S3?", ["Attach an IAM role to the instance", "Put access keys in the application code", "Use the root account's keys", "Make the bucket public"], "Roles give temporary credentials that rotate automatically."],
  [I, "What makes a subnet 'public'?", ["Its route table has a route to an Internet Gateway", "It has a 'public' tag", "It uses a NAT Gateway", "It has more IP addresses"], "Without that route, instances can't be reached from the internet."],
  [I, "Which service lets instances in a private subnet reach the internet for updates without being reachable from it?", ["NAT Gateway", "Internet Gateway", "CloudFront", "Direct Connect"], "Outbound only: replies come back, new inbound connections don't."],
  [I, "Which service spreads traffic across several EC2 instances?", ["Elastic Load Balancing (ALB / NLB)", "Route tables", "IAM", "CloudTrail"], "An ALB works at HTTP level; an NLB at TCP/UDP level."],
  [I, "What does an Auto Scaling group do?", ["Adds or removes instances based on demand or a schedule", "Resizes S3 buckets", "Backs up RDS", "Rotates access keys"], "Combine it with a load balancer for a self-healing fleet."],
  [I, "Which is block storage attached to an EC2 instance, like a disk?", ["EBS", "S3", "Glacier", "CloudFront"], "EBS volumes behave like hard disks; S3 is object storage."],
  [I, "Which service is AWS's DNS?", ["Route 53", "CloudFront", "VPC", "Certificate Manager"], "Named after DNS's port 53."],
  [A, "Which service records the API calls made in your account, for auditing?", ["CloudTrail", "CloudWatch", "Trusted Advisor", "X-Ray"], "CloudTrail answers 'who did what, and when'."],
  [A, "What is the principle of least privilege?", ["Give only the permissions a task actually needs", "Give admin access to avoid errors", "Share one IAM user across the team", "Use the root user for automation"], "Smaller permissions mean a smaller blast radius if credentials leak."],
]);

const linux = bank("linux", [
  [B, "Which command prints the current directory?", ["pwd", "cd", "ls", "whoami"], "pwd = print working directory."],
  [B, "Which command changes a file's permissions?", ["chmod", "chown", "mv", "touch"], "chown changes the owner; chmod changes read/write/execute permissions."],
  [B, "What does chmod 755 file give?", ["Owner rwx; group and others r-x", "Everyone rwx", "Owner rw-; others nothing", "Owner r-x; others rwx"], "7 = rwx, 5 = r-x."],
  [B, "Which command searches for text inside files?", ["grep", "find", "touch", "cat"], "find searches for files by name or attributes; grep searches their contents."],
  [B, "Which command shows running processes live, with CPU usage?", ["top", "ls", "uname", "pwd"], "htop is a friendlier alternative if installed."],
  [I, "Which command shows free space on mounted filesystems?", ["df -h", "du -h", "free -h", "uptime"], "du shows how much space a directory uses; df shows space left on disks."],
  [I, "How do you see which process is listening on port 80?", ["ss -tulpn (or netstat -tulpn)", "ps -port 80", "top -p 80", "chmod 80"], "Run with sudo to see process names for all users."],
  [I, "What does the pipe | do?", ["Sends one command's output as input to the next", "Runs two commands in parallel", "Writes output to a file", "Comments out the rest of the line"], "Example: ps aux | grep nginx."],
  [I, "Which file maps host names to IP addresses locally?", ["/etc/hosts", "/etc/resolv.conf", "/etc/hostname", "/etc/passwd"], "resolv.conf lists DNS servers; /etc/hosts holds fixed name-to-IP entries."],
  [I, "How do you check the status of the nginx service on a systemd system?", ["systemctl status nginx", "service-check nginx", "nginx --status", "ps status nginx"], "Use journalctl -u nginx to read its logs."],
  [I, "What does 2>&1 do?", ["Sends standard error to the same place as standard output", "Runs the command twice", "Sends output only to standard error", "Runs the command in the background"], "Common in cron jobs: cmd > log.txt 2>&1."],
  [I, "Which command shows memory usage?", ["free -h", "df -h", "du -sh", "lsblk"], "Look at the 'available' column, not just 'free'."],
  [A, "What does kill -9 send to a process?", ["SIGKILL, which cannot be caught or ignored", "SIGTERM, a graceful stop", "SIGHUP, a reload", "SIGINT, like Ctrl+C"], "Try plain kill (SIGTERM) first so the program can clean up."],
  [A, "How do you edit the current user's scheduled cron jobs?", ["crontab -e", "nano /var/log/cron", "systemctl cron edit", "at -e"], "crontab -l lists them."],
  [A, "What is an inode?", ["A structure storing a file's metadata and where its data blocks are", "A process ID", "A network interface", "A type of shell"], "Running out of inodes can stop new files even when disk space is free."],
]);

const git = bank("git", [
  [B, "Which command turns the current folder into a Git repository?", ["git init", "git start", "git clone", "git new"], "It creates the hidden .git folder that stores the history."],
  [B, "What does git add do?", ["Stages changes for the next commit", "Uploads code to GitHub", "Creates a branch", "Merges two branches"], "Commit records what is staged."],
  [B, "Which command sends your local commits to the remote repository?", ["git push", "git pull", "git fetch", "git commit"], "pull/fetch bring changes down; push sends them up."],
  [B, "Which command shows the commit history?", ["git log", "git history", "git show-all", "git status"], "git log --oneline gives a compact view."],
  [I, "What is the difference between git fetch and git pull?", ["fetch only downloads remote changes; pull downloads and merges them into your branch", "They are identical", "pull only downloads", "fetch deletes local changes"], "git pull = git fetch + git merge."],
  [I, "Which command creates a branch called feature and switches to it?", ["git checkout -b feature (or git switch -c feature)", "git branch -m feature", "git merge feature", "git commit -b feature"], "git branch feature only creates it without switching."],
  [I, "What is a merge conflict?", ["Both branches changed the same lines and Git can't choose automatically", "A push that failed due to the network", "A deleted repository", "A missing .gitignore"], "Edit the file, keep the right lines, then git add and commit."],
  [I, "What is .gitignore for?", ["Listing files Git should not track, like .env or node_modules", "Ignoring merge conflicts", "Hiding branches", "Skipping commits"], "It keeps secrets and build output out of the repository."],
  [I, "What does git stash do?", ["Saves uncommitted changes aside so you can switch tasks", "Deletes untracked files", "Pushes to a hidden remote", "Squashes commits"], "git stash pop brings the changes back."],
  [I, "What does the remote name 'origin' usually mean?", ["The repository you cloned from (or first connected to)", "The first commit", "The main branch", "Your local folder"], "That is why you write git push origin main."],
  [I, "What is a pull request?", ["A request on GitHub/GitLab to review and merge one branch into another", "Another name for git pull", "A fetch from upstream", "A Git tag"], "It is where code review happens before merging."],
  [A, "How do you undo the last commit but keep its changes staged?", ["git reset --soft HEAD~1", "git reset --hard HEAD~1", "git revert --all", "git clean -fd"], "--hard would throw the changes away."],
  [A, "Why use git revert instead of git reset on a shared branch?", ["revert adds a new commit that undoes changes without rewriting history others already have", "revert is faster", "reset cannot undo commits", "revert deletes the branch"], "Rewriting shared history forces everyone else to fix their copies."],
  [A, "What does git rebase main do while you are on a feature branch?", ["Replays your feature commits on top of the latest main", "Merges feature into main", "Deletes main", "Pushes to main"], "It gives a linear history; don't rebase commits others have already pulled."],
  [A, "Which command shows changes in files that are not yet staged?", ["git diff", "git diff --staged", "git log -p", "git show"], "git diff --staged shows what is already staged."],
]);

const cicd = bank("cicd", [
  [B, "What does CI stand for?", ["Continuous Integration", "Code Inspection", "Cloud Infrastructure", "Container Image"], "Developers merge small changes often, and each merge is built and tested automatically."],
  [B, "What is the main goal of Continuous Integration?", ["Merge code often and automatically build and test every change", "Deploy once a month", "Write documentation", "Manage servers by hand"], "Problems are found within minutes, not weeks."],
  [B, "Which step usually comes first in a pipeline?", ["Check out the code and install dependencies", "Deploy to production", "Send release notes", "Delete old servers"], "Then build, test, package and deploy."],
  [B, "Which of these is a CI/CD tool?", ["GitHub Actions", "Terraform", "Prometheus", "Nginx"], "Jenkins, GitLab CI and CircleCI are others."],
  [I, "Continuous Delivery vs Continuous Deployment?", ["Delivery keeps every change ready to release with a manual approval; Deployment releases automatically", "They mean the same thing", "Deployment always needs manual approval", "Delivery skips tests"], "The difference is that last manual step to production."],
  [I, "Where do GitHub Actions workflows live in a repository?", [".github/workflows/*.yml", ".gitlab-ci.yml", "Jenkinsfile", ".circleci/config.yml"], "Each YAML file there is a workflow."],
  [I, "What is a pipeline artifact?", ["A file produced by one stage, such as a build or report, kept or passed to later stages", "A failed job", "A Git branch", "A secret"], "For example a compiled app or a test report."],
  [I, "Where should API keys used by a pipeline be kept?", ["In the CI system's encrypted secrets", "Hard-coded in the pipeline YAML", "In the README", "In commit messages"], "Secrets in the repo can be read by anyone with access, forever."],
  [I, "Why run tests on every pull request?", ["To catch bugs before they reach the main branch", "To make builds slower", "Because Git requires it", "To deploy straight to production"], "Branch protection can block merging until checks pass."],
  [I, "What does 'shift left' mean?", ["Doing testing and security checks earlier in development", "Moving servers to another region", "Deploying older versions", "Removing pipeline stages"], "Bugs found earlier are cheaper to fix."],
  [I, "What is a rollback?", ["Going back to the previous working version after a bad release", "Rebasing a branch", "Re-running tests", "Deleting logs"], "Good pipelines make rollback one click or one command."],
  [A, "What is a blue-green deployment?", ["Two identical environments; switch traffic to the new one and switch back if needed", "Deploying only on weekdays", "Running tests in two colours", "Splitting the database in two"], "Switching back is instant because the old version is still running."],
  [A, "What is a canary release?", ["Releasing to a small share of users first, then widening if it looks healthy", "Releasing only to testers", "Rolling back every night", "Deploying to everyone at once"], "Named after canaries used to detect danger early in mines."],
  [A, "Why build a Docker image once and promote the same image through test, staging and production?", ["What you tested is exactly what runs in production", "Kubernetes requires it", "It only saves disk space", "Images can't be rebuilt"], "Rebuilding per environment can pull in different dependencies."],
  [A, "What is a flaky test?", ["A test that sometimes passes and sometimes fails with no code change", "A slow test", "A skipped test", "A security test"], "Flaky tests make people ignore failures; fix or quarantine them."],
]);

const ansible = bank("ansible", [
  [B, "How does Ansible usually connect to Linux hosts?", ["Over SSH, with no agent on the host", "Through an agent installed on every host", "Through SNMP", "Through RDP"], "Being agentless is one of Ansible's main advantages."],
  [B, "What is an Ansible playbook?", ["A YAML file describing tasks to run on hosts", "A Python library", "A list of IP addresses", "A log file"], "Playbooks contain plays; plays contain tasks."],
  [B, "What is the inventory?", ["The list of managed hosts and groups", "The list of modules", "The output of a run", "The vault password"], "It can be a static file or generated dynamically from a cloud."],
  [B, "Which command runs a playbook?", ["ansible-playbook site.yml", "ansible run site.yml", "ansible-galaxy site.yml", "ansible-vault site.yml"], "ansible-galaxy installs roles; ansible-vault encrypts files."],
  [I, "What does 'idempotent' mean for an Ansible task?", ["Running it again makes no further changes once the host is in the desired state", "It can run only once", "It always runs in parallel", "It can never fail"], "That is why re-running a playbook is safe."],
  [I, "Which module installs packages on Ubuntu?", ["apt", "yum", "copy", "service"], "yum/dnf are for Red Hat family systems."],
  [I, "What are handlers for?", ["Running a task, like restarting a service, only when another task reports a change", "Handling errors", "Storing variables", "Connecting to hosts"], "Tasks notify handlers; handlers run once at the end of the play."],
  [I, "What is a role?", ["A reusable bundle of tasks, handlers, templates and variables", "A user permission", "A host group", "A connection plugin"], "Roles keep big automation organised and shareable."],
  [I, "Which templating engine does Ansible use?", ["Jinja2", "Handlebars", "Go templates", "Mustache"], "Templates use {{ variable }} syntax."],
  [I, "What does become: true do?", ["Runs tasks with privilege escalation, such as sudo", "Switches to another host", "Retries failed tasks", "Converts YAML to JSON"], "Needed for tasks like installing packages."],
  [A, "How do you keep passwords encrypted inside Ansible files?", ["Ansible Vault", "Plain variable files", "YAML comments", "Inventory groups"], "Vault-encrypted files can still be committed to Git safely."],
  [A, "What does --check do when running a playbook?", ["A dry run: reports what would change without changing anything", "Checks syntax only", "Checks SSH keys", "Checks free disk space"], "Combine with --diff to see the exact changes."],
]);

const jenkins = bank("jenkins", [
  [B, "Jenkins is mainly…", ["An automation server for CI/CD", "A container runtime", "A cloud provider", "A database"], "It runs builds, tests and deployments from jobs or pipelines."],
  [B, "Which file defines a Jenkins pipeline as code inside the repository?", ["Jenkinsfile", "Dockerfile", "pom.xml", "workflow.yml"], "Keeping it in the repo means the pipeline is versioned with the code."],
  [B, "What is a stage in a pipeline?", ["A named group of steps, such as Build, Test or Deploy", "A plugin", "A node label", "A Git tag"], "Stages appear as columns in the pipeline view."],
  [B, "What is Jenkins' default web port?", ["8080", "80", "3000", "22"], "Usually put behind a reverse proxy with HTTPS in production."],
  [I, "A declarative pipeline starts with which block?", ["pipeline { }", "node { }", "job { }", "stage { }"], "Scripted pipelines start with node { }."],
  [I, "What are agents (nodes) in Jenkins?", ["Machines or containers where pipeline steps actually run", "Plugins", "Users", "Credentials"], "The controller schedules work; agents execute it."],
  [I, "How should a pipeline use passwords and tokens?", ["Store them in Jenkins Credentials and read them with withCredentials / credentials()", "Write them in the Jenkinsfile", "Print them in the console", "Put them in the job name"], "Jenkins masks credential values in the logs."],
  [I, "What starts a build on every push, without polling?", ["A webhook from GitHub or GitLab", "A cron job every minute", "A manual click", "Restarting Jenkins"], "Webhooks are instant and cheaper than polling."],
  [I, "Where do you read a build's logs?", ["The build's Console Output", "The Jenkinsfile", "The plugin manager", "Global configuration"], "Blue Ocean and the stage view also link to step logs."],
  [I, "Why avoid running builds on the Jenkins controller?", ["Security and stability: builds should run on agents", "Installing tools there is slower", "The controller has no shell", "Licensing rules"], "A malicious build on the controller could read every secret."],
  [A, "What does post { always { … } } do?", ["Runs steps after the pipeline whatever the result", "Runs steps only on success", "Runs steps before the pipeline", "Retries the pipeline"], "Useful for cleanup and publishing test reports."],
  [A, "What is a multibranch pipeline?", ["Jenkins finds branches with a Jenkinsfile and creates a pipeline for each", "A pipeline with many stages", "A cluster of Jenkins servers", "A plugin manager"], "Feature branches and pull requests get CI automatically."],
]);

const networking = bank("networking", [
  [B, "Which protocol turns domain names into IP addresses?", ["DNS", "DHCP", "HTTP", "SMTP"], "DNS is the internet's phone book."],
  [B, "What is the default port for HTTPS?", ["443", "80", "22", "8080"], "HTTP is 80, SSH is 22."],
  [B, "What does a load balancer do?", ["Spreads incoming traffic across several servers", "Stores files", "Encrypts disks", "Hands out IP addresses"], "It also removes unhealthy servers from rotation."],
  [B, "What is the default SSH port?", ["22", "21", "25", "3389"], "21 is FTP, 25 is SMTP, 3389 is RDP."],
  [I, "How do TCP and UDP differ?", ["TCP is connection-based and reliable; UDP is connectionless, faster and has no delivery guarantee", "UDP is the reliable one", "They are identical", "TCP doesn't use ports"], "Web traffic uses TCP; DNS queries and video calls often use UDP."],
  [I, "How many usable host addresses does a /24 IPv4 subnet have?", ["254", "256", "255", "24"], "256 addresses minus the network and broadcast addresses."],
  [I, "A Layer 7 load balancer can route traffic based on…", ["HTTP host name, path or headers", "Only IP address and port", "MAC address", "Cable type"], "Layer 4 balancers only see IPs and ports."],
  [I, "What does DHCP do?", ["Automatically gives IP addresses to devices", "Resolves domain names", "Encrypts traffic", "Balances load"], "It also hands out the gateway and DNS servers."],
  [I, "Which of these is a private IPv4 range?", ["10.0.0.0/8", "8.8.8.0/24", "1.1.1.0/24", "100.0.0.0/8"], "Private ranges: 10/8, 172.16/12 and 192.168/16."],
  [A, "What does a reverse proxy such as Nginx do in front of applications?", ["Receives client requests and forwards them to backend servers", "Proxies employees' outgoing browsing", "Assigns IP addresses", "Stores DNS records"], "It can also terminate TLS, cache and load-balance."],
  [A, "What is a health check in load balancing?", ["A regular probe that takes failing servers out of rotation", "An antivirus scan", "SSL certificate renewal", "DNS caching"], "Typically an HTTP request to an endpoint like /health."],
  [A, "What is a 'sticky session'?", ["Sending a user's requests to the same backend server each time", "Keeping TCP connections open forever", "Caching DNS answers", "Retrying failed requests"], "Useful when session data lives in one server's memory."],
]);

const azure = bank("azure", [
  [B, "Which Azure service provides virtual servers?", ["Azure Virtual Machines", "Azure Blob Storage", "Azure Functions", "Azure DevOps"], "Like EC2 on AWS."],
  [B, "Which Azure service is object storage for files?", ["Blob Storage", "Azure SQL Database", "Cosmos DB", "Azure Monitor"], "Like S3 on AWS."],
  [B, "What is a Resource Group?", ["A logical container for related Azure resources", "A group of users", "A region", "A virtual network"], "Deleting a resource group deletes everything inside it."],
  [B, "Which Azure service offers CI/CD pipelines, repos and boards?", ["Azure DevOps", "Azure Monitor", "Azure Advisor", "Azure Arc"], "GitHub Actions is the other common choice."],
  [I, "What is Azure's identity service called today?", ["Microsoft Entra ID (formerly Azure AD)", "Azure Key Vault", "Azure Policy", "Azure Arc"], "It handles users, groups, sign-in and app registrations."],
  [I, "Where should secrets and certificates be stored in Azure?", ["Azure Key Vault", "A public Blob container", "App settings inside the code", "Resource tags"], "Apps read them at runtime with a managed identity."],
  [I, "What is Azure's managed Kubernetes service?", ["AKS (Azure Kubernetes Service)", "ACI", "ACR", "App Service"], "ACI runs single containers; ACR stores images."],
  [I, "What is a VNet?", ["An isolated private network in Azure", "A VPN appliance", "A DNS zone", "A load balancer"], "Like a VPC on AWS."],
  [I, "Which service runs serverless functions?", ["Azure Functions", "Azure Virtual Machines", "AKS", "Azure Batch"], "Like Lambda on AWS."],
  [I, "Which service stores private container images?", ["Azure Container Registry (ACR)", "Azure Files", "Docker Desktop", "AKS"], "AKS can pull from ACR using a managed identity."],
  [A, "What does a Network Security Group (NSG) do?", ["Allows or denies inbound and outbound traffic for subnets or network interfaces", "Encrypts disks", "Assigns public IPs", "Hosts DNS"], "Rules are evaluated by priority number, lowest first."],
  [A, "What is Azure's native infrastructure-as-code language?", ["Bicep (which compiles to ARM templates)", "HCL", "CloudFormation", "Ansible YAML"], "Terraform also works well with Azure."],
]);

const gcp = bank("gcp", [
  [B, "Which Google Cloud service provides virtual machines?", ["Compute Engine", "App Engine", "Cloud Run", "BigQuery"], "Like EC2 on AWS."],
  [B, "Which Google Cloud service is object storage?", ["Cloud Storage", "Persistent Disk", "Filestore", "Bigtable"], "Buckets of objects, like S3."],
  [B, "What is Google Cloud's managed Kubernetes service?", ["Google Kubernetes Engine (GKE)", "Cloud Run", "Compute Engine", "Cloud Functions"], "Kubernetes itself started at Google."],
  [B, "Where should container images be stored in Google Cloud today?", ["Artifact Registry", "Cloud SQL", "Cloud DNS", "Cloud Build"], "It replaces the older Container Registry."],
  [I, "Which service runs containers serverlessly and can scale to zero?", ["Cloud Run", "Compute Engine", "GKE Standard", "Cloud SQL"], "You pay only while requests are being handled."],
  [I, "What is the basic unit that holds resources and billing in Google Cloud?", ["A project (inside folders and an organization)", "A resource group", "A subscription", "An account"], "Every resource belongs to exactly one project."],
  [I, "Which is Google Cloud's command-line tool?", ["gcloud", "az", "aws", "terraform"], "az is Azure's CLI; aws is AWS's."],
  [I, "Which is Google Cloud's managed relational database?", ["Cloud SQL", "Firestore", "BigQuery", "Memorystore"], "It runs MySQL, PostgreSQL or SQL Server for you."],
  [I, "What is an IAM role binding?", ["Granting a role to a principal (user, group or service account) on a resource", "Linking two VPCs", "A billing account", "A firewall rule"], "Bindings make up a resource's IAM policy."],
  [I, "Which service is a serverless data warehouse?", ["BigQuery", "Cloud SQL", "Spanner", "Dataflow"], "Query huge datasets with SQL without managing servers."],
  [A, "What is a service account?", ["An identity that applications and VMs use to call Google APIs", "A human admin account", "A billing profile", "A support plan"], "Give it only the roles the app needs."],
  [A, "How are VPC networks scoped in Google Cloud?", ["The VPC is global; its subnets are regional", "Each VPC lives in one zone", "Each VPC lives in one region", "VPCs are per user"], "One VPC can span all regions — different from AWS and Azure."],
]);

export const QUESTIONS: Question[] = [
  ...docker,
  ...kubernetes,
  ...terraform,
  ...aws,
  ...linux,
  ...git,
  ...cicd,
  ...ansible,
  ...jenkins,
  ...networking,
  ...azure,
  ...gcp,
];

export const QUESTION_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

export function questionsForTool(tool: string): Question[] {
  return tool === "mix" ? QUESTIONS : QUESTIONS.filter((q) => q.tool === tool);
}
