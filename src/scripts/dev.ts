export const dev = () => {
  // Compile project with swc and run the compiled code in watch mode
  const { spawn } = require('child_process');

  const swc = spawn('swc', ['src', '-d', 'dist', '--watch']);

  swc.stdout.on('data', (data: any) => {
    console.log(`stdout: ${data}`);
  });
};
