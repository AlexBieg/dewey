import fs from 'fs';
import chalk from 'chalk';
import path from 'path';
import {
  get as _get,
  differenceBy as _differenceBy
} from 'lodash';

class Dewey {
  constructor(dir, config, showOutput=true) {
    this.dir = dir;
    this.config = config;
    this.showOutput = showOutput;
    this.errors = [];
    this.successes = [];
  }

  /**
   * Run the dewey test on log the results
   */
  run() {
    this.test();
    this.showResults();
  }

  /**
   * Test all files using the provided directory and config
   */
  test() {
    this.testDir(this.dir, this.config, []);
  }

  printItem(color, name, currentPath, _prefix, _suffix) {
    if (this.showOutput) {
      console.log(chalk[color](
        _prefix ? _prefix : '',
        path.join(...currentPath, name),
        _suffix ? _suffix : ''
      ));
    }
  }

  printSuccess(path, name) {
    this.printItem('green', name, path, '✓');
  }

  printError(path, name) {
    this.printItem('red', name, path, '𝘅');
  }

  printIgnored(path, name) {
    this.printItem('blue', name, path, '◉', '(ignored)');
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

    let completedFileConfig;
    let incompleteRequiredFileConfigs = [..._get(config, 'files', []).filter(fc => fc.required)];
    let incompleteRequiredDirConfigs = [..._get(config, 'dirs', []).filter(dc => dc.required)];

    // Test all files in the directory
    files.forEach((file) => {
      if (this.matchIgnore(file, config, currentPath)) {
        this.printIgnored(currentPath, file);
      } else if (completedFileConfig = this.matchFile(file, config, currentPath)) {
        this.printSuccess(currentPath, file);
        this.successes.push(file);

        if (completedFileConfig.required) {
          incompleteRequiredFileConfigs = incompleteRequiredFileConfigs.filter(ifc => ifc.name !== completedFileConfig.name);
        }
      } else {
        this.printError(currentPath, file);
        this.errors.push({
          name: file,
          path: currentPath,
          matches: this.getResolvedMatches(config, currentPath, file, 'files'),
        })
      }
    });

    // Test all directories in the directory
    dirs.forEach((childDir) => {
      if (this.matchIgnore(childDir, config, currentPath)) {
        this.printIgnored(currentPath, childDir);
      } else {
        const dirConfig = this.getConfigForDir(childDir, config, currentPath);
        if (!dirConfig) {
          this.printError(currentPath, childDir);
          this.errors.push({
            name: childDir,
            path: currentPath,
            matches: this.getResolvedMatches(config, currentPath, childDir, 'dirs'),
          })
        } else {
          this.printSuccess(currentPath, childDir);
          this.successes.push(childDir);
          if (Object.keys(dirConfig).length) {
            this.testDir(childDir, dirConfig, currentPath);
          }

          const matchingConfigs = this.getDirMatchingConfigs(childDir, config, currentPath);
          incompleteRequiredDirConfigs = _differenceBy(incompleteRequiredDirConfigs, matchingConfigs, (c) => c.name);
        }
      }
    });

    incompleteRequiredFileConfigs.forEach((fc) => {
      this.errors.push({
        required: true,
        type: 'file',
        name: fc.name,
        path: currentPath,
      });
    });

    incompleteRequiredDirConfigs.forEach((dc) => {
      this.errors.push({
        required: true,
        type: 'dir',
        name: dc.name,
        path: currentPath,
      });
    });
  }

  getResolvedMatches(config, currentPath, name, type) {
    return _get(config, type, []).map(itemConfig => {
      const matcher = itemConfig.name;
      if (typeof matcher === 'function') {
        return matcher(currentPath.slice().reverse(), name);
      }
      return matcher;
    });
  }

  matchIgnore(name, config, pathToDir) {
    return _get(config, 'ignore', []).some((matcher) => {
      return this.match(name, matcher, pathToDir);
    })
  }

  matchFile(file, config, pathToDir) {
    return _get(config, 'files', []).find((fileConfig) => {
      return this.match(file, fileConfig.name ? fileConfig.name : fileConfig, pathToDir);
    });
  }

  match(name, matcher, path) {
    if (typeof matcher === 'string') {
      return matcher === name;
    } else if (typeof matcher === 'function') {
      const newMatcher = matcher(path.slice().reverse(), name);
      if (typeof newMatcher === "boolean") {
        return newMatcher;
      } else {
        return this.match(name, newMatcher, path);
      }
    } else if (matcher instanceof RegExp) {
        return name.match(matcher);
    }
  }

  getConfigForDir(dir, parentConfig, pathToDir) {
    const config = _get(parentConfig, 'dirs', []).reduce((acc, dirConfig) => {
      if (this.match(dir, dirConfig.name, pathToDir)) {
        if (!acc) {
          return dirConfig.config || {};
        }
        return {
          ignore: [
            ..._get(acc, 'ignore', []),
            ..._get(dirConfig, 'ignore', []),
          ],
          files: [
            ..._get(acc, 'files', []),
            ..._get(dirConfig, 'files', [])
          ],
          dirs: [
            ..._get(acc, 'dirs', []),
            ..._get(dirConfig, 'dirs', []),
          ]
        };
      }
      return acc;
    }, undefined);

    return config;
  }

  getDirMatchingConfigs(dir, parentConfig, pathToDir) {
    return _get(parentConfig, 'dirs', []).filter(dirConfig => this.match(dir, dirConfig.name, pathToDir));
  }

  /**
   * Show the results of a test
   */
  showResults() {
    if (this.showOutput) {
      console.log('\n====Results====');
      console.log('Successes:', this.successes.length);
      console.log('Failures:', this.errors.length);
      this.errors.filter(error => !error.required).forEach(error => {
        this.printItem('red', error.name, error.path);
        console.log('\t', 'Should be one of:', error.matches);
      });

      this.errors.filter(error => error.required).forEach(error => {
        this.printItem('red', error.name, error.path, `Missing Required ${error.type === 'file' ? 'File' : 'Directory'}: `);
      });
    }

    if (this.errors.length) {
      throw new Error('Tests failed.');
    }
  }
}

export default Dewey;