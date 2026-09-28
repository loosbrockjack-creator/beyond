/**
 * Pulls a snapshot of a public GitHub repo so the grader scores the code that
 * was actually written, not the student's description of it.
 *
 * Unauthenticated GitHub allows 60 requests an hour, which is fine for
 * occasional grading. Set GITHUB_TOKEN to raise it to 5000.
 */

export interface RepoFile {
  path: string;
  content: string;
}

export interface RepoSnapshot {
  owner: string;
  repo: string;
  branch: string;
  files: RepoFile[];
  totalFiles: number;
  truncated: boolean;
}

const MAX_BYTES = 180_000;
const MAX_FILES = 40;
const MAX_FILE_BYTES = 40_000;

/** Source and prose. Everything else is noise to a grader. */
const KEEP = /\.(ts|tsx|js|jsx|mjs|cjs|py|rb|go|rs|java|kt|swift|sh|sql|toml|ya?ml|json|md|txt|env\.example)$/i;

const SKIP_DIR = /(^|\/)(node_modules|\.git|\.next|dist|build|out|vendor|target|__pycache__|\.venv|venv|coverage|\.turbo)(\/|$)/i;
const SKIP_FILE = /(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|poetry\.lock|Cargo\.lock|\.min\.(js|css)$)/i;

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url.trim());
    if (!/(^|\.)github\.com$/i.test(u.hostname)) return null;
    const [owner, repo] = u.pathname.replace(/^\/+/, "").split("/");
    if (!owner || !repo) return null;
    return { owner, repo: repo.replace(/\.git$/i, "") };
  } catch {
    return null;
  }
}

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "beyond-course-grader",
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

export async function fetchRepoSnapshot(url: string): Promise<RepoSnapshot> {
  const parsed = parseRepoUrl(url);
  if (!parsed) throw new Error("That does not look like a GitHub repository URL");
  const { owner, repo } = parsed;

  const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: headers() });
  if (metaRes.status === 404) {
    throw new Error(
      process.env.GITHUB_TOKEN
        ? "Repository not found. Check the URL, and that your GITHUB_TOKEN can see it."
        : "Repository not found. Make it public, or set GITHUB_TOKEN to grade private repos.",
    );
  }
  if (metaRes.status === 403) {
    throw new Error("GitHub rate limit hit. Wait an hour, or set GITHUB_TOKEN.");
  }
  if (!metaRes.ok) throw new Error(`GitHub returned ${metaRes.status}`);
  const meta = await metaRes.json();
  const branch: string = meta.default_branch ?? "main";

  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: headers() },
  );
  if (!treeRes.ok) throw new Error(`Could not read the file tree (${treeRes.status})`);
  const tree = await treeRes.json();

  const candidates: { path: string; size: number }[] = (tree.tree ?? [])
    .filter((n: { type: string; path: string; size?: number }) =>
      n.type === "blob" &&
      !SKIP_DIR.test(n.path) &&
      !SKIP_FILE.test(n.path) &&
      KEEP.test(n.path) &&
      (n.size ?? 0) <= MAX_FILE_BYTES)
    .map((n: { path: string; size?: number }) => ({ path: n.path, size: n.size ?? 0 }));

  // READMEs first, then shallow files, then the rest. Depth is a decent proxy
  // for how central a file is.
  candidates.sort((a, b) => {
    const readme = (p: string) => (/readme/i.test(p) ? 0 : 1);
    if (readme(a.path) !== readme(b.path)) return readme(a.path) - readme(b.path);
    const depth = (p: string) => p.split("/").length;
    if (depth(a.path) !== depth(b.path)) return depth(a.path) - depth(b.path);
    return a.path.localeCompare(b.path);
  });

  const files: RepoFile[] = [];
  let bytes = 0;
  const token = process.env.GITHUB_TOKEN;

  for (const c of candidates) {
    if (files.length >= MAX_FILES || bytes >= MAX_BYTES) break;

    // raw.githubusercontent carries no auth, so it only works for public repos.
    // With a token, go through the contents API instead, which reads private
    // repos too and lifts the rate limit to 5000 an hour.
    const raw = token
      ? await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURI(c.path)}?ref=${branch}`,
          { headers: { ...headers(), Accept: "application/vnd.github.raw" } },
        )
      : await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodeURI(c.path)}`,
          { headers: { "User-Agent": "beyond-course-grader" } },
        );

    if (!raw.ok) continue;
    const content = await raw.text();
    if (content.includes("\u0000")) continue; // binary that slipped the extension filter
    bytes += content.length;
    files.push({ path: c.path, content });
  }

  return {
    owner,
    repo,
    branch,
    files,
    totalFiles: candidates.length,
    truncated: files.length < candidates.length,
  };
}

/** Flattens a snapshot into something a model can read. */
export function renderSnapshot(snap: RepoSnapshot): string {
  const header =
    `Repository: ${snap.owner}/${snap.repo} (branch ${snap.branch})\n` +
    `Showing ${snap.files.length} of ${snap.totalFiles} source files` +
    (snap.truncated ? ", truncated to fit.\n" : ".\n");

  const body = snap.files
    .map((f) => `\n--- ${f.path} ---\n${f.content}`)
    .join("\n");

  return header + body;
}
