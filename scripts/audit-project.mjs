import { access, readFile, readdir } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import { generatedStaticFiles, staticSourceFiles } from "../config/static-assets.mjs";

const projectRoot = process.cwd();
const publicRoot = resolve(projectRoot, "public");
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".vinext",
  ".wrangler",
  "dist",
  "node_modules",
]);
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".mjs",
  ".prisma",
  ".sh",
  ".ts",
  ".tsx",
  ".webmanifest",
]);
const localAssetPattern = /\.(?:avif|css|gif|html?|ico|jpe?g|js|json|mjs|mp4|ogg|png|svg|webmanifest|webm|woff2?|ttf|otf)$/i;

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function walk(directory, files = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) await walk(absolute, files);
    else files.push(absolute);
  }
  return files;
}

function normalizeLocalReference(value) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("data:")) return null;
  if (/^(?:mailto|tel|javascript):/i.test(trimmed)) return null;

  try {
    const url = new URL(trimmed, "https://palecho.com");
    if (url.hostname !== "palecho.com") return null;
    if (!localAssetPattern.test(url.pathname)) return null;
    return decodeURIComponent(url.pathname).replace(/^\/+/, "");
  } catch {
    return null;
  }
}

function extractReferences(source) {
  const values = [];
  const patterns = [
    /(?:src|href|poster|content)\s*=\s*["']([^"']+)["']/gi,
    /url\(\s*["']?([^"')]+)["']?\s*\)/gi,
    /["'`](\/[^"'`?#\s]+\.(?:avif|css|gif|html?|ico|jpe?g|js|json|mjs|mp4|ogg|png|svg|webmanifest|webm|woff2?|ttf|otf))(?:[?#][^"'`]*)?["'`]/gi,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) values.push(match[1]);
  }
  return [...new Set(values.map(normalizeLocalReference).filter(Boolean))];
}

const missingSources = [];
const outputOwners = new Map();
for (const source of staticSourceFiles) {
  if (!(await exists(resolve(projectRoot, source)))) missingSources.push(source);
  const output = basename(source);
  const owners = outputOwners.get(output) ?? [];
  owners.push(source);
  outputOwners.set(output, owners);
}

const collisions = [...outputOwners.entries()].filter(([, owners]) => owners.length > 1);
const projectFiles = await walk(projectRoot);
const sourceInventory = projectFiles
  .map((file) => relative(projectRoot, file))
  .filter((file) => !file.startsWith("public/"));
const scannedInventory = sourceInventory.filter((file) => textExtensions.has(extname(file)));
const publicFiles = (await walk(publicRoot)).map((file) => relative(publicRoot, file));
const publicSet = new Set(publicFiles);
const inbound = new Map(publicFiles.map((file) => [file, new Set()]));
const missingReferences = [];

for (const publicFile of publicFiles.filter((file) => textExtensions.has(extname(file)))) {
  const source = await readFile(resolve(publicRoot, publicFile), "utf8");
  for (const reference of extractReferences(source)) {
    if (!publicSet.has(reference)) {
      missingReferences.push({ from: publicFile, to: reference });
      continue;
    }
    inbound.get(reference)?.add(publicFile);
  }
}

for (const sourceFile of scannedInventory) {
  const source = await readFile(resolve(projectRoot, sourceFile), "utf8");
  for (const reference of extractReferences(source)) {
    if (publicSet.has(reference)) inbound.get(reference)?.add(`source:${sourceFile}`);
  }
}

const entryPages = new Set(publicFiles.filter((file) => file.endsWith(".html")));
for (const generated of generatedStaticFiles) entryPages.add(generated);
const unreferencedPublishedAssets = [...inbound.entries()]
  .filter(([file, consumers]) => !entryPages.has(file) && consumers.size === 0)
  .map(([file]) => file)
  .sort();

const dependencyEdges = [...inbound.entries()]
  .filter(([, consumers]) => consumers.size > 0)
  .map(([file, consumers]) => ({ file, usedBy: [...consumers].sort() }))
  .sort((a, b) => a.file.localeCompare(b.file));

const report = {
  sourceFiles: sourceInventory.length,
  scannedTextAndConfigFiles: scannedInventory.length,
  publishedFiles: publicFiles.length,
  publishedPages: entryPages.size,
  dependencyEdges,
  unreferencedPublishedAssets,
};

console.log(JSON.stringify(report, null, 2));

if (missingSources.length || collisions.length || missingReferences.length) {
  if (missingSources.length) console.error("Missing configured sources:", missingSources);
  if (collisions.length) console.error("Conflicting output names:", collisions);
  if (missingReferences.length) console.error("Broken local references:", missingReferences);
  process.exitCode = 1;
}
