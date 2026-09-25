import "dotenv/config";
import { randomUUID, randomBytes, pbkdf2Sync } from "node:crypto";
import { writeFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PBKDF2_ITERATIONS = 100_000;

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, "sha256");
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

const name = process.env.SEED_OWNER_NAME ?? "Farm Owner";
const username = process.env.SEED_OWNER_USERNAME ?? "owner";
const password = process.env.SEED_OWNER_PASSWORD ?? "changeme123";
const target = process.argv.includes("--remote") ? "--remote" : "--local";

const id = randomUUID();
const passwordHash = hashPassword(password);
const now = Date.now();

const sql = `
INSERT INTO users (id, name, username, password_hash, role, created_at)
SELECT ${sqlString(id)}, ${sqlString(name)}, ${sqlString(username)}, ${sqlString(passwordHash)}, 'OWNER', ${now}
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = ${sqlString(username)});
`;

const tmpFile = join(tmpdir(), `seed-${Date.now()}.sql`);
writeFileSync(tmpFile, sql);

try {
  execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "spf-business-suite", target, "--file", tmpFile],
    { stdio: "inherit" }
  );
  console.log(`\nSeed attempted for "${username}" (${target}). If it already existed, nothing changed.`);
} finally {
  unlinkSync(tmpFile);
}
