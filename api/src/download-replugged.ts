/* eslint-disable @typescript-eslint/no-explicit-any */
// For CLI usage
// npm run download-replugged

import { fetch } from "undici";
import config from "./config.js";
import { STORAGE_FOLDER, createDirForFile } from "./utils/misc.js";
import path from "path";
import { writeFile } from "fs/promises";

const ADDONS_FOLDER = STORAGE_FOLDER("addons");

const { token } = config.github;

const headers: Record<string, string> = {};
if (token) {
  headers.Authorization = `Bearer ${token}`;
}

console.log(`Getting latest release for replugged`);
const res = await fetch(`https://api.github.com/repos/replugged-org/replugged/releases/latest`, {
  headers,
});
if (!res.ok) {
  console.error("Error getting release", await res.text());
  process.exit(1);
}
const release = (await res.json()) as any;
const version = release.tag_name.replace(/^v/, "");
const asarAsset = release.assets.find((asset: any) => asset.name === `replugged.asar`);

if (!asarAsset) {
  console.error("No asar found");
  process.exit(1);
}
const asarUrl = asarAsset.browser_download_url;
console.log(`Version: ${version}`);
console.log(`Asar: ${asarUrl}`);

const manifestRes = {
  id: "dev.replugged.Replugged",
  name: "Replugged",
  description: "Replugged itself",
  author: {
    name: "replugged",
    discordID: "1000992611840049192",
    github: "replugged-org",
  },
  type: "replugged",
  updater: {
    type: "store",
    id: "dev.replugged.Replugged",
  },
  version,
  license: "MIT",
};
const asarRes = await fetch(asarUrl, {
  headers,
}).then((res) => res.arrayBuffer());
const manifestPath = path.join(ADDONS_FOLDER, "manifests", `dev.replugged.Replugged.json`);
const asarPath = path.join(ADDONS_FOLDER, "asars", `dev.replugged.Replugged.asar`);
[manifestPath, asarPath].forEach(createDirForFile);
await writeFile(manifestPath, JSON.stringify(manifestRes, null, 2));
await writeFile(asarPath, Buffer.from(asarRes));
console.log(`Wrote manifest and asar for Replugged to disk: ${manifestPath} and ${asarPath}`);
