const fs = require("node:fs");

if (!fs.existsSync(".env")) {
  fs.copyFileSync("sample.env", ".env");
}

if (!fs.existsSync("ecosystem.config.js")) {
  fs.copyFileSync("sample.ecosystem.config.js", "ecosystem.config.js");
}

if (!fs.existsSync("data")) {
  fs.mkdirSync("data");
}
