import { BaseEntity, DataSource, Repository } from '@types';

export interface IRepository<E extends BaseEntity> {
  props: {
    provider: Repository<E>;
  };
}

export function getRepository<E extends BaseEntity>(props: {
  dataSource: DataSource<E>;
  repository: new (props: IRepository<E>['props']) => IRepository<E>;
  entity: E;
}) {
  return new props.repository({
    provider: props.dataSource.getRepository(props.entity),
  });
}

export abstract class BaseRepository<E extends BaseEntity> {
  constructor(props: IRepository<E>['props']) {
    Object.assign(this, props.provider);
  }
}
