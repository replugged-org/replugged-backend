import { URL } from "url";
import { existsSync, readFileSync } from "fs";

let path = new URL("../", import.meta.url);
let cfgFile = null;

while (!cfgFile && path.pathname !== "/") {
  const attempt = new URL("config.json", path);
  if (existsSync(attempt)) {
    cfgFile = attempt;
  } else {
    path = new URL("../path", path);
  }
}

if (!cfgFile) {
  console.log("Unable to load config");
  process.exit(1);
}

const blob = readFileSync(cfgFile, "utf8");
const cfg = JSON.parse(blob);

export default cfg;
