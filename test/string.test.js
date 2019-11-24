import Dewey from '../dewey';
import fs from 'fs';
import { FakeFileObject } from './utils';

jest.mock('fs');

describe('matching string names', () => {
  beforeAll(() => {
    fs.readdirSync.mockImplementation(() => ['test1', 'test2']);
  })

  test('Passes with string file names in objectForm', () => {
    fs.lstatSync.mockImplementation(() => new FakeFileObject(false));
    const dewey = new Dewey(
      '',
      { files: [{ name: 'test1' }, { name: 'test2' }] },
      false,
    );
    dewey.run();
  });

  test('Passes with string file names in list form', () => {
    fs.lstatSync.mockImplementation(() => new FakeFileObject(false));
    const dewey = new Dewey(
      '',
      { files: ['test1', 'test2'] },
      false,
    );
    dewey.run();
  });

  test('Passes with string file names ignored', () => {
    fs.lstatSync.mockImplementation(() => new FakeFileObject(false));
    const dewey = new Dewey(
      '',
      { ignore: ['test1', 'test2'] },
      false,
    );
    dewey.run();
  });

  test('Passes with string dir names', () => {
    fs.lstatSync.mockImplementation(() => new FakeFileObject(true));
    const dewey = new Dewey(
      '',
      { dirs: [{ name: 'test1' }, { name: 'test2' }] },
      false,
    );
    dewey.run();
  });

  test('Passes with string dir names ignored', () => {
    fs.lstatSync.mockImplementation(() => new FakeFileObject(true));
    const dewey = new Dewey(
      '',
      { ignore: ['test1', 'test2'] },
      false,
    );
    dewey.run();
  });
});