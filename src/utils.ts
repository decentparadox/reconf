// import * as fs from "fs";
// import * as path from "path";
import chalk from "chalk";
import fs from "fs-extra"; // Use fs-extra for file operations ("fs-extra");

import * as path from "path";
const srcDir = path.resolve(__dirname, "src/templates");
const destDir = path.resolve(__dirname, "dist/templates");



export function createFolderStructure(buildDir: string) {
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir, { recursive: true });
  fs.mkdirSync(path.join(buildDir, "ansible/roles"), { recursive: true });
}

export function writeFile(filePath: string, content: string) {
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(chalk.green(`Created: ${filePath}`));
}
