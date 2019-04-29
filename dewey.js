import fs from 'fs';
import chalk from 'chalk';
import path from 'path';
import { get as _get } from 'lodash';

class Dewey {
  constructor(dir, config) {
    this.dir = dir;
    this.config = config;
    this.errors = [];
    this.successes = [];
  }

  /**
   * Run the dewey test on log the results
   */
  run() {
    this.test();
    this.showResults();
    this.clearResults();
  }

  /**
   * Test all files using the provided directory and config
   */
  test() {
    this.testDir(this.dir, this.config, []);
  }

  testDir(dir, config, pathToDir) {
    const currentPath = [...pathToDir, dir];
    const names = fs.readdirSync(path.join(...currentPath));
    const { files, dirs } = names.reduce((acc, name) => {
      const stat = fs.lstatSync(path.join(...currentPath, name));
      if (stat.isFile()) {
        acc.files.push(name);
      } else if (stat.isDirectory()) {
        acc.dirs.push(name);
      }

      return acc;
    }, { files: [], dirs: [] });

    files.forEach((file) => {
      if (this.matchIgnore(file, config, currentPath)) {
        console.log(chalk.gray('◉', file))
      } else if (this.matchFile(file, config, currentPath)) {
        console.log(chalk.green('✓', file));
        this.successes.push(file);
      } else {
        console.error(chalk.red('𝘅', file));
        this.errors.push(file)
      }
    });

    dirs.forEach((childDir) => {
      if (this.matchIgnore(childDir, config, currentPath)) {
        console.log(chalk.yellow('◉', childDir))
      } else {
        const dirConfig = this.getConfigForDir(childDir, config, currentPath);
        if (!dirConfig) {
          console.error(chalk.red('𝘅', childDir));
          this.errors.push(childDir)
        } else {
          console.log(chalk.green('✓', childDir));
          this.successes.push(childDir);
          this.testDir(childDir, dirConfig, currentPath);
        }
      }
    })
  }

  matchIgnore(name, config, pathToDir) {
    return _get(config, 'ignore', []).some((matcher) => {
      return this.match(name, matcher, pathToDir);
    })
  }

  matchFile(file, config, pathToDir) {
    return _get(config, 'files', []).some((matcher) => {
      return this.match(file, matcher, pathToDir);
    })
  }

  match(name, matcher, path) {
    if (typeof matcher === 'string') {
      return matcher === name;
    } else if (typeof matcher === 'function') {
      return matcher(path, name) === name;
    } else if (matcher instanceof RegExp) {
      return name.match(matcher);
    }
  }

  getConfigForDir(dir, parentConfig, pathToDir) {
    let config;

    _get(parentConfig, 'dirs', []).forEach((dirConfig) => {
      if (this.match(dir, dirConfig.dirName, pathToDir)) {
        config = dirConfig.config;
      }
    })
    
    return config;
  }

  /**
   * Show the results of a test
   */
  showResults() {
    console.log('\n===Results===');
    console.log('Successes:', this.successes.length);
    console.log('Failures:', this.errors.length);
    this.errors.forEach(error => {
      console.error(chalk.red(error));
    })
  }

  /**
   * Clear the results of a test
   */
  clearResults() {
    this.errors = [];
  }
}

export default Dewey;