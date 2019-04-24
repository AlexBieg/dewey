import fs from 'fs';

class Dewey {
  constructor(dir, config) {
    this.dir = dir;
    this.config = config;
    this.errors = [];
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
    console.log('testing');
  }

  /**
   * Show the results of a test
   */
  showResults() {
    console.error('\x1b[31m', 'error');
  }

  /**
   * Clear the results of a test
   */
  clearResults() {
    this.errors = [];
  }
}

export default Dewey;