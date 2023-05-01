# gas-bundler-test

Bundle all files Google App Scripts (GAS) files into one,
so it can be tested in nodejs

Google Apps Scripts treats all function define in project
as global, making it hard to tests our project at development
level.

The intention of this simple library is to bundle all
the files specified by the user in one function or file
that can be imported and tested.

## Install

> npm install @didando8a/gas-bundler-test

## How to use

Let's say you project has a src folder where all your
Google App Scripts reside and want to use it for testing purposes in
you test/unit files

### Bundling and writing to a file

```javascript
const gasBundlerTest = require('@didando8a/gas-bundler-test');

// Create a Bundler class
// Get all files in src (first parameter) 
// and create a file with the bundled output in test/ specified it as a second parameter
const bundler = new gasBundlerTest.Bundler("src", "tests");

// Bundle and export all function in the bundle modules specified in the first parameter,
// In this case export divide_numbers and test_test functions.
// If there are external libraries used and want to be mocked when testing, specify the into 
// an array as a second parameter so that they are added to the global scope
bundler.bundle(['divide_numbers', 'test_test'], ['SpreadsheetApp'])

// A file test/gasBundler.js will be created
// Require the bundle file in other tests so it can be tested
```

### Bundling without writing to a file (Creating a function)
```javascript
const gasBundlerTest = require('@didando8a/gas-bundler-test');

// Create a Bundler class
// Get all files in src (first parameter) 
// and create a fucntion with the bundled output
const bundler = new gasBundlerTest.Bundler("src");

// Bundle and export all function in the bundle modules specified in the first parameter.
// If there are external libraries used and want to be mocked when testing, specify the into 
// an array as a second parameter so that they are added to the global scope
const gasFiles = bundler.bundle(['divide_numbers'], ['SpreadsheetApp']);

// functions can be tested strait away
gasFiles.divide_numbers();
```
