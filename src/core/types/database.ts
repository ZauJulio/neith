import {
  Repository,
  MigrationInterface,
  QueryRunner,
  BaseEntity,
} from 'typeorm';

export { MigrationInterface, QueryRunner, Repository };

export type DataSource<E extends BaseEntity> = {
  getRepository: (entity: E) => Repository<E>;
};
