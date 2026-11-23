/**
 * Command Playground: a tiny pretend machine that runs in the browser.
 * Nothing here touches a real server — commands only change this in-memory state
 * and print realistic-looking output so learners can practise safely.
 */

export const HOME = "/home/student";

export type Container = { id: string; name: string; image: string; status: "running" | "exited"; ports: string[]; created: number };
export type Deployment = { name: string; image: string; replicas: number };
export type Service = { name: string; type: string; port: number; nodePort?: number };

export type SimState = {
  cwd: string;
  /** path → file content, or null for a directory */
  fs: Record<string, string | null>;
  docker: { images: string[]; containers: Container[] };
  k8s: { deployments: Deployment[]; services: Service[] };
  git: { root: string | null; branch: string; branches: string[]; staged: string[]; commits: { hash: string; msg: string; branch: string }[]; committed: Record<string, string> };
  tf: { inited: boolean; planned: boolean; applied: boolean };
  /** normalised record of successful commands, used by mission checks */
  log: string[];
  history: string[];
  tick: number;
};

const MAIN_TF = `terraform {
  required_providers {
    aws = { source = "hashicorp/aws" }
  }
}

provider "aws" {
  region = "ap-south-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0f5ee92e2d63afc18"
  instance_type = "t3.micro"
  tags = { Name = "generate-logic-web" }
}

resource "aws_s3_bucket" "assets" {
  bucket = "generate-logic-assets-demo"
}
`;

const DEPLOYMENT_YAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 2
  selector:
    matchLabels: { app: api }
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: api
          image: node:20-alpine
`;

export function initialState(): SimState {
  return {
    cwd: HOME,
    fs: {
      "/": null,
      "/home": null,
      [HOME]: null,
      [`${HOME}/notes.txt`]: "Remember: practise every day!\n",
      [`${HOME}/project`]: null,
      [`${HOME}/project/main.tf`]: MAIN_TF,
      [`${HOME}/project/deployment.yaml`]: DEPLOYMENT_YAML,
      [`${HOME}/project/README.md`]: "# Demo project\nUsed in the Generate Logic Command Playground.\n",
      "/etc": null,
      "/etc/hostname": "generatelogic\n",
      "/tmp": null,
    },
    docker: { images: ["hello-world"], containers: [] },
    k8s: { deployments: [], services: [{ name: "kubernetes", type: "ClusterIP", port: 443 }] },
    git: { root: null, branch: "main", branches: ["main"], staged: [], commits: [], committed: {} },
    tf: { inited: false, planned: false, applied: false },
    log: [],
    history: [],
    tick: 0,
  };
}

export type RunResult = { state: SimState; output: string[]; clear?: boolean };

/** Output lines may start with one of these markers to colour them. */
export const ERR = "\u0001";
export const OK = "\u0002";
export const WARN = "\u0003";

/* ───────────────────────── helpers ───────────────────────── */

function clone(s: SimState): SimState {
  return structuredClone(s);
}

/** Split a command line into words, keeping "quoted strings" together. */
export function tokenize(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quote: string | null = null;
  let had = false;
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      had = true;
    } else if (/\s/.test(ch)) {
      if (cur || had) out.push(cur);
      cur = "";
      had = false;
    } else cur += ch;
  }
  if (cur || had) out.push(cur);
  return out;
}

export function resolvePath(cwd: string, p: string): string {
  if (!p || p === "~") return HOME;
  let path = p.startsWith("~/") ? HOME + p.slice(1) : p.startsWith("/") ? p : `${cwd}/${p}`;
  const parts: string[] = [];
  for (const seg of path.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  path = "/" + parts.join("/");
  return path;
}

export function displayPath(p: string) {
  return p === HOME ? "~" : p.startsWith(HOME + "/") ? "~" + p.slice(HOME.length) : p;
}

const parentOf = (p: string) => (p === "/" ? "/" : p.slice(0, p.lastIndexOf("/")) || "/");
const baseName = (p: string) => p.slice(p.lastIndexOf("/") + 1);
const isDir = (s: SimState, p: string) => s.fs[p] === null;
const exists = (s: SimState, p: string) => p in s.fs;
const childrenOf = (s: SimState, dir: string) =>
  Object.keys(s.fs)
    .filter((p) => p !== dir && parentOf(p) === dir)
    .sort();

function hex(seed: string, len = 12) {
  let h = 2166136261;
  let out = "";
  while (out.length < len) {
    for (const c of seed + out.length) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    out += (h >>> 0).toString(16).padStart(8, "0");
  }
  return out.slice(0, len);
}

function flag(args: string[], ...names: string[]) {
  return args.some((a) => names.includes(a));
}

/** Value of --name=x or --name x */
function opt(args: string[], name: string): string | undefined {
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a === name) return args[i + 1];
    if (a.startsWith(name + "=")) return a.slice(name.length + 1);
  }
  return undefined;
}

function table(rows: string[][]): string[] {
  const widths = rows[0]!.map((_, c) => Math.max(...rows.map((r) => (r[c] ?? "").length)));
  return rows.map((r) => r.map((cell, c) => (c === r.length - 1 ? cell : cell.padEnd(widths[c]! + 3))).join("").trimEnd());
}

const ago = (s: SimState, t: number) => {
  const mins = Math.max(1, s.tick - t);
  return `${mins} minute${mins === 1 ? "" : "s"} ago`;
};

/* ───────────────────────── main entry ───────────────────────── */

export const COMMANDS = ["help", "clear", "pwd", "ls", "cd", "mkdir", "touch", "cat", "echo", "rm", "cp", "mv", "whoami", "date", "uname", "history", "git", "docker", "kubectl", "terraform"];

export function run(prev: SimState, line: string): RunResult {
  const trimmed = line.trim();
  let state = clone(prev);
  state.tick++;
  if (!trimmed) return { state: prev, output: [] };
  state.history.push(trimmed);

  const output: string[] = [];
  let clear = false;
  for (const part of trimmed.split("&&").map((p) => p.trim()).filter(Boolean)) {
    const r = runOne(state, part);
    state = r.state;
    output.push(...r.output);
    if (r.clear) {
      clear = true;
      output.length = 0;
    }
    if (r.failed) break;
  }
  return { state, output, clear };
}

type One = { state: SimState; output: string[]; clear?: boolean; failed?: boolean };

function runOne(s: SimState, line: string): One {
  // echo "text" > file / >> file
  const redirect = line.match(/^(.*?)\s*(>>?)\s*(\S+)$/);
  if (redirect && /^echo\b/.test(redirect[1]!)) {
    const text = tokenize(redirect[1]!).slice(1).join(" ");
    const path = resolvePath(s.cwd, redirect[3]!);
    if (!isDir(s, parentOf(path))) return fail(s, `bash: ${redirect[3]}: No such file or directory`);
    if (isDir(s, path)) return fail(s, `bash: ${redirect[3]}: Is a directory`);
    s.fs[path] = (redirect[2] === ">>" ? (s.fs[path] ?? "") : "") + text + "\n";
    s.log.push(`write:${path}`);
    return ok(s);
  }

  const words = tokenize(line);
  const [cmd, ...args] = words;
  switch (cmd) {
    case "help":
      return ok(s, [
        "Try real commands, for example:",
        "  Linux      pwd · ls -la · cd project · mkdir devops · cat notes.txt · echo \"hi\" > a.txt",
        "  Git        git init · git status · git add . · git commit -m \"msg\" · git log --oneline",
        "  Docker     docker pull nginx · docker run -d --name web -p 8080:80 nginx · docker ps",
        "  Kubernetes kubectl get nodes · kubectl create deployment web --image=nginx",
        "  Terraform  terraform init · terraform plan · terraform apply -auto-approve",
        "Use ↑/↓ for history, Tab to complete, and 'clear' to clean the screen.",
      ]);
    case "clear":
      return { state: s, output: [], clear: true };
    case "pwd":
      s.log.push("pwd");
      return ok(s, [s.cwd]);
    case "whoami":
      return ok(s, ["student"]);
    case "date":
      return ok(s, [new Date().toString()]);
    case "uname":
      return ok(s, [flag(args, "-a") ? "Linux generatelogic 6.8.0-generic #1 SMP x86_64 GNU/Linux" : "Linux"]);
    case "history":
      return ok(s, s.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`));
    case "ls":
      return ls(s, args);
    case "cd": {
      const target = resolvePath(s.cwd, args[0] ?? "~");
      if (!exists(s, target)) return fail(s, `bash: cd: ${args[0]}: No such file or directory`);
      if (!isDir(s, target)) return fail(s, `bash: cd: ${args[0]}: Not a directory`);
      s.cwd = target;
      s.log.push(`cd:${target}`);
      return ok(s);
    }
    case "mkdir": {
      const p = flag(args, "-p");
      const names = args.filter((a) => !a.startsWith("-"));
      if (!names.length) return fail(s, "mkdir: missing operand");
      for (const n of names) {
        const path = resolvePath(s.cwd, n);
        if (exists(s, path)) {
          if (p) continue;
          return fail(s, `mkdir: cannot create directory '${n}': File exists`);
        }
        if (!isDir(s, parentOf(path))) {
          if (!p) return fail(s, `mkdir: cannot create directory '${n}': No such file or directory`);
          let cur = "";
          for (const seg of path.split("/").filter(Boolean)) {
            cur += "/" + seg;
            if (!exists(s, cur)) s.fs[cur] = null;
          }
        } else s.fs[path] = null;
        s.log.push(`mkdir:${path}`);
      }
      return ok(s);
    }
    case "touch": {
      if (!args.length) return fail(s, "touch: missing file operand");
      for (const n of args) {
        const path = resolvePath(s.cwd, n);
        if (!isDir(s, parentOf(path))) return fail(s, `touch: cannot touch '${n}': No such file or directory`);
        if (!exists(s, path)) s.fs[path] = "";
        s.log.push(`touch:${path}`);
      }
      return ok(s);
    }
    case "cat": {
      if (!args.length) return fail(s, "cat: missing file operand");
      const out: string[] = [];
      for (const n of args) {
        const path = resolvePath(s.cwd, n);
        if (!exists(s, path)) return fail(s, `cat: ${n}: No such file or directory`, out);
        if (isDir(s, path)) return fail(s, `cat: ${n}: Is a directory`, out);
        out.push(...(s.fs[path] ?? "").replace(/\n$/, "").split("\n"));
        s.log.push(`cat:${path}`);
      }
      return ok(s, out);
    }
    case "echo":
      return ok(s, [args.join(" ")]);
    case "rm": {
      const recursive = args.some((a) => /^-[a-z]*r/i.test(a));
      const names = args.filter((a) => !a.startsWith("-"));
      if (!names.length) return fail(s, "rm: missing operand");
      for (const n of names) {
        const path = resolvePath(s.cwd, n);
        if (!exists(s, path)) return fail(s, `rm: cannot remove '${n}': No such file or directory`);
        if (isDir(s, path) && !recursive) return fail(s, `rm: cannot remove '${n}': Is a directory`);
        if (path === "/" || path === HOME || s.cwd.startsWith(path)) return fail(s, `rm: refusing to remove '${n}'`);
        for (const k of Object.keys(s.fs)) if (k === path || k.startsWith(path + "/")) delete s.fs[k];
        s.log.push(`rm:${path}`);
      }
      return ok(s);
    }
    case "cp":
    case "mv": {
      const names = args.filter((a) => !a.startsWith("-"));
      if (names.length !== 2) return fail(s, `${cmd}: expected a source and a destination`);
      const src = resolvePath(s.cwd, names[0]!);
      let dst = resolvePath(s.cwd, names[1]!);
      if (!exists(s, src)) return fail(s, `${cmd}: cannot stat '${names[0]}': No such file or directory`);
      if (isDir(s, src)) return fail(s, `${cmd}: '${names[0]}' is a directory (not supported here)`);
      if (isDir(s, dst)) dst = `${dst}/${baseName(src)}`;
      if (!isDir(s, parentOf(dst))) return fail(s, `${cmd}: cannot create '${names[1]}': No such file or directory`);
      s.fs[dst] = s.fs[src] ?? "";
      if (cmd === "mv") delete s.fs[src];
      s.log.push(`${cmd}:${src}:${dst}`);
      return ok(s);
    }
    case "git":
      return git(s, args);
    case "docker":
      return docker(s, args);
    case "kubectl":
    case "k":
      return kubectl(s, args);
    case "terraform":
    case "tf":
      return terraform(s, args);
    case "sudo":
      return fail(s, "sudo is disabled in the playground — you already have everything you need.");
    case "vim":
    case "nano":
    case "vi":
      return fail(s, `${cmd} isn't available here. Use echo "text" > file to write files.`);
    default:
      return fail(s, `${cmd}: command not found. Type 'help' to see what you can try.`);
  }
}

function ok(s: SimState, output: string[] = []): One {
  return { state: s, output };
}
function fail(s: SimState, msg: string, before: string[] = []): One {
  return { state: s, output: [...before, `\u0001${msg}`], failed: true };
}

/* ───────────────────────── Linux: ls ───────────────────────── */

function ls(s: SimState, args: string[]): One {
  const long = args.some((a) => /^-[a-z]*l/.test(a));
  const all = args.some((a) => /^-[a-z]*a/.test(a));
  const target = resolvePath(s.cwd, args.find((a) => !a.startsWith("-")) ?? ".");
  if (!exists(s, target)) return fail(s, `ls: cannot access '${args.find((a) => !a.startsWith("-"))}': No such file or directory`);
  s.log.push(`ls:${target}`);
  if (!isDir(s, target)) return ok(s, [baseName(target)]);
  let names = childrenOf(s, target).map(baseName);
  if (s.git.root === target && all) names = [".git", ...names];
  if (!all) names = names.filter((n) => !n.startsWith("."));
  if (!long) return ok(s, names.length ? [names.map((n) => (isDir(s, `${target}/${n}`) || n === ".git" ? `${n}/` : n)).join("  ")] : []);
  const rows = names.map((n) => {
    const p = `${target}/${n}`;
    const dir = n === ".git" || isDir(s, p);
    const size = dir ? 4096 : (s.fs[p] ?? "").length;
    return `${dir ? "drwxr-xr-x" : "-rw-r--r--"} 1 student student ${String(size).padStart(5)} Nov 23 10:00 ${n}${dir ? "/" : ""}`;
  });
  return ok(s, [`total ${rows.length * 4}`, ...rows]);
}

/* ───────────────────────── Git ───────────────────────── */

function repoFiles(s: SimState) {
  const root = s.git.root!;
  return Object.keys(s.fs)
    .filter((p) => p.startsWith(root + "/") && s.fs[p] !== null)
    .map((p) => p.slice(root.length + 1))
    .sort();
}

function git(s: SimState, args: string[]): One {
  const [sub, ...rest] = args;
  if (!sub || sub === "--help") return ok(s, ["usage: git <command> — try init, status, add, commit, log, branch, checkout, switch"]);
  if (sub === "--version" || sub === "version") return ok(s, ["git version 2.43.0"]);
  if (sub === "init") {
    if (s.git.root === s.cwd) return ok(s, [`Reinitialized existing Git repository in ${s.cwd}/.git/`]);
    s.git = { root: s.cwd, branch: "main", branches: ["main"], staged: [], commits: [], committed: {} };
    s.log.push(`git init:${s.cwd}`);
    return ok(s, [`Initialized empty Git repository in ${s.cwd}/.git/`]);
  }
  const root = s.git.root;
  if (!root || !(s.cwd === root || s.cwd.startsWith(root + "/")))
    return fail(s, "fatal: not a git repository (or any of the parent directories): .git");

  const files = repoFiles(s);
  const changed = files.filter((f) => s.git.committed[f] !== s.fs[`${root}/${f}`]);
  const deleted = Object.keys(s.git.committed).filter((f) => !files.includes(f));

  switch (sub) {
    case "status": {
      s.log.push("git status");
      const staged = s.git.staged;
      const unstaged = changed.filter((f) => !staged.includes(f));
      const out = [`On branch ${s.git.branch}`];
      if (!s.git.commits.length) out.push("", "No commits yet");
      if (staged.length) out.push("", "Changes to be committed:", ...staged.map((f) => `\t${s.git.committed[f] === undefined ? "new file:" : "modified:"}   ${f}`).map((l) => `\u0002${l}`));
      if (unstaged.length || deleted.length)
        out.push("", "Untracked / changed files:", '  (use "git add <file>..." to include in what will be committed)', ...unstaged.map((f) => `\u0003\t${f}`), ...deleted.map((f) => `\u0003\tdeleted: ${f}`));
      if (!staged.length && !unstaged.length && !deleted.length) out.push("nothing to commit, working tree clean");
      return ok(s, out);
    }
    case "add": {
      if (!rest.length) return fail(s, "Nothing specified, nothing added.");
      const all = rest.includes(".") || rest.includes("-A") || rest.includes("--all");
      const pick = all
        ? changed
        : rest.map((r) => {
            const full = resolvePath(s.cwd, r);
            return full.slice(root.length + 1);
          });
      for (const f of pick) {
        if (!all && !files.includes(f)) return fail(s, `fatal: pathspec '${f}' did not match any files`);
        if (!s.git.staged.includes(f) && changed.includes(f)) s.git.staged.push(f);
      }
      s.log.push("git add");
      return ok(s);
    }
    case "commit": {
      const msg = opt(rest, "-m");
      if (!msg) return fail(s, 'error: please add a message, e.g. git commit -m "Add main.tf"');
      if (!s.git.staged.length) return fail(s, "nothing to commit (use \"git add\" to stage files first)");
      const hash = hex(msg + s.tick, 7);
      for (const f of s.git.staged) s.git.committed[f] = s.fs[`${root}/${f}`] ?? "";
      const n = s.git.staged.length;
      s.git.staged = [];
      s.git.commits.unshift({ hash, msg, branch: s.git.branch });
      s.log.push("git commit");
      return ok(s, [`[${s.git.branch}${s.git.commits.length === 1 ? " (root-commit)" : ""} ${hash}] ${msg}`, ` ${n} file${n === 1 ? "" : "s"} changed`]);
    }
    case "log": {
      s.log.push("git log");
      if (!s.git.commits.length) return fail(s, `fatal: your current branch '${s.git.branch}' does not have any commits yet`);
      if (rest.includes("--oneline")) return ok(s, s.git.commits.map((c, i) => `${c.hash} ${i === 0 ? `(HEAD -> ${s.git.branch}) ` : ""}${c.msg}`));
      return ok(s, s.git.commits.flatMap((c, i) => [`commit ${c.hash}${hex(c.hash, 33)}${i === 0 ? ` (HEAD -> ${s.git.branch})` : ""}`, "Author: Student <student@generatelogic.in>", "", `    ${c.msg}`, ""]));
    }
    case "branch": {
      const name = rest.find((r) => !r.startsWith("-"));
      if (!name) return ok(s, s.git.branches.map((b) => (b === s.git.branch ? `* ${b}` : `  ${b}`)));
      if (!s.git.commits.length) return fail(s, `fatal: not a valid object name: '${s.git.branch}' (make a commit first)`);
      if (s.git.branches.includes(name)) return fail(s, `fatal: a branch named '${name}' already exists`);
      s.git.branches.push(name);
      s.log.push(`git branch:${name}`);
      return ok(s);
    }
    case "checkout":
    case "switch": {
      const create = rest.includes("-b") || rest.includes("-c");
      const name = rest.find((r) => !r.startsWith("-"));
      if (!name) return fail(s, `fatal: missing branch name`);
      if (create) {
        if (!s.git.commits.length) return fail(s, "fatal: make a commit before creating branches");
        if (s.git.branches.includes(name)) return fail(s, `fatal: a branch named '${name}' already exists`);
        s.git.branches.push(name);
      } else if (!s.git.branches.includes(name)) return fail(s, `error: pathspec '${name}' did not match any branch`);
      s.git.branch = name;
      s.log.push(`git switch:${name}`);
      return ok(s, [`Switched to ${create ? "a new " : ""}branch '${name}'`]);
    }
    case "push":
      return fail(s, "fatal: no remote configured in the playground (on a real machine: git remote add origin <url>)");
    default:
      return fail(s, `git: '${sub}' is not supported in the playground yet.`);
  }
}

/* ───────────────────────── Docker ───────────────────────── */

const KNOWN_IMAGES = ["nginx", "redis", "postgres", "node", "python", "alpine", "ubuntu", "httpd", "mysql", "busybox", "hello-world"];
const imageBase = (img: string) => img.split(":")[0]!;

function findContainer(s: SimState, ref: string) {
  return s.docker.containers.find((c) => c.name === ref || c.id.startsWith(ref));
}

function docker(s: SimState, args: string[]): One {
  let [sub, ...rest] = args;
  if (sub === "container" || sub === "image") {
    const map: Record<string, string> = { ls: sub === "image" ? "images" : "ps", rm: sub === "image" ? "rmi" : "rm" };
    sub = map[rest[0] ?? ""] ?? rest[0];
    rest = rest.slice(1);
  }
  switch (sub) {
    case undefined:
    case "--help":
      return ok(s, ["Usage: docker COMMAND — try pull, images, run, ps, stop, start, logs, rm, rmi"]);
    case "--version":
    case "version":
      return ok(s, ["Docker version 27.3.1, build ce12230"]);
    case "pull": {
      const img = rest[0];
      if (!img) return fail(s, '"docker pull" requires exactly 1 argument.');
      if (!KNOWN_IMAGES.includes(imageBase(img))) return fail(s, `Error response from daemon: pull access denied for ${img}, repository does not exist`);
      const tag = img.includes(":") ? img.split(":")[1] : "latest";
      if (!s.docker.images.includes(imageBase(img))) s.docker.images.push(imageBase(img));
      s.log.push(`docker pull:${imageBase(img)}`);
      return ok(s, [`${tag}: Pulling from library/${imageBase(img)}`, `${hex(img, 12)}: Pull complete`, `Digest: sha256:${hex(img + "d", 40)}`, `Status: Downloaded newer image for ${imageBase(img)}:${tag}`]);
    }
    case "images": {
      s.log.push("docker images");
      return ok(s, table([["REPOSITORY", "TAG", "IMAGE ID", "SIZE"], ...s.docker.images.map((i) => [i, "latest", hex(i, 12), i === "hello-world" ? "13.3kB" : "187MB"])]));
    }
    case "run": {
      const detached = rest.some((a) => /^-[a-z]*d/.test(a));
      const name = opt(rest, "--name");
      const ports: string[] = [];
      for (let i = 0; i < rest.length; i++) if (rest[i] === "-p" && rest[i + 1]) ports.push(rest[i + 1]!);
      // image = first word that isn't a flag or a flag's value
      let img: string | undefined;
      for (let i = 0; i < rest.length; i++) {
        const a = rest[i]!;
        if (a === "-p" || a === "--name" || a === "-e" || a === "-v") {
          i++;
          continue;
        }
        if (a.startsWith("-")) continue;
        img = a;
        break;
      }
      if (!img) return fail(s, '"docker run" requires at least 1 argument (an image).');
      const base = imageBase(img);
      if (!KNOWN_IMAGES.includes(base)) return fail(s, `Unable to find image '${img}' locally\ndocker: Error response from daemon: repository ${img} not found.`);
      if (name && s.docker.containers.some((c) => c.name === name))
        return fail(s, `docker: Error response from daemon: Conflict. The container name "/${name}" is already in use.`);
      if (ports.some((p) => s.docker.containers.some((c) => c.status === "running" && c.ports.some((q) => q.split(":")[0] === p.split(":")[0]))))
        return fail(s, "docker: Error response from daemon: port is already allocated.");
      const out: string[] = [];
      if (!s.docker.images.includes(base)) {
        out.push(`Unable to find image '${base}:latest' locally`, `latest: Pulling from library/${base}`, `Status: Downloaded newer image for ${base}:latest`);
        s.docker.images.push(base);
      }
      const id = hex(base + s.tick, 64);
      const short = id.slice(0, 12);
      const cname = name ?? `${["eager", "brave", "quirky", "sleepy"][s.tick % 4]}_${["turing", "hopper", "lovelace", "torvalds"][s.tick % 4]}`;
      const longRunning = !["hello-world", "busybox", "alpine", "ubuntu"].includes(base);
      s.docker.containers.push({ id, name: cname, image: base, status: longRunning ? "running" : "exited", ports, created: s.tick });
      s.log.push(`docker run:${base}`);
      if (base === "hello-world") out.push("", "Hello from Docker!", "This message shows that your installation appears to be working correctly.");
      else if (detached) out.push(id);
      else out.push(`(container ${short} started — in a real terminal it would stay attached; use -d to run in the background)`);
      return ok(s, out);
    }
    case "ps": {
      const all = rest.some((a) => /^-[a-z]*a/.test(a) || a === "--all");
      s.log.push(all ? "docker ps -a" : "docker ps");
      const list = s.docker.containers.filter((c) => all || c.status === "running");
      return ok(
        s,
        table([
          ["CONTAINER ID", "IMAGE", "STATUS", "PORTS", "NAMES"],
          ...list.map((c) => [c.id.slice(0, 12), c.image, c.status === "running" ? `Up ${ago(s, c.created)}` : "Exited (0)", c.ports.map((p) => `0.0.0.0:${p.replace(":", "->")}/tcp`).join(", "), c.name]),
        ]),
      );
    }
    case "stop":
    case "start":
    case "restart": {
      if (!rest.length) return fail(s, `"docker ${sub}" requires at least 1 argument.`);
      const out: string[] = [];
      for (const ref of rest) {
        const c = findContainer(s, ref);
        if (!c) return fail(s, `Error response from daemon: No such container: ${ref}`, out);
        c.status = sub === "stop" ? "exited" : "running";
        if (sub !== "stop") c.created = s.tick;
        s.log.push(`docker ${sub}:${c.name}`);
        out.push(ref);
      }
      return ok(s, out);
    }
    case "rm": {
      const force = rest.some((a) => a === "-f" || a === "--force");
      const refs = rest.filter((a) => !a.startsWith("-"));
      if (!refs.length) return fail(s, '"docker rm" requires at least 1 argument.');
      const out: string[] = [];
      for (const ref of refs) {
        const c = findContainer(s, ref);
        if (!c) return fail(s, `Error response from daemon: No such container: ${ref}`, out);
        if (c.status === "running" && !force) return fail(s, `Error response from daemon: cannot remove container "${ref}": container is running: stop the container before removing or use -f`, out);
        s.docker.containers = s.docker.containers.filter((x) => x !== c);
        s.log.push(`docker rm:${c.name}`);
        out.push(ref);
      }
      return ok(s, out);
    }
    case "rmi": {
      const img = rest.find((a) => !a.startsWith("-"));
      if (!img) return fail(s, '"docker rmi" requires at least 1 argument.');
      const base = imageBase(img);
      if (!s.docker.images.includes(base)) return fail(s, `Error response from daemon: No such image: ${img}`);
      if (s.docker.containers.some((c) => c.image === base)) return fail(s, `Error response from daemon: conflict: unable to remove image ${base} — it is used by a container`);
      s.docker.images = s.docker.images.filter((i) => i !== base);
      s.log.push(`docker rmi:${base}`);
      return ok(s, [`Untagged: ${base}:latest`, `Deleted: sha256:${hex(base, 40)}`]);
    }
    case "logs": {
      const c = rest[0] ? findContainer(s, rest[rest.length - 1]!) : undefined;
      if (!c) return fail(s, `Error response from daemon: No such container: ${rest[0] ?? ""}`);
      s.log.push(`docker logs:${c.name}`);
      if (c.image === "nginx")
        return ok(s, ["/docker-entrypoint.sh: Configuration complete; ready for start up", `${new Date().toISOString()} [notice] 1#1: nginx/1.27.2`, `${new Date().toISOString()} [notice] 1#1: start worker processes`]);
      if (c.image === "redis") return ok(s, ["* Ready to accept connections tcp"]);
      return ok(s, [`(${c.image} started)`]);
    }
    case "exec": {
      const ref = rest.find((a) => !a.startsWith("-"));
      const c = ref ? findContainer(s, ref) : undefined;
      if (!c) return fail(s, `Error response from daemon: No such container: ${ref ?? ""}`);
      if (c.status !== "running") return fail(s, `Error response from daemon: container ${ref} is not running`);
      s.log.push(`docker exec:${c.name}`);
      return ok(s, [`(you are "inside" ${c.name} — the playground doesn't open nested shells, but on a real machine you would get a prompt like root@${c.id.slice(0, 12)}:/#)`]);
    }
    case "build":
      return fail(s, "docker build needs a Dockerfile and a real Docker engine — try it on your machine after the playground missions!");
    default:
      return fail(s, `docker: '${sub}' is not supported in the playground yet.`);
  }
}

/* ───────────────────────── Kubernetes ───────────────────────── */

function podsOf(d: Deployment) {
  return Array.from({ length: d.replicas }, (_, i) => `${d.name}-${hex(d.name, 10)}-${hex(d.name + i, 5)}`);
}

function kubectl(s: SimState, args: string[]): One {
  const [sub, ...rest] = args;
  const kind = (rest[0] ?? "").toLowerCase();
  const norm = (k: string) =>
    ({ po: "pods", pod: "pods", pods: "pods", deploy: "deployments", deployment: "deployments", deployments: "deployments", svc: "services", service: "services", services: "services", no: "nodes", node: "nodes", nodes: "nodes", ns: "namespaces", namespace: "namespaces", namespaces: "namespaces" })[k];
  switch (sub) {
    case undefined:
    case "--help":
      return ok(s, ["kubectl controls the Kubernetes cluster — try get, create, scale, expose, describe, delete, apply"]);
    case "version":
      return ok(s, ["Client Version: v1.31.2", "Server Version: v1.31.1"]);
    case "cluster-info":
      return ok(s, ["Kubernetes control plane is running at https://127.0.0.1:6443", "CoreDNS is running at https://127.0.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy"]);
    case "get": {
      const what = norm(kind.split(",")[0]!);
      if (!what) return fail(s, `error: the server doesn't have a resource type "${rest[0] ?? ""}"`);
      s.log.push(`kubectl get:${what}`);
      if (what === "nodes")
        return ok(s, table([["NAME", "STATUS", "ROLES", "AGE", "VERSION"], ["control-plane", "Ready", "control-plane", "12d", "v1.31.1"], ["worker-1", "Ready", "<none>", "12d", "v1.31.1"], ["worker-2", "Ready", "<none>", "12d", "v1.31.1"]]));
      if (what === "namespaces")
        return ok(s, table([["NAME", "STATUS", "AGE"], ["default", "Active", "12d"], ["kube-node-lease", "Active", "12d"], ["kube-public", "Active", "12d"], ["kube-system", "Active", "12d"]]));
      if (what === "deployments") {
        if (!s.k8s.deployments.length) return ok(s, ["No resources found in default namespace."]);
        return ok(s, table([["NAME", "READY", "UP-TO-DATE", "AVAILABLE", "AGE"], ...s.k8s.deployments.map((d) => [d.name, `${d.replicas}/${d.replicas}`, String(d.replicas), String(d.replicas), "1m"])]));
      }
      if (what === "pods") {
        const pods = s.k8s.deployments.flatMap(podsOf);
        if (!pods.length) return ok(s, ["No resources found in default namespace."]);
        return ok(s, table([["NAME", "READY", "STATUS", "RESTARTS", "AGE"], ...pods.map((p) => [p, "1/1", "Running", "0", "1m"])]));
      }
      return ok(
        s,
        table([
          ["NAME", "TYPE", "CLUSTER-IP", "PORT(S)", "AGE"],
          ...s.k8s.services.map((v, i) => [v.name, v.type, `10.96.${i}.${10 + i}`, v.nodePort ? `${v.port}:${v.nodePort}/TCP` : `${v.port}/TCP`, i === 0 ? "12d" : "1m"]),
        ]),
      );
    }
    case "create": {
      if (kind !== "deployment" && kind !== "deploy") return fail(s, "the playground supports: kubectl create deployment <name> --image=<image>");
      const name = rest[1];
      const image = opt(rest, "--image");
      if (!name || name.startsWith("-") || !image) return fail(s, "error: usage: kubectl create deployment <name> --image=<image>");
      if (s.k8s.deployments.some((d) => d.name === name)) return fail(s, `Error from server (AlreadyExists): deployments.apps "${name}" already exists`);
      const replicas = Number(opt(rest, "--replicas") ?? 1) || 1;
      s.k8s.deployments.push({ name, image, replicas });
      s.log.push(`kubectl create deployment:${name}`);
      return ok(s, [`deployment.apps/${name} created`]);
    }
    case "apply": {
      const file = opt(rest, "-f");
      if (!file) return fail(s, "error: must specify -f <file>");
      const path = resolvePath(s.cwd, file);
      const text = s.fs[path];
      if (text === undefined || text === null) return fail(s, `error: the path "${file}" does not exist`);
      if (!/kind:\s*Deployment/.test(text)) return fail(s, "error: the playground only applies Deployment files");
      const name = text.match(/metadata:\s*\n\s*name:\s*(\S+)/)?.[1] ?? "app";
      const image = text.match(/image:\s*(\S+)/)?.[1] ?? "nginx";
      const replicas = Number(text.match(/replicas:\s*(\d+)/)?.[1] ?? 1);
      const existing = s.k8s.deployments.find((d) => d.name === name);
      if (existing) Object.assign(existing, { image, replicas });
      else s.k8s.deployments.push({ name, image, replicas });
      s.log.push(`kubectl apply:${name}`);
      return ok(s, [`deployment.apps/${name} ${existing ? "configured" : "created"}`]);
    }
    case "scale": {
      const ref = rest.find((r) => !r.startsWith("-"));
      const name = ref?.includes("/") ? ref.split("/")[1] : rest[1] && norm(kind) === "deployments" ? rest[1] : ref;
      const d = s.k8s.deployments.find((x) => x.name === name);
      const replicas = Number(opt(rest, "--replicas"));
      if (!d) return fail(s, `Error from server (NotFound): deployments.apps "${name ?? ""}" not found`);
      if (!Number.isInteger(replicas) || replicas < 0 || replicas > 20) return fail(s, "error: --replicas must be a number between 0 and 20");
      d.replicas = replicas;
      s.log.push(`kubectl scale:${d.name}:${replicas}`);
      return ok(s, [`deployment.apps/${d.name} scaled`]);
    }
    case "expose": {
      const ref = rest.find((r) => !r.startsWith("-"));
      const name = ref?.includes("/") ? ref.split("/")[1] : rest[1] && norm(kind) === "deployments" ? rest[1] : ref;
      const d = s.k8s.deployments.find((x) => x.name === name);
      if (!d) return fail(s, `Error from server (NotFound): deployments.apps "${name ?? ""}" not found`);
      const port = Number(opt(rest, "--port"));
      if (!port) return fail(s, "error: couldn't find port via --port flag");
      const type = opt(rest, "--type") ?? "ClusterIP";
      if (!["ClusterIP", "NodePort", "LoadBalancer"].includes(type)) return fail(s, `error: invalid service type "${type}"`);
      if (s.k8s.services.some((v) => v.name === d.name)) return fail(s, `Error from server (AlreadyExists): services "${d.name}" already exists`);
      s.k8s.services.push({ name: d.name, type, port, nodePort: type === "ClusterIP" ? undefined : 30000 + (s.tick % 2767) });
      s.log.push(`kubectl expose:${d.name}:${type}`);
      return ok(s, [`service/${d.name} exposed`]);
    }
    case "describe": {
      const what = norm(kind);
      const name = rest[1];
      if (what === "deployments") {
        const d = s.k8s.deployments.find((x) => x.name === name);
        if (!d) return fail(s, `Error from server (NotFound): deployments.apps "${name ?? ""}" not found`);
        s.log.push(`kubectl describe:${d.name}`);
        return ok(s, [`Name:          ${d.name}`, "Namespace:     default", `Replicas:      ${d.replicas} desired | ${d.replicas} updated | ${d.replicas} available`, "StrategyType:  RollingUpdate", "Pod Template:", `  Containers:`, `   ${d.image.split(":")[0]}:`, `    Image:  ${d.image}`]);
      }
      return fail(s, "the playground can describe deployments: kubectl describe deployment <name>");
    }
    case "delete": {
      const what = norm(kind.split("/")[0]!);
      const name = kind.includes("/") ? kind.split("/")[1] : rest[1];
      if (what === "deployments") {
        if (!s.k8s.deployments.some((d) => d.name === name)) return fail(s, `Error from server (NotFound): deployments.apps "${name ?? ""}" not found`);
        s.k8s.deployments = s.k8s.deployments.filter((d) => d.name !== name);
        s.log.push(`kubectl delete deployment:${name}`);
        return ok(s, [`deployment.apps "${name}" deleted`]);
      }
      if (what === "services") {
        if (name === "kubernetes") return fail(s, "let's keep the built-in 'kubernetes' service 🙂");
        if (!s.k8s.services.some((v) => v.name === name)) return fail(s, `Error from server (NotFound): services "${name ?? ""}" not found`);
        s.k8s.services = s.k8s.services.filter((v) => v.name !== name);
        s.log.push(`kubectl delete service:${name}`);
        return ok(s, [`service "${name}" deleted`]);
      }
      if (what === "pods") {
        const d = s.k8s.deployments.find((x) => podsOf(x).includes(name ?? ""));
        if (!d) return fail(s, `Error from server (NotFound): pods "${name ?? ""}" not found`);
        s.log.push("kubectl delete pod");
        return ok(s, [`pod "${name}" deleted`, `(the Deployment "${d.name}" immediately creates a replacement pod — that's self-healing!)`]);
      }
      return fail(s, `error: the playground can delete deployments, services and pods`);
    }
    case "logs":
      return ok(s, ["(pod logs) server listening on port 80"]);
    default:
      return fail(s, `kubectl: '${sub}' is not supported in the playground yet.`);
  }
}

/* ───────────────────────── Terraform ───────────────────────── */

function terraform(s: SimState, args: string[]): One {
  const [sub, ...rest] = args;
  if (sub === "version" || sub === "--version" || sub === "-v") return ok(s, ["Terraform v1.9.8", "on linux_amd64"]);
  if (!sub || sub === "--help") return ok(s, ["Usage: terraform <command> — try init, validate, fmt, plan, apply, state list, destroy"]);
  const hasTf = Object.keys(s.fs).some((p) => parentOf(p) === s.cwd && p.endsWith(".tf"));
  if (!hasTf) return fail(s, `Error: No configuration files in ${displayPath(s.cwd)}. Go to the folder with main.tf first (cd ~/project).`);
  const needsInit = () => fail(s, 'Error: Inconsistent dependency lock file. Run "terraform init" first.');
  switch (sub) {
    case "init":
      s.tf.inited = true;
      s.log.push("terraform init");
      return ok(s, ["Initializing the backend...", "Initializing provider plugins...", "- Installing hashicorp/aws v5.76.0...", "- Installed hashicorp/aws v5.76.0 (signed by HashiCorp)", "", "\u0002Terraform has been successfully initialized!"]);
    case "validate":
      if (!s.tf.inited) return needsInit();
      s.log.push("terraform validate");
      return ok(s, ["\u0002Success! The configuration is valid."]);
    case "fmt":
      s.log.push("terraform fmt");
      return ok(s, []);
    case "plan":
      if (!s.tf.inited) return needsInit();
      s.tf.planned = true;
      s.log.push("terraform plan");
      if (s.tf.applied) return ok(s, ["No changes. Your infrastructure matches the configuration."]);
      return ok(s, [
        "Terraform will perform the following actions:",
        "",
        "\u0002  # aws_instance.web will be created",
        '\u0002  + resource "aws_instance" "web" {',
        '\u0002      + ami           = "ami-0f5ee92e2d63afc18"',
        '\u0002      + instance_type = "t3.micro"',
        "\u0002    }",
        "",
        "\u0002  # aws_s3_bucket.assets will be created",
        '\u0002  + resource "aws_s3_bucket" "assets" {',
        '\u0002      + bucket = "generate-logic-assets-demo"',
        "\u0002    }",
        "",
        "Plan: 2 to add, 0 to change, 0 to destroy.",
      ]);
    case "apply":
      if (!s.tf.inited) return needsInit();
      s.log.push("terraform apply");
      if (s.tf.applied) return ok(s, ["No changes. Your infrastructure matches the configuration.", "", "Apply complete! Resources: 0 added, 0 changed, 0 destroyed."]);
      s.tf.applied = true;
      return ok(s, [
        ...(rest.includes("-auto-approve") ? [] : ["(playground: auto-approving — a real terminal would ask you to type 'yes')"]),
        "aws_s3_bucket.assets: Creating...",
        "aws_instance.web: Creating...",
        "aws_s3_bucket.assets: Creation complete after 2s [id=generate-logic-assets-demo]",
        "aws_instance.web: Creation complete after 13s [id=i-0a1b2c3d4e5f67890]",
        "",
        "\u0002Apply complete! Resources: 2 added, 0 changed, 0 destroyed.",
      ]);
    case "state":
      if (rest[0] !== "list") return fail(s, "the playground supports: terraform state list");
      s.log.push("terraform state list");
      return ok(s, s.tf.applied ? ["aws_instance.web", "aws_s3_bucket.assets"] : []);
    case "show":
      s.log.push("terraform show");
      return ok(s, s.tf.applied ? ["# aws_instance.web:", 'resource "aws_instance" "web" {', '    id            = "i-0a1b2c3d4e5f67890"', '    instance_type = "t3.micro"', "}"] : ["The state file is empty. No resources are represented."]);
    case "destroy":
      if (!s.tf.inited) return needsInit();
      s.log.push("terraform destroy");
      if (!s.tf.applied) return ok(s, ["No changes. No objects need to be destroyed."]);
      s.tf.applied = false;
      return ok(s, [
        ...(rest.includes("-auto-approve") ? [] : ["(playground: auto-approving — a real terminal would ask you to type 'yes')"]),
        "aws_instance.web: Destroying... [id=i-0a1b2c3d4e5f67890]",
        "aws_s3_bucket.assets: Destroying... [id=generate-logic-assets-demo]",
        "aws_instance.web: Destruction complete after 31s",
        "",
        "\u0002Destroy complete! Resources: 2 destroyed.",
      ]);
    default:
      return fail(s, `terraform: '${sub}' is not supported in the playground yet.`);
  }
}

/** Simple Tab completion: commands first, then files in the current folder. */
export function complete(s: SimState, line: string): string {
  const words = line.split(" ");
  const last = words[words.length - 1] ?? "";
  if (words.length === 1) {
    const m = COMMANDS.filter((c) => c.startsWith(last));
    return m.length === 1 ? `${m[0]} ` : line;
  }
  const dirPart = last.includes("/") ? last.slice(0, last.lastIndexOf("/") + 1) : "";
  const dir = resolvePath(s.cwd, dirPart || ".");
  const m = childrenOf(s, dir)
    .map(baseName)
    .filter((n) => n.startsWith(last.slice(dirPart.length)));
  if (m.length !== 1) return line;
  const full = `${dir}/${m[0]}`.replace("//", "/");
  words[words.length - 1] = dirPart + m[0] + (isDir(s, full) ? "/" : " ");
  return words.join(" ");
}
