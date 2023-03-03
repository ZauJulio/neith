import fs from 'fs';
import path from 'path';

import { HttpServer } from '@types';
import { MODULES_PATH } from '@constants';

/**
 * ModuleLoader Class is used to load all modules with their dependencies.
 * The modules are used to load the routes, controllers, mydlewares and
 * services of each system entity.
 *
 * @class ModuleLoader
 * @returns {Promise<any[]>} An array of objects with modules builders
 */
export class ModuleLoader {
  private server: HttpServer;
  private dependencies = ['service', 'repository', 'controller', 'middleware'];

  private modulesDirs: string[];

  constructor(server: HttpServer) {
    this.server = server;

    this.modulesDirs = this.getModuleDirs();
  }

  capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get the directories inside the modules path
   *
   * @private
   * @returns {string[]} An array of directory names
   */
  private getModuleDirs(): string[] {
    return fs
      .readdirSync(path.resolve(__dirname, MODULES_PATH))
      .filter((dir) =>
        fs
          .statSync(path.resolve(__dirname, `${MODULES_PATH}/${dir}`))
          .isDirectory(),
      );
  }

  /**
   * This function returns an array of objects with the following structure:
   *
   * [ { 'Beer': { 'BeerModule': [Getter] }, }, ... ]
   *
   * @private
   * @returns {Promise<any[]>} An array of objects with modules builders
   *
   * The object key is the module name, and the value is an object with the module
   * builder and all the module dependencies.
   *
   * The module builder is the class that extends BaseModule and is responsible
   * for loading the module routes and dependencies.
   */
  private async getModules(): Promise<any[]> {
    return Promise.all(
      this.modulesDirs.map(async (_module) => ({
        [_module]: await import(`${MODULES_PATH}/${_module}`),
      })),
    );
  }

  /**
   * This function returns an 2d array with the shape:
   *
   * [
   *   ['service',    [class BeerService    extends BaseService]],
   *   ['repository', [class BeerRepository extends Repository]],
   *   ['controller', [class BeerController extends BaseController]],
   *   ['middleware', [class BeerMiddleware extends BaseMiddleware]],
   * ]
   *
   * @private
   * @param {string} name The module name
   * @returns {Promise<any[]>} An array of arrays with the module dependencies
   *
   * The module dependencies are the classes that are used by the module builder
   * to load the routes and dependencies.
   *
   * The module dependencies are loaded dynamically from the module directory,
   * so the module builder doesn't need to know which dependencies are needed
   * by the module, it just needs to know the name of the module and the name
   * of the dependencies.
   */
  private async getModuleDependencies(name: string): Promise<any[]> {
    return Promise.all(
      this.dependencies.map(async (dependence) => {
        const _dependencePath = `${name.toLowerCase()}.${dependence}`;
        const _path = `${MODULES_PATH}/${name}/${_dependencePath}`;

        const dependenceName = `${name}${this.capitalize(dependence)}`;

        return [dependence, (await import(_path))[dependenceName]];
      }, {}),
    );
  }

  /**
   * loadModules() method is used to load all modules required by the application.
   *
   * The method uses `getModules` method to get all the required modules, maps
   * over them and retrieves the module name. For each module, the method gets its
   * dependencies using `getModuleDependencies` method and creates an object with
   * module builder and its dependencies. Finally, the method returns an array of all
   * the modules with their builders and dependencies.
   *
   * The shape of the returned array is:
   *
   * [
   *   {
   *     'Beer': {
   *        moduleBuilder: [class BeerModule     extends BaseModule],
   *        service:       [class BeerService    extends BaseService],
   *        repository:    [class BeerRepository extends Repository],
   *        controller:    [class BeerController extends BaseController],
   *        middleware:    [class BeerMiddleware extends BaseMiddleware],
   *     },
   *   },
   *   ...
   * ]
   * @returns {Array} Returns an array of objects containing module names and their
   * builders with dependencies.
   */
  async loadModules(): Promise<any[]> {
    const modules = await this.getModules();

    return await Promise.all(
      modules.map(async (_module) => {
        const moduleName = Object.keys(_module)[0];

        const moduleBuilder = _module[moduleName][`${moduleName}Module`];

        const moduleDependencies = Object.fromEntries(
          await this.getModuleDependencies(moduleName),
        );

        return { [moduleName]: { moduleBuilder, ...moduleDependencies } };
      }),
    );
  }

  /**
   * constructModules() method is used to construct all the loaded modules.
   *
   * The method maps over the array of modules and retrieves the module name. For
   * each module, the method gets the module builder and its dependencies. The method
   * creates a new instance of the module builder with the required properties and
   * returns an array of all the constructed modules.
   *
   * @param {Array} loadedModules An array of objects containing module names and their
   * builders with dependencies.
   *
   * @returns {Array} Returns an array of constructed modules.
   */
  async constructModules(loadedModules: any[]): Promise<any[]> {
    return loadedModules.map((_module) => {
      const name = Object.keys(_module)[0];

      const ModuleBuilder = _module[name].moduleBuilder;

      const presentDependenciesNames = Object.keys(_module[name]).filter(
        (key) => key !== 'module',
      );

      const moduleDependencies = Object.fromEntries(
        presentDependenciesNames.map((dependence) => [
          dependence,
          _module[name][dependence],
        ]),
      );

      return new ModuleBuilder({
        name: name.toLowerCase(),
        server: this.server,
        ...moduleDependencies,
      });
    });
  }
}

export async function loadModules(server: HttpServer) {
  const loader = new ModuleLoader(server);
  const modules = await loader.loadModules();

  return loader.constructModules(modules);
}
