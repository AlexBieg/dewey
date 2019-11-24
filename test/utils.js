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

export {
  FakeFileObject,
};