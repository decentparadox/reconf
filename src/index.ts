#!/usr/bin/env node

import inquirer from "inquirer";
import { generateProject } from "./generate";
import chalk from "chalk";
const SERVICES = ["apache", "mysql", "redis", "nginx", "node", "custom_service"];

// Create an instance of the prompt module
const prompt = inquirer.createPromptModule();
const RECONF_TITLE = `
__________                            _____ 
\\______   \\ ____   ____  ____   _____/ ____\\
 |       _// __ \\_/ ___\\/  _ \\ /    \\   __\\ 
 |    |   \\  ___/\\  \\__(  <_> )   |  \\  |   
 |____|_  /\\___  >\\___  >____/|___|  /__|   
        \\/     \\/     \\/           \\/       

`
console.log(chalk.green(RECONF_TITLE));
(async () => {
  // Prompt for server information
  const { servers } = await prompt([
    {
      type: "input",
      name: "servers",
      message:
        "Enter servers (name:ip format, comma-separated, e.g., web:192.168.33.10,db:192.168.33.11):",
      validate: (input) =>
        input.split(",").every((s: string | string[]) => s.includes(":")) || "Invalid format!",
    },
  ]);

  // Prompt for roles selection
  const { roles } = await prompt([
    {
      type: "checkbox",
      name: "roles",
      message: "Select roles to configure:",
      choices: SERVICES,
    },
  ]);

  // Parse server input into a structured format
  const parsedServers = servers.split(",").map((s: string) => {
    const [name, ip] = s.split(":");
    return { name, ip };
  });

  // Generate the project using the parsed inputs
  generateProject(parsedServers, roles);
})();
