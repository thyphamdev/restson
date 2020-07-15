module.exports = class ModuleGetter {
  static getFullDir(subDir, dir) {
    if (typeof subDir !== 'string') {
      return null;
    }

    // subDir is full dir already
    if (subDir.startsWith('./')) {
      return subDir;
    }

    if (typeof dir !== 'string') {
      return `./${subDir}`;
    }

    return `./${dir}/${subDir}`;
  }

  static getModule(modulePath, dir) {
    if (typeof modulePath !== 'string') {
      return null;
    }

    return require.main.require(ModuleGetter.getFullDir(modulePath, dir));
  }
};
