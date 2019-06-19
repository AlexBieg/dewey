import Dewey from '../dewey';
import fs from 'fs';

jest.mock('fs');

class FakeFileObject {
  constructor(isDir) {
    this.isDir = isDir;
  }

  isFile() {
    return !this.isDir;
  }

  isDirectory() {
    return this.isDir;
  }
}

const emptyConfig = {
  files: [],
  dirs: [],
};

test('Passes with string file names', () => {
  fs.readdirSync.mockImplementation(() => ['test1', 'test2']);
  fs.lstatSync.mockImplementation((items) => new FakeFileObject(false));
  const dewey = new Dewey(
    '',
    { files: ['test1', 'test2'] },
    false,
  );
  dewey.run();
});

test('Passes with string dir names', () => {
  fs.readdirSync.mockImplementation(() => ['test1', 'test2']);
  fs.lstatSync.mockImplementation((items) => new FakeFileObject(true));
  const dewey = new Dewey(
    '',
    { dirs: [{ name: 'test1' }, { name: 'test2' }], config: emptyConfig },
    false,
  );
  dewey.run();
});