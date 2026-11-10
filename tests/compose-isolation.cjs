const assert = require('node:assert/strict');
const fs = require('node:fs');

// The Compose model can contain credentials. Never print it or assertion values.
let model;
try {
  model = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  console.error('Cannot read the Compose model; configuration content was withheld.');
  process.exit(1);
}
const services = model.services;
const defaults = Object.keys(services).filter(name => !services[name].profiles?.length);
assert.ok(defaults.length === 1 && defaults[0] === 'serve',
  'A default compose up must start only the development server');
assert.ok(services.tools.profiles?.includes('cli'), 'Tools must be opt-in');
assert.ok(services.test.profiles?.includes('test'), 'Browser tests must be opt-in');
assert.ok(services['test-site'].profiles?.includes('test'), 'Test server must be opt-in');
assert.ok(services['test-site'].environment.HUGO_PARAMS_PEXELSAPIKEY === '',
  'The test server must not receive a Pexels credential');

const command = services['test-site'].command.join(' ');
const destination = command.match(/--destination(?:=|\s+)(\/[^\s"']+)/)?.[1];
assert.ok(destination?.startsWith('/tmp/'),
  'The test server must render to a private container directory, not the shared public/');
assert.ok(!services['test-site'].volumes.some(volume =>
  destination === volume.target || destination.startsWith(`${volume.target}/`)),
  'The test output must not be inside a shared mount');

console.log('Compose isolation checks passed: development-only default, opt-in CLI/tests, private test output.');
