#!/usr/bin/env node
/**
 * Nitro bundles `@electric-sql/pglite` into the server function and then
 * resolves `pglite.data` / the wasm files next to that bundle. Copy them
 * there so the embedded Postgres fallback can boot when DATABASE_URL is unset
 * (local production preview). Deployed apps with DATABASE_URL never open them.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const fromDir = join(root, "node_modules/@electric-sql/pglite/dist");
const toDir = join(root, ".vercel/output/functions/__server.func/_libs");
const files = ["pglite.data", "pglite.wasm", "initdb.wasm"];

await mkdir(toDir, { recursive: true });
for (const name of files) {
  await copyFile(join(fromDir, name), join(toDir, name));
  console.log(`[pglite] copied ${name}`);
}
