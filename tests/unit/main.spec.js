const gasBundler = require('../../src/main');
const fs = require("fs");

describe('concatenate files', () => {

    it('concatenate 2 files properly', () => {
        const bundler = new gasBundler.Bundler('tests/fixtures');
        const expected = `


// Adding file tests/fixtures/file_one.js

function multiply_numbers(p1, p2) {
    return p1 * p2;
}


// Adding file tests/fixtures/file_two.js

// Function to compute the product of p1 and p2
function divide_numbers(p1, p2) {
    return p1 / p2;
}


// Adding file tests/fixtures/otro/file_three.js

function testest() {
    return p1;
}

return {
    multiply_numbers,
};
`;

        expect(bundler.getContent(['multiply_numbers'])).toBe(expected);
    });

    it('concatenate 2 files properly with module.export file', () => {
        const bundler = new gasBundler.Bundler('tests/fixtures', 'tests/bundle');
        const expected = `


// Adding file tests/fixtures/file_one.js

function multiply_numbers(p1, p2) {
    return p1 * p2;
}


// Adding file tests/fixtures/file_two.js

// Function to compute the product of p1 and p2
function divide_numbers(p1, p2) {
    return p1 / p2;
}


// Adding file tests/fixtures/otro/file_three.js

function testest() {
    return p1;
}

module.exports = {
    multiply_numbers,
    divide_numbers,
    testTest,
};
`;

        expect(bundler.getContent(['multiply_numbers', 'divide_numbers', 'testTest'], [])).toBe(expected);
    });


    it('concatenate 2 files properly with module.export and write to a file', () => {
        const bundler = new gasBundler.Bundler('tests/fixtures', 'tests/bundle');
        const expected = `


// Adding file tests/fixtures/file_one.js

function multiply_numbers(p1, p2) {
    return p1 * p2;
}


// Adding file tests/fixtures/file_two.js

// Function to compute the product of p1 and p2
function divide_numbers(p1, p2) {
    return p1 / p2;
}


// Adding file tests/fixtures/otro/file_three.js

function testest() {
    return p1;
}

module.exports = {
    multiply_numbers,
    divide_numbers,
    testTest,
};
`;


        bundler.bundle(['multiply_numbers', 'divide_numbers', 'testTest']);
        const parsedFile = fs.readFileSync(
            'tests/bundle/gasBundler.js',
            'utf-8',
        );

        expect(parsedFile).toBe(expected);
    });
});
