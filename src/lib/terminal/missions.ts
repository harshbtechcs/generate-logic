import { HOME, type SimState } from "./sim";

/**
 * Command Playground missions. Ids are saved in the database when a signed-in
 * user finishes one, so never rename or reuse an id — add new ones instead.
 * Missions in a track are done in order; only the current one is checked.
 */
export type Mission = {
  id: string;
  title: string;
  goal: string;
  hint: string; // the exact command(s) to try
  learn: string; // one line shown after it's done
  check: (s: SimState) => boolean;
};

export type Track = { tool: "linux" | "git" | "docker" | "kubernetes" | "terraform"; name: string; intro: string; missions: Mission[] };

const has = (s: SimState, entry: string) => s.log.includes(entry);
const P = `${HOME}/project`;

export const TRACKS: Track[] = [
  {
    tool: "linux",
    name: "Linux",
    intro: "Move around the file system and work with files — the base of every DevOps job.",
    missions: [
      { id: "linux-1", title: "Where am I?", goal: "Print the folder you are in right now.", hint: "pwd", learn: "pwd = print working directory.", check: (s) => has(s, "pwd") },
      { id: "linux-2", title: "Look around", goal: "List everything in your home folder, including hidden files, in long format.", hint: "ls -la", learn: "-l shows permissions, owner and size; -a shows hidden files.", check: (s) => s.log.some((l) => l === `ls:${HOME}`) && s.history.some((h) => /^ls\s+(-\w*l\w*a|-\w*a\w*l|-l\s+-a|-a\s+-l)/.test(h)) },
      { id: "linux-3", title: "Make a folder", goal: "Create a folder called devops inside your home folder.", hint: "mkdir devops", learn: "mkdir -p also creates parent folders if they are missing.", check: (s) => s.fs[`${HOME}/devops`] === null },
      { id: "linux-4", title: "Write a file", goal: 'Create devops/hello.txt containing the text "Hello DevOps".', hint: 'echo "Hello DevOps" > devops/hello.txt', learn: "> overwrites a file, >> appends to it.", check: (s) => /hello devops/i.test(s.fs[`${HOME}/devops/hello.txt`] ?? "") },
      { id: "linux-5", title: "Read it back", goal: "Show the contents of devops/hello.txt.", hint: "cat devops/hello.txt", learn: "cat prints a file; for long files use less or tail -f for logs.", check: (s) => has(s, `cat:${HOME}/devops/hello.txt`) },
      { id: "linux-6", title: "Clean up", goal: "Delete the file notes.txt from your home folder.", hint: "rm ~/notes.txt", learn: "There is no recycle bin in Linux — rm is permanent. Use rm -r for folders.", check: (s) => !(`${HOME}/notes.txt` in s.fs) },
    ],
  },
  {
    tool: "git",
    name: "Git",
    intro: "Track changes like a real team — init, stage, commit and branch.",
    missions: [
      { id: "git-1", title: "Start a repository", goal: "Go to the project folder and turn it into a Git repository.", hint: "cd ~/project && git init", learn: "git init creates the hidden .git folder that stores all history.", check: (s) => s.git.root === P },
      { id: "git-2", title: "Check the status", goal: "See which files Git has noticed.", hint: "git status", learn: "Run git status often — it tells you exactly what to do next.", check: (s) => has(s, "git status") && s.git.root !== null },
      { id: "git-3", title: "Stage files", goal: "Stage every file in the project for the next commit.", hint: "git add .", learn: "The staging area lets you choose exactly what goes into a commit.", check: (s) => s.git.staged.length >= 3 || s.git.commits.length > 0 },
      { id: "git-4", title: "First commit", goal: "Save a snapshot with a commit message.", hint: 'git commit -m "Initial commit"', learn: "Good messages say why, e.g. \"Add Terraform config for web server\".", check: (s) => s.git.commits.length > 0 },
      { id: "git-5", title: "New branch", goal: "Create a branch called feature and switch to it.", hint: "git checkout -b feature", learn: "Branches let you work on changes without touching main.", check: (s) => s.git.branch === "feature" },
      { id: "git-6", title: "Read history", goal: "Show the commit history in one line per commit.", hint: "git log --oneline", learn: "Every commit has a unique hash you can go back to.", check: (s) => has(s, "git log") && s.history.some((h) => h.includes("--oneline")) },
    ],
  },
  {
    tool: "docker",
    name: "Docker",
    intro: "Pull images, run containers and manage their lifecycle.",
    missions: [
      { id: "docker-1", title: "Pull an image", goal: "Download the nginx image from Docker Hub.", hint: "docker pull nginx", learn: "Images are read-only templates; containers are running copies of them.", check: (s) => s.docker.images.includes("nginx") },
      { id: "docker-2", title: "Run a web server", goal: "Run nginx in the background, named web, with port 8080 mapped to 80.", hint: "docker run -d --name web -p 8080:80 nginx", learn: "-d = detached, -p host:container publishes a port.", check: (s) => s.docker.containers.some((c) => c.name === "web" && c.image === "nginx" && c.status === "running" && c.ports.includes("8080:80")) },
      { id: "docker-3", title: "List containers", goal: "Show the running containers.", hint: "docker ps", learn: "docker ps -a also shows stopped containers.", check: (s) => s.log.some((l) => l.startsWith("docker ps")) && s.docker.containers.some((c) => c.name === "web") },
      { id: "docker-4", title: "Check the logs", goal: "Read the logs of the web container.", hint: "docker logs web", learn: "Add -f to follow logs live, like tail -f.", check: (s) => has(s, "docker logs:web") },
      { id: "docker-5", title: "Stop it", goal: "Stop the web container.", hint: "docker stop web", learn: "Stopping keeps the container so you can start it again.", check: (s) => s.docker.containers.some((c) => c.name === "web" && c.status === "exited") },
      { id: "docker-6", title: "Remove it", goal: "Delete the web container.", hint: "docker rm web", learn: "docker rm -f stops and removes in one step.", check: (s) => has(s, "docker rm:web") && !s.docker.containers.some((c) => c.name === "web") },
    ],
  },
  {
    tool: "kubernetes",
    name: "Kubernetes",
    intro: "Deploy, scale and expose an app on a 3-node cluster.",
    missions: [
      { id: "k8s-1", title: "Meet the cluster", goal: "List the nodes in the cluster.", hint: "kubectl get nodes", learn: "Nodes are the machines; the control plane schedules pods onto workers.", check: (s) => has(s, "kubectl get:nodes") },
      { id: "k8s-2", title: "Create a deployment", goal: "Create a deployment named web using the nginx image.", hint: "kubectl create deployment web --image=nginx", learn: "A Deployment keeps the requested number of pods running.", check: (s) => s.k8s.deployments.some((d) => d.name === "web" && d.image.startsWith("nginx")) },
      { id: "k8s-3", title: "Scale out", goal: "Scale web to 3 replicas.", hint: "kubectl scale deployment web --replicas=3", learn: "Scaling changes the desired pod count; Kubernetes does the rest.", check: (s) => s.k8s.deployments.some((d) => d.name === "web" && d.replicas === 3) },
      { id: "k8s-4", title: "See the pods", goal: "List the pods.", hint: "kubectl get pods", learn: "Each replica is one pod with its own name and IP.", check: (s) => has(s, "kubectl get:pods") && s.k8s.deployments.some((d) => d.name === "web" && d.replicas >= 3) },
      { id: "k8s-5", title: "Expose it", goal: "Expose web on port 80 as a NodePort service.", hint: "kubectl expose deployment web --port=80 --type=NodePort", learn: "Services give pods one stable address; NodePort opens it on every node.", check: (s) => s.k8s.services.some((v) => v.name === "web" && v.type === "NodePort" && v.port === 80) },
      { id: "k8s-6", title: "Apply a YAML file", goal: "Create the api deployment from ~/project/deployment.yaml.", hint: "kubectl apply -f ~/project/deployment.yaml", learn: "In real projects everything is YAML in Git, applied with kubectl apply.", check: (s) => s.k8s.deployments.some((d) => d.name === "api") },
    ],
  },
  {
    tool: "terraform",
    name: "Terraform",
    intro: "Run the full init → plan → apply → destroy workflow on main.tf.",
    missions: [
      { id: "tf-1", title: "Read the config", goal: "Go to the project folder and look at main.tf.", hint: "cd ~/project && cat main.tf", learn: "Resources describe what you want; Terraform works out how to create it.", check: (s) => has(s, `cat:${P}/main.tf`) },
      { id: "tf-2", title: "Initialise", goal: "Download the providers this config needs.", hint: "terraform init", learn: "init downloads providers (here: AWS) and sets up the backend.", check: (s) => s.tf.inited },
      { id: "tf-3", title: "Validate", goal: "Check the configuration for mistakes.", hint: "terraform validate", learn: "validate catches syntax and reference errors before you plan.", check: (s) => has(s, "terraform validate") },
      { id: "tf-4", title: "Plan", goal: "Preview what Terraform will create.", hint: "terraform plan", learn: "Always read the plan — it's your last chance to catch surprises.", check: (s) => has(s, "terraform plan") },
      { id: "tf-5", title: "Apply", goal: "Create the infrastructure without the confirmation prompt.", hint: "terraform apply -auto-approve", learn: "Terraform records what it created in the state file.", check: (s) => s.tf.applied },
      { id: "tf-6", title: "Destroy", goal: "List what's in the state, then destroy everything.", hint: "terraform state list && terraform destroy -auto-approve", learn: "destroy removes everything in state — great for cleaning up labs and saving money.", check: (s) => has(s, "terraform state list") && has(s, "terraform destroy") && !s.tf.applied },
    ],
  },
];

export const MISSION_IDS = new Set(TRACKS.flatMap((t) => t.missions.map((m) => m.id)));

export function missionCount(tool: string) {
  return TRACKS.find((t) => t.tool === tool)?.missions.length ?? 0;
}
