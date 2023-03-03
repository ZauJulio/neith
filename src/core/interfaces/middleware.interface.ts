import { DataValidator, NextFunction, Request, Response } from '@types';
import { debug, Debugger, validate } from '@utils';
import { IControllerFat } from '@interfaces';

export interface IMiddleware<C> {
  signature:
    | ((
        req: Request,
        res: Response,
        next: NextFunction,
      ) => Promise<Response | undefined | void>)
    | Debugger
    | DataValidator
    | C;
  props: {
    name: string;
    controller: IControllerFat<C, any>;
  };
}

export type IMiddlewareFat<M, C> = M extends BaseMiddleware<C> ? M : never;

export abstract class BaseMiddleware<C> {
  [key: string]: IMiddleware<C>['signature'];

  log: Debugger;
  controller: IControllerFat<C, any>;

  validate: DataValidator;

  constructor(props: IMiddleware<C>['props']) {
    this.log = debug(`Module:${props.name}-middleware`);
    this.controller = props.controller;
    this.validate = validate;
  }
}
