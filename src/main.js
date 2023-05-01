const path = require('path');
const fs = require('fs');

class Bundler {
  #fileName = 'gasBundler.js';

  fullPathToFiles;

  fullPathToCreatedFile = null;

  validFiles = ['.js'];

  constructor(pathsToFiles, pathToCreatedFile = null) {
    if (typeof pathToCreatedFile === 'string') {
      const pathToCreatedFileDir = path.join(process.cwd(), pathToCreatedFile);
      const isDirectory = fs.existsSync(pathToCreatedFileDir)
          && fs.lstatSync(pathToCreatedFileDir).isDirectory();

      if (!isDirectory) {
        throw new Error(`Parameter 2 is of type string but ${pathToCreatedFile} is not a directory`);
      }

      this.fullPathToCreatedFile = pathToCreatedFileDir;
    }

    if (typeof pathsToFiles === 'string') {
      const pathToDir = path.join(process.cwd(), pathsToFiles);
      const isDirectory = fs.existsSync(pathToDir) && fs.lstatSync(pathToDir).isDirectory();

      if (!isDirectory) {
        throw Error(`Parameter is of type string but ${pathToDir} is not a directory`);
      }

      // SHOULD I PASS THE FULL PATH INSTEAD THEN CAT THE REMOVE
      // THE PATH WHERE THE PROCESS IS RUNNING FROM?
      const arrayOfFiles = this.#getFilesFromDir(pathsToFiles, []);

      if (arrayOfFiles.length === 0) {
        throw Error(`Path ${pathToDir} is a directory but do not contain any file of type ${this.validFiles.join(', ')}`);
      }

      this.fullPathToFiles = arrayOfFiles;

      return;
    } if (Array.isArray(pathsToFiles)) {
      if (pathsToFiles.length === 0) {
        throw Error('Parameter cannot be empty');
      }

      this.fullPathToFiles = this.#getFilesFromList(pathsToFiles);

      return;
    }

    throw Error('Parameter should be either a string referencing a directory or a set of files (at least one)');
  }

  #getFilesFromDir(pathToDir, arrayOfFiles = []) {
    const files = fs.readdirSync(pathToDir);
    let filesArray = arrayOfFiles;

    files.forEach((file) => {
      const newPath = path.join(pathToDir, file);
      if (fs.existsSync(newPath) && fs.statSync(newPath).isDirectory()) {
        filesArray = this.#getFilesFromDir(newPath, filesArray);
      } else if (this.validFiles.includes(path.extname(newPath).toLowerCase())) {
        filesArray.push(newPath);
      }
    });

    return filesArray;
  }

  #getFilesFromList(pathsToFiles) {
    return pathsToFiles.map((pathToFile) => {
      const fullPathToFile = path.join(process.cwd(), pathToFile);
      const isFile = fs.existsSync(fullPathToFile) && fs.lstatSync(fullPathToFile).isFile();

      if (!isFile) {
        throw Error(`${fullPathToFile} is not a not a file`);
      }

      if (!this.validFiles.includes(path.extname(fullPathToFile).toLowerCase())) {
        throw Error(`${fullPathToFile} is not a valid file. Valid files ${this.validFiles.join(', ')}`);
      }

      return fullPathToFile;
    });
  }

  /**
   *
   * @param exportNameList Functions and constants that want to be exported
   * @param globalLibraryList libraries to be exported.
   * @returns {*} All files concatenated in the order they were added in the array
   */
  getContent(exportNameList, globalLibraryList = []) {
    let bundleFile = '';

    try {
      this.fullPathToFiles.forEach((pathToFile) => {
        const newFileMarkTemplate = `


// Adding file ${pathToFile}

`;

        const parsedFile = fs.readFileSync(
          pathToFile,
          'utf-8',
        );
        bundleFile = ''.concat(bundleFile, newFileMarkTemplate, parsedFile);
      });

      globalLibraryList.forEach((globalLibName) => {
        bundleFile = ''.concat(`global.${globalLibName} = {}`, '\n', bundleFile);
      });
    } catch (err) {
      throw Error(err);
    }

    const exportTemplate = `
${this.fullPathToCreatedFile === null ? 'return' : 'module.exports ='} {
    ${exportNameList.join(',\n    ')},
};
`;

    return ''.concat(bundleFile, '\n', exportTemplate.toString());
  }

  /**
   *
   * @param exportNameList Functions and constants that want to be exported
   * @param globalLibraryList libraries, functions, constants that are part of the GAS api and are meant to be mocked
   *  Use it to mock a library used in GAS (for instance SpreadsheetApp) by adding it
   *  to the global object
   * @returns {(Function|void)} a function with All files concatenated in the order they
   * were added in the array or write all files concatenated in the file specified in
   * fullPathToCreatedFile
   */
  bundle(exportNameList, globalLibraryList = []) {
    if (!Array.isArray(exportNameList) || exportNameList.length === 0) {
      if (!Array.isArray(exportNameList)) {
        throw Error('parameter 2 exportNameList must be of type array');
      }

      throw Error('parameter 2 exportNameList cannot be empty');
    }

    const bundleFile = this.getContent(exportNameList, globalLibraryList);

    if (this.fullPathToCreatedFile === null) {
      // eslint-disable-next-line no-new-func
      return Function(bundleFile)();
    }

    try {
      fs.writeFileSync(path.join(this.fullPathToCreatedFile, this.#fileName), bundleFile);
      fs.chmodSync(path.join(this.fullPathToCreatedFile, this.#fileName), 0o666);
    } catch (err) {
      throw Error(err);
    }

    return undefined;
  }
}

module.exports = {
  Bundler,
};
