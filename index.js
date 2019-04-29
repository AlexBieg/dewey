#!/usr/bin/env node
import fs from 'fs';
import Dewey from './dewey.js';
import path from 'path';

const [,, ...args] = process.argv;
const [argsStartingDir, argsConfigPath] = args;
const configPath = argsConfigPath || './dewey.config.js';
const startingDir = argsStartingDir || './';

let dir;
try {
  dir = fs.readdirSync(startingDir);
} catch (e) {
  console.error('\x1b[31m', 'Unable to find starting directory');
  process.exit();
}

let config;
try {
  config = require(path.resolve(process.cwd(), configPath));
} catch (e) {
  console.error('\x1b[31m', 'No/Invalid dewey config file found');
  process.exit();
}

const dewey = new Dewey(startingDir, config);

dewey.run();