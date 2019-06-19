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
  }

  /**
   * Test all files using the provided directory and config
   */
  test() {
    this.testDir(this.dir, this.config, []);
  }

  printItem(color, name, currentPath, _prefix, _suffix) {
    console.log(chalk[color](
      _prefix ? _prefix : '',
      path.join(...currentPath, name),
      _suffix ? _suffix : ''
     ));
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

    files.forEach((file) => {
      if (this.matchIgnore(file, config, currentPath)) {
        this.printIgnored(currentPath, file);
      } else if (this.matchFile(file, config, currentPath)) {
        this.printSuccess(currentPath, file);
        this.successes.push(file);
      } else {
        this.printError(currentPath, file);
        this.errors.push({
          name: file,
          path: currentPath,
          matches: this.getResolvedFileMatches(config, currentPath, file),
        })
      }
    });

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
            matches: this.getResolvedDirMatches(config, currentPath, childDir),
          })
        } else {
          this.printSuccess(currentPath, childDir);
          this.successes.push(childDir);
          this.testDir(childDir, dirConfig, currentPath);
        }
      }
    })
  }

  getResolvedFileMatches(config, currentPath, file) {
    return _get(config, 'files', []).map(fileConfig => {
      const matcher = fileConfig.name;
      if (typeof matcher === 'function') {
        return matcher(currentPath.slice().reverse(), file);
      }
      return matcher;
    })
  }

  getResolvedDirMatches(config, currentPath, dir) {
    return _get(config, 'dirs', []).map(dirConfig => {
      const matcher = dirConfig.name;
      if (typeof matcher === 'function') {
        return matcher(currentPath, dir);
      }
      return matcher;
    })
  }

  matchIgnore(name, config, pathToDir) {
    return _get(config, 'ignore', []).some((matcher) => {
      return this.match(name, matcher, pathToDir);
    })
  }

  matchFile(file, config, pathToDir) {
    return _get(config, 'files', []).some((fileConfig) => {
      return this.match(file, fileConfig.name, pathToDir);
    })
  }

  match(name, matcher, path) {
    if (typeof matcher === 'string') {
      return matcher === name;
    } else if (typeof matcher === 'function') {
      return matcher(path.slice().reverse(), name) === name;
    } else if (matcher instanceof RegExp) {
      return name.match(matcher);
    }
  }

  getConfigForDir(dir, parentConfig, pathToDir) {
    const config = _get(parentConfig, 'dirs', []).reduce((acc, dirConfig) => {
      if (this.match(dir, dirConfig.name, pathToDir)) {
        if (!acc) {
          return dirConfig.config;
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
            ..._get(acc, 'dirs', []),
          ]
        };
      }
      return acc;
    }, undefined);

    return config;
  }

  /**
   * Show the results of a test
   */
  showResults() {
    console.log('\n====Results====');
    console.log('Successes:', this.successes.length);
    console.log('Failures:', this.errors.length);
    this.errors.forEach(error => {
      this.printItem('red', error.name, error.path);
      console.log('\t', 'Should be one of:', error.matches);
    })
  }
}

export default Dewey;