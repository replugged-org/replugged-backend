import express from "express";
import cors from "cors";
import fs from "fs";
const app = express();

const index = fs.readFileSync("dist/index.html", "utf8");
const distFiles = fs.readdirSync("dist").filter((x) => !["assets", "index.html"].includes(x));

const STORE_ITEM_RGX = /^\/store\/([^/]+)/;

const meta = [
  {
    match: [],
    title: "Replugged",
    description:
      "Enhance your Discord experience with new features and looks. Replugged makes your Discord truly yours.",
    robots: "",
  },
  {
    match: ["/"],
    title: "Replugged - Discord Client Mod",
  },
  {
    match: ["/download"],
    title: "Download",
    description: "Replugged installer and manual installation steps for Windows, macOS and Linux.",
  },
  {
    match: ["/me"],
    title: "My Account",
    description: "Manage your Replugged account.",
    robots: "noindex",
  },
  {
    match: ["/install"],
    title: "Addon Installer",
    robots: "noindex",
  },
  {
    match: ["/stats"],
    title: "Statistics",
    description: "Statistics about Replugged and its users.",
  },
  {
    match: ["/contributors"],
    title: "Contributors",
    description: "All the people who develop or contributed to Replugged.",
  },
  {
    match: ["/branding"],
    title: "Branding",
    description: "Replugged branding guidelines and assets.",
  },
  {
    match: ["/store/plugins"],
    title: "Plugins",
    description: "Explore and install plugins for Replugged.",
  },
  {
    match: ["/store/themes"],
    title: "Themes",
    description: "Explore and install themes for Replugged.",
  },
  {
    match: [STORE_ITEM_RGX],
    data: async (path) => {
      const id = path.match(STORE_ITEM_RGX)[1];
      if (["plugins", "themes"].includes(id.toLowerCase())) return null;
      const data = await fetch(
        `http://localhost:${process.env.BACKEND_PORT ?? 8080}/api/store/${id}`,
      )
        .then((r) => r.json())
        .catch(() => null);
      if (!data || data.error) return null;
      const type = {
        "replugged-plugin": "Plugin",
        "replugged-theme": "Theme",
      }[data.type];
      if (!type) return null;
      return {
        title: `${data.name} - Replugged ${type}`,
        description: data.description,
      };
    },
  },
];

const defaultMeta = meta[0];

app.listen(Number(process.env.PORT ?? 8000), () => {
  console.log(`Listening on port ${Number(process.env.PORT ?? 8000)}`);
});

app.use(cors());

app.use("/assets", express.static("dist/assets"));
distFiles.forEach((file) => {
  app.get(`/${file}`, (req, res) => {
    res.sendFile(`${file}`, {
      root: "dist",
    });
  });
});

app.get("*", async (req, res) => {
  // Create copy of index for this request
  let indexCopy = index;

  // Get metadata for the current page
  const currentMeta =
    meta.find((m) => {
      const matchers = m.match;
      return matchers.some((matcher) =>
        typeof matcher === "string" ? req.path === matcher : matcher.test(req.path),
      );
    }) ?? {};
  const data = ("data" in currentMeta ? await currentMeta.data(req.path) : currentMeta) ?? {};
  // Apply default metadata
  const mergedMeta = { ...defaultMeta, ...data };

  // Replace variables
  // Repeat until no more variables are replaced
  let previousIndex = "";
  while (indexCopy !== previousIndex) {
    previousIndex = indexCopy;
    for (const key in mergedMeta) {
      const value = mergedMeta[key];
      indexCopy = indexCopy.replaceAll(`{${key}}`, value ?? "");
    }
  }

  // Send the index.html file
  res.send(indexCopy);
});
