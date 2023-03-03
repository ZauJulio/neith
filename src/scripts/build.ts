export const build = () => {
  console.log('Building production files...');

  const { spawn } = require('child_process');

  const swc = spawn('swc', ['src', '-d', 'dist', '--source-maps']);

  swc.stdout.on('data', (data: any) => {
    console.log(`stdout: ${data}`);
  });
};
