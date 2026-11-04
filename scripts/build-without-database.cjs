// Keep .env.local credentials untouched and prevent build-time database access.
const { spawnSync } = require('node:child_process');
const result = spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npx.cmd next build'], {
  stdio: 'inherit',
  env: { ...process.env, MONGODB_URI: '' },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
