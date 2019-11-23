#!/usr/bin/env node
import fs from 'fs';
import Dewey from './dewey.js';
import path from 'path';
import chalk from 'chalk';
import yargs from 'yargs';

const configPath = yargs.argv.config || './dewey.config.js';
const startingDir = yargs.argv.dir || './';

let dir;
try {
  dir = fs.readdirSync(startingDir);
} catch (e) {
  console.error(chalk.red('Unable to find starting directory'));
  process.exit();
}

let config;
try {
  config = require(path.resolve(process.cwd(), configPath));
} catch (e) {
  console.error(chalk.red('No/Invalid dewey config file found'));
  process.exit();
}

const dewey = new Dewey(startingDir, config);

dewey.run();