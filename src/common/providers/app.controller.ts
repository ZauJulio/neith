import { debug } from '@utils';
import { loadModules } from '@modules';

import { BaseModule } from '@interfaces';
import { App, HttpServer, Request, Response, Router } from '@types';

class AppController {
  server: HttpServer;

  log = debug('app:controller');
  router = Router();

  constructor(props: { server: HttpServer }) {
    this.server = props.server;

    this.build();
  }

  async build() {
    this.buildDefaultRoute();
    await this.buildRESTRoutes();
  }

  buildDefaultRoute() {
    this.router.get('/', (req: Request, res: Response) =>
      res
        .status(200)
        .send(`Server running at http://localhost:${process.env.PORT}`)
    );
  }

  async buildRESTRoutes() {
    for (const _module of await loadModules(this.server)) {
      this.router.use(`/${_module.name}`, _module.router);

      this.logRoutes(_module);
    }
  }

  logRoutes(_moduleInstance: BaseModule<any, any, any, any, any>) {
    for (const _layer of _moduleInstance.router.stack) {
      const _path = _layer.route?.path;
      const _methods = Object.keys(_layer.route?.methods).join(', ');

      this.log(`${_path} - ${_methods}`);
    }
  }
}

export function registerAppController(props: { app: App; server: HttpServer }) {
  props.app.use(new AppController(props).router);
}
