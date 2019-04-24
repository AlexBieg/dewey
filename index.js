#!/usr/bin/env node
const fs = require('fs');

const [,, ...arguments] = process.argv;
const [argsStartingDir, argsConfigPath] = arguments;
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

console.log(config);
console.log(dir);
