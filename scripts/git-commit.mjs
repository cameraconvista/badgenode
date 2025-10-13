// scripts/git-commit.mjs
import { spawnSync } from "node:child_process";

const sh = (c, a, o={}) => {
  const r = spawnSync(c, a, { stdio:"pipe", encoding:"utf8", ...o });
  return { code: r.status ?? 0, out: (r.stdout||"")+(r.stderr||"") };
};
const fail = (m, o="") => { console.error("[git-commit] ❌", m); if(o) console.error(o.trim()); process.exit(1); };
const ok   = (...m) => console.log("[git-commit]", ...m);

// 0) Repo & branch
let r = sh("git", ["rev-parse", "--is-inside-work-tree"]);
if (r.code !== 0) fail("Non è una repo git.", r.out);
r = sh("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
const branch = r.out.trim();
if (branch !== "main") fail(`Branch '${branch}'. Consentito solo 'main'.`);

// 1) Remote origin
r = sh("git", ["remote", "get-url", "origin"]);
if (r.code !== 0) fail("Remote 'origin' mancante.", r.out);

// 2) Staging
r = sh("git", ["add", "-A"]);
if (r.code !== 0) fail("Errore 'git add -A'.", r.out);

// 3) Se niente da committare → esci pulito
r = sh("git", ["diff", "--cached", "--name-only"]);
if (!r.out.trim()) { ok("Nessuna modifica da committare."); process.exit(0); }

// 4) Messaggio (CLI o env)
const subject = (process.argv.slice(2).join(" ").trim() || process.env.COMMIT_MSG || "chore: update")
  .replace(/\s+/g, " ").slice(0,72);
const body = "safe-commit: add→commit→push (main), rebase-on-demand";

// 5) Commit sicuro (doppio -m)
r = sh("git", ["commit", "-m", subject, "-m", body]);
if (r.code !== 0) fail("Commit fallito.", r.out);
ok("Commit:", subject);

// 6) Push; se rifiutato → rebase e retry
r = sh("git", ["push", "origin", "main"]);
if (r.code !== 0) {
  ok("Push rifiutato, eseguo pull --rebase…");
  let rr = sh("git", ["pull", "--rebase", "origin", "main"]);
  if (rr.code !== 0) fail("Pull --rebase fallito. Risolvi conflitti.", rr.out);
  r = sh("git", ["push", "origin", "main"]);
  if (r.code !== 0) fail("Push fallito dopo rebase.", r.out);
}
ok("Push eseguito su origin/main.");
