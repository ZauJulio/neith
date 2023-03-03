import { dev, start, build } from './scripts';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .command('dev', 'Run development server', (argv) => {
    dev();
  })
  .command('start', 'Run production server', (argv) => {
    start();
  })
  .command('build', 'Build production files', (argv) => {
    build();
  })
  .parse()
