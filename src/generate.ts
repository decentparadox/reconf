import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { createFolderStructure, writeFile } from "./utils";
import { v4 as uuidv4 } from "uuid";

const TEMPLATE_DIR = path.resolve(__dirname, "templates");

function renderTemplate(templatePath: string, context: any): string {
  const templateContent = fs.readFileSync(templatePath, "utf-8");
  const Handlebars = require("handlebars");
  const template = Handlebars.compile(templateContent);
  return template(context);
}

export function generateProject(servers: any[], roles: string[]) {
  // Generate a unique directory for each project
  const UNIQUE_BUILD_DIR = path.resolve(process.cwd(), `build_${uuidv4()}`);
  createFolderStructure(UNIQUE_BUILD_DIR);

  // Vagrantfile
  const vagrantContent = renderTemplate(
    path.join(TEMPLATE_DIR, "Vagrantfile.j2"),
    { servers }
  );
  writeFile(path.join(UNIQUE_BUILD_DIR, "Vagrantfile"), vagrantContent);

  // playbook.yml
  const playbookContent = renderTemplate(
    path.join(TEMPLATE_DIR, "playbook.yml.j2"),
    { roles }
  );
  writeFile(path.join(UNIQUE_BUILD_DIR, "ansible/playbook.yml"), playbookContent);

  // Role-specific files
  roles.forEach((role) => {
    const rolePath = path.join(UNIQUE_BUILD_DIR, `ansible/roles/${role}`);
    const tasksPath = path.join(rolePath, "tasks");
    const templatesPath = path.join(rolePath, "templates");
  
    fs.mkdirSync(tasksPath, { recursive: true });
    fs.mkdirSync(templatesPath, { recursive: true });
  
    const roleTemplatePath = path.join(TEMPLATE_DIR, `${role}.yml.j2`);
    if (fs.existsSync(roleTemplatePath)) {
      const roleContent = renderTemplate(roleTemplatePath, {});
      writeFile(path.join(tasksPath, "main.yml"), roleContent);
    }
  
    // Copy templates specific to the role
    if (role === "apache") {
      const apacheTemplateSource = path.join(TEMPLATE_DIR, "apache.conf.j2");
      const apacheTemplateDest = path.join(templatesPath, "apache.conf.j2");
      if (fs.existsSync(apacheTemplateSource)) {
        fs.copyFileSync(apacheTemplateSource, apacheTemplateDest);
        console.log(`Copied: ${apacheTemplateSource} -> ${apacheTemplateDest}`);
      }
    }
  });
  

  // Run vagrant up in the unique build folder
  try {
    console.log("Running 'vagrant up'...");
    execSync("vagrant up", { cwd: UNIQUE_BUILD_DIR, stdio: "inherit" });
  } catch (error) {
    console.error("Error running 'vagrant up':", (error as any).message);
  }
}
