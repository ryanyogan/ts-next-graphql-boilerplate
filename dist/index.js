#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const ncp_1 = require("ncp");
const copy = (source, destination) => new Promise((res, rej) => ncp_1.ncp(source, destination, err => {
    if (err) {
        rej(err);
    }
    else {
        res();
    }
}));
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
        validate: (input) => {
            if (/^([A-Za-z\-\_\d])+$/.test(input)) {
                return true;
            }
            else {
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
    .then(({ frontendChoice, backendChoice, extraChoices, projectName }) => __awaiter(this, void 0, void 0, function* () {
    const rootDest = `${CURR_DIR}/${projectName}`;
    fs.mkdirSync(rootDest);
    yield copy(`${TEMPLATE_FOLDER}/root`, rootDest);
    const destination = `${rootDest}/packages`;
    fs.mkdirSync(destination);
    const serverDestination = `${destination}/server`;
    const webDestination = `${destination}/web`;
    yield copy(`${TEMPLATE_FOLDER}/frontend/${frontendChoice}`, webDestination);
    yield copy(`${TEMPLATE_FOLDER}/backend/${backendChoice}`, serverDestination);
    yield Promise.all([
        extraChoices.map((extra) => {
            const dest = `${destination}/${extraNameMapping[extra] || extra}`;
            return copy(`${TEMPLATE_FOLDER}/extras/${extra}`, dest);
        })
    ]);
}));
//# sourceMappingURL=index.js.map