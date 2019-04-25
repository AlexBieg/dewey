import fs from 'fs';
import chalk from 'chalk';

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
    let files = fs.readdirSync(this.dir);

    while (files.length > 0) {
      if (this.config.test.files.includes(files[0])) {
        console.log(chalk.green('✓', files[0]));
        this.successes.push(files[0]);
      } else {
        console.error(chalk.red('𝘅', files[0]));
        this.errors.push(files[0])
      }
      files = files.slice(1, files.length);
    }
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