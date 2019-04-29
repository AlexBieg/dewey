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
        this.printItem('blue', file, currentPath, '◉', '(ignored)');
      } else if (this.matchFile(file, config, currentPath)) {
        this.printItem('green', file, currentPath, '✓');
        this.successes.push(file);
      } else {
        this.printItem('red', file, currentPath, '𝘅');
        this.errors.push({
          name: file,
          path: currentPath,
          matches: this.getResolvedFileMatches(config, currentPath, file),
        })
      }
    });

    dirs.forEach((childDir) => {
      if (this.matchIgnore(childDir, config, currentPath)) {
        this.printItem('blue', childDir, currentPath, '◉', '(ignored)');
      } else {
        const dirConfig = this.getConfigForDir(childDir, config, currentPath);
        if (!dirConfig) {
          this.printItem('red', childDir, currentPath, '𝘅');
          this.errors.push({
            name: childDir,
            path: currentPath,
            matches: this.getResolvedDirMatches(config, currentPath, childDir),
          })
        } else {
          this.printItem('green', childDir, currentPath, '✓');
          this.successes.push(childDir);
          this.testDir(childDir, dirConfig, currentPath);
        }
      }
    })
  }

  getResolvedFileMatches(config, currentPath, file) {
    return _get(config, 'files', []).map(matcher => {
      if (typeof matcher === 'function') {
        return matcher(currentPath, file);
      }
      return matcher;
    })
  }

  getResolvedDirMatches(config, currentPath, dir) {
    return _get(config, 'dirs', []).map(matcher => {
      if (typeof matcher.dirName === 'function') {
        return matcher.dirName(currentPath, dir);
      }
      return matcher.dirName;
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
    const config = _get(parentConfig, 'dirs', []).reduce((acc, dirConfig) => {
      if (this.match(dir, dirConfig.dirName, pathToDir)) {
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
    console.log('\n===Results===');
    console.log('Successes:', this.successes.length);
    console.log('Failures:', this.errors.length);
    this.errors.forEach(error => {
      this.printItem('red', error.name, error.path);
      console.log('\t', 'Should be one of:', error.matches);
    })
  }
}

export default Dewey;