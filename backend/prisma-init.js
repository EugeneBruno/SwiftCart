const { execSync } = require("child_process");

execSync("npx prisma init", { stdio: "inherit" });
