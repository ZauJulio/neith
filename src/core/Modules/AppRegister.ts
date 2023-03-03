import fs from 'fs';
import path from 'path';

import { HttpServer } from '@types';
import { MODULES_PATH } from '@constants';

export interface AppRegisterOptions {
  server: HttpServer;
  app: any;
  resource: string;
  dependencies?: Record<string, string>;
}

/**
 * AppRegister
 * 
 * @description
 * This class is used to register the app resources
 * such as middleware, controller, service, etc, of the
 * application.
 * 
 * @param {AppRegisterOptions} options
 * @param {HttpServer} options.server
 * @param {any} options.app
 * @param {string} options.resource
 * @param {Record<string, string>} options.dependencies
 */
export class AppRegister {
  private dependencies: AppRegisterOptions['dependencies'];
  private server: AppRegisterOptions['server'];
  private app: AppRegisterOptions['app'];

  public resource: AppRegisterOptions['resource'];

  private resourcePath: AppRegisterOptions['resource'];

  constructor(options: AppRegisterOptions) {
    const { server, app, resource, dependencies } = options;

    this.app = app;
    this.server = server;
    this.resource = resource;
    this.dependencies = dependencies;

    const _path = path.join(MODULES_PATH, '..', `app.${this.resource}`);

    if (!fs.existsSync(_path)) {
      throw new Error(`Resource ${this.resource} not found`);
    }

    this.resourcePath = _path;
  }

  async load() {
    const module = await import(this.resourcePath);

    if (module.default) {
      return module.default({
        server: this.server,
        app: this.app,
        dependencies: this.dependencies,
      });
    }
  }
}
