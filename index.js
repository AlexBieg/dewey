#!/usr/bin/env node
import fs from 'fs';
import Dewey from './dewey.js';

const [,, ...args] = process.argv;
const [argsStartingDir, argsConfigPath] = args;
const configPath = argsConfigPath || './.deweyrc';
const startingDir = argsStartingDir || './';

let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  console.error('\x1b[31m', 'No/Invalid dewey config file found');
  process.exit();
}

let dir;
try {
  dir = fs.readdirSync(startingDir);
} catch (e) {
  console.error('\x1b[31m', 'Unable to find starting directory');
  process.exit();
}

const dewey = new Dewey(startingDir, config);

dewey.run();