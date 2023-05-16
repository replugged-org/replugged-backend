/* eslint-disable @typescript-eslint/no-explicit-any */
// For CLI usage
// npm run download-addon <user/repo> [addonId]

import { fetch } from "undici";
import config from "./config.js";
import { STORAGE_FOLDER, createDirForFile } from "./utils/misc.js";
import path from "path";
import { writeFile } from "fs/promises";

const ADDONS_FOLDER = STORAGE_FOLDER("addons");

const { token } = config.github;

const headers: Record<string, string> = {};
if (token) {
  headers.Authorization = `token ${token}`;
}

const [repoId, addonId] = process.argv.slice(2);

if (!repoId) {
  console.error("Please specify repo id");
  process.exit(1);
}

console.log(`Getting latest release for ${repoId}`);
const res = await fetch(`https://api.github.com/repos/${repoId}/releases/latest`, {
  headers,
});
if (!res.ok) {
  console.error("Error getting release", await res.text());
  process.exit(1);
}
const release = (await res.json()) as any;
const manifestAssets = release.assets.filter((asset: any) => {
  if (addonId) {
    return asset.name === `${addonId}.json`;
  }

  return asset.name.endsWith(".json");
});
if (manifestAssets.length === 0) {
  console.error("No manifest found");
  process.exit(1);
}
if (manifestAssets.length > 1) {
  console.error(
    `Multiple manifests found, please specify addon id. Found: ${manifestAssets
      .map((asset: any) => asset.name.replace(/\.json$/, ""))
      .join(", ")}`,
  );
  process.exit(1);
}
const manifestAddonId = manifestAssets[0].name.replace(/\.json$/, "");
const manifestUrl = manifestAssets[0].browser_download_url;
const asarAsset = release.assets.find((asset: any) => asset.name === `${manifestAddonId}.asar`);
if (!asarAsset) {
  console.error("No asar found");
  process.exit(1);
}
const asarUrl = asarAsset.browser_download_url;
console.log(`Manifest: ${manifestUrl}`);
console.log(`Asar: ${asarUrl}`);

const manifestRes = (await fetch(manifestUrl, {
  headers,
}).then((res) => res.json())) as any;
const typePath = manifestRes.type.replace(/^replugged-/, "");
const asarRes = await fetch(asarUrl, {
  headers,
}).then((res) => res.arrayBuffer());
const manifestPath = path.join(ADDONS_FOLDER, "manifests", typePath, `${manifestAddonId}.json`);
const asarPath = path.join(ADDONS_FOLDER, "asars", typePath, `${manifestAddonId}.asar`);
[manifestPath, asarPath].forEach(createDirForFile);
await writeFile(manifestPath, JSON.stringify(manifestRes, null, 2));
await writeFile(asarPath, Buffer.from(asarRes));
console.log(
  `Wrote manifest and asar for ${manifestAddonId} to disk: ${manifestPath} and ${asarPath}`,
);
