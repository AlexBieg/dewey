import Dewey from '../dewey';
import fs from 'fs';
import { FakeFileObject } from './utils';

jest.mock('fs');

describe('matching regex names', () => {
  beforeAll(() => {
    fs.readdirSync.mockImplementation(() => ['test1', 'test2']);
  })

  test('Passes with regex file names in objectForm', () => {
    fs.lstatSync.mockImplementation(() => new FakeFileObject(false));
    const dewey = new Dewey(
      '',
      { files: [{ name: /test1/ }, { name: /test2/ }] },
      false,
    );
    dewey.run();
  });

  test('Passes with regex file names in list form', () => {
    fs.lstatSync.mockImplementation(() => new FakeFileObject(false));
    const dewey = new Dewey(
      '',
      { files: [/test1/, /test2/] },
      false,
    );
    dewey.run();
  });

  test('Passes with multiple regex matches', () => {
    fs.lstatSync.mockImplementation(() => new FakeFileObject(false));
    const dewey = new Dewey(
      '',
      { files: [{ name: /test[0-9]/ }] },
      false,
    );
    dewey.run();
  });

  test('Passes with regex file names ignored', () => {
    fs.lstatSync.mockImplementation(() => new FakeFileObject(false));
    const dewey = new Dewey(
      '',
      { ignore: [/test1/, /test2/] },
      false,
    );
    dewey.run();
  });

  test('Passes with string dir names', () => {
    fs.lstatSync.mockImplementation(() => new FakeFileObject(true));
    const dewey = new Dewey(
      '',
      { dirs: [{ name: /test1/ }, { name: /test2/ }] },
      false,
    );
    dewey.run();
  });

  test('Passes with regex dir names ignored', () => {
    fs.lstatSync.mockImplementation(() => new FakeFileObject(true));
    const dewey = new Dewey(
      '',
      { ignore: [/test1/, /test2/] },
      false,
    );
    dewey.run();
  });
});