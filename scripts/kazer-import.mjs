#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { tmpdir } from "node:os";

const args = process.argv.slice(2);
const repository = args.find(value => !value.startsWith("--"));
const shouldCopy = args.includes("--copy");
const licenseArg = args.find(value => value.startsWith("--license="))?.split("=")[1] ?? "";
const allowedLicenses = licenseArg.split(",").map(value => value.trim().toLowerCase()).filter(Boolean);

if (!repository || !/^https:\/\/github\.com\/[^/]+\/[^/]+(?:\.git)?$/.test(repository)) {
  console.error("Uso: node scripts/kazer-import.mjs https://github.com/org/repo [--copy --license=MIT,Apache-2.0]");
  process.exit(2);
}

const root = resolve(import.meta.dirname, "..");
const temp = mkdtempSync(join(tmpdir(), "kazer-import-"));
const checkout = join(temp, "repo");
const slug = basename(repository.replace(/\.git$/, ""));

try {
  execFileSync("git", ["clone", "--depth", "1", "--no-tags", repository, checkout], { stdio: "ignore" });
  const commitSha = execFileSync("git", ["-C", checkout, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const files = readdirSync(checkout).filter(file => /^(license|copying|notice|copyright)/i.test(file));
  const licenseText = files.map(file => readFileSync(join(checkout, file), "utf8")).join("\n").slice(0, 30000).toLowerCase();
  const detected = licenseText.includes("apache license") ? "Apache-2.0" : licenseText.includes("mit license") ? "MIT" : licenseText.includes("gnu general public") ? "GPL-family" : files.length ? "Declared file requires human review" : "Not detected";
  const classification = shouldCopy && allowedLicenses.length && allowedLicenses.some(license => detected.toLowerCase().includes(license)) ? "review_required" : "external";
  const provenance = { name: slug, upstream: repository, repository, commitSha, release: null, importDate: new Date().toISOString(), license: detected, copyright: files, noticeFiles: files.filter(file => /notice|copyright/i.test(file)), modifications: shouldCopy ? "Pending human review before copy" : "Not incorporated", kazerAdapter: null, classification, reviewStatus: "pending" };
  const output = join(root, "provenance", `${slug}.json`);
  writeFileSync(output, `${JSON.stringify(provenance, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, repository, commitSha, detectedLicense: detected, classification, provenance: output, copied: false }, null, 2));
  if (shouldCopy && classification === "review_required") {
    console.error("Copy not performed: automated detection is never a legal approval. A maintainer must review the exact license and rerun with an approved process.");
    process.exitCode = 3;
  }
} catch (error) {
  console.error(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  rmSync(temp, { recursive: true, force: true });
}
