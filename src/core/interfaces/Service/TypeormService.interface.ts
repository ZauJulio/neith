import { debug, Debugger } from 'debug';
import { BaseEntity } from '@types';
import { BaseRepository } from '@interfaces';

export interface IService<R extends BaseRepository<BaseEntity>> {
  props: {
    name: string;
    repository: R;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type IServiceFat<S, R> = S extends BaseService<infer R> ? S : never;

export abstract class BaseService<R extends BaseRepository<BaseEntity>> {
  repository: R;
  log: Debugger;

  constructor(props: IService<R>['props']) {
    this.log = debug(`app:${props.name}-service`);
    this.repository = props.repository;
  }
}
