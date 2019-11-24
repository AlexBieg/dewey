import Dewey from '../dewey';
import fs from 'fs';
import { FakeFileObject } from './utils';

jest.mock('fs');

describe('matching full structure', () => {
  beforeAll(() => {
    fs.readdirSync.mockImplementation((dirName) => {
      switch (dirName) {
        case 'dir1':
          return ['dir1file1', 'dir1file2', 'dir2', 'dir1ignoreFile', 'dir1ignoreDir'];
        case 'dir1/dir2':
          return ['dir1dir2file1', 'dir1dir2ignoreFile', 'dir1dir2ignoreDir'];
        default:
          return ['dir1', 'file1', 'ignoreFile', 'ignoreDir'];
      }
    });
  })

  test('Passes when testing a full directory structure using strings', () => {
    fs.lstatSync.mockImplementation((name) => new FakeFileObject(name.includes('file') ? false : true));
    const dewey = new Dewey(
      '',
      {
        ignore: ['ignoreFile', 'ignoreDir'],
        files: [{ name: 'file1' }],
        dirs: [
          {
            name: 'dir1',
            config: {
              ignore: ['dir1ignoreFile', 'dir1ignoreDir'],
              files: [{ name: 'dir1file1' }, { name: 'dir1file2'}],
              dirs: [
                {
                  name: 'dir2',
                  config: {
                    ignore: ['dir1dir2ignoreFile', 'dir1dir2ignoreDir'],
                    files: [{ name: 'dir1dir2file1'}]
                  }
                }
              ]
            }
          }
        ]
      },
      false,
    );
    dewey.run();
  });

  test('Passes when testing a full directory structure using regex', () => {
    fs.lstatSync.mockImplementation((name) => new FakeFileObject(name.includes('file') ? false : true));
    const dewey = new Dewey(
      '',
      {
        ignore: [/ignore[File|Dir]/],
        files: [{ name: /file1/ }],
        dirs: [
          {
            name: /dir1/,
            config: {
              ignore: [/dir1ignore[File|Dir]/],
              files: [{ name: /dir1file[0-9]/ }],
              dirs: [
                {
                  name: /dir2/,
                  config: {
                    ignore: [/dir1dir2ignore[File|Dir]/],
                    files: [{ name: /dir1dir2file1/}]
                  }
                }
              ]
            }
          }
        ]
      },
      false,
    );
    dewey.run();
  });

  test('Passes when testing a full directory structure using functions', () => {
    fs.lstatSync.mockImplementation((name) => new FakeFileObject(name.includes('file') ? false : true));
    const dewey = new Dewey(
      '',
      {
        ignore: [(path, name) => name.includes('ignore')],
        files: [{ name: () => 'file1' }],
        dirs: [
          {
            name: (path, name) => /dir1/,
            config: {
              ignore: [(path, name) => name.includes('ignore')],
              files: [{ name: (path) => new RegExp(`${path[0]}file[0-9]`)}],
              dirs: [
                {
                  name: () => 'dir2',
                  config: {
                    ignore: [(path, name) => name.includes('ignore')],
                    files: [{ name: (path) => `${path[1]}${path[0]}file1` }]
                  }
                }
              ]
            }
          }
        ]
      },
      false,
    );
    dewey.run();
  });
});