const assert = require('assert');
const { hookStdout } = require('../src/utils');

describe('Utilities', () => {
  it('hooks stdout', () => {
    const data = { type: 'foo', data: null };

    const results = [];
    const unhookStdout = hookStdout(results);
    console.log('hookStdout');
    console.log(JSON.stringify(data));

    unhookStdout();
    assert.deepStrictEqual(results, [data]);
  });
});
