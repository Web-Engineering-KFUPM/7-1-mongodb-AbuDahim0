#!/usr/bin/env node

/**
 * Lab Autograder — 7-1 MongoDB
 *
 * Grades based on:
 * - MongoDB Cloud screenshots:
 *   Mongo-Screen-Shots/TODO-1 ... TODO-9
 * - Mongoose code:
 *   server.js
 *
 * Marking:
 * - 80 marks for lab TODOs
 * - 20 marks for submission timing
 *   - On/before deadline => 20/20
 *   - After deadline     => 10/20
 *
 * Deadline: 08 Apr 2026 20:59 (Asia/Riyadh, UTC+03:00)
 *
 * Repo layout expected:
 * - repo root may be the project itself OR may contain the project folder
 * - project folder: 7-1-mongodb-main/
 * - app folder:     7-1-mongodb-main/7-1-mongodb/
 * - grader file:    7-1-mongodb-main/script/grade.cjs
 * - student files:
 *      7-1-mongodb-main/7-1-mongodb/server.js
 *      7-1-mongodb-main/7-1-mongodb/Mongo-Screen-Shots/TODO-1 ... TODO-9
 *
 * Notes:
 * - JS comments are ignored (starter TODO comments do NOT count).
 * - Screenshot TODOs are graded only by checking whether each TODO folder
 *   contains at least one image file.
 * - Mongoose checks are intentionally lenient and verify top-level implementation only.
 * - Code can be in any order.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ARTIFACTS_DIR = "artifacts";
const FEEDBACK_DIR = path.join(ARTIFACTS_DIR, "feedback");
fs.mkdirSync(FEEDBACK_DIR, { recursive: true });

/* -----------------------------
   Deadline (Asia/Riyadh)
   08 Apr 2026, 20:59
-------------------------------- */
const DEADLINE_RIYADH_ISO = "2026-04-13T20:59:00+03:00";
const DEADLINE_MS = Date.parse(DEADLINE_RIYADH_ISO);

// Submission marks policy
const SUBMISSION_MAX = 20;
const SUBMISSION_LATE = 10;

/* -----------------------------
   TODO marks (out of 80)
-------------------------------- */
const tasks = [
  // MongoDB screenshot part = 36
  { id: "mdb1", name: "MongoDB TODO 1: Screenshot in TODO-1", marks: 4 },
  { id: "mdb2", name: "MongoDB TODO 2: Screenshot in TODO-2", marks: 4 },
  { id: "mdb3", name: "MongoDB TODO 3: Screenshot in TODO-3", marks: 4 },
  { id: "mdb4", name: "MongoDB TODO 4: Screenshot in TODO-4", marks: 4 },
  { id: "mdb5", name: "MongoDB TODO 5: Screenshot in TODO-5", marks: 4 },
  { id: "mdb6", name: "MongoDB TODO 6: Screenshot in TODO-6", marks: 4 },
  { id: "mdb7", name: "MongoDB TODO 7: Screenshot in TODO-7", marks: 4 },
  { id: "mdb8", name: "MongoDB TODO 8: Screenshot in TODO-8", marks: 4 },
  { id: "mdb9", name: "MongoDB TODO 9: Screenshot in TODO-9", marks: 4 },

  // Mongoose code part = 44
  { id: "mg1", name: "Mongoose TODO 1: Establish MongoDB connection", marks: 8 },
  { id: "mg2", name: "Mongoose TODO 2: Define schema and model", marks: 8 },
  { id: "mg3", name: "Mongoose TODO 3: Create document(s)", marks: 7 },
  { id: "mg4", name: "Mongoose TODO 4: Read document(s)", marks: 7 },
  { id: "mg5", name: "Mongoose TODO 5: Update document", marks: 7 },
  { id: "mg6", name: "Mongoose TODO 6: Delete document", marks: 7 },
];

const STEPS_MAX = tasks.reduce((sum, t) => sum + t.marks, 0); // 80
const TOTAL_MAX = STEPS_MAX + SUBMISSION_MAX; // 100

/* -----------------------------
   Helpers
-------------------------------- */
function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function mdEscape(s) {
  return String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function splitMarks(stepMarks, missingCount, totalChecks) {
  if (missingCount <= 0) return stepMarks;
  const perItem = stepMarks / totalChecks;
  const deducted = perItem * missingCount;
  return Math.max(0, round2(stepMarks - deducted));
}

function existsFile(p) {
  try {
    return fs.existsSync(p) && fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function existsDir(p) {
  try {
    return fs.existsSync(p) && fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function hasAny(text, patterns) {
  return patterns.some((p) => p.test(text));
}

function hasImageFile(dirPath) {
  if (!existsDir(dirPath)) return false;

  const imageExts = new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".bmp",
    ".svg",
  ]);

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const full = path.join(dirPath, entry.name);

      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (imageExts.has(ext)) return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Strip JS comments while trying to preserve strings/templates.
 */
function stripJsComments(code) {
  if (!code) return code;

  let out = "";
  let i = 0;

  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;

  while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1];

    if (!inDouble && !inTemplate && ch === "'" && !inSingle) {
      inSingle = true;
      out += ch;
      i++;
      continue;
    }
    if (inSingle && ch === "'") {
      let backslashes = 0;
      for (let k = i - 1; k >= 0 && code[k] === "\\"; k--) backslashes++;
      if (backslashes % 2 === 0) inSingle = false;
      out += ch;
      i++;
      continue;
    }

    if (!inSingle && !inTemplate && ch === '"' && !inDouble) {
      inDouble = true;
      out += ch;
      i++;
      continue;
    }
    if (inDouble && ch === '"') {
      let backslashes = 0;
      for (let k = i - 1; k >= 0 && code[k] === "\\"; k--) backslashes++;
      if (backslashes % 2 === 0) inDouble = false;
      out += ch;
      i++;
      continue;
    }

    if (!inSingle && !inDouble && ch === "`" && !inTemplate) {
      inTemplate = true;
      out += ch;
      i++;
      continue;
    }
    if (inTemplate && ch === "`") {
      let backslashes = 0;
      for (let k = i - 1; k >= 0 && code[k] === "\\"; k--) backslashes++;
      if (backslashes % 2 === 0) inTemplate = false;
      out += ch;
      i++;
      continue;
    }

    if (!inSingle && !inDouble && !inTemplate) {
      if (ch === "/" && next === "/") {
        i += 2;
        while (i < code.length && code[i] !== "\n") i++;
        continue;
      }
      if (ch === "/" && next === "*") {
        i += 2;
        while (i < code.length) {
          if (code[i] === "*" && code[i + 1] === "/") {
            i += 2;
            break;
          }
          i++;
        }
        continue;
      }
    }

    out += ch;
    i++;
  }

  return out;
}

/* -----------------------------
   Project root detection
-------------------------------- */
const REPO_ROOT = process.cwd();

function isAppFolder(p) {
  try {
    return (
      fs.existsSync(path.join(p, "package.json")) &&
      fs.existsSync(path.join(p, "server.js"))
    );
  } catch {
    return false;
  }
}

function pickProjectRoot(cwd) {
  if (isAppFolder(cwd)) return cwd;

  const preferred = path.join(cwd, "7-1-mongodb");
  if (isAppFolder(preferred)) return preferred;

  const preferredNested = path.join(cwd, "7-1-mongodb-main", "7-1-mongodb");
  if (isAppFolder(preferredNested)) return preferredNested;

  let subs = [];
  try {
    subs = fs
      .readdirSync(cwd, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    subs = [];
  }

  for (const name of subs) {
    const p = path.join(cwd, name);
    if (isAppFolder(p)) return p;

    const nested = path.join(p, "7-1-mongodb");
    if (isAppFolder(nested)) return nested;
  }

  return cwd;
}

const PROJECT_ROOT = pickProjectRoot(REPO_ROOT);

/* -----------------------------
   Find files/folders
-------------------------------- */
const serverFile = path.join(PROJECT_ROOT, "server.js");
const screenshotRoot = path.join(PROJECT_ROOT, "Mongo-Screen-Shots");
const todoFolders = Array.from({ length: 9 }, (_, i) =>
  path.join(screenshotRoot, `TODO-${i + 1}`)
);

/* -----------------------------
   Determine submission time
-------------------------------- */
let lastCommitISO = null;
let lastCommitMS = null;

try {
  lastCommitISO = execSync("git log -1 --format=%cI", { encoding: "utf8" }).trim();
  lastCommitMS = Date.parse(lastCommitISO);
} catch {
  lastCommitISO = new Date().toISOString();
  lastCommitMS = Date.now();
}

/* -----------------------------
   Submission marks
-------------------------------- */
const isLate = Number.isFinite(lastCommitMS) ? lastCommitMS > DEADLINE_MS : true;
const submissionScore = isLate ? SUBMISSION_LATE : SUBMISSION_MAX;

/* -----------------------------
   Load & strip student file
-------------------------------- */
const serverRaw = existsFile(serverFile) ? safeRead(serverFile) : null;
const serverCode = serverRaw ? stripJsComments(serverRaw) : null;

const results = [];

/* -----------------------------
   Result helpers
-------------------------------- */
function addResult(task, required) {
  const missing = required.filter((r) => !r.ok);
  const score = splitMarks(task.marks, missing.length, required.length);

  results.push({
    id: task.id,
    name: task.name,
    max: task.marks,
    score,
    checklist: required.map((r) => `${r.ok ? "✅" : "❌"} ${r.label}`),
    deductions: missing.length ? missing.map((m) => `Missing: ${m.label}`) : [],
  });
}

function failTask(task, reason) {
  results.push({
    id: task.id,
    name: task.name,
    max: task.marks,
    score: 0,
    checklist: [],
    deductions: [reason],
  });
}

/* -----------------------------
   Grade MongoDB screenshot TODOs
-------------------------------- */
for (let i = 0; i < 9; i++) {
  const task = tasks[i];
  const dir = todoFolders[i];

  const required = [
    {
      label: `Contains at least one image file in Mongo-Screen-Shots/TODO-${i + 1}`,
      ok: hasImageFile(dir),
    },
  ];

  addResult(task, required);
}

/* -----------------------------
   Grade Mongoose TODOs
-------------------------------- */

/**
 * TODO 1 — Establish MongoDB connection
 */
{
  const task = tasks[9];

  if (!serverCode) {
    failTask(task, "server.js not found / unreadable.");
  } else {
    const required = [
      {
        label: 'Imports mongoose using import mongoose from "mongoose"',
        ok: /import\s+mongoose\s+from\s+['"]mongoose['"]/i.test(serverCode),
      },
      {
        label: "Calls mongoose.connect(...)",
        ok: /mongoose\.connect\s*\(/i.test(serverCode),
      },
      {
        label: "Uses a MongoDB SRV connection string",
        ok: /mongodb\+srv:\/\//i.test(serverCode),
      },
      {
        label: "Connection string includes a database name after .net/",
        ok: /mongodb\+srv:\/\/[\s\S]*?\.mongodb\.net\/[A-Za-z0-9_-]+/i.test(serverCode),
      },
    ];

    addResult(task, required);
  }
}

/**
 * TODO 2 — Define schema and model
 */
{
  const task = tasks[10];

  if (!serverCode) {
    failTask(task, "server.js not found / unreadable.");
  } else {
    const required = [
      {
        label: "Defines a schema using new mongoose.Schema(...)",
        ok: /new\s+mongoose\.Schema\s*\(/i.test(serverCode),
      },
      {
        label: "Schema includes name field",
        ok: /name\s*:\s*String/i.test(serverCode),
      },
      {
        label: "Schema includes age field",
        ok: /age\s*:\s*Number/i.test(serverCode),
      },
      {
        label: "Schema includes major field",
        ok: /major\s*:\s*String/i.test(serverCode),
      },
      {
        label: 'Creates Student model using mongoose.model("Student", ...)',
        ok: /mongoose\.model\s*\(\s*['"]Student['"]\s*,/i.test(serverCode),
      },
    ];

    addResult(task, required);
  }
}

/**
 * TODO 3 — Create document(s)
 */
{
  const task = tasks[11];

  if (!serverCode) {
    failTask(task, "server.js not found / unreadable.");
  } else {
    const required = [
      {
        label: "Has createStudents function or equivalent create logic",
        ok: hasAny(serverCode, [
          /async\s+function\s+createStudents\s*\(/i,
          /const\s+createStudents\s*=\s*async\s*\(/i,
          /let\s+createStudents\s*=\s*async\s*\(/i,
        ]),
      },
      {
        label: "Uses Student.insertMany(...) or Student.create(...)",
        ok: hasAny(serverCode, [
          /Student\.insertMany\s*\(/i,
          /Student\.create\s*\(/i,
        ]),
      },
      {
        label: 'Includes student data for "Ali"',
        ok: /name\s*:\s*['"]Ali['"]/i.test(serverCode),
      },
      {
        label: 'Includes student data for "Sara"',
        ok: /name\s*:\s*['"]Sara['"]/i.test(serverCode),
      },
    ];

    addResult(task, required);
  }
}

/**
 * TODO 4 — Read document(s)
 */
{
  const task = tasks[12];

  if (!serverCode) {
    failTask(task, "server.js not found / unreadable.");
  } else {
    const required = [
      {
        label: "Has readStudents function or equivalent read logic",
        ok: hasAny(serverCode, [
          /async\s+function\s+readStudents\s*\(/i,
          /const\s+readStudents\s*=\s*async\s*\(/i,
          /let\s+readStudents\s*=\s*async\s*\(/i,
        ]),
      },
      {
        label: "Uses Student.find()",
        ok: /Student\.find\s*\(\s*\)/i.test(serverCode),
      },
      {
        label: "Logs or uses the read result",
        ok: hasAny(serverCode, [
          /console\.log\s*\(\s*all\s*\)/i,
          /const\s+all\s*=\s*await\s+Student\.find\s*\(\s*\)/i,
          /await\s+Student\.find\s*\(\s*\)/i,
        ]),
      },
    ];

    addResult(task, required);
  }
}

/**
 * TODO 5 — Update document
 */
{
  const task = tasks[13];

  if (!serverCode) {
    failTask(task, "server.js not found / unreadable.");
  } else {
    const required = [
      {
        label: "Has updateStudent function or equivalent update logic",
        ok: hasAny(serverCode, [
          /async\s+function\s+updateStudent\s*\(/i,
          /const\s+updateStudent\s*=\s*async\s*\(/i,
          /let\s+updateStudent\s*=\s*async\s*\(/i,
        ]),
      },
      {
        label: 'Uses Student.updateOne(...) targeting name "Ali"',
        ok: /Student\.updateOne\s*\(\s*\{[\s\S]*?name\s*:\s*['"]Ali['"]/i.test(serverCode),
      },
      {
        label: "Updates age to 22",
        ok: hasAny(serverCode, [
          /age\s*:\s*22/i,
          /\$set\s*:\s*\{[\s\S]*?age\s*:\s*22/i,
        ]),
      },
    ];

    addResult(task, required);
  }
}

/**
 * TODO 6 — Delete document
 */
{
  const task = tasks[14];

  if (!serverCode) {
    failTask(task, "server.js not found / unreadable.");
  } else {
    const required = [
      {
        label: "Has deleteStudent function or equivalent delete logic",
        ok: hasAny(serverCode, [
          /async\s+function\s+deleteStudent\s*\(/i,
          /const\s+deleteStudent\s*=\s*async\s*\(/i,
          /let\s+deleteStudent\s*=\s*async\s*\(/i,
        ]),
      },
      {
        label: 'Uses Student.deleteOne(...) targeting name "Sara"',
        ok: /Student\.deleteOne\s*\(\s*\{[\s\S]*?name\s*:\s*['"]Sara['"]/i.test(serverCode),
      },
    ];

    addResult(task, required);
  }
}

/* -----------------------------
   Final scoring
-------------------------------- */
const stepsScore = results.reduce((sum, r) => sum + r.score, 0);
const totalScore = round2(stepsScore + submissionScore);

/* -----------------------------
   Build summary + feedback
-------------------------------- */
const LAB_NAME = "7-1-mongodb-main";

const submissionLine = `- **Lab:** ${LAB_NAME}
- **Deadline (Riyadh / UTC+03:00):** ${DEADLINE_RIYADH_ISO}
- **Last commit time (from git log):** ${lastCommitISO}
- **Submission marks:** **${submissionScore}/${SUBMISSION_MAX}** ${isLate ? "(Late submission)" : "(On time)"}
`;

let summary = `# ${LAB_NAME} — Autograding Summary

## Submission

${submissionLine}

## Files Checked

- Repo root (cwd): ${REPO_ROOT}
- Detected project root: ${PROJECT_ROOT}
- Server: ${existsFile(serverFile) ? `✅ ${serverFile}` : "❌ server.js not found"}
- Screenshot root: ${existsDir(screenshotRoot) ? `✅ ${screenshotRoot}` : "❌ Mongo-Screen-Shots folder not found"}

## Marks Breakdown

| Component | Marks |
|---|---:|
`;

for (const r of results) summary += `| ${r.name} | ${r.score}/${r.max} |\n`;
summary += `| Submission (timing) | ${submissionScore}/${SUBMISSION_MAX} |\n`;

summary += `
## Total Marks

**${totalScore} / ${TOTAL_MAX}**

## Detailed Checks (What you did / missed)
`;

for (const r of results) {
  const done = (r.checklist || []).filter((x) => x.startsWith("✅"));
  const missed = (r.checklist || []).filter((x) => x.startsWith("❌"));

  summary += `
<details>
  <summary><strong>${mdEscape(r.name)}</strong> — ${r.score}/${r.max}</summary>

  <br/>

  <strong>✅ Found</strong>
  ${done.length ? "\n" + done.map((x) => `- ${mdEscape(x)}`).join("\n") : "\n- (Nothing detected)"}

  <br/><br/>

  <strong>❌ Missing</strong>
  ${missed.length ? "\n" + missed.map((x) => `- ${mdEscape(x)}`).join("\n") : "\n- (Nothing missing)"}

  <br/><br/>

  <strong>❗ Deductions / Notes</strong>
  ${
    r.deductions && r.deductions.length
      ? "\n" + r.deductions.map((d) => `- ${mdEscape(d)}`).join("\n")
      : "\n- No deductions."
  }

</details>
`;
}

summary += `
> Full feedback is also available in: \`artifacts/feedback/README.md\`
`;

let feedback = `# ${LAB_NAME} — Feedback

## Submission

${submissionLine}

## Files Checked

- Repo root (cwd): ${REPO_ROOT}
- Detected project root: ${PROJECT_ROOT}
- Server: ${existsFile(serverFile) ? `✅ ${serverFile}` : "❌ server.js not found"}
- Screenshot root: ${existsDir(screenshotRoot) ? `✅ ${screenshotRoot}` : "❌ Mongo-Screen-Shots folder not found"}

---

## TODO-by-TODO Feedback
`;

for (const r of results) {
  feedback += `
### ${r.name} — **${r.score}/${r.max}**

**Checklist**
${r.checklist.length ? r.checklist.map((x) => `- ${x}`).join("\n") : "- (No checks available)"}

**Deductions / Notes**
${r.deductions.length ? r.deductions.map((d) => `- ❗ ${d}`).join("\n") : "- ✅ No deductions. Good job!"}
`;
}

feedback += `
---

## How marks were deducted (rules)

- JS comments are ignored, so starter TODO comments do NOT count.
- Screenshot TODOs are graded only by presence of at least one image file inside each TODO folder.
- Mongoose checks are intentionally lenient and verify top-level implementation only.
- Code can be in ANY order; repeated code is allowed.
- Common equivalents are accepted where possible.
- npm install commands and manual testing commands are NOT graded.
- Missing required items reduce marks proportionally within that TODO.
- The script checks for the required MongoDB/Mongoose structure, not exact wording.
`;

/* -----------------------------
   Write outputs
-------------------------------- */
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
}

const csv = `student,score,max_score
all_students,${totalScore},${TOTAL_MAX}
`;

fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
fs.writeFileSync(path.join(ARTIFACTS_DIR, "grade.csv"), csv);
fs.writeFileSync(path.join(FEEDBACK_DIR, "README.md"), feedback);

console.log(
  `✔ Lab graded: ${totalScore}/${TOTAL_MAX} (Submission: ${submissionScore}/${SUBMISSION_MAX}, TODOs: ${stepsScore}/${STEPS_MAX}).`
);