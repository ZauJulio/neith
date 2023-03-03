import { debug, Debugger } from 'debug';

export interface IService {
  props: {
    name: string;
  };
}

export type IServiceFat<S> = S extends BaseService ? S : never;

export abstract class BaseService {
  log: Debugger;

  constructor(props: IService['props']) {
    this.log = debug(`app:${props.name}-service`);
  }
}
