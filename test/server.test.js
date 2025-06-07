const { spawn } = require('child_process');
const assert = require('assert');

describe('server start', function () {
  this.timeout(5000); // allow time for server to start
  let proc;
  before(function (done) {
    proc = spawn('node', ['backend.js']);
    const onData = (data) => {
      if (data.toString().includes('Server running on port')) {
        proc.stdout.off('data', onData);
        done();
      }
    };
    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('error', done);
  });

  after(function () {
    if (proc) proc.kill();
  });

  it('prints startup message', function () {
    // If before hook completed, server started successfully
    assert.ok(true);
  });
});
