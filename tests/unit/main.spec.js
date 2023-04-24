const gasBundler = require('../../src/main');

const bundler = new gasBundler.Bundler('tests/fixtures');

describe('concatenate files', () => {

    it('concatenate 2 files properly', () => {
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

return {
    multiply_numbers
};
`;

        expect(bundler.bundle(['multiply_numbers'])).toBe(expected);
    });
});