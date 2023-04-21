const path = require('path');
const fs = require('fs');

class Bundler {
    fullPathToFiles;
    validFiles = ['.js']

    constructor(pathsToFiles) {
        if (pathsToFiles instanceof String) {
            const pathToDir = path.join(process.cwd(), pathsToFiles);
            const stats = fs.statSync(pathToDir);

            if (!stats.isDirectory()) {
                throw Error(`Parameter is of type string but ${pathToDir} is not a directory`);
            }

            const arrayOfFiles = this.#getFilesFromDir(pathsToFiles, []);

            if (arrayOfFiles.length === 0) {
                throw Error(`Path ${pathToDir} is a directory but do not contain any file of type ${this.validFiles.join(', ')}`);
            }

            this.fullPathToFiles = arrayOfFiles;
        } else if (Array.isArray(pathsToFiles)) {
            if (pathsToFiles.length === 0) {
                throw Error(`Parameter cannot be empty`);
            }

            this.fullPathToFiles = this.#getFilesFromList(pathsToFiles);
        }

        throw Error('Parameter should be either a string referencing a directory or a set of files (at least one)');
    }

    #getFilesFromDir(pathToDir, arrayOfFiles = []) {
        const files = fs.readdirSync(pathToDir);

        files.forEach(file => {
            const newPath =path.join(pathToDir, file);
            if (fs.statSync(newPath).isDirectory()) {
                arrayOfFiles = this.#getFilesFromDir(newPath, arrayOfFiles);
            } else if (this.validFiles.includes(path.extname(newPath).toLowerCase())) {
                arrayOfFiles.push(newPath);
            }
        });

        return arrayOfFiles;
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
}

function createPathFromRunningProcessFolder(pathToFile) {
    return `${process.cwd()}/${pathToFile}`;
}

/**
 *
 * @param pathsList Array of file path to be bundled.
 *  The path should be referenced from teh project root (when the process is running)
 * @param exportNameList Functions and constants that want to be exported
 * @param globalLibraryList libraries to be exported.
 *  Use it to mock a library used in GAS (for instance SpreadsheetApp) by adding it
 *  to the global object
 * @returns {*} All files concatenated in the were added in the array
 */
function bundle(pathsList, exportNameList, globalLibraryList = []) {
    if (!Array.isArray(pathsList) || pathsList.length === 0) {
        if (!Array.isArray(pathsList)) {
            throw Error('parameter 1 pathList must be of type array');
        }

        throw Error('parameter 1 pathList cannot be empty');
    }

    if (!Array.isArray(exportNameList) || exportNameList.length === 0) {
        if (!Array.isArray(pathsList)) {
            throw Error('parameter 2 exportNameList must be of type array');
        }

        throw Error('parameter 2 exportNameList cannot be empty')
    }

    let bundleFile = '';

    try {
        pathsList.forEach(pathToFile => {
            const parsedFiled = readFileSync(
                createPathFromRunningProcessFolder(pathToFile),
                'utf-8',
            );

            bundleFile = ''.concat(bundleFile, '\n', parsedFiled);
        });

        globalLibraryList.forEach(globalLibName => {
            bundleFile = ''.concat(`global.${globalLibName} = {}`, '\n', bundleFile);
        });

    } catch (err) {
        console.error(err);
    }

    const exportTemplate = ` return {
    ${exportNameList.join(', ')}
};`

    // eslint-disable-next-line no-new-func
    return Function(bundleFile + exportTemplate.toString())();
}

module.exports = {
    Bundler,
}
