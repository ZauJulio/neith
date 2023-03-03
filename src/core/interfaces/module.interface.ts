import {
  IMiddleware,
  IController,
  IService,
  IMiddlewareFat,
  IControllerFat,
  IServiceFat,
  BaseMiddleware,
  BaseController,
  BaseService,
} from '@interfaces';

import { Router, HttpServer, BaseEntity, Repository } from '@types';
import { debug, Debugger } from '@utils';

export interface IModule<
  M extends BaseMiddleware<C>,
  C extends BaseController<S>,
  S extends BaseService<R>,
  R extends Repository<E>,
  E extends BaseEntity,
> {
  props: {
    name: string;
    server: HttpServer;
    repository: R;
    service: new (props: IService<R>['props']) => IServiceFat<S, R>;
    controller: new (props: IController<S>['props']) => IControllerFat<C, S>;
    middleware: new (props: IMiddleware<C>['props']) => IMiddlewareFat<M, C>;
  };
}

export interface ModuleFactoryProps {
  server: HttpServer;
}

export abstract class BaseModule<
  M extends BaseMiddleware<C>,
  C extends BaseController<S>,
  S extends BaseService<R>,
  R extends Repository<E>,
  E extends BaseEntity,
> {
  name: string;
  router: Router;
  server: HttpServer;
  middleware: IMiddlewareFat<M, C>;
  controller: IControllerFat<C, S>;

  log: Debugger;

  constructor(props: IModule<M, C, S, R, E>['props']) {
    const { name, repository, server } = props;

    this.name = name;
    this.server = server;
    this.router = Router();

    const service = new props.service({ name, repository });

    const controller = new props.controller({ name, service });

    this.middleware = new props.middleware({ name, controller });

    this.controller = controller;
    this.log = debug(`Module:${name}-builder`);

    this.routes();
  }

  abstract routes(): Promise<void>;
}
