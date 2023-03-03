import * as winston from 'winston';
import helmet from 'helmet';
import cors from 'cors';

import * as expressWinston from 'express-winston';
import rateLimit from 'express-rate-limit';
import * as bodyparser from 'body-parser';

import { debug } from '@utils';
import { App, AppHandler } from '@types';

export class AppMiddlewares {
  handlers: AppHandler[] = [];
  log = debug('app:middleware');

  constructor() {
    this.buildCors();
    this.buildBodyParser();
    this.buildRateLimit();

    this.buildLogger();
  }

  buildRateLimit() {
    // Middleware: Rate limit - apply to all requests
    this.handlers.push(
      rateLimit({
        windowMs: 60 * 60 * 1000, // 1hr
        max: 2000, // limit each IP to 100 requests per windowMs
        message: 'Too many requests, please try again later',
      }),
    );

    this.log('Rate limit applied');
  }

  buildCors() {
    // App: CORS
    this.handlers.push(cors({ origin: '*' }));

    this.log('CORS applied');
  }

  buildBodyParser() {
    // Middleware: Body parser
    this.handlers.push(bodyparser.json());

    this.log('Body parser applied');
  }

  buildHelmet() {
    // Middleware: Helmet
    this.handlers.push(helmet());

    this.log('Helmet applied');
  }

  buildLogger() {
    // Middleware: Logging
    if (process.env.NODE_ENV !== 'test') {
      this.handlers.push(
        expressWinston.logger({
          transports: [new winston.transports.Console()],
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.json(),
          ),
        }),
      );

      this.handlers.push(
        expressWinston.errorLogger({
          transports: [new winston.transports.Console()],
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.json(),
          ),
        }) as unknown as AppHandler,
      );
    }

    this.log('Logger applied');
  }
}

export function registerAppMiddleware(props: { app: App }) {
  props.app.use(new AppMiddlewares().handlers);
}
