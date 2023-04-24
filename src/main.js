const path = require('path');
const fs = require('fs');

class Bundler {
  fullPathToFiles;

  validFiles = ['.js'];

  constructor(pathsToFiles) {
    if (typeof pathsToFiles === 'string') {
      const pathToDir = path.join(process.cwd(), pathsToFiles);
      const stats = fs.statSync(pathToDir);

      console.log(pathToDir);

      if (!stats.isDirectory()) {
        throw Error(`Parameter is of type string but ${pathToDir} is not a directory`);
      }

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
      if (fs.statSync(newPath).isDirectory()) {
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
      const stats = fs.statSync(fullPathToFile);

      if (!stats.isFile()) {
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
   *  Use it to mock a library used in GAS (for instance SpreadsheetApp) by adding it
   *  to the global object
   * @returns {*} All files concatenated in the were added in the array
   */
  bundle(exportNameList, globalLibraryList = []) {
    if (!Array.isArray(exportNameList) || exportNameList.length === 0) {
      if (!Array.isArray(exportNameList)) {
        throw Error('parameter 2 exportNameList must be of type array');
      }

      throw Error('parameter 2 exportNameList cannot be empty');
    }

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

      globalLibraryList.pop();
      // globalLibraryList.forEach(globalLibName => {
      //   bundleFile = ''.concat(`global.${globalLibName} = {}`, '\n', bundleFile)
      // })
    } catch (err) {
      console.error(err);
    }

    const exportTemplate = `
return {
    ${exportNameList.join(', ')}
};
`;

    return ''.concat(bundleFile, '\n', exportTemplate.toString());
    // // eslint-disable-next-line no-new-func
    // return Function(bundleFile + exportTemplate.toString())();
  }
}

// function createPathFromRunningProcessFolder (pathToFile) {
//   return `${process.cwd()}/${pathToFile}`
// }

module.exports = {
  Bundler,
};
