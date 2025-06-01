
const { spawn } = require('child_process');
const path = require('path');

// Run the migration script
const migrationPath = path.join(__dirname, '..', 'server', 'migrate.ts');

console.log('Starting database migration...');

const child = spawn('npx', ['tsx', migrationPath], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('Migration completed successfully!');
  } else {
    console.error(`Migration failed with exit code ${code}`);
  }
});
