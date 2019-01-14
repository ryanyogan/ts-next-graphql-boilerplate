#!/usr/bin/env node

import * as inquirer from "inquirer";
import * as fs from "fs";
import * as path from "path";
import { ncp } from "ncp";

const copy = (source: string, destination: string) =>
  new Promise((res, rej) =>
    ncp(source, destination, err => {
      if (err) {
        rej(err);
      } else {
        res();
      }
    })
  );

// Do not use template strings on __dirname for our Windows friends
const TEMPLATE_FOLDER = path.join(__dirname, "..", "templates");

const frontendChoices = fs.readdirSync(`${TEMPLATE_FOLDER}/frontend`);
const backendChoices = fs.readdirSync(`${TEMPLATE_FOLDER}/backend`);
const extraChoices = fs.readdirSync(`${TEMPLATE_FOLDER}/extras`);

const QUESTIONS = [
  {
    name: "frontendChoice",
    type: "list",
    message: "What frontned library would you like?",
    choices: frontendChoices
  },
  {
    name: "backendChoice",
    type: "list",
    message: "What backend library would you like?",
    choices: backendChoices
  },
  {
    name: "extraChoices",
    type: "checkbox",
    message: "Any extra plugins?",
    choices: extraChoices
  },
  {
    name: "projectName",
    type: "input",
    message: "Project name:",
    validate: (input: string) => {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) {
        return true;
      } else {
        return "Project name may only include letters, numbers, undercores, and hashes.";
      }
    }
  }
];

const extraNameMapping = {
  docz: "ui"
};

const CURR_DIR = process.cwd();

inquirer
  .prompt(QUESTIONS)
  .then(
    async ({
      frontendChoice,
      backendChoice,
      extraChoices,
      projectName
    }: any) => {
      const rootDest = `${CURR_DIR}/${projectName}`;
      fs.mkdirSync(rootDest);

      await copy(`${TEMPLATE_FOLDER}/root`, rootDest);

      const destination = `${rootDest}/packages`;
      fs.mkdirSync(destination);

      const serverDestination = `${destination}/server`;
      const webDestination = `${destination}/web`;

      await copy(
        `${TEMPLATE_FOLDER}/frontend/${frontendChoice}`,
        webDestination
      );

      await copy(
        `${TEMPLATE_FOLDER}/backend/${backendChoice}`,
        serverDestination
      );

      await Promise.all([
        extraChoices.map((extra: keyof typeof extraNameMapping) => {
          const dest = `${destination}/${extraNameMapping[extra] || extra}`;
          return copy(`${TEMPLATE_FOLDER}/extras/${extra}`, dest);
        })
      ]);
    }
  );
