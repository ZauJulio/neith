import { debug, Debugger } from '@utils';
import { IServiceFat } from '@interfaces';
import { Request, Response, NextFunction } from '@types';

export interface IController<S> {
  signature:
    | ((req: Request, res: Response, next: NextFunction) => Promise<Response>)
    | Debugger
    | S;
  props: {
    name: string;
    service: IServiceFat<S>;
  };
}

export type IControllerFat<C, S> = C extends BaseController<S> ? C : never;

export abstract class BaseController<S> {
  [key: string]: IController<S>['signature'];

  log: Debugger;
  service: IServiceFat<S>;

  constructor(props: IController<S>['props']) {
    this.log = debug(`Module:${props.name}-controller`);
    this.service = props.service;
  }
}
