require('./common/config/env');
require('./common/config/db');

import { AppRegister } from '@modules'
import { App, HttpServer } from '@types';
import { AppServer, debug, CreateHttpServer } from '@utils';

export function bootstrap() {
  const app: App = AppServer();
  const server: HttpServer = CreateHttpServer(app);

  const log = debug('Server:bootstrap');
  const port = process.env.PORT || 8080;

  if (process.env.NODE_ENV !== 'test') {
    server.listen(port, () =>
      log(`Server running at http://localhost:${port}`)
    );
  }

  const registerAppMiddleware = new AppRegister({
    server,
    app,
    resource: 'middleware',
  });

  registerAppMiddleware.load();

  const registerAppController = new AppRegister({
    server,
    app,
    resource: 'controller',
  });

  registerAppController.load();

  const registerAppService = new AppRegister({
    server,
    app,
    resource: 'service',
  });

  registerAppService.load();

  return { app, server };
}

bootstrap();
