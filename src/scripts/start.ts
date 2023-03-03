export const start = () => {
  // Run the compiled code
  const { spawn } = require('child_process');

  const node = spawn('node', ['dist/index.js']);

  node.stdout.on('data', (data: any) => {
    console.log(`stdout: ${data}`);
  });
};
